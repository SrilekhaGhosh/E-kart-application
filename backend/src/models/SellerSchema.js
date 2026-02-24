import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  businessName: String,
  ownerName: String,
  rating: Number,
  // A helper array to quickly find all products by this seller
  inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

export default 