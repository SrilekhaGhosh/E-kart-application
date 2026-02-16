import mongoose  from "mongoose";




const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "backenduser", // Links to your existing User
    required: true
  },
  name:
   { type: String,
     required: true,
      trim: true },
  description: 
  { type: String,
     required: true },
  price: 
  { type: Number,
     required: true,
      min: 0 },
  category: {
     type: String,
      required: true 
    },
  stock:
   { type: Number, 
    required: true,
     min: 0
     },
  images: [String],
  isActive:
   { type: Boolean, 
    default: true }
}, { timestamps: true });

// Ensure a seller can't duplicate product names
productSchema.index({ sellerId: 1, name: 1 }, { unique: true });

// check if "Product" exists in mongoose.models, otherwise create it
export default mongoose.models.Product || mongoose.model("Product", productSchema);