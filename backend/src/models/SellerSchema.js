import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  businessName: String,
  ownerName: String,
  rating: Number,

  inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

export default mongoose.model("Seller", sellerSchema);