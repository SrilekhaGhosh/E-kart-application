import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { apiUrl } from "../config/api";

const API_URL = apiUrl("/market/products");

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}) => {
    const { append = false, ...queryParams } = params || {};
    const response = await axios.get(API_URL, { params: queryParams });
    return { data: response.data, append: Boolean(append) };
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
    selectedProduct: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const appendUniqueById = (existing = [], incoming = []) => {
      const map = new Map();
      for (const item of existing) {
        if (item && item._id) map.set(String(item._id), item);
      }
      for (const item of incoming) {
        if (item && item._id) map.set(String(item._id), item);
      }
      return Array.from(map.values());
    };

    builder
      // Fetch All
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";

        const payload = action.payload;
        const data = payload?.data !== undefined ? payload.data : payload;
        const append = Boolean(payload?.append);

       
        if (Array.isArray(data)) {
          state.items = append ? appendUniqueById(state.items, data) : data;
          state.page = 1;
          state.limit = data.length;
          state.totalItems = data.length;
          state.totalPages = 1;
        } else {
          const nextItems = data?.items || [];
          const nextPage = data?.page || 1;

          state.items = append && nextPage > 1 ? appendUniqueById(state.items, nextItems) : nextItems;
          state.page = nextPage;
          state.limit = data?.limit || 12;
          state.totalItems = data?.totalItems || 0;
          state.totalPages = data?.totalPages || 1;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

    
      .addCase(fetchProductById.pending, (state) => {
        state.status = "loading";
        state.selectedProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default productsSlice.reducer;