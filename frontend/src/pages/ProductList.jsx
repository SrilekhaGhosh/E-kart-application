import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../slices/productsSlice";
import { fetchCart } from "../slices/cartSlice";

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, status, error } = useSelector((state) => state.products);
  const { items: cartItems } = useSelector((state) => state.cart);

  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));

  /* ===============================
     ✅ FIXED useEffect (NO LOOP)
  =============================== */
  useEffect(() => {
    // Fetch all products once
    dispatch(fetchProducts());

    // Fetch cart only if logged in
    if (token) {
      dispatch(fetchCart(token));
    }

  }, [dispatch]); // ❗ ONLY dispatch

  /* ===============================
     🚫 BLOCK SELLER VIEW
  =============================== */
  if (user && user.role === "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">
            Sellers cannot view all products.
          </h2>
          <p className="text-gray-600">
            Please go to your dashboard to manage your products.
          </p>
        </div>
      </div>
    );
  }

  /* ===============================
     🛒 CART COUNT
  =============================== */
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">All Products</h2>
          <button onClick={() => navigate('/home')} className="text-blue-600 hover:text-blue-800 mb-2">← Back to Home</button>

          {token && (
            <button
              onClick={() => navigate("/cart")}
              className="relative bg-blue-600 text-white px-6 py-3 rounded-lg 
                         hover:bg-blue-700 transition shadow-lg"
            >
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white 
                                 text-xs font-bold rounded-full h-6 w-6 
                                 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="text-center text-lg">Loading...</div>
        )}

        {/* Error */}
        {status === "failed" && (
          <div className="text-center text-red-500">{error}</div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {items.map((product) => (
            <div
              key={product._id}
              onClick={() => navigate(`/product/${product._id}`)}
              className="bg-white rounded-xl shadow-md overflow-hidden 
                         cursor-pointer hover:shadow-xl hover:scale-105 
                         transition duration-300"
            >
              <img
                src={
                  product.images && product.images[0]
                    ? product.images[0]
                    : "/placeholder.png"
                }
                alt={product.name}
                className="h-56 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="text-lg font-semibold text-center text-gray-800">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProductList;