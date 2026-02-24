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
      required: true,
      trim: true,
      lowercase: true
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


productSchema.index({ sellerId: 1, name: 1 }, { unique: true });


export default mongoose.models.Product || mongoose.model("Product", productSchema);