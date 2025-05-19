// store/slices/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
    isOffline: boolean;
    lastConnectivityCheck: string | null;
}

const initialState: AppState = {
    isOffline: false,
    lastConnectivityCheck: null
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setNetworkStatus(state, action: PayloadAction<boolean>) {
            console.log(action.payload, 'PAYLOAd');
            state.isOffline = action.payload;
        }
    }
});

export const { setNetworkStatus } = appSlice.actions;
export default appSlice.reducer;
