// store/slices/historySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';


// Типы данных


interface HistoryState {
    historicalData: [], // Объект для хранения исторических данных по валютам и периодам
    isLoading: boolean,
    error: object | null,
    lastUpdated: object | null,
}

// Начальное состояние
const initialState: HistoryState = {
    historicalData: [], // Объект для хранения исторических данных по валютам и периодам
    isLoading: false,
    error: null,
    lastUpdated: null
};

// Thunk для загрузки исторических данных
export const fetchHistoricalRates = createAsyncThunk(
    'history/fetchHistoricalRates',
    async (params: {currency: string, period: string}, { getState, rejectWithValue }) => {
        try {
            // Используем глобальное состояние сети
            const state = getState() as any;
            const isOffline = state.app.isOffline;
            const currentState = state.history
            console.log(state, '!!!!!!!!!!!');

            if (isOffline) {
                if (currentState?.historicalData) {
                    return {
                        data : currentState?.historicalData,
                        lastUpdated: currentState.lastUpdated
                    };
                } else {
                    return rejectWithValue('Нет подключения к интернету и отсутствуют кэшированные данные');
                }
            }

            const data = await api.getHistoricalRates(params);

            return {
                ...data,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            return rejectWithValue((error as Error).message || 'Не удалось загрузить исторические данные');
        }
    }
);

// Срез для истории курсов
const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHistoricalRates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchHistoricalRates.fulfilled, (state, action) => {
                state.isLoading = false;
                // Сохраняем данные в кэш по ключу
                const { data, lastUpdated } = action.payload;
                console.log(action.payload, '!!!!!!!!!!!');
                // Обновляем кэш и метки времени
                state.historicalData = data


                // Обновляем общую метку времени
                state.lastUpdated = lastUpdated;
            })
            .addCase(fetchHistoricalRates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Произошла ошибка при загрузке данных';
            });
    }
});

export default historySlice.reducer;
