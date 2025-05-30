// store/slices/forecastSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { api, ForecastData } from '../../services/api';

// Enum for forecast methods
export enum ForecastMethod {
  LINEAR = 'linear',
  ADVANCED = 'advanced',
  MACHINE_LEARNING = 'ml',
}

// Fixed forecast days by method
export const FORECAST_DAYS = {
  [ForecastMethod.LINEAR]: 7,
  [ForecastMethod.ADVANCED]: 14,
  [ForecastMethod.MACHINE_LEARNING]: 30,
};

// Параметры для запроса прогноза
export interface ForecastParams {
  currency: string;
  method: ForecastMethod;
}

// Состояние slice
interface ForecastState {
  forecastData: ForecastData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Начальное состояние
const initialState: ForecastState = {
  forecastData: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk для получения прогноза
export const fetchForecast = createAsyncThunk(
  'forecast/fetchForecast',
  async (params: ForecastParams, { getState, rejectWithValue }) => {
    try {
      // Получаем текущее состояние
      const state = getState() as any;
      const currentState = state.forecast;
      const isOffline = state.app.isOffline; // Используем глобальное состояние сети

      // Если оффлайн, но есть кешированные данные, возвращаем их
      if (isOffline) {
        if (currentState.forecastData && currentState.forecastData.length > 0) {
          return {
            data: currentState.forecastData,
            lastUpdated: currentState.lastUpdated,
          };
        } else {
          return rejectWithValue('Отсутствует подключение к интернету и нет кешированных данных');
        }
      }

      // Если онлайн, загружаем свежие данные
      const forecastResult = await api.getForecast({
        currency: params.currency.toLowerCase(),
        method: params.method,
      });

      if (!forecastResult || forecastResult.length === 0) {
        throw new Error('No forecast data could be generated');
      }

      return {
        data: forecastResult,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch forecast');
    }
  }
);

// Slice
const forecastSlice = createSlice({
  name: 'forecast',
  initialState,
  reducers: {
    // Очистка ошибки
    clearError: state => {
      state.error = null;
    },
    // Очистка всех данных прогноза
    clearForecastData: state => {
      state.forecastData = [];
      state.error = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: builder => {
    builder
      // Начало загрузки
      .addCase(fetchForecast.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      // Успешная загрузка
      .addCase(fetchForecast.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.forecastData = action.payload.data;
        state.lastUpdated = action.payload.lastUpdated;
      })
      // Ошибка загрузки
      .addCase(fetchForecast.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Не очищаем данные при ошибке - они могут быть из кеша
      });
  },
});

// Экспортируем actions
export const { clearError, clearForecastData } = forecastSlice.actions;

// Селекторы
export const selectForecastData = (state: { forecast: ForecastState }) =>
  state.forecast.forecastData;
export const selectForecastLoading = (state: { forecast: ForecastState }) =>
  state.forecast.isLoading;
export const selectForecastError = (state: { forecast: ForecastState }) => state.forecast.error;
export const selectForecastLastUpdated = (state: { forecast: ForecastState }) =>
  state.forecast.lastUpdated;

// Экспортируем reducer
export default forecastSlice.reducer;
