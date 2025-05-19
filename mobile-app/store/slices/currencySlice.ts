// store/slices/currencySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, RatesResponse } from '../../services/api';
import { DEFAULT_CURRENCIES } from '../../constants/config';

interface CurrencyState {
    rates: RatesResponse | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null; // Timestamp последнего успешного обновления
}

const initialState: CurrencyState = {
    rates: null,
    isLoading: false,
    error: null,
    lastUpdated: null
};

// Thunk для загрузки курсов валют
export const fetchRates = createAsyncThunk(
    'currency/fetchRates',
    async (currencies: string[], { getState, rejectWithValue }) => {
        try {
            // Получаем текущее состояние
            const state = getState() as any;
            const currentState = state.currency;
            const isOffline = state.app.isOffline; // Используем глобальное состояние сети
            // Если оффлайн, но есть кешированные данные, возвращаем их с флагом оффлайн
            if (isOffline) {
                if (currentState.rates) {
                    return {
                        ...currentState.rates,
                        // Сохраняем оригинальную отметку времени
                        lastUpdated: currentState.lastUpdated
                    };
                } else {
                    return rejectWithValue('Отсутствует подключение к интернету и нет кешированных данных');
                }
            }

            // Если онлайн, загружаем свежие данные
            const data = await api.getCurrentRates(
                DEFAULT_CURRENCIES.BASE,
                currencies
            );

            // Возвращаем с обновленной отметкой времени и выключенным флагом оффлайн
            return {
                ...data,
                lastUpdated: new Date().toISOString()
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Не удалось загрузить курсы валют');
        }
    }
);

const currencySlice = createSlice({
    name: 'currency',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rates = action.payload;
                state.lastUpdated = action.payload.lastUpdated;

                // Извлекаем доступные банки из полученных данных
                const banks: string[] = [];
                if (action.payload.banks) {
                    action.payload.banks.forEach((rate: any) => {
                        if (rate.source && !banks.includes(rate.source)) {
                            banks.push(rate.source);
                        }
                    });
                }

            })
            .addCase(fetchRates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                // Если данные загружались ранее, помечаем их как оффлайн
            });
    }
});

export default currencySlice.reducer;
