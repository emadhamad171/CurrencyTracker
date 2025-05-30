// server/src/controllers/currencyController.js
const logger = require('../utils/logger');
const currencyService = require('../services/currencyService');

class CurrencyController {
  async getCurrentRates(req, res) {
    try {
      const { base = 'UAH', currencies = 'USD,EUR' } = req.query;
      const currencyArray = Array.isArray(currencies)
        ? currencies
        : currencies.split(',');

      logger.info(
        `Getting current rates for ${currencyArray.join(',')} with base ${base}`,
      );

      const rates = await currencyService.getCurrentRates(base, currencyArray);

      return res.status(200).json(rates);
    } catch (error) {
      logger.error(`Error getting current rates: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }

  // Get historical exchange rates
  async getHistoricalRates(req, res) {
    try {
      const { currency = 'usd', period = 'month' } = req.query;

      logger.info(`Getting historical rates for ${currency}/} from}`);

      const data = await currencyService.getHistoricalRates(currency, period);
      return res.status(200).json(data);
    } catch (error) {
      logger.error(`Error in getHistoricalRates: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }

  async getRatesForConverter(req, res) {
    try {
      const converterRates = await currencyService.getConverterRates();

      return res.status(200).json(converterRates);
    } catch (error) {
      logger.error(`Error getting forecast: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }
  async getRatesForAlerts(req, res) {
    try {
      // Получаем валюты из параметров запроса или используем по умолчанию
      const { currencies = 'USD,EUR' } = req.query;
      const currencyArray = Array.isArray(currencies)
        ? currencies
        : currencies.split(',');

      logger.info(`Getting NBU rates for alerts: ${currencyArray.join(', ')}`);

      // Используем новый метод для получения конкретных валют
      const rates = await currencyService.getNBUSpecificRates(currencyArray);

      return res.status(200).json(rates);
    } catch (error) {
      logger.error(`Error getting rates for alerts: ${error.message}`);

      // Fallback ответ
      return res.status(200).json({
        USDUAH: { market: 41.8, currency: 'USD', name: 'US Dollar (fallback)' },
        EURUAH: { market: 44.6, currency: 'EUR', name: 'Euro (fallback)' },
      });
    }
  }
}

module.exports = new CurrencyController();
