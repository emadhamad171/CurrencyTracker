// server/src/controllers/currencyController.js
const logger = require('../utils/logger');
const NBUService = require('../services/NBUService');
const historyService = require('../services/historyService');
const forecastService = require('../services/forecastService');

class CurrencyController {
    // Get current exchange rates
    async getCurrentRates(req, res) {
        try {
            const { base = 'UAH', currencies = 'USD,EUR' } = req.query;
            const currencyArray = Array.isArray(currencies) ? currencies : currencies.split(',');

            logger.info(`Getting current rates for ${currencyArray.join(',')} with base ${base}`);

            const rates = await NBUService.getCurrentRates(base, currencyArray);

            return res.status(200).json(rates);
        } catch (error) {
            logger.error(`Error getting current rates: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }

    // Get historical exchange rates
    async getHistoricalRates(req, res) {
        try {
            const {
                currency = 'usd',
                period = 'month',
            } = req.query;

            logger.info(`Getting historical rates for ${currency}/} from}`);

            const data = await historyService.getHistoricalRates(
                currency, period
            );

            return res.status(200).json(data);
        } catch (error) {
            logger.error(`Error in getHistoricalRates: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }

    async getForecast(req, res) {
        try {
            const {
                currency = 'usd',
                method = 'linear'
            } = req.query;
            if (req.query.base || req.query.days) {
                logger.info('Deprecated parameters (base, days) used in forecast request');
            }

            logger.info(`Getting forecast for ${currency}, method: ${method}`);

            const forecast = await forecastService.getForecast(currency, method);

            return res.status(200).json(forecast);
        } catch (error) {
            logger.error(`Error getting forecast: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CurrencyController();
