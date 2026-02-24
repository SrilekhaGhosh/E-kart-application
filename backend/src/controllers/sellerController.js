import Product from "../models/productSchema.js";
import Order from "../models/orderSchema.js";
import Cart from "../models/cartSchema.js";
import multer from "multer";
import { uploadImageBuffer } from "../config/cloudinary.js";

// --- MULTER CONFIGURATION ---
// Memory storage so nothing is written to disk; we upload buffer to Cloudinary.
const storage = multer.memoryStorage();

// Filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPG, PNG, and SVG are allowed."), false);
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});


// --- CONTROLLERS ---

export const addProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;

        const normalizedCategory = (category || "").toString().trim().toLowerCase();
        if (!normalizedCategory) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }

        const files = Array.isArray(req.files) ? req.files : [];
        if (!files.length) {
            return res.status(400).json({ success: false, message: "No images uploaded" });
        }

        const uploaded = await Promise.all(
            files.map((f) =>
                uploadImageBuffer(f.buffer, {
                    folder: `ekart/products/${req.userId}`,
                })
            )
        );

        const imageUrls = uploaded
            .map((u) => u?.secure_url)
            .filter(Boolean);

        if (!imageUrls.length) {
            return res.status(500).json({ msg: "Cloudinary upload failed" });
        }
        // Check duplicate name for this specific seller
        const exists = await Product.findOne({ sellerId: req.userId, name });
        if (exists) return res.status(400).json({ msg: "Product with this name already exists." });

        const newProduct = new Product({
            sellerId: req.userId,
            name, 
            price, 
            description,
            category: normalizedCategory,
            stock, 
            images: imageUrls // Saving URLs in the array
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ msg: "Duplicate product name." });
        res.status(500).json({ error: err.message });
    }
};

export const editProduct = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (updateData.category !== undefined) {
            const normalizedCategory = (updateData.category || "").toString().trim().toLowerCase();
            if (!normalizedCategory) {
                return res.status(400).json({ msg: "Category is required" });
            }
            updateData.category = normalizedCategory;
        }

        // If new files are uploaded, replace product images
        const files = Array.isArray(req.files) ? req.files : [];
        if (files.length) {
            const uploaded = await Promise.all(
                files.map((f) =>
                    uploadImageBuffer(f.buffer, {
                        folder: `ekart/products/${req.userId}`,
                    })
                )
            );

            const imageUrls = uploaded
                .map((u) => u?.secure_url)
                .filter(Boolean);

            if (!imageUrls.length) {
                return res.status(500).json({ msg: "Cloudinary upload failed" });
            }

            updateData.images = imageUrls;
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, sellerId: req.userId },
            { $set: updateData }, 
            { new: true }
        );

        if (!product) return res.status(404).json({ msg: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};






export const getSellerProducts = async (req, res) => {
    try {
        const myProducts = await Product.find({ sellerId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json(myProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// export const deleteProduct = async (req, res) => {
//     try {
//         const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.userId });
//         if (!product) return res.status(404).json({ msg: "Product not found" });
//         res.json({ msg: "Product Deleted" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

export const deleteProduct = async (req, res) => {
  try {
    // 1️⃣ Delete product (only seller can delete)
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      sellerId: req.userId
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // 2️⃣ Remove this product from ALL carts
    await Cart.updateMany(
      { "items.productId": product._id },
      { $pull: { items: { productId: product._id } } }
    );

    res.json({ msg: "Product deleted and removed from all carts" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSellerHistory = async (req, res) => {
    try {
        const orders = await Order.find({ "items.sellerId": req.userId })
            .populate('buyerId', 'userName email')
            .sort({ createdAt: -1 });

        const history = orders.map(order => {
            const myItems = order.items.filter(item => item.sellerId.toString() === req.userId);
            return {
                orderId: order._id,
                buyer: order.buyerId,
                date: order.createdAt,
                status: order.status,
                itemsSold: myItems,
                totalEarnings: myItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)
            };
        });

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};