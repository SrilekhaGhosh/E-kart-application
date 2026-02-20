import express from "express";
import { hasToken } from "../middleware/hasToken.js"; // Using YOUR existing middleware

import { 
  getAllProducts, 
  addToCart, 
  getCartDetails, 
  buy, 
  getMarketProfile,   
  updateMarketProfile ,
  getMyOrders
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

// --- BUYER FEATURES (Protected by Token) ---
marketRoute.get("/profile", hasToken, getMarketProfile);      // Gets Address + Orders
marketRoute.put("/profile", hasToken, updateMarketProfile);   // Updates Address/Business Info
marketRoute.post("/cart", hasToken, addToCart);
marketRoute.get("/cart", hasToken, getCartDetails);
marketRoute.post("/buy", hasToken, buy);
marketRoute.get("/orders", hasToken, getMyOrders);

// --- SELLER FEATURES ---
marketRoute.post("/seller/product", hasToken,upload.single('image'), addProduct);
marketRoute.put("/seller/product/:id", hasToken, upload.single('image'),editProduct);
marketRoute.delete("/seller/product/:id", hasToken, deleteProduct);
marketRoute.get("/seller/history", hasToken, getSellerHistory);
marketRoute.get("/seller/my-products", hasToken, getSellerProducts);

export default marketRoute;