import Product from "../models/productSchema.js";
import Cart from "../models/cartSchema.js";
import Order from "../models/orderSchema.js";
import Profile from "../models/profileSchema.js" 



export const getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit || "12", 10)));
    const search = (req.query.search || "").toString().trim();
    const categoryParam = req.query.category;
    const minPriceRaw = req.query.minPrice;
    const maxPriceRaw = req.query.maxPrice;
    const sortBy = (req.query.sortBy || "createdAt").toString();
    const sortOrder = (req.query.sortOrder || "desc").toString().toLowerCase();

    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filter = { isActive: true, stock: { $gt: 0 } };

    const categories = Array.isArray(categoryParam)
      ? categoryParam
      : (categoryParam || "")
          .toString()
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

    if (categories.length) {
      const categoryRegexes = categories.map(
        (c) => new RegExp(`^${escapeRegExp(c)}$`, "i")
      );
      filter.category = { $in: categoryRegexes };
    }

    const minPriceStr = minPriceRaw === undefined || minPriceRaw === null ? "" : String(minPriceRaw).trim();
    const maxPriceStr = maxPriceRaw === undefined || maxPriceRaw === null ? "" : String(maxPriceRaw).trim();
    const hasMinPrice = minPriceStr !== "";
    const hasMaxPrice = maxPriceStr !== "";
    const minPrice = hasMinPrice ? Number(minPriceStr) : undefined;
    const maxPrice = hasMaxPrice ? Number(maxPriceStr) : undefined;

    if (hasMinPrice && Number.isFinite(minPrice)) {
      filter.price = { ...(filter.price || {}), $gte: minPrice };
    }
    if (hasMaxPrice && Number.isFinite(maxPrice)) {
      filter.price = { ...(filter.price || {}), $lte: maxPrice };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const allowedSort = new Set(["createdAt", "price", "name", "stock"]);
    const safeSortBy = allowedSort.has(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;
    const sort = { [safeSortBy]: safeSortOrder };

    const skip = (page - 1) * limit;
    const totalItems = await Product.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    const items = await Product.find(filter)
      .sort(sort)
      .collation({ locale: "en", strength: 2 })
      .skip(skip)
      .limit(limit);

    res.json({
      items,
      page,
      limit,
      totalItems,
      totalPages,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMarketCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", {
      isActive: true,
      stock: { $gt: 0 },
    });

    const normalized = (categories || [])
      .filter(Boolean)
      .map((c) => c.toString().trim().toLowerCase())
      .filter(Boolean);

    const items = Array.from(new Set(normalized)).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

    const updateDoc = {};
    if (address !== undefined) updateDoc.address = address;
    if (businessName !== undefined) updateDoc.businessName = businessName;
    if (gstNumber !== undefined) updateDoc.gstNumber = gstNumber;

    // Upsert: Create if not exists, Update if exists
    const updated = await Profile.findOneAndUpdate(
      { userId: req.userId },
      Object.keys(updateDoc).length ? { $set: updateDoc } : {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const profile = await Profile.findById(updated._id)
      .populate('userId', 'userName email role profileImage')
      .populate({ path: 'myOrders', options: { sort: { createdAt: -1 } } });

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

   
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ msg: "Valid quantity is required" });
    }


    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

   
    let cart = await Cart.findOne({ buyerId: req.userId });

    if (!cart) {
      cart = new Cart({ buyerId: req.userId, items: [] });
    }

   
    cart.items = cart.items.filter(item => item.productId);

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

   
    if (itemIndex > -1) {

      if (setQuantity) {

       
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

    
      if (quantity > 0) {

        if (quantity > product.stock) {
          return res.status(400).json({
            msg: `Only ${product.stock} items available in stock`
          });
        }

        cart.items.push({ productId, quantity });
      }
    }

  
    await cart.save();

  
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

   
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ msg: "Valid quantity is required" });
    }

  
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    
    const cart = await Cart.findOne({ buyerId: req.userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

   
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Item not found in cart" });
    }

   
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

   
    await cart.save();

   
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price images stock sellerId');

    res.status(200).json(updatedCart);

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    
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

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    
    const beforeCount = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId);
    if (cart.items.length !== beforeCount) {
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message, error: err.message });
  }
};

export const buy = async (req, res) => {
  try {
    console.log('🛒 BUY REQUEST - User:', req.userId);

    const cart = await Cart.findOne({ buyerId: req.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) return res.status(400).json({ msg: "Cart is empty" });

    console.log('📦 Cart items count:', cart.items.length);

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

      
      const productId = item.productId._id || item.productId;
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(400).json({ msg: "One or more items in your cart no longer exist." });
      }

      console.log(`📊 Product: ${product.name}, Current Stock: ${product.stock}, Order Quantity: ${item.quantity}`);

      if (product.stock < item.quantity) {
        return res.status(400).json({ msg: `Item ${product.name} is out of stock` });
      }
     
      const oldStock = product.stock;
      product.stock -= item.quantity;
      await product.save();
      
     
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

    const newOrder = new Order({
      buyerId: req.userId,
      items: orderItems,
      totalAmount,
      shippingAddress: userProfile.address, 
      paymentId: "DEMO_" + Date.now()
    });
    await newOrder.save();

   
    cart.items = [];
    await cart.save();

    console.log('✅ Order placed successfully:', newOrder._id);

    res.json({ msg: "Order placed!", orderId: newOrder._id });
  } catch (err) { 
    console.error('❌ BUY ERROR:', err);
    res.status(500).json({ error: err.message }); 
  }
};