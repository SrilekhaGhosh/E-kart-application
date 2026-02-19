import userSchema from "../models/userSchema.js";
import dotenv from "dotenv/config"
import jwt from "jsonwebtoken"
import sessionSchema from "../models/sessionSchema.js";


export const hasToken = async (req, res, next) => {
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
                    const existing = await sessionSchema.findOne({ userId: id })
                    if (existing) {
                        req.user = { id }
                        req.userId = id
                        next()
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: "User Allready LoggedOut"
                        })
                    }
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