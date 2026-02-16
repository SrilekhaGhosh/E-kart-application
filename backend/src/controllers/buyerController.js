import Product from "../models/ProductSchema.js";
import Cart from "../models/cartSchema.js";
import Order from "../models/orderSchema.js";
import Profile from  "../models/profileSchema.js" 



export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMarketProfile = async (req, res) => {
  try {
    // Fetches Profile AND populates the User Auth details (email/name) from your existing User model
    const profile = await Profile.findOne({ userId: req.userId })
      .populate('userId', 'userName email role profileImage') 
      .populate({ path: 'myOrders', options: { sort: { createdAt: -1 } } }); // Virtual Populate
      
    if (!profile) return res.status(404).json({ msg: "Market profile not found. Please update profile." });
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateMarketProfile = async (req, res) => {
  try {
    const { address, businessName, gstNumber } = req.body;
    
    // Upsert: Create if not exists, Update if exists
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $set: { address, businessName, gstNumber } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ buyerId: req.userId });

    if (!cart) {
      cart = new Cart({ buyerId: req.userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(p => p.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    await cart.save();
    res.json(cart);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Get all orders for the logged-in buyer
export const getMyOrders = async (req, res) => {
  try {
    // Find all orders matching the buyer's ID, and sort them by newest first (-1)
    const orders = await Order.find({ buyerId: req.userId }).sort({ createdAt: -1 });
    
    if (!orders || orders.length === 0) {
      return res.status(200).json({ msg: "You have no orders yet.", orders: [] });
    }

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCartDetails = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.userId })
      .populate('items.productId', 'name price images stock sellerId');
    res.json(cart || { items: [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const buy = async (req, res) => {
  try {
    // 1. Get Cart
    const cart = await Cart.findOne({ buyerId: req.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) return res.status(400).json({ msg: "Cart is empty" });

    // 2. CHECK PROFILE FOR ADDRESS (Critical Step)
    const userProfile = await Profile.findOne({ userId: req.userId });
    if (!userProfile || !userProfile.address || !userProfile.address.street) {
      return res.status(400).json({ msg: "Please complete your Market Profile (Address) before buying!" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // 3. Process Items
    for (let item of cart.items) {
      const product = item.productId;

      if (!product) {
        return res.status(400).json({ msg: "One or more items in your cart no longer exist." });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Item ${product.name} is out of stock` });
      }
     

      product.stock -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        sellerId: product.sellerId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || ""
      });
    }

    // 4. Create Order
    const newOrder = new Order({
      buyerId: req.userId,
      items: orderItems,
      totalAmount,
      shippingAddress: userProfile.address, // Using data from Profile
      paymentId: "DEMO_" + Date.now()
    });
    await newOrder.save();

    // 5. Clear Cart
    cart.items = [];
    await cart.save();

    res.json({ msg: "Order placed!", orderId: newOrder._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
};