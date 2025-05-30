// Настройки отображения
export const CHART_COLORS = {
  BUY: '#28a745',
  SELL: '#dc3545',
  GRID: '#e9e9e9',
  AXIS: '#666666',
  FORECAST: '#007bff',
  FORECAST_AREA: 'rgba(0, 123, 255, 0.1)',
};

export const CURRENCY_PAIRS = [
  { code: 'USDUAH' as const, label: '💵🇺🇦 USD/UAH', flag: '💵🇺🇦', name: 'US Dollar' },
  { code: 'EURUAH' as const, label: '💶🇺🇦 EUR/UAH', flag: '💶🇺🇦', name: 'Euro' },
  { code: 'GBPUAH' as const, label: '💷🇺🇦 GBP/UAH', flag: '💷🇺🇦', name: 'British Pound' },
  { code: 'CHFUAH' as const, label: '🇨🇭🇺🇦 CHF/UAH', flag: '🇨🇭🇺🇦', name: 'Swiss Franc' },
  { code: 'JPYUAH' as const, label: '💴🇺🇦 JPY/UAH', flag: '💴🇺🇦', name: 'Japanese Yen' },
  { code: 'CADUAH' as const, label: '🇨🇦🇺🇦 CAD/UAH', flag: '🇨🇦🇺🇦', name: 'Canadian Dollar' },
  { code: 'AUDUAH' as const, label: '🇦🇺🇺🇦 AUD/UAH', flag: '🇦🇺🇺🇦', name: 'Australian Dollar' },
  { code: 'PLNUAH' as const, label: '🇵🇱🇺🇦 PLN/UAH', flag: '🇵🇱🇺🇦', name: 'Polish Zloty' },
  { code: 'CZKUAH' as const, label: '🇨🇿🇺🇦 CZK/UAH', flag: '🇨🇿🇺🇦', name: 'Czech Koruna' },
  { code: 'CNHUAH' as const, label: '🇨🇳🇺🇦 CNH/UAH', flag: '🇨🇳🇺🇦', name: 'Chinese Yuan' },
];

export const DEFAULT_CURRENCIES = {
  BASE: 'UAH',
  SELECTED: ['USD', 'EUR', 'GBP', 'PLN', 'CHF'], // Топ-5 валют
};

// constants/config.ts - ПРОСТОЕ РЕШЕНИЕ БЕЗ EAS

// ====== API CONFIGURATION ======
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__
    ? 'http://localhost:5001/api' // Development
    : 'https://your-production-url.com/api'); // Production fallback

// ====== FIREBASE CONFIGURATION ======
export const FIREBASE_PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!;
export const FIREBASE_VAPID_KEY = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;

// Проверяем что основные переменные есть
if (!FIREBASE_PROJECT_ID) {
  throw new Error('EXPO_PUBLIC_FIREBASE_PROJECT_ID is required');
}

// ====== EXPO PUSH NOTIFICATIONS ======
// ✅ ПРОСТОЕ РЕШЕНИЕ: НЕ ПЕРЕДАЕМ projectId ВООБЩЕ
export const getExpoPushConfig = () => {
  return {
    // Никаких projectId - пусть Expo использует defaults
    ...(FIREBASE_VAPID_KEY && { vapidKey: FIREBASE_VAPID_KEY }),
  };
};

// ====== DEBUG INFO ======
if (__DEV__) {
  console.log('📱 Config loaded:');
  console.log('- API_URL:', API_URL);
  console.log('- FIREBASE_PROJECT_ID:', FIREBASE_PROJECT_ID);
  console.log('- VAPID_KEY configured:', !!FIREBASE_VAPID_KEY);
}
