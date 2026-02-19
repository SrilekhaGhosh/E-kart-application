import Product from "../models/productSchema.js";
import Order from "../models/orderSchema.js";

export const addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, images } = req.body;

    // Check duplicate name for THIS seller
    const exists = await Product.findOne({ sellerId: req.userId, name });
    if (exists) return res.status(400).json({ msg: "Product with this name already exists." });

    const newProduct = new Product({
      sellerId: req.userId,
      name, price, description, category, stock, images
    });
    await newProduct.save();
    res.json(newProduct);
  } catch (err) { 
    if (err.code === 11000) return res.status(400).json({ msg: "Duplicate product name." });
    res.status(500).json({ error: err.message }); 
  }
};
export const getSellerProducts = async (req, res) => {
  try {
    // Find all products where the sellerId matches the logged-in user's ID
    const myProducts = await Product.find({ sellerId: req.userId }).sort({ createdAt: -1 });
    
    // Send back the array of products (it will be an empty array [] if they haven't added any yet)
    res.status(200).json(myProducts);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};



export const editProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, sellerId: req.userId },
            req.body, { new: true }
        );
        if(!product) return res.status(404).json({msg: "Product not found"});
        res.json(product);
    } catch (err) { res.status(500).json({ error: err.message }); }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.userId });
        if(!product) return res.status(404).json({msg: "Product not found"});
        res.json({msg: "Product Deleted"});
    } catch (err) { res.status(500).json({ error: err.message }); }
}

export const getSellerHistory = async (req, res) => {
  try {
    // Find all orders containing this seller's items
    const orders = await Order.find({ "items.sellerId": req.userId })
      .populate('buyerId', 'userName email') 
      .sort({ createdAt: -1 });

    // Filter to show ONLY relevant items
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
  } catch (err) { res.status(500).json({ error: err.message }); }
};