import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, FraudStats, TransactionResult } from '@/types';

// Define initial state
interface AppState {
  transactions: Transaction[];
  stats: FraudStats | null;
  user: { username: string } | null;
  loading: boolean;
  error: string | null;
  transactionResult: {
    transaction: Transaction | null;
    result: TransactionResult | null;
  };
}

const initialState: AppState = {
  transactions: [],
  stats: null,
  user: null,
  loading: false,
  error: null,
  transactionResult: {
    transaction: null,
    result: null,
  },
};

// Create slice
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    setStats: (state, action: PayloadAction<FraudStats>) => {
      state.stats = action.payload;
    },
    setUser: (state, action: PayloadAction<{ username: string } | null>) => {
      state.user = action.payload;
    },
    setTransactionResult: (
      state,
      action: PayloadAction<{
        transaction: Transaction;
        result: TransactionResult;
      }>
    ) => {
      state.transactionResult = action.payload;
    },
    resetTransactionResult: (state) => {
      state.transactionResult = {
        transaction: null,
        result: null,
      };
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setTransactions,
  addTransaction,
  setStats,
  setUser,
  setTransactionResult,
  resetTransactionResult,
} = appSlice.actions;

// Configure store
export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
