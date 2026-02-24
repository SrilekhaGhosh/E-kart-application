import userSchema from "../models/userSchema.js";
import dotenv from "dotenv/config"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import sessionSchema from "../models/sessionSchema.js";
import { verifyMail } from "../emailVerify/verifyMail.js";
import { uploadImageBuffer } from "../config/cloudinary.js";


// export const register = async (req, res) => {
//     try {
//         const { userName, email, password,role } = req.body
//          if (role && !["buyer", "seller"].includes(role)) {
//       return res.status(400).json({
//         message: "Invalid role selected"
//       });
//     }
//         const existing = await userSchema.findOne({ email })
//         if (existing) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User Allready Exist"
//             })
//         }
//         const hashedPassword = await bcrypt.hash(password, 10)
//         const user = await userSchema.create({ userName, email, password: hashedPassword,role })
//         const token = jwt.sign({ id: user._id }, process.env.SECRETKEY, {
//             expiresIn: "5m"
//         })
//         user.token = token
//         await user.save()
//         verifyMail(token,email)
//         if (user) {
//             return res.status(201).json({
//                 success: true,
//                 message: "User Registered Successfully",
//                 user
                
//             })
//         }
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
export const register = async (req, res) => {
    try {
        const { userName, email, password, role } = req.body;

        if (role && !["buyer", "seller"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role selected"
            });
        }

        const existing = await userSchema.findOne({ email });

       if (existing) {
            if (existing.isVerified === false) {
                // If they exist but never verified, delete the old junk record!
                await userSchema.findByIdAndDelete(existing._id);
            } else {
                // If they exist AND are verified, block them.
                return res.status(400).json({
                    success: false,
                    message: "User Already Exists and is verified. Please login."
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userSchema.create({
            userName,
            email,
            password: hashedPassword,
            role: role || "buyer"
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.SECRETKEY,
            { expiresIn: "5m" }
        );
            user.token = token; // Make sure to save the token to the DB so we can check it later!
        await user.save();
        verifyMail(token, email);

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userSchema.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Unauthorised Access do register first"
            })
        } else {
            const passwordCheck = await bcrypt.compare(password, user.password)
            if (!passwordCheck ) {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect Password"
                })
            } else if (passwordCheck && user.isVerified) {
                await sessionSchema.findOneAndDelete({ userId: user._id })
                await sessionSchema.create({ userId: user._id })
                const accessToken = jwt.sign({ id: user._id }, process.env.SECRETKEY, {
                    expiresIn: "10days"
                })
                const refreshToken = jwt.sign({ id: user._id }, process.env.SECRETKEY, {
                    expiresIn: "30days"
                })
                user.isLoggedIn = true
                await user.save()
                return res.status(200).json({
                    success: true,
                    message: "User LoggedIn Successfully",
                    accessToken,
                    refreshToken,
                    user
                })
            } else {
                return res.status(401).json({
                    message: "verify then LoggedIn"
                })
            }
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async (req, res) => {
    try {
        const existing = await sessionSchema.findOne({ userId: req.userId })
        const user = await userSchema.findById({ _id: req.userId })
        if (existing) {
            await sessionSchema.findOneAndDelete({ userId: req.userId })
            user.isLoggedIn = false
            await user.save()
            return res.status(200).json({
                success: true,
                message: "User LoggedOut Successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "User Allready LoggedOut"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const updateUserProfile = async (req, res) => {
  try {
    const { userName } = req.body;

    const user = await userSchema.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User Not Found"
      });
    }

    // if image uploaded
    if (req.file) {
      const allowedType = ["image/jpeg", "image/png", "image/svg+xml"];

      if (!allowedType.includes(req.file.mimetype)) {
        return res.status(400).json({
          status: false,
          message: "File type not supported"
        });
      }

      const uploadResult = await uploadImageBuffer(req.file.buffer, {
        folder: `ekart/profiles/${user._id}`,
      });

      const imageUrl = uploadResult?.secure_url;
      if (!imageUrl) {
        return res.status(500).json({ status: false, message: "Cloudinary upload failed" });
      }

      user.profileImage = imageUrl;
    }

    // update username if provided
    if (userName) {
      user.userName = userName;
    }

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Profile Updated",
      user
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userSchema.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User Not Found"
      });
    }

    return res.status(200).json({
      status: true,
      user
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};



