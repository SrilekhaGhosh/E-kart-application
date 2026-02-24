import userSchema from "../models/userSchema.js";
import dotenv from "dotenv/config";
import jwt from "jsonwebtoken";


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

                    
                    const profileExists = await Profile.findOne({ userId: user._id });
                    if (!profileExists) {
                    
                        await Profile.create({ userId: user._id });
                        
                        await Cart.create({ buyerId: user._id, items: [] });
                        
                    }
                   

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