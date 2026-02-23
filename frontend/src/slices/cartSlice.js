import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (token, { rejectWithValue }) => {
    try {
      console.log('Redux: Fetching cart');
      const response = await axios.get('http://localhost:8001/market/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Redux: Cart fetched', response.data);
      return response.data;
    } catch (error) {
      console.error('Redux: Fetch cart failed', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { msg: error.message });
    }
  }
);


export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, token }, { rejectWithValue }) => {
    try {
      console.log('Redux: Adding to cart', { productId, quantity });
      const response = await axios.post(
        'http://localhost:8001/market/cart',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Redux: Cart response', response.data);
      return response.data;
    } catch (error) {
      console.error('Redux: Add to cart failed', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { msg: error.message });
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateCartQuantity',
  async ({ productId, quantity, token }, { rejectWithValue }) => {
    try {
      console.log('Redux: Updating cart quantity', { productId, quantity });
      const response = await axios.put(
        'http://localhost:8001/market/cart',
        { productId, quantity, setQuantity: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Redux: Update response', response.data);
      return response.data;
    } catch (error) {
      console.error('Redux: Update cart failed', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { msg: error.message });
    }
  }
);

export const placeOrder = createAsyncThunk(
  'cart/placeOrder',
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:8001/market/buy',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Normalize cart shape
        if (Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else if (action.payload && action.payload.items) {
          state.items = action.payload.items;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.msg || action.payload?.message || action.error.message;
      })
      .addCase(addToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Accept both { items: [...] } and full cart object
        if (Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else if (action.payload && action.payload.items) {
          state.items = action.payload.items;
        } else {
          state.items = [];
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.msg || action.payload?.message || action.error.message;
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (Array.isArray(action.payload.items)) {
          state.items = action.payload.items;
        } else if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else if (action.payload && action.payload.items) {
          state.items = action.payload.items;
        } else {
          state.items = [];
        }
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.msg || action.payload?.message || action.error.message;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.items = [];
        state.status = 'succeeded';
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.msg || action.payload?.message || action.error.message;
      });
  },
});

export default cartSlice.reducer;
