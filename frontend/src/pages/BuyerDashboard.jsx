import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import { fetchBuyerProfile, fetchBuyerOrders, updateBuyerMarketProfile } from '../slices/buyerSlice';
import { placeOrder } from '../slices/cartSlice';

const BuyerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, orders, status, error } = useSelector((state) => state.buyer);

  const token = useMemo(() => localStorage.getItem('accessToken'), []);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    zip: '',
    country: '',
    phone: '',
  });

  const isAddressComplete = (addr) => {
    return Boolean(addr?.street && addr?.city && addr?.country && addr?.phone);
  };

  const pendingPlaceOrder = Boolean(location.state?.pendingPlaceOrder) || sessionStorage.getItem('pendingPlaceOrder') === '1';

  const authUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchBuyerProfile(token));
      dispatch(fetchBuyerOrders(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (location.state?.openAddressEditor) {
      setIsEditingAddress(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (pendingPlaceOrder) {
      setIsEditingAddress(true);
    }
  }, [pendingPlaceOrder]);

  useEffect(() => {
    // Sync form state from profile
    if (profile?.address) {
      setAddress({
        street: profile.address.street || '',
        city: profile.address.city || '',
        zip: profile.address.zip || '',
        country: profile.address.country || '',
        phone: profile.address.phone || '',
      });
    }
  }, [profile]);

  const handleSaveAddress = async () => {
    if (!token) {
      toast.error('Please login');
      navigate('/login');
      return;
    }

    // Minimal validation: required fields
    if (!address.street || !address.city || !address.country || !address.phone) {
      toast.error('Please fill Street, City, Country and Phone');
      return;
    }

    try {
      await dispatch(updateBuyerMarketProfile({ token, address })).unwrap();
      setIsEditingAddress(false);

      // If user came from cart to complete address, place the order automatically.
      if (pendingPlaceOrder) {
        sessionStorage.removeItem('pendingPlaceOrder');
        await dispatch(placeOrder(token)).unwrap();
        await dispatch(fetchBuyerOrders(token));
        toast.success('Order placed successfully!');
      } else {
        toast.success('Address saved');
      }

      // Ensure we stay on dashboard (orders section)
      navigate('/buyer/dashboard', { replace: true, state: {} });
    } catch (err) {
      const errorMessage = err?.msg || err?.message || err?.error || 'Failed to update address';
      toast.error(errorMessage);
    }
  };

  const openProduct = (productId) => {
    if (!productId) return;
    navigate(`/product/${productId}`);
  };

  const ordersCount = Array.isArray(orders) ? orders.length : 0;
  const addressComplete = isAddressComplete(profile?.address);
  const profileImageUrl = profile?.userId?.profileImage || authUser?.profileImage || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Buyer Dashboard</h2>
            <div className="text-sm text-gray-600 mt-1">Manage your address and track your orders</div>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Continue Shopping
          </button>
        </div>

        {status === 'loading' && <div className="text-center text-gray-700">Loading...</div>}
        {status === 'failed' && <div className="text-center text-red-500">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Profile */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-lg rounded-3xl shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-200 bg-gray-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-xl">
                    👤
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm text-gray-500">Welcome</div>
                  <div className="text-lg font-extrabold text-gray-900 truncate">
                    {profile?.userId?.userName || authUser?.userName || '-'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {profile?.userId?.email || authUser?.email || '-'}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${addressComplete ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}
              >
                {addressComplete ? 'Address ready' : 'Address needed'}
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 p-4">
              <div className="text-sm font-bold text-gray-900">Shipping Address</div>
              <div className="text-sm text-gray-700 mt-2">
                {profile?.address?.street ? (
                  <>
                    {profile.address.street}, {profile.address.city}, {profile.address.country}
                  </>
                ) : (
                  <span className="text-gray-500">No address saved</span>
                )}
              </div>
              <div className="text-sm text-gray-700 mt-1">Phone: {profile?.address?.phone || '-'}</div>

              {!addressComplete && (
                <div className="text-xs text-amber-700 mt-3 font-semibold">
                  Address required before placing order
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setIsEditingAddress((v) => !v)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  {isEditingAddress ? 'Close Editor' : (addressComplete ? 'Edit Address' : 'Add Address')}
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-800 hover:bg-gray-50 transition"
                >
                  Go to Cart
                </button>
              </div>
            </div>

            {isEditingAddress && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-base font-bold text-gray-900 mb-4">Edit Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={address.street}
                    onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                    placeholder="Street"
                    className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    placeholder="City"
                    className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    value={address.zip}
                    onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
                    placeholder="ZIP"
                    className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    value={address.country}
                    onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                    placeholder="Country"
                    className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    value={address.phone}
                    onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                    placeholder="Phone"
                    className="w-full px-3 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 sm:col-span-2"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveAddress}
                    className="px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow border border-gray-200 p-6 flex flex-col min-h-0 max-h-[calc(100vh-260px)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">My Orders</h3>
                <div className="text-xs text-gray-500">Latest first</div>
              </div>
              <div className="text-sm text-gray-600">{ordersCount} orders</div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {ordersCount === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                  <div className="text-gray-800 font-bold mb-2">No orders yet</div>
                  <div className="text-sm text-gray-500 mb-5">Start shopping and place your first order.</div>
                  <button
                    onClick={() => navigate('/products')}
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(orders || []).map((order) => (
                    <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm text-gray-600">Order ID</div>
                          <div className="font-bold text-gray-900 truncate">{order._id}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 capitalize">
                            {order.status}
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-gray-600">Total</div>
                            <div className="text-lg font-extrabold text-blue-700">₹{order.totalAmount}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="text-sm font-bold text-gray-900 mb-3">Items</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(order.items || []).map((item, idx) => (
                            <button
                              key={`${item.productId}-${idx}`}
                              type="button"
                              onClick={() => openProduct(item.productId)}
                              className="text-left w-full rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition p-3 flex gap-3 bg-white"
                            >
                              <img
                                src={item.image || '/placeholder.png'}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover bg-gray-100 border border-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">{item.name}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Qty: <span className="font-semibold text-gray-700">{item.quantity}</span> • Price: <span className="font-semibold text-gray-700">₹{item.price}</span>
                                </div>
                                <div className="text-xs text-indigo-600 mt-2 font-semibold">View product →</div>
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => navigate('/products')}
                            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                          >
                            Shop more
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
