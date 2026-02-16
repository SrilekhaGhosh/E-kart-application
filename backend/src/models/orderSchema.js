import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "backenduser",
    required: true
  },
  shippingAddress: { // Snapshot from Profile
    street: String,
    city: String,
    zip: String,
    country: String
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "backenduser" }, // Essential for Seller Dashboard
    name: String,   // Snapshot
    price: Number,  // Snapshot
    quantity: Number,
    image: String
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["placed", "shipped", "delivered", "cancelled"],
    default: "placed"
  },
  paymentId: String
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);