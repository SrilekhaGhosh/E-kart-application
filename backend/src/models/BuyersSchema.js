import mongoose  from "mongoose";

const buyerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  address: {
    street: String,
    city: String,
    zip: String
  },
  // CART: Embed this because it changes constantly and belongs only to this user
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],
  // ORDER HISTORY: References to the Order collection
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

export default mongoose.model("buyer", buyerSchema)