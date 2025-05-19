// server/src/routes/index.js
const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

// Current rates
router.get('/rates', currencyController.getCurrentRates);

// Historical rates
router.get('/history', currencyController.getHistoricalRates);

// Forecast
router.get('/forecast', currencyController.getForecast);

module.exports = router;
