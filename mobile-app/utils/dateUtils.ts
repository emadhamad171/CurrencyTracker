/**
 * Форматирует дату в строку формата 'DD.MM.YYYY HH:MM'
 * @param {Date | string} date - Дата для форматирования
 * @returns {string} - Отформатированная строка
 */
export const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

/**
 * Форматирует дату для отображения в графиках (только день и месяц)
 * @param {string} dateStr - Дата в формате 'YYYY-MM-DD'
 * @returns {string} - Строка с датой в формате 'DD.MM'
 */
export const formatDateForChart = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}`;
};

/**
 * Возвращает относительное время (например, "5 минут назад")
 * @param {Date | string} date - Дата для форматирования
 * @returns {string} - Строка с относительным временем
 */
export const getRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();

    // Конвертируем миллисекунды в минуты, часы и дни
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
        return 'только что';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} ${pluralize(diffMinutes, 'минуту', 'минуты', 'минут')} назад`;
    } else if (diffHours < 24) {
        return `${diffHours} ${pluralize(diffHours, 'час', 'часа', 'часов')} назад`;
    } else if (diffDays < 30) {
        return `${diffDays} ${pluralize(diffDays, 'день', 'дня', 'дней')} назад`;
    } else {
        return formatDate(dateObj);
    }
};

/**
 * Проверяет, устарели ли данные (старше определенного времени)
 * @param {Date | null} date - Дата для проверки
 * @param {number} maxAgeMs - Максимальный возраст данных в миллисекундах
 * @returns {boolean} - true, если данные устарели
 */
export const isDataStale = (date: Date | null, maxAgeMs: number = 3600000): boolean => {
    if (!date) return true;
    const now = new Date();
    return now.getTime() - date.getTime() > maxAgeMs;
};

/**
 * Получить диапазон дат для выбранного периода
 * @param {string} period - Период ('7days', '30days', '90days', '365days')
 * @returns {Object} - Объект с начальной и конечной датами
 */
export const getDateRangeForPeriod = (period: string): { start: string, end: string } => {
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
            start.setDate(end.getDate() - 30); // по умолчанию 30 дней
    }

    return {
        start: formatDateISO(start),
        end: formatDateISO(end)
    };
};

/**
 * Форматирует дату в формат ISO 'YYYY-MM-DD'
 * @param {Date} date - Дата для форматирования
 * @returns {string} - Строка с датой в формате 'YYYY-MM-DD'
 */
export const formatDateISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Вспомогательная функция для правильного склонения слов
 * @param {number} count - Количество
 * @param {string} one - Форма для 1 (минута)
 * @param {string} few - Форма для 2-4 (минуты)
 * @param {string} many - Форма для 5+ (минут)
 * @returns {string} - Правильная форма слова
 */
const pluralize = (count: number, one: string, few: string, many: string): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return one;
    } else if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
        return few;
    } else {
        return many;
    }
};
