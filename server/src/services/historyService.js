// server/src/services/historyService.js
const logger = require('../utils/logger');
const NBUService = require('./NBUService');

class HistoryService {
    // Get historical data for a currency
    async getHistoricalRates(currency, period) {
        try {
            logger.info(`Getting historical rates for ${currency}/} via MinFin API`);

            // Get historical data via MinFin API
            return await NBUService.getHistoricalRates(
                currency, period
            );

        } catch (error) {
            logger.error(`Error in getHistoricalRates: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new HistoryService();
