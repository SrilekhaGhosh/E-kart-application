import mongoose  from "mongoose";

const buyerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  address: {
    street: String,
    city: String,
    zip: String
  },
  
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],
 
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});

export default mongoose.model("buyer", buyerSchema)