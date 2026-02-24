import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartQuantity, placeOrder } from '../slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import { apiUrl } from '../config/api';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, error } = useSelector((state) => state.cart);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Check if user is a buyer
    if (!user || user.role !== 'buyer') {
      toast.error('Only buyers can access the cart');
      navigate('/home');
      return;
    }
    
    if (token) dispatch(fetchCart(token));
  }, [dispatch, navigate]);

  const handleQuantityChange = async (productId, quantity, stock) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please login to update cart');
      return;
    }
    if (quantity < 1) return;
    if (quantity > stock) {
      toast.error('Cannot exceed stock');
      return;
    }
    
    console.log('Updating cart quantity:', { productId, quantity, stock });
    
    try {
      const result = await dispatch(updateCartQuantity({ productId, quantity, token })).unwrap();
      console.log('Update cart success:', result);
      await dispatch(fetchCart(token)).unwrap();
      toast.success('Cart updated!');
    } catch (error) {
      console.error('Cart update error FULL:', error);
      const errorMessage = error?.msg || error?.message || error?.error || 'Failed to update cart';
      toast.error(errorMessage);
      toast.error(error?.msg || error?.message || 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (productId) => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    toast.error('Please login to update cart');
    return;
  }

  try {
    await dispatch(
      updateCartQuantity({ productId, quantity: 0 , token })
    ).unwrap();

    await dispatch(fetchCart(token)).unwrap();

    toast.success('Item removed from cart');
  } catch (error) {
    console.error('Remove item error FULL:', error);

    const errorMessage =
      error?.msg ||
      error?.message ||
      error?.error ||
      'Failed to remove item';

    toast.error(errorMessage);
  }
};

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please login to place order');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Ensure buyer has address before ordering; if missing, redirect to address editor (no alert)
    try {
      const profileRes = await axios.get(apiUrl('/market/profile'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const addr = profileRes.data?.address;
      const hasAddress = Boolean(addr?.street && addr?.city && addr?.country && addr?.phone);
      if (!hasAddress) {
        sessionStorage.setItem('pendingPlaceOrder', '1');
        navigate('/buyer/dashboard', {
          state: { openAddressEditor: true, pendingPlaceOrder: true },
        });
        return;
      }
    } catch (e) {
      // If profile not found (404) treat as missing address
      sessionStorage.setItem('pendingPlaceOrder', '1');
      navigate('/buyer/dashboard', {
        state: { openAddressEditor: true, pendingPlaceOrder: true },
      });
      return;
    }
    
    setIsPlacingOrder(true);
    try {
      const result = await dispatch(placeOrder(token)).unwrap();
      toast.success('Order placed successfully!');
      navigate('/buyer/dashboard');
    } catch (err) {
      console.error('Place order error FULL:', err);
      const errorMessage = err?.msg || err?.message || err?.error || 'Failed to place order';
      // If backend complains about missing address, redirect instead of showing an alert
      if ((errorMessage || '').toLowerCase().includes('address')) {
        sessionStorage.setItem('pendingPlaceOrder', '1');
        navigate('/buyer/dashboard', {
          state: { openAddressEditor: true, pendingPlaceOrder: true },
        });
        return;
      }
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Calculate total price safely (using ?. to avoid crashing if productId is missing)
  const totalPrice = items.reduce(
    (acc, item) => acc + (item.productId?.price || 0) * item.quantity,
    0
  );

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Shopping Cart</h2>
            <div className="text-sm text-gray-600 mt-1">Review your items and place your order</div>
            {items.length > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                {totalItems} items • Total ₹{totalPrice}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/products')}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Continue Shopping
          </button>
        </div>
        
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        )}
        
        {items.length === 0 && status !== 'loading' && (
          <div className="bg-white rounded-3xl shadow border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Browse Products
            </button>
          </div>
        )}
        
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow border border-gray-200 p-6 flex flex-col min-h-0 max-h-[calc(100vh-260px)]">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">Cart Items</h3>
                  <div className="text-xs text-gray-500">Update quantity or remove items</div>
                </div>
                <div className="text-sm text-gray-600">{totalItems} items</div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <div className="space-y-4">
                  {items.map((item, idx) => {
                    // SAFETY CHECK: If the product was deleted from the database, skip it so the page doesn't crash
                    if (!item.productId) return null;
                    const key = item._id || (item.productId && item.productId._id) || idx;
                    const itemTotal = item.productId.price * item.quantity;

                    return (
                      <div
                        key={key}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/product/${item.productId._id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/product/${item.productId._id}`);
                          }
                        }}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.productId.images?.[0] || '/placeholder.png'}
                              alt={item.productId.name}
                              className="h-24 w-24 object-cover rounded-2xl border border-gray-100 bg-gray-100"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                                {item.productId.name}
                              </h3>
                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                                In stock: {item.productId.stock}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">₹{item.productId.price} per item</p>
                            <div className="text-xs text-gray-500 mt-2">Product subtotal: <span className="font-bold text-gray-800">₹{itemTotal}</span></div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex flex-col items-end justify-between gap-3">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Subtotal</p>
                              <p className="text-2xl font-extrabold text-blue-700">₹{itemTotal}</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <button
                                className="w-9 h-9 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item.productId._id, item.quantity - 1, item.productId.stock);
                                }}
                                disabled={item.quantity <= 1}
                              >
                                <span className="text-lg font-bold">−</span>
                              </button>
                              <span className="w-12 text-center font-extrabold text-lg text-gray-900">{item.quantity}</span>
                              <button
                                className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(item.productId._id, item.quantity + 1, item.productId.stock);
                                }}
                                disabled={item.quantity >= item.productId.stock}
                              >
                                <span className="text-lg font-bold">+</span>
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(item.productId._id);
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow border border-gray-200 p-6 sticky top-8">
                <h3 className="text-xl font-extrabold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({totalItems})</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-green-600">₹{totalPrice}</span>
                  </div>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || items.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isPlacingOrder ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;