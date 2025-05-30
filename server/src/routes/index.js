const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const forecastController = require('../controllers/forecastController');
const priceAlertsController = require('../controllers/priceAlertsController');

// Current rates
router.get('/rates', currencyController.getCurrentRates);

// Historical rates
router.get('/history', currencyController.getHistoricalRates);

// Converter
router.get('/converter', currencyController.getRatesForConverter);

// Forecast dashboard
router.get('/fundamental-analysis', forecastController.getFundamentalDashboard);

// Price Alerts
router.post('/alerts', priceAlertsController.createPriceAlert);
router.get('/alerts/user/:userId', priceAlertsController.getUserAlerts);
router.get('/alerts/user/:userId/stats', priceAlertsController.getAlertsStats);
router.delete('/alerts/:alertId', priceAlertsController.deleteAlert);
router.post('/alerts/check', priceAlertsController.checkAndSendAlerts);
router.get('/alerts/rates', currencyController.getRatesForAlerts);

module.exports = router;
