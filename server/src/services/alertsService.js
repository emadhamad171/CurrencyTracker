const admin = require('firebase-admin');
const cron = require('node-cron');
const logger = require('../utils/logger');
const currencyService = require('./currencyService');

// Инициализация Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

const db = admin.firestore();
const messaging = admin.messaging();

// Проверка и отправка оповещений
const checkAndSendAlerts = async () => {
  try {
    logger.info('Starting alert check process');

    // Получаем текущие курсы валют
    const currentRates = await currencyService.fetchCurrentRates();
    if (!currentRates) {
      throw new Error('Failed to fetch current rates');
    }

    // Получаем все активные оповещения
    const alertsSnapshot = await db
      .collection('alerts')
      .where('active', '==', true)
      .get();

    if (alertsSnapshot.empty) {
      logger.info('No active alerts found');
      return;
    }

    const alerts = alertsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(`Found ${alerts.length} active alerts to check`);

    // Обрабатываем каждое оповещение
    for (const alert of alerts) {
      await processAlert(alert, currentRates);
    }

    logger.info('Alert check process completed');
  } catch (error) {
    logger.error(`Error in check and send alerts: ${error.message}`);
  }
};

// Обработка одного оповещения
const processAlert = async (alert, currentRates) => {
  try {
    // Находим нужную валюту
    const currencyRates = currentRates.find(
      (rate) =>
        rate.currency.toLowerCase() === alert.currency.toLowerCase() &&
        rate.baseCurrency.toLowerCase() === alert.baseCurrency.toLowerCase(),
    );

    if (!currencyRates) {
      logger.warn(
        `No rate found for currency ${alert.currency}/${alert.baseCurrency}`,
      );
      return;
    }

    // Проверяем условие оповещения
    let isTriggered = false;
    if (alert.direction === 'above' && currencyRates.sell >= alert.threshold) {
      isTriggered = true;
    } else if (
      alert.direction === 'below' &&
      currencyRates.buy <= alert.threshold
    ) {
      isTriggered = true;
    }

    if (isTriggered) {
      logger.info(`Alert triggered: ${alert.id}`);

      // Получаем информацию о пользователе
      const userDoc = await db.collection('users').doc(alert.userId).get();
      if (!userDoc.exists) {
        logger.warn(`User not found for alert ${alert.id}`);
        return;
      }

      const userData = userDoc.data();

      // Если у пользователя есть FCM токен, отправляем оповещение
      if (userData.fcmToken) {
        await sendPushNotification(userData.fcmToken, alert, currencyRates);
      }

      // Добавляем запись в историю оповещений
      await db.collection('alertHistory').add({
        alertId: alert.id,
        userId: alert.userId,
        currency: alert.currency,
        baseCurrency: alert.baseCurrency,
        threshold: alert.threshold,
        direction: alert.direction,
        currentRate:
          alert.direction === 'above' ? currencyRates.sell : currencyRates.buy,
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Если оповещение одноразовое, деактивируем его
      if (alert.oneTime) {
        await db.collection('alerts').doc(alert.id).update({
          active: false,
        });
      }
    }
  } catch (error) {
    logger.error(`Error processing alert ${alert.id}: ${error.message}`);
  }
};

// Отправка push-уведомления
const sendPushNotification = async (token, alert, currencyRates) => {
  try {
    const rate =
      alert.direction === 'above' ? currencyRates.sell : currencyRates.buy;
    const directionText =
      alert.direction === 'above' ? 'превысил' : 'упал ниже';

    const message = {
      token,
      notification: {
        title: `Оповещение курса ${alert.currency}/${alert.baseCurrency}`,
        body: `Курс ${directionText} пороговое значение ${alert.threshold} и составляет ${rate.toFixed(2)}`,
      },
      data: {
        alertId: alert.id,
        currency: alert.currency,
        baseCurrency: alert.baseCurrency,
        threshold: alert.threshold.toString(),
        direction: alert.direction,
        currentRate: rate.toString(),
        type: 'currency_alert',
      },
    };

    const response = await messaging.send(message);
    logger.info(`Push notification sent for alert ${alert.id}: ${response}`);
    return response;
  } catch (error) {
    logger.error(`Error sending push notification: ${error.message}`);
    throw error;
  }
};

// Запуск проверки оповещений по расписанию (каждые 15 минут)
const startAlertScheduler = () => {
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running scheduled alert check');
    await checkAndSendAlerts();
  });

  logger.info('Alert scheduler started');
};

module.exports = {
  checkAndSendAlerts,
  startAlertScheduler,
};
