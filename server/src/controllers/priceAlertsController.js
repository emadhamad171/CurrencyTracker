// server/src/controllers/priceAlertsController.js
const admin = require('firebase-admin');
const axios = require('axios');

// Инициализация Firebase Admin (если еще не сделано в вашем проекте)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

// ====== СОЗДАНИЕ АЛЕРТА ======
const createPriceAlert = async (req, res) => {
  try {
    const {
      userId,
      currencyPair, // 'USDUAH' | 'EURUAH'
      alertType, // 'above' | 'below'
      targetPrice,
      pushToken, // Expo push token
      isActive = true,
    } = req.body;

    // Валидация
    if (!userId || !currencyPair || !alertType || !targetPrice || !pushToken) {
      return res.status(400).json({
        error: 'Отсутствуют обязательные поля',
        required: [
          'userId',
          'currencyPair',
          'alertType',
          'targetPrice',
          'pushToken',
        ],
      });
    }

    if (!['USDUAH', 'EURUAH'].includes(currencyPair)) {
      return res.status(400).json({
        error: 'Неподдерживаемая валютная пара',
        supported: ['USDUAH', 'EURUAH'],
      });
    }

    if (!['above', 'below'].includes(alertType)) {
      return res.status(400).json({
        error: 'Неверный тип алерта',
        supported: ['above', 'below'],
      });
    }

    if (targetPrice <= 0) {
      return res.status(400).json({
        error: 'Цена должна быть больше 0',
      });
    }

    // Получаем текущую цену для валидации
    const currentRates = await getCurrentExchangeRates();
    const currentPrice = currentRates[currencyPair]?.market;

    if (!currentPrice) {
      return res.status(500).json({
        error: 'Не удалось получить текущий курс валют',
      });
    }

    // Проверяем логичность алерта
    if (alertType === 'above' && targetPrice <= currentPrice) {
      console.warn(
        `⚠️ Alert above ${targetPrice} but current price is ${currentPrice}`,
      );
    }
    if (alertType === 'below' && targetPrice >= currentPrice) {
      console.warn(
        `⚠️ Alert below ${targetPrice} but current price is ${currentPrice}`,
      );
    }

    // Создаем алерт в Firestore
    const alertData = {
      userId,
      currencyPair,
      alertType,
      targetPrice: parseFloat(targetPrice),
      pushToken,
      isActive,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      triggeredAt: null,
      currentPriceAtCreation: currentPrice,
      lastChecked: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('priceAlerts').add(alertData);

    console.log(`✅ Price alert created: ${docRef.id} for user ${userId}`);

    res.status(201).json({
      success: true,
      alertId: docRef.id,
      message: `Алерт создан: ${currencyPair} ${alertType === 'above' ? 'выше' : 'ниже'} ${targetPrice}₴`,
      data: {
        ...alertData,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Create alert error:', error);
    res.status(500).json({
      error: 'Error occured while creating alert',
      message: error.message,
    });
  }
};

// ====== ПОЛУЧЕНИЕ АЛЕРТОВ ПОЛЬЗОВАТЕЛЯ ======
// server/src/controllers/priceAlertsController.js - УПРОЩЕННЫЕ ЗАПРОСЫ

// ====== ПОЛУЧЕНИЕ АЛЕРТОВ ПОЛЬЗОВАТЕЛЯ (БЕЗ СОРТИРОВКИ) ======
const getUserAlerts = async (req, res) => {
  console.log('📥 GET USER ALERTS REQUEST:', {
    params: req.params,
    query: req.query,
  });

  try {
    const { userId } = req.params;

    if (!userId) {
      console.error('❌ Missing userId parameter');
      return res.status(400).json({
        error: 'userId обязателен',
      });
    }

    console.log('🔍 Getting alerts for userId:', userId);

    // ✅ УПРОЩЕННЫЙ ЗАПРОС БЕЗ orderBy (НЕ ТРЕБУЕТ ИНДЕКСА)
    const alertsSnapshot = await db
      .collection('priceAlerts')
      .where('userId', '==', userId)
      .get();

    console.log('📊 Found alerts:', alertsSnapshot.size);

    const alerts = [];
    alertsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Processing alert:', doc.id, {
        currencyPair: data.currencyPair,
        targetPrice: data.targetPrice,
        isActive: data.isActive,
      });

      alerts.push({
        id: doc.id,
        ...data,
        // ✅ БЕЗОПАСНОЕ ПРЕОБРАЗОВАНИЕ TIMESTAMP
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        triggeredAt: data.triggeredAt?.toDate
          ? data.triggeredAt.toDate().toISOString()
          : null,
        lastChecked: data.lastChecked?.toDate
          ? data.lastChecked.toDate().toISOString()
          : new Date().toISOString(),
      });
    });

    // ✅ СОРТИРОВКА НА КЛИЕНТЕ (ПОСЛЕ ПОЛУЧЕНИЯ ДАННЫХ)
    alerts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    console.log('✅ Processed and sorted alerts:', alerts.length);

    // Получаем текущие курсы для показа статуса
    console.log('💱 Getting current rates for status calculation...');
    let currentRates;
    try {
      currentRates = await getCurrentExchangeRates();
      console.log('💱 Current rates loaded:', Object.keys(currentRates));
    } catch (ratesError) {
      console.warn('⚠️ Failed to load current rates:', ratesError.message);
      currentRates = {
        USDUAH: { market: 41.8 },
        EURUAH: { market: 44.6 },
      };
    }

    // ✅ ДОБАВЛЯЕМ СТАТУС И ТЕКУЩИЕ ЦЕНЫ К КАЖДОМУ АЛЕРТУ
    const alertsWithStatus = alerts.map((alert) => {
      const currentPrice = currentRates[alert.currencyPair]?.market;
      const status = getAlertStatus(alert, currentPrice);
      const distanceToTarget = calculateDistanceToTarget(alert, currentPrice);

      return {
        ...alert,
        currentPrice,
        status,
        distanceToTarget,
      };
    });

    console.log('✅ Enhanced alerts with status:', alertsWithStatus.length);

    res.json({
      success: true,
      count: alerts.length,
      alerts: alertsWithStatus,
    });
  } catch (error) {
    console.error('❌ GET USER ALERTS ERROR:', error);
    console.error('❌ Error stack:', error.stack);

    res.status(500).json({
      error: 'Error occurred while receiving alerts',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// ====== ПОЛУЧЕНИЕ СТАТИСТИКИ (УПРОЩЕННАЯ ВЕРСИЯ) ======
const getAlertsStats = async (req, res) => {
  console.log('📥 GET ALERTS STATS REQUEST:', {
    params: req.params,
  });

  try {
    const { userId } = req.params;

    if (!userId) {
      console.error('❌ Missing userId parameter');
      return res.status(400).json({
        error: 'userId обязателен',
      });
    }

    console.log('📊 Getting stats for userId:', userId);

    // ✅ ОДИН ПРОСТОЙ ЗАПРОС БЕЗ СЛОЖНЫХ УСЛОВИЙ
    const allAlertsSnapshot = await db
      .collection('priceAlerts')
      .where('userId', '==', userId)
      .get();

    let activeCount = 0;
    let triggeredCount = 0;
    const byPair = {
      USDUAH: { active: 0, triggered: 0 },
      EURUAH: { active: 0, triggered: 0 },
    };

    // ✅ ПОДСЧЕТ НА КЛИЕНТЕ
    allAlertsSnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.isActive) {
        activeCount++;
        if (byPair[data.currencyPair]) {
          byPair[data.currencyPair].active++;
        }
      }

      if (data.triggeredAt) {
        triggeredCount++;
        if (byPair[data.currencyPair]) {
          byPair[data.currencyPair].triggered++;
        }
      }
    });

    const stats = {
      active: activeCount,
      triggered: triggeredCount,
      total: allAlertsSnapshot.size,
      byPair,
    };

    console.log('✅ Stats calculated:', stats);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('❌ GET STATS ERROR:', error);
    console.error('❌ Error stack:', error.stack);

    res.status(500).json({
      error: 'Error occurred while receiving stats',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// ====== УДАЛЕНИЕ АЛЕРТА ======
const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.body;

    if (!alertId || !userId) {
      return res.status(400).json({
        error: 'alertId и userId обязательны',
      });
    }

    // Проверяем что алерт принадлежит пользователю
    const alertDoc = await db.collection('priceAlerts').doc(alertId).get();

    if (!alertDoc.exists) {
      return res.status(404).json({
        error: 'Алерт не найден',
      });
    }

    const alertData = alertDoc.data();
    if (alertData.userId !== userId) {
      return res.status(403).json({
        error: 'Нет прав на удаление этого алерта',
      });
    }

    await db.collection('priceAlerts').doc(alertId).delete();

    console.log(`🗑️ Alert deleted: ${alertId} by user ${userId}`);

    res.json({
      success: true,
      message: 'Алерт удален',
    });
  } catch (error) {
    console.error('❌ Delete alert error:', error);
    res.status(500).json({
      error: 'Error occurred trying to delete alert',
      message: error.message,
    });
  }
};

// ====== ПОЛУЧЕНИЕ ТЕКУЩИХ КУРСОВ (используем ваш существующий API) ======
const getCurrentExchangeRates = async () => {
  try {
    // Используем ваш существующий метод из currencyController
    const response = await axios.get(
      `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/dashboard/fundamental`,
      {
        timeout: 10000,
      },
    );

    if (
      response.data &&
      response.data.indicators &&
      response.data.indicators.currentRates
    ) {
      return response.data.indicators.currentRates;
    }

    // Fallback
    return {
      USDUAH: { official: 41.2, market: 41.8 },
      EURUAH: { official: 44.1, market: 44.6 },
    };
  } catch (error) {
    console.error('❌ Error getting current rates:', error.message);

    // Возвращаем fallback данные
    return {
      USDUAH: { official: 41.2, market: 41.8 },
      EURUAH: { official: 44.1, market: 44.6 },
    };
  }
};

// ====== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======
const getAlertStatus = (alert, currentPrice) => {
  if (!currentPrice) {
    return 'unknown';
  }
  if (alert.triggeredAt) {
    return 'triggered';
  }
  if (!alert.isActive) {
    return 'inactive';
  }

  const { alertType, targetPrice } = alert;

  if (alertType === 'above') {
    if (currentPrice >= targetPrice) {
      return 'ready_to_trigger';
    }
    const distance = ((targetPrice - currentPrice) / currentPrice) * 100;
    if (distance <= 2) {
      return 'close';
    }
    return 'waiting';
  } else {
    if (currentPrice <= targetPrice) {
      return 'ready_to_trigger';
    }
    const distance = ((currentPrice - targetPrice) / currentPrice) * 100;
    if (distance <= 2) {
      return 'close';
    }
    return 'waiting';
  }
};

const calculateDistanceToTarget = (alert, currentPrice) => {
  if (!currentPrice) {
    return null;
  }

  const distance = Math.abs(currentPrice - alert.targetPrice);
  const percentage = (distance / currentPrice) * 100;

  return {
    absolute: parseFloat(distance.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(2)),
    direction: currentPrice > alert.targetPrice ? 'above' : 'below',
  };
};

const sendExpoPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    console.log(
      '📱 Sending push notification to:',
      `${pushToken.substring(0, 20)}...`,
    );

    // Если это fallback токен - симулируем отправку
    if (pushToken.startsWith('fallback_')) {
      console.log('🔄 Simulating push for fallback token:', { title, body });
      return { success: true, simulated: true };
    }

    // ✅ ОТПРАВКА ЧЕРЕЗ EXPO PUSH API
    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: {
        ...data,
        type: 'price_alert',
      },
      priority: 'high',
      channelId: 'price-alerts',
    };

    const response = await axios.post(
      'https://exp.host/--/api/v2/push/send',
      message,
      {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    if (response.data.errors) {
      console.error('❌ Expo push errors:', response.data.errors);
      return { success: false, errors: response.data.errors };
    }

    console.log('✅ Push notification sent successfully');
    return { success: true, receipt: response.data };
  } catch (error) {
    console.error('❌ Error sending push notification:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ ОБНОВЛЕННАЯ ФУНКЦИЯ checkAndSendAlerts С PUSH УВЕДОМЛЕНИЯМИ
const checkAndSendAlerts = async () => {
  console.log('🔍 Starting price alerts check...');

  try {
    // Получаем текущие курсы
    console.log('💱 Getting current exchange rates...');
    let currentRates;
    try {
      const response = await axios.get(
        'http://localhost:5001/api/fundamental-analysis',
        {
          timeout: 10000,
        },
      );
      currentRates = response.data?.indicators?.currentRates;
      console.log(
        '💱 Current rates loaded:',
        currentRates ? Object.keys(currentRates) : 'No rates',
      );
    } catch (ratesError) {
      console.error('❌ Error getting current rates:', ratesError.message);
      return { success: false, error: 'Failed to get current rates' };
    }

    if (!currentRates) {
      console.error('❌ No current rates available');
      return { success: false, error: 'No current rates available' };
    }

    // Получаем активные алерты
    const alertsSnapshot = await db
      .collection('priceAlerts')
      .where('isActive', '==', true)
      .where('triggeredAt', '==', null)
      .get();

    console.log(`📊 Checking ${alertsSnapshot.size} active alerts...`);

    let triggeredCount = 0;

    // Проверяем каждый алерт
    for (const alertDoc of alertsSnapshot.docs) {
      const alert = alertDoc.data();
      const alertId = alertDoc.id;

      const currentPrice = currentRates[alert.currencyPair]?.market;
      if (!currentPrice) {
        console.warn(`⚠️ No current price for ${alert.currencyPair}`);
        continue;
      }

      // Проверяем условие срабатывания
      let shouldTrigger = false;
      if (alert.alertType === 'above' && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
      } else if (
        alert.alertType === 'below' &&
        currentPrice <= alert.targetPrice
      ) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        console.log(
          `🎯 Alert triggered! ${alert.currencyPair} ${alert.alertType} ${alert.targetPrice} (current: ${currentPrice})`,
        );

        // ОТПРАВЛЯЕМ PUSH УВЕДОМЛЕНИЕ
        const pushTitle = '💰 Алерт по курсу валют!';
        const pushBody = `${alert.currencyPair}: ${currentPrice.toFixed(2)}₴ (цель: ${alert.targetPrice}₴)`;

        const pushResult = await sendExpoPushNotification(
          alert.pushToken,
          pushTitle,
          pushBody,
          {
            currencyPair: alert.currencyPair,
            currentPrice,
            targetPrice: alert.targetPrice,
            alertType: alert.alertType,
          },
        );

        console.log('📱 Push notification result:', pushResult);

        // Помечаем алерт как сработавший
        await db
          .collection('priceAlerts')
          .doc(alertId)
          .update({
            triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: false,
            triggerPrice: currentPrice,
            pushSent: pushResult.success,
            pushError: pushResult.success ? null : pushResult.error,
          });

        triggeredCount++;
      } else {
        // Обновляем время последней проверки
        await db.collection('priceAlerts').doc(alertId).update({
          lastChecked: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    const result = {
      success: true,
      checked: alertsSnapshot.size,
      triggered: triggeredCount,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Alerts check completed:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in checkAndSendAlerts:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createPriceAlert,
  getUserAlerts,
  deleteAlert,
  checkAndSendAlerts,
  getAlertsStats,
  sendExpoPushNotification,
  getCurrentExchangeRates,
};
