// server/src/controllers/forecastController.js
const logger = require('../utils/logger');
const forecastService = require('../services/forecastService');

class ForecastController {
    async getForecast(req, res) {
        try {
            const {
                currency = 'USD',
                baseCurrency = 'UAH',
                days = 7,
                method = 'linear'
            } = req.query;

            const data = await forecastService.getForecast(
                currency, baseCurrency, parseInt(days), method
            );

            return res.status(200).json(data);
        } catch (error) {
            logger.error(`Error in getForecast: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ForecastController();``
