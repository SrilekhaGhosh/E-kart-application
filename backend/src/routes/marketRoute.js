import express from "express";
import { hasToken } from "../middleware/hasToken.js"; // Using YOUR existing middleware

import { 
  getAllProducts, 
  getMarketCategories,
  addToCart, 
  getCartDetails, 
  buy, 
  getMarketProfile,   
  updateMarketProfile ,
  getMyOrders,
  getProductById,
  updateCart
} from "../controllers/buyerController.js";

import { 
  addProduct, 
  editProduct, 
  getSellerHistory,
  deleteProduct,
  getSellerProducts,
  upload
} from "../controllers/sellerController.js";

const marketRoute = express.Router();

// --- PUBLIC ---
marketRoute.get("/products", getAllProducts);
marketRoute.get("/categories", getMarketCategories);

// --- BUYER FEATURES (Protected by Token) ---
marketRoute.get("/profile", hasToken, getMarketProfile);      // Gets Address + Orders
marketRoute.put("/profile", hasToken, updateMarketProfile);   // Updates Address/Business Info
marketRoute.post("/cart", hasToken, addToCart);
marketRoute.put("/cart", hasToken, updateCart);
marketRoute.delete("/product/:id", hasToken, deleteProduct);
marketRoute.get("/cart", hasToken, getCartDetails);
marketRoute.get("/products/:id", getProductById);  
marketRoute.post("/buy", hasToken, buy);
marketRoute.get("/orders", hasToken, getMyOrders);

// --- SELLER FEATURES ---
marketRoute.post("/seller/product", hasToken, upload.array('images', 6), addProduct);
marketRoute.put("/seller/product/:id", hasToken, upload.array('images', 6), editProduct);
marketRoute.delete("/seller/product/:id", hasToken, deleteProduct);
marketRoute.get("/seller/history", hasToken, getSellerHistory);
marketRoute.get("/seller/my-products", hasToken, getSellerProducts);

export default marketRoute;