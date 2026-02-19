import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchBuyerProfile = createAsyncThunk(
  'buyer/fetchBuyerProfile',
  async (token) => {
    const response = await axios.get('http://localhost:8001/market/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const fetchBuyerOrders = createAsyncThunk(
  'buyer/fetchBuyerOrders',
  async (token) => {
    const response = await axios.get('http://localhost:8001/market/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.orders;
  }
);

const buyerSlice = createSlice({
  name: 'buyer',
  initialState: {
    profile: null,
    orders: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuyerProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBuyerProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchBuyerProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchBuyerOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      });
  },
});

export default buyerSlice.reducer;
