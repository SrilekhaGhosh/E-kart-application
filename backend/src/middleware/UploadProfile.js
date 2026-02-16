import multer from "multer";
import path from "path";

const uploadPath = path.join(process.cwd(), "src", "upload", "profiles");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id;
    if (!userId) {
      return cb(new Error("User ID not found in request"));
    }
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(
      null,
      userId + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  }
});

export const uploadProfile = multer({ storage });
