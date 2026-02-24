import { v2 as cloudinary } from "cloudinary";

const cloudinaryUrl = process.env.CLOUDINARY_URL;

// Uses CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
if (!cloudinaryUrl) {
	console.warn("CLOUDINARY_URL is not set. Cloudinary uploads will fail.");
} else {
	try {
		const parsed = new URL(cloudinaryUrl);
		const cloudName = parsed.hostname;
		const apiKey = decodeURIComponent(parsed.username);
		const apiSecret = decodeURIComponent(parsed.password);

		cloudinary.config({
			cloud_name: cloudName,
			api_key: apiKey,
			api_secret: apiSecret,
			secure: true,
		});
	} catch (e) {
		console.warn("Invalid CLOUDINARY_URL format. Cloudinary uploads will fail.");
	}
}

export const uploadImageBuffer = (buffer, options = {}) => {
	return new Promise((resolve, reject) => {
		if (!buffer) return reject(new Error("No file buffer provided"));

		const stream = cloudinary.uploader.upload_stream(
			{
				resource_type: "image",
				...options,
			},
			(error, result) => {
				if (error) return reject(error);
				resolve(result);
			}
		);

		stream.end(buffer);
	});
};

export default cloudinary;
