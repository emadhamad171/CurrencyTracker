import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import currencyReducer from './slices/currencySlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import NetInfo from '@react-native-community/netinfo';
import historyReducer from './slices/historySlice';
import appReducer, {setNetworkStatus} from './slices/appSlice';

// Конфигурация для Redux Persist
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['currency', 'history'] // Какие slices сохранять
};

// Комбинируем все редьюсеры
const rootReducer = combineReducers({
    currency: currencyReducer,
    history: historyReducer,
    app: appReducer

    // Добавляйте здесь другие редьюсеры
});

// Создаем персистентный редьюсер
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Создаем хранилище
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
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

