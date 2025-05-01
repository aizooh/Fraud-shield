import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, FraudStats, TransactionResult } from '@/types'; // Assuming @/types is correct

// --- Keep your AppState Interface ---
interface AppState {
  transactions: Transaction[];
  stats: FraudStats | null;
  user: { username: string; role: string } | null; // Added role based on Sidebar usage
  loading: boolean;
  error: string | null;
  transactionResult: {
    transaction: Transaction | null;
    result: TransactionResult | null;
  };
}

// --- Keep your initial state ---
// Consider adding a default role if applicable
const initialState: AppState = {
  transactions: [],
  stats: null,
  // user: null, // Initial state is null
  // Let's provide an initial user object matching the structure Sidebar expects, even if it's guest-like
  user: { username: 'Guest', role: 'User' }, // Or keep null if you handle login explicitly elsewhere
  loading: false,
  error: null,
  transactionResult: {
    transaction: null,
    result: null,
  },
};

// --- Keep your app slice ---
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
    // Ensure the user payload includes the 'role' if you intend to store it
    setUser: (state, action: PayloadAction<{ username: string; role: string } | null>) => {
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
    // Optional: Add a logout action
    logoutUser: (state) => {
       state.user = null; // Or reset to guest state: { username: 'Guest', role: 'User' };
    }
  },
});

// --- Export actions ---
export const {
  setLoading,
  setError,
  setTransactions,
  addTransaction,
  setStats,
  setUser,
  setTransactionResult,
  resetTransactionResult,
  logoutUser, // if added
} = appSlice.actions;

// --- Configure the store (this part was already correct) ---
export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

// --- Export ONLY the CORRECT types derived from the actual store ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optional: Export the state shape interface if needed elsewhere, maybe with a clearer name
// export type AppSliceState = AppState;