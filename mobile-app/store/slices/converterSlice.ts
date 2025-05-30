import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';

import { api, NBURate } from '../../services/api';

interface ConverterState {
  rates: NBURate[]; // All NBU rates to UAH
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
}

const initialState: ConverterState = {
  rates: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  fromCurrency: 'USD',
  toCurrency: 'EUR',
  amount: '1',
};

export const fetchConverterRates = createAsyncThunk(
  'converter/fetchConverterRates',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const currentState = state.converter;
      const isOffline = state.app.isOffline;

      if (isOffline) {
        if (currentState.rates && currentState.rates.length > 0) {
          return {
            rates: currentState.rates,
            lastUpdated: currentState.lastUpdated,
          };
        } else {
          return rejectWithValue('No internet connection and no cached data');
        }
      }

      const netState = await NetInfo.refresh();
      if (!netState.isConnected) {
        if (currentState.rates && currentState.rates.length > 0) {
          return {
            rates: currentState.rates,
            lastUpdated: currentState.lastUpdated,
          };
        } else {
          return rejectWithValue('No internet connection and no cached data');
        }
      }

      const allRates = await api.getRatesForConverter();
      if (!allRates || allRates.length === 0) {
        throw new Error('No rates data received from API');
      }

      return {
        rates: allRates,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch converter rates');
    }
  }
);

const converterSlice = createSlice({
  name: 'converter',
  initialState,
  reducers: {
    setFromCurrency: (state, action: PayloadAction<string>) => {
      state.fromCurrency = action.payload;
    },
    setToCurrency: (state, action: PayloadAction<string>) => {
      state.toCurrency = action.payload;
    },
    setAmount: (state, action: PayloadAction<string>) => {
      state.amount = action.payload;
    },
    swapCurrencies: state => {
      const temp = state.fromCurrency;
      state.fromCurrency = state.toCurrency;
      state.toCurrency = temp;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchConverterRates.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConverterRates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.rates = action.payload.rates;
        state.lastUpdated = action.payload.lastUpdated;
      })
      .addCase(fetchConverterRates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFromCurrency, setToCurrency, setAmount, swapCurrencies, clearError } =
  converterSlice.actions;

// Selectors
export const selectConverterRates = (state: { converter: ConverterState }) => state.converter.rates;
export const selectConverterLoading = (state: { converter: ConverterState }) =>
  state.converter.isLoading;
export const selectConverterError = (state: { converter: ConverterState }) => state.converter.error;
export const selectConverterLastUpdated = (state: { converter: ConverterState }) =>
  state.converter.lastUpdated;
export const selectFromCurrency = (state: { converter: ConverterState }) =>
  state.converter.fromCurrency;
export const selectToCurrency = (state: { converter: ConverterState }) =>
  state.converter.toCurrency;
export const selectAmount = (state: { converter: ConverterState }) => state.converter.amount;

// Build available currencies from rates
export const selectConverterCurrencies = (state: { converter: ConverterState }) => {
  const rates = state.converter.rates;
  if (!rates || rates.length === 0) {
    return [];
  }
  // Always include UAH
  const uah = { code: 'UAH', name: 'Ukrainian Hryvnia', rate: 1 };
  return [
    uah,
    ...rates.map(r => ({
      code: r.cc,
      name: r.txt,
      rate: r.rate,
    })),
  ];
};

// Calculate converted amount
export const selectConvertedAmount = (state: { converter: ConverterState }) => {
  const { rates, fromCurrency, toCurrency, amount } = state.converter;
  if (!amount || isNaN(Number(amount))) {
    return '';
  }
  const amt = parseFloat(amount);

  if (fromCurrency === toCurrency) {
    return amt.toString();
  }

  // Find rates to UAH
  const getRateToUAH = (cc: string) => {
    if (cc === 'UAH') {
      return 1;
    }
    const found = rates.find(r => r.cc === cc);
    return found ? found.rate : null;
  };

  const fromRate = getRateToUAH(fromCurrency);
  const toRate = getRateToUAH(toCurrency);

  if (!fromRate || !toRate) {
    return '';
  }

  // Convert: amount in FROM -> UAH -> TO
  const amountInUAH = amt * fromRate;
  const result = amountInUAH / toRate;
  return result.toString();
};

// Data freshness
export const selectConverterDataFreshness = (state: { converter: ConverterState }) => {
  if (!state.converter.lastUpdated) {
    return null;
  }
  const lastUpdated = new Date(state.converter.lastUpdated);
  const now = new Date();
  const diffInHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  return {
    lastUpdated: state.converter.lastUpdated,
    hoursAgo: Math.floor(diffInHours),
    isStale: diffInHours > 12,
  };
};

export default converterSlice.reducer;
