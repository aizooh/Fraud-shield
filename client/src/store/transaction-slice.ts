import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '@shared/schema';

interface TransactionState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
}

const initialState: TransactionState = {
  transactions: [],
  selectedTransaction: null
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload;
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions = [action.payload, ...state.transactions];
    },
    selectTransaction(state, action: PayloadAction<Transaction>) {
      state.selectedTransaction = action.payload;
    },
    clearSelectedTransaction(state) {
      state.selectedTransaction = null;
    }
  }
});

export const {
  setTransactions,
  addTransaction,
  selectTransaction,
  clearSelectedTransaction
} = transactionSlice.actions;

export default transactionSlice.reducer;
