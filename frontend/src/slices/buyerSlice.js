import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { apiUrl } from '../config/api';

export const fetchBuyerProfile = createAsyncThunk(
  'buyer/fetchBuyerProfile',
  async (token) => {
    const response = await axios.get(apiUrl('/market/profile'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const fetchBuyerOrders = createAsyncThunk(
  'buyer/fetchBuyerOrders',
  async (token) => {
    const response = await axios.get(apiUrl('/market/orders'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.orders;
  }
);

export const updateBuyerMarketProfile = createAsyncThunk(
  'buyer/updateBuyerMarketProfile',
  async ({ token, address }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        apiUrl('/market/profile'),
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: error.message });
    }
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
      })
      .addCase(updateBuyerMarketProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateBuyerMarketProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updateBuyerMarketProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.msg || action.error.message;
      });
  },
});

export default buyerSlice.reducer;
