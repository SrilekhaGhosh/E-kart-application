import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "backenduser",
    required: true,
    unique: true
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1, min: 1 },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);