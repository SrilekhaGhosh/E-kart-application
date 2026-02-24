import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

export const uploadImageBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer) return reject(new Error("Missing file buffer"));

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
