import Product from "../models/productSchema.js";
import Cart from "../models/cartSchema.js";
import Order from "../models/orderSchema.js";
import Profile from "../models/profileSchema.js" 



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
    const { productId, quantity, setQuantity } = req.body;

    // 1️⃣ Validate productId
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    // 2️⃣ Validate quantity properly
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ msg: "Valid quantity is required" });
    }

    // 3️⃣ Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // 4️⃣ Get or create cart
    let cart = await Cart.findOne({ buyerId: req.userId });

    if (!cart) {
      cart = new Cart({ buyerId: req.userId, items: [] });
    }

    // Clean invalid items
    cart.items = cart.items.filter(item => item.productId);

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    // 5️⃣ If item already exists in cart
    if (itemIndex > -1) {

      if (setQuantity) {

        // 🔥 REMOVE ITEM COMPLETELY
        if (quantity === 0) {
          cart.items.splice(itemIndex, 1);
        } else {

          if (quantity > product.stock) {
            return res.status(400).json({
              msg: `Only ${product.stock} items available in stock`
            });
          }

          cart.items[itemIndex].quantity = quantity;
        }

      } else {

        const newQuantity = cart.items[itemIndex].quantity + quantity;

        if (newQuantity > product.stock) {
          return res.status(400).json({
            msg: `Only ${product.stock} items available in stock`
          });
        }

        cart.items[itemIndex].quantity = newQuantity;
      }

    } else {

      // 6️⃣ If item does NOT exist in cart
      if (quantity > 0) {

        if (quantity > product.stock) {
          return res.status(400).json({
            msg: `Only ${product.stock} items available in stock`
          });
        }

        cart.items.push({ productId, quantity });
      }
    }

    // 7️⃣ Save cart
    await cart.save();

    // 8️⃣ Populate cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images stock sellerId');

    res.status(200).json(populatedCart);

  } catch (err) {
    res.status(500).json({ msg: err.message, error: err.message });
  }
};
export const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // 1️⃣ Validate
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ msg: "Valid quantity is required" });
    }

    // 2️⃣ Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // 3️⃣ Find cart
    const cart = await Cart.findOne({ buyerId: req.userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    // 4️⃣ Find item inside cart
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Item not found in cart" });
    }

    // 5️⃣ If quantity = 0 → REMOVE item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock
      if (quantity > product.stock) {
        return res.status(400).json({
          msg: `Only ${product.stock} items available in stock`
        });
      }

      cart.items[itemIndex].quantity = quantity;
    }

    // 6️⃣ Save cart
    await cart.save();

    // 7️⃣ Populate updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images stock sellerId');

    res.status(200).json(updatedCart);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
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


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCartDetails = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.userId })
      .populate('items.productId', 'name price images stock sellerId');
    
    const result = cart || { items: [] };
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ msg: err.message, error: err.message });
  }
};

export const buy = async (req, res) => {
  try {
    console.log('🛒 BUY REQUEST - User:', req.userId);
    
    // 1. Get Cart
    const cart = await Cart.findOne({ buyerId: req.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) return res.status(400).json({ msg: "Cart is empty" });

    console.log('📦 Cart items count:', cart.items.length);

    // 2. CHECK PROFILE FOR ADDRESS (Critical Step)
    const userProfile = await Profile.findOne({ userId: req.userId });
    if (!userProfile || !userProfile.address || !userProfile.address.street) {
      return res.status(400).json({ msg: "Please complete your Market Profile (Address) before buying!" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // 3. Process Items
    for (let item of cart.items) {
      if (!item.productId) {
        return res.status(400).json({ msg: "One or more items in your cart no longer exist." });
      }

      // Fetch the product directly to ensure we can save it properly
      const productId = item.productId._id || item.productId;
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(400).json({ msg: "One or more items in your cart no longer exist." });
      }

      console.log(`📊 Product: ${product.name}, Current Stock: ${product.stock}, Order Quantity: ${item.quantity}`);

      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Item ${product.name} is out of stock` });
      }
     
      // Decrement stock and save
      const oldStock = product.stock;
      product.stock -= item.quantity;
      await product.save();
      
      // Verify the save worked
      const verifyProduct = await Product.findById(productId);
      console.log(`✅ Stock updated: ${product.name} from ${oldStock} to ${verifyProduct.stock} (verified: ${verifyProduct.stock})`);

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

    console.log('✅ Order placed successfully:', newOrder._id);

    res.json({ msg: "Order placed!", orderId: newOrder._id });
  } catch (err) { 
    console.error('❌ BUY ERROR:', err);
    res.status(500).json({ error: err.message }); 
  }
};