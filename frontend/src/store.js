// Redux store setup for EKart
import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import sellerReducer from './slices/sellerSlice';
import buyerReducer from './slices/buyerSlice';

const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    seller: sellerReducer,
    buyer: buyerReducer,
  },
});

export default store;
