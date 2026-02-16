import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "backenduser", // Links to your existing Auth User
    required: true,
    unique: true
  },
  // --- BUYER DATA ---
  address: {
    street: String,
    city: String,
    zip: String,
    country: String,
    phone: String
  },
  // --- SELLER DATA ---
  businessName: String,
  gstNumber: String,
  sellerRating: { type: Number, default: 0 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

// OPTIONAL: Virtual to see orders when fetching profile
profileSchema.virtual('myOrders', {
  ref: 'Order',
  localField: 'userId',
  foreignField: 'buyerId'
});

export default mongoose.model("Profile", profileSchema);