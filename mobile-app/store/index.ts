import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupListeners } from '@reduxjs/toolkit/query';

import currencyReducer from './slices/currencySlice';
import historyReducer from './slices/historySlice';
import forecastReducer from './slices/forecastSlice';
import converterReducer from './slices/converterSlice';
import appReducer from './slices/appSlice';

// Конфигурация для Redux Persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['currency', 'history', 'forecast', 'converter'], // Какие slices сохранять
};

// Комбинируем все редьюсеры
const rootReducer = combineReducers({
  currency: currencyReducer,
  history: historyReducer,
  forecast: forecastReducer,
  converter: converterReducer,
  app: appReducer,

  // Добавляйте здесь другие редьюсеры
});

// Создаем персистентный редьюсер
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Создаем хранилище
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Создаем persistor для сохранения состояния
export const persistor = persistStore(store);

// Настраиваем слушатели для RTK Query (если будем использовать)
setupListeners(store.dispatch);

// Настраиваем мониторинг соединения
// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
