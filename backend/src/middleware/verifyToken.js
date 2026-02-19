import userSchema from "../models/userSchema.js";
import dotenv from "dotenv/config";
import jwt from "jsonwebtoken";

// ---> NEW IMPORTS <---
import Profile from "../models/profileSchema.js";
import Cart from "../models/cartSchema.js";

export const verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token is Missing"
            })
        } else {
            const token = authHeader.split(" ")[1]
            jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        return res.status(400).json({
                            success: false,
                            message: "Token is Expire"
                        })
                    }
                    return res.status(400).json({
                        success: false,
                        message: "Token is Invalid"
                    })
                } else {
                    const { id } = decoded
                    const user = await userSchema.findById(id)
                    if (!user) {
                        return res.status(400).json({
                            success: false,
                            message: "User Not Found"
                        })
                    }
                    
                    user.token = null
                    user.isVerified = true
                    await user.save()

                    // ==========================================
                    // ---> NEW LOGIC: CREATE PROFILE & CART <---
                    // ==========================================
                    const profileExists = await Profile.findOne({ userId: user._id });
                    if (!profileExists) {
                        // 1. Create the blank Profile for address/business details
                        await Profile.create({ userId: user._id });
                        
                        // 2. Create the empty Cart
                        await Cart.create({ buyerId: user._id, items: [] });
                        
                        // Note on Orders: We DO NOT create an Order document here. 
                        // Order documents should only be created when a user actually 
                        // completes a checkout. The Order history is just a collection 
                        // of those checkout documents.
                    }
                    // ==========================================

                    return res.status(200).json({
                        success: true,
                        message: "User Verified Successfully",
                        user
                    })
                }
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}