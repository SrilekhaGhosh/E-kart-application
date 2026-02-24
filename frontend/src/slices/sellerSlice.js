import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../config/api';

export const fetchSellerProducts = createAsyncThunk(
  'seller/fetchSellerProducts',
  async (token) => {
    const response = await axios.get(apiUrl('/market/seller/my-products'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const fetchSellerHistory = createAsyncThunk(
  'seller/fetchSellerHistory',
  async (token) => {
    const response = await axios.get(apiUrl('/market/seller/history'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

const sellerSlice = createSlice({
  name: 'seller',
  initialState: {
    products: [],
    history: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchSellerHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSellerHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.history = action.payload;
      })
      .addCase(fetchSellerHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default sellerSlice.reducer;
