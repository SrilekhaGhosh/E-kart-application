import express from "express"
import { login, logout, register, updateUserProfile, getUserProfile } from "../controllers/userController.js"
import { verifyToken } from "../middleware/verifyToken.js"
import { hasToken } from "../middleware/hasToken.js"
import { uploadProfile } from "../middleware/UploadProfile.js"
import { userValidateSchema, validateUser } from "../validators/userValidate.js"


const userRoute = express.Router()

userRoute.post("/register",validateUser(userValidateSchema), register)
userRoute.post("/login", login)
userRoute.get("/verify", verifyToken)
userRoute.get("/profile/:id", hasToken, getUserProfile)
userRoute.delete("/logout", hasToken, logout)
userRoute.put("/update-profile", hasToken, uploadProfile.single("profileImage"), updateUserProfile)

export default userRoute