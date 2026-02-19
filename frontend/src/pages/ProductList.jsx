import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../slices/productsSlice';
import { addToCart, fetchCart } from '../slices/cartSlice';
import toast from 'react-hot-toast';

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, error } = useSelector((state) => state.products);
  const { items: cartItems } = useSelector((state) => state.cart);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role === 'buyer') {
      dispatch(fetchProducts());
    }
    // Load cart for buyers
    if (user && user.role === 'buyer') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        dispatch(fetchCart(token));
      }
    }
  }, [dispatch, user]);

  if (user && user.role === 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Sellers cannot view all products.</h2>
          <p className="text-gray-600">Go to your dashboard to manage your products.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please login to add to cart');
      return;
    }
    
    console.log('Adding product to cart:', { productId, token: token ? 'exists' : 'missing' });
    
    try {
      const result = await dispatch(addToCart({ productId, quantity: 1, token })).unwrap();
      console.log('Add to cart success:', result);
      await dispatch(fetchCart(token)).unwrap();
      toast.success('Added to cart!');

      
    } catch (error) {
      console.error('Add to cart error FULL:', error);
      const errorMessage = error?.msg || error?.message || error?.error || 'Failed to add to cart';
      toast.error(errorMessage);
      toast.error(error?.msg || error?.message || 'Failed to add to cart');
    }
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">All Products</h2>
          {user && user.role === 'buyer' && (
            <button
              onClick={() => navigate('/cart')}
              className="relative bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
        {status === 'loading' && <div className="text-center">Loading...</div>}
        {status === 'failed' && <div className="text-center text-red-500">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <img
                src={product.images && product.images[0] ? product.images[0] : '/placeholder.png'}
                alt={product.name}
                className="h-40 w-full object-cover rounded mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <div className="flex justify-between items-center mt-auto mb-2">
                <span className="text-lg font-bold text-blue-600">₹{product.price}</span>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>
              <button
                className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mt-2"
                onClick={() => handleAddToCart(product._id)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
