import multer from "multer";

// Memory storage so nothing is written to disk; controller uploads to Cloudinary.
const storage = multer.memoryStorage();

export const uploadProfile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
