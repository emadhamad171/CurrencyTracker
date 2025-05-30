// server/src/services/CurrencyService.js
const axios = require('axios');
const logger = require('../utils/logger');
const { cacheData, getCachedData } = require('../utils/cache');

// MinFin API Configuration
const MINFIN_API_KEY = process.env.MINFIN_API_KEY;
const MINFIN_API_BASE = 'https://api.minfin.com.ua';

// Cache TTLs (in seconds)
const CACHE_TTL = {
  CURRENT_RATES: 30 * 60, // Current rates: 30 minutes
  HISTORICAL_RATES: 24 * 60 * 60, // Historical data: 24 hours
};

class CurrencyService {
  /**
   * Get current exchange rates from all sources
   * @param {string} baseCurrency - Base currency (UAH)
   * @param {array} currencies - Array of currency codes ['USD', 'EUR', ...]
   * @returns {object} - Object with exchange rates from all sources
   */
  async getCurrentRates(baseCurrency = 'UAH', currencies = ['USD', 'EUR']) {
    try {
      const cacheKey = `current_rates_${baseCurrency}_${currencies.sort().join('_')}`;

      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        logger.info('Returning cached current rates');
        return cachedData;
      }

      logger.info(`Fetching current rates for ${currencies.join(', ')}`);

      // Fetch data from all sources
      const [nbuRates, bankRates, blackMarketRates] = await Promise.all([
        this.getNBURates(baseCurrency, currencies),
        this.getBankRates(baseCurrency, currencies),
        this.getBlackMarketRates(baseCurrency, currencies),
      ]);

      // Combine all rates
      const result = {
        nbu: nbuRates,
        banks: bankRates,
        black: blackMarketRates,
        timestamp: Date.now(),
      };

      // Cache the result
      await cacheData(cacheKey, result, CACHE_TTL.CURRENT_RATES);

      return result;
    } catch (error) {
      logger.error(`Error getting combined rates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch NBU (National Bank of Ukraine) rates
   */
  async getNBURates(baseCurrency = 'UAH', currencies = ['USD', 'EUR']) {
    try {
      const cacheKey = `nbu_rates_${baseCurrency}_${currencies.sort().join('_')}`;

      // Check cache
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      logger.info('Fetching NBU rates');

      // Call NBU API - using correct endpoint
      const response = await this.callMinFinAPI(
        `${MINFIN_API_BASE}/nbu/${MINFIN_API_KEY}`,
      );

      if (!response || !response.data) {
        throw new Error('Invalid response from NBU API');
      }
      const rates = this.formatNBURates(
        response.data,
        currencies,
        baseCurrency,
      );
      await cacheData(cacheKey, rates, CACHE_TTL.CURRENT_RATES);

      return rates;
    } catch (error) {
      logger.error(`Error fetching NBU rates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch commercial bank rates (PrivatBank, Monobank, etc.)
   */
  async getBankRates(baseCurrency = 'UAH', currencies = ['USD', 'EUR']) {
    try {
      const cacheKey = `bank_rates_${baseCurrency}_${currencies.sort().join('_')}`;

      // Check cache
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      logger.info('Fetching commercial bank rates');

      // For bank rates, we need to make separate requests for each currency
      const bankRatesPromises = currencies.map((currency) =>
        this.callMinFinAPI(
          `${MINFIN_API_BASE}/exchrates/${MINFIN_API_KEY}/${currency}`,
        ),
      );

      const responses = await Promise.all(bankRatesPromises);

      // Format bank rates
      const allBankRates = [];

      responses.forEach((response, index) => {
        if (response && response.data) {
          const currencyCode = currencies[index];
          const bankRates = this.formatBankRates(
            response.data,
            currencyCode,
            baseCurrency,
          );
          allBankRates.push(...bankRates);
        }
      });
      await cacheData(cacheKey, allBankRates, CACHE_TTL.CURRENT_RATES);

      return allBankRates;
    } catch (error) {
      logger.error(`Error fetching bank rates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch black market rates
   */
  async getBlackMarketRates(baseCurrency = 'UAH', currencies = ['USD', 'EUR']) {
    try {
      const cacheKey = `black_market_rates_${baseCurrency}_${currencies.sort().join('_')}`;

      // Check cache
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      logger.info('Fetching black market rates');

      // Call Black Market API with correct endpoint
      const response = await this.callMinFinAPI(
        `${MINFIN_API_BASE}/auction/info/${MINFIN_API_KEY}`,
      );

      if (!response || !response.data) {
        throw new Error('Invalid response from Black Market API');
      }

      const rates = this.formatBlackMarketRates(
        response.data,
        currencies,
        baseCurrency,
      );

      await cacheData(cacheKey, rates, CACHE_TTL.CURRENT_RATES);

      return rates;
    } catch (error) {
      logger.error(`Error fetching black market rates: ${error.message}`);
      throw error;
    }
  }

  async getHistoricalRates(currency = 'usd', period = 'month') {
    try {
      const cacheKey = `historical_${currency}_nbu_${period}`;

      const response = await this.callMinFinAPI(
        `https://minfin.com.ua/api/currency/rates/nbu/${currency}/avg?period=${period}`,
      );

      await cacheData(cacheKey, response?.data, CACHE_TTL.HISTORICAL_RATES);
      return response?.data;
    } catch (error) {
      logger.error(`Error getting historical rates: ${error.message}`);
      throw error;
    }
  }

  async getConverterRates() {
    try {
      const url =
        'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
      const response = await axios.get(url);
      return response?.data;
    } catch (error) {
      logger.error(`Error getting historical rates: ${error.message}`);
      throw error;
    }
  }

  async getNBUSpecificRates(currencies = ['USD', 'EUR']) {
    try {
      const cacheKey = `nbu_specific_rates_${currencies.sort().join('_')}`;

      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        logger.info(`Returning cached NBU rates for ${currencies.join(', ')}`);
        return cachedData;
      }

      logger.info(
        `Fetching NBU rates for specific currencies: ${currencies.join(', ')}`,
      );

      const currenciesParam = currencies.map((c) => c.toUpperCase()).join(',');
      const url = `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json&cc=${currenciesParam}`;

      logger.debug(`NBU API URL: ${url}`);

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Currency Exchange App/1.0',
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response from NBU API');
      }

      // Форматируем ответ для алертов
      const formattedRates = {};

      response.data.forEach((rate) => {
        if (rate.cc && rate.rate) {
          const pairKey = `${rate.cc}UAH`;
          formattedRates[pairKey] = {
            market: parseFloat(rate.rate),
            currency: rate.cc,
            name: rate.txt,
            date: rate.exchangedate,
            code: rate.r030,
          };
        }
      });

      // Кешируем на 30 минут
      await cacheData(cacheKey, formattedRates, 30 * 60);

      logger.info('NBU specific rates fetched successfully:', formattedRates);
      return formattedRates;
    } catch (error) {
      logger.error(`Error fetching NBU specific rates: ${error.message}`);

      // Возвращаем fallback значения
      const fallbackRates = {};
      currencies.forEach((currency) => {
        const pairKey = `${currency.toUpperCase()}UAH`;
        fallbackRates[pairKey] = {
          market: currency === 'USD' ? 41.8 : 44.6,
          currency: currency.toUpperCase(),
          name: `${currency.toUpperCase()} (fallback)`,
          date: new Date().toISOString().split('T')[0],
          code: currency === 'USD' ? 840 : 978,
        };
      });

      return fallbackRates;
    }
  }

  formatNBURates(data, currencies, baseCurrency) {
    if (!data) {
      return [];
    }
    // NBU returns object with currency codes as keys
    return currencies
      .filter((currency) => data[currency.toLowerCase()])
      .map((currency) => {
        const currencyData = data[currency.toLowerCase()];
        return {
          source: 'NBU',
          currency: currency.toUpperCase(),
          baseCurrency,
          buy: parseFloat(currencyData.bid), // NBU uses 'bid' field
          sell: parseFloat(currencyData.ask), // NBU uses 'ask' field
          date: currencyData.date,
          timestamp: Date.now(),
        };
      });
  }

  /**
   * Format bank rates from API response
   */
  formatBankRates(data, currency, baseCurrency) {
    if (!data.data) {
      return [];
    }

    const result = [];

    data.data.forEach((bank) => {
      if (
        bank.slug === 'ukrsibbank' ||
        bank.slug === 'monobank' ||
        bank?.slug === 'privatbank'
      ) {
        const rateData = bank.card || bank.cash;

        if (rateData) {
          result.push({
            source:
              bank.slug === 'ukrsibbank'
                ? 'UkrsibBank'
                : bank?.slug === 'privatbank'
                  ? 'PrivatBank'
                  : 'Monobank',
            currency: currency.toUpperCase(),
            baseCurrency,
            buy: parseFloat(rateData.bid),
            sell: parseFloat(rateData.ask),
            date: new Date(rateData.date).toISOString(),
            timestamp: Date.now(),
          });
        }
      }
    });

    return result;
  }

  /**
   * Format black market rates from API response
   */
  formatBlackMarketRates(data, currencies, baseCurrency) {
    if (!data) {
      return [];
    }

    return currencies
      .filter((currency) => data[currency.toLowerCase()])
      .map((currency) => {
        const marketData = data[currency.toLowerCase()];

        return {
          source: 'BlackMarket',
          currency: currency.toUpperCase(),
          baseCurrency,
          buy: parseFloat(marketData.bid),
          sell: parseFloat(marketData.ask),
          date: marketData.time,
          timestamp: Date.now(),
        };
      });
  }

  /**
   * Call MinFin API with error handling and rate limiting
   */
  async callMinFinAPI(endpoint, params = {}) {
    try {
      logger.debug(`Calling MinFin API: ${endpoint}`);

      // Add small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await axios.get(endpoint, {
        params,
        headers: {
          'User-Agent': 'Currency Exchange App/1.0',
        },
        timeout: 10000, // 10 seconds timeout
      });

      return response;
    } catch (error) {
      // Handle specific API errors
      if (error.response) {
        const status = error.response.status;

        if (status === 429) {
          logger.error('MinFin API rate limit exceeded');
        } else if (status === 401) {
          logger.error('MinFin API authentication failed - check your API key');
        } else {
          logger.error(`MinFin API error: Status ${status}`);
        }
      } else if (error.request) {
        logger.error('MinFin API request failed with no response');
      } else {
        logger.error(`MinFin API error: ${error.message}`);
      }

      throw error;
    }
  }
}

module.exports = new CurrencyService();
