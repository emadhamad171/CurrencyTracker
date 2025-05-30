// server/src/services/cronService.js
const cron = require('node-cron');
const { checkAndSendAlerts } = require('../controllers/priceAlertsController');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // ====== ЗАПУСК ВСЕХ CRON ЗАДАЧ ======
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cron service already running');
      return;
    }

    console.log('🚀 Starting cron service...');

    // Проверка алертов каждые 5 минут
    this.startPriceAlertsCheck();

    // Очистка старых алертов раз в день
    this.startCleanupJob();

    this.isRunning = true;
    console.log('✅ Cron service started successfully');
  }

  // ====== ОСТАНОВКА ВСЕХ ЗАДАЧ ======
  stop() {
    console.log('🛑 Stopping cron service...');

    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ Cron service stopped');
  }

  // ====== ПРОВЕРКА АЛЕРТОВ КАЖДЫЕ 5 МИНУТ ======
  startPriceAlertsCheck() {
    const jobName = 'price-alerts-check';
    // '*/15 * * * *'     // Каждые 15 минут
    // '*/30 * * * *'     // Каждые 30 минут
    // '*/30 * * * * *'     // Каждые 30  cекунд

    // Каждые 5 минут в рабочие часы (8:00-22:00 UTC)
    const job = cron.schedule(
      '*/30 * * * *',
      async () => {
        try {
          console.log('🔍 [CRON] Starting scheduled price alerts check...');
          const startTime = Date.now();

          const result = await checkAndSendAlerts();

          const duration = Date.now() - startTime;
          console.log(
            `✅ [CRON] Price alerts check completed in ${duration}ms:`,
            {
              checked: result.checked,
              triggered: result.triggered,
            },
          );

          // Логируем в файл для мониторинга
          if (result.triggered > 0) {
            console.log(`🚨 [CRON] ${result.triggered} alerts triggered!`);
          }
        } catch (error) {
          console.error('❌ [CRON] Price alerts check failed:', error);
        }
      },
      {
        scheduled: false,
        timezone: 'UTC',
      },
    );

    job.start();
    this.jobs.set(jobName, job);
    console.log(
      '📅 Price alerts check scheduled (every 5 minutes, 8AM-10PM UTC)',
    );
  }

  // ====== ОЧИСТКА СТАРЫХ АЛЕРТОВ РАЗ В ДЕНЬ ======
  startCleanupJob() {
    const jobName = 'alerts-cleanup';

    // Каждый день в 2:00 UTC
    const job = cron.schedule(
      '0 2 * * *',
      async () => {
        try {
          console.log('🧹 [CRON] Starting alerts cleanup...');
          const startTime = Date.now();

          const result = await this.cleanupOldAlerts();

          const duration = Date.now() - startTime;
          console.log(`✅ [CRON] Cleanup completed in ${duration}ms:`, result);
        } catch (error) {
          console.error('❌ [CRON] Alerts cleanup failed:', error);
        }
      },
      {
        scheduled: false,
        timezone: 'UTC',
      },
    );

    job.start();
    this.jobs.set(jobName, job);
    console.log('📅 Alerts cleanup scheduled (daily at 2AM UTC)');
  }

  // ====== ОЧИСТКА СТАРЫХ СРАБОТАВШИХ АЛЕРТОВ ======
  async cleanupOldAlerts() {
    const admin = require('firebase-admin');
    const db = admin.firestore();

    try {
      // Удаляем сработавшие алерты старше 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldAlertsQuery = db
        .collection('priceAlerts')
        .where('triggeredAt', '!=', null)
        .where(
          'triggeredAt',
          '<',
          admin.firestore.Timestamp.fromDate(thirtyDaysAgo),
        );

      const snapshot = await oldAlertsQuery.get();

      if (snapshot.empty) {
        return { deleted: 0, message: 'No old alerts to cleanup' };
      }

      const batch = db.batch();
      let deleteCount = 0;

      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        deleteCount++;
      });

      await batch.commit();

      return {
        deleted: deleteCount,
        message: `Deleted ${deleteCount} old triggered alerts`,
      };
    } catch (error) {
      console.error('❌ Cleanup error:', error);
      throw error;
    }
  }
}

// Экспортируем singleton
const cronService = new CronService();

module.exports = cronService;
