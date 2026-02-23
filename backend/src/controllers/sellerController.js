import Product from "../models/productSchema.js";
import Order from "../models/orderSchema.js";
import multer from "multer";
import path from "path"; // Required for file extensions

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
    destination: "uploads/", // Make sure this folder exists in your project root
    filename: function (req, file, cb) {
        // Creates a unique filename: image-17000000000.jpg
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

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

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        // Construct the URL to access the image
        // Inside addProduct or editProduct
const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

// Example output: http://localhost:8001/uploads/image-17156789.png
        // Check duplicate name for this specific seller
        const exists = await Product.findOne({ sellerId: req.userId, name });
        if (exists) return res.status(400).json({ msg: "Product with this name already exists." });

        const newProduct = new Product({
            sellerId: req.userId,
            name, 
            price, 
            description,
            category, 
            stock, 
            images: [imageUrl] // Saving the URL in the array
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

        // If a new file is uploaded, update the image URL
        if (req.file) {
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            updateData.images = [imageUrl]; 
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