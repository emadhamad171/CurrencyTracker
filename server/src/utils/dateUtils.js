/**
 * Форматирует дату в строку формата 'YYYY-MM-DD'
 * @param {Date} date - Дата для форматирования
 * @returns {string} - Строка с датой в формате 'YYYY-MM-DD'
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Получает диапазон дат для указанного периода
 * @param {string} period - Период ('7days', '30days', '90days', '365days')
 * @returns {Object} - Объект с начальной и конечной датами
 */
const getDateRangeForPeriod = (period) => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case '7days':
      start.setDate(end.getDate() - 7);
      break;
    case '30days':
      start.setDate(end.getDate() - 30);
      break;
    case '90days':
      start.setDate(end.getDate() - 90);
      break;
    case '365days':
      start.setDate(end.getDate() - 365);
      break;
    default:
      start.setDate(end.getDate() - 30); // По умолчанию 30 дней
  }

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

/**
 * Генерирует массив дат для заданного периода
 * @param {string} period - Период ('7days', '30days', '90days', '365days')
 * @returns {string[]} - Массив дат в формате 'YYYY-MM-DD'
 */
const generateDateArray = (period) => {
  const { start, end } = getDateRangeForPeriod(period);
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates = [];

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Проверяет, устарели ли данные относительно текущего времени
 * @param {Date|string} date - Дата для проверки
 * @param {number} maxAgeMs - Максимальный возраст данных в миллисекундах
 * @returns {boolean} - true, если данные устарели
 */
const isDataOutdated = (date, maxAgeMs) => {
  const now = new Date();
  const dataDate = new Date(date);
  return now.getTime() - dataDate.getTime() > maxAgeMs;
};

/**
 * Определяет максимальный возраст данных в зависимости от источника
 * @param {string} source - Источник данных
 * @returns {number} - Максимальный возраст данных в миллисекундах
 */
const getMaxAgeForSource = (source) => {
  switch (source) {
    case 'national_bank':
      // Национальный банк обновляет курсы раз в день
      return 24 * 60 * 60 * 1000; // 24 часа
    case 'interbank':
      // Межбанк обновляется чаще
      return 1 * 60 * 60 * 1000; // 1 час
    case 'exchange_offices':
      // Обменные пункты обновляются несколько раз в день
      return 6 * 60 * 60 * 1000; // 6 часов
    default:
      return 12 * 60 * 60 * 1000; // 12 часов по умолчанию
  }
};

module.exports = {
  formatDate,
  getDateRangeForPeriod,
  generateDateArray,
  isDataOutdated,
  getMaxAgeForSource,
};
