import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
      profileImage: {
        type: String,
        required: false
    },
    token: {
        type: String,
        default: null
    },
     role: {
    type: String,
    enum: ["buyer", "seller"],  
    default: "buyer"
  }
}, { timestamps: true })

export default mongoose.model("backenduser", userSchema)