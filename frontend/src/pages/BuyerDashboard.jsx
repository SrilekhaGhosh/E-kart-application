import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBuyerProfile, fetchBuyerOrders } from '../slices/buyerSlice';

const BuyerDashboard = () => {
  const dispatch = useDispatch();
  const { profile, orders, status, error } = useSelector((state) => state.buyer);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchBuyerProfile(token));
      dispatch(fetchBuyerOrders(token));
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Buyer Dashboard</h2>
        {status === 'loading' && <div className="text-center">Loading...</div>}
        {status === 'failed' && <div className="text-center text-red-500">{error}</div>}
        {profile && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Profile</h3>
            <div className="mb-2">Name: {profile.userId.userName}</div>
            <div className="mb-2">Email: {profile.userId.email}</div>
            <div className="mb-2">Role: {profile.userId.role}</div>
            <div className="mb-2">Address: {profile.address?.street}, {profile.address?.city}, {profile.address?.country}</div>
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold mb-4">My Orders</h3>
          <div className="space-y-4">
            {orders.length === 0 && <div className="text-gray-500">No orders found.</div>}
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">Order ID: {order._id}</span>
                  <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="mb-2">Status: <span className="font-semibold">{order.status}</span></div>
                <div className="mb-2">Total: <span className="font-bold text-blue-600">₹{order.totalAmount}</span></div>
                <div>
                  <h4 className="font-semibold mb-1">Items:</h4>
                  <ul className="list-disc pl-6">
                    {order.items.map((item) => (
                      <li key={item.productId}>
                        {item.name} x {item.quantity} (₹{item.price} each)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
