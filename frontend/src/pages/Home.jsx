import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to EKart</h2>
        {user ? (
          <>
            <div className="mb-4">
              <span className="font-semibold">Hello, {user.userName}!</span>
              <div className="text-sm text-gray-500">Role: {user.role}</div>
            </div>
            <div className="flex flex-col gap-4">
              <button
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => navigate('/products')}
              >
                View Products
              </button>
              {user.role === 'buyer' && (
                <>
                  <button
                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    onClick={() => navigate('/buyer/dashboard')}
                  >
                    Buyer Dashboard
                  </button>
                  <button
                    className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    onClick={() => navigate('/cart')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    My Cart
                  </button>
                </>
              )}
              {user.role === 'seller' && (
                <button
                  className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  onClick={() => navigate('/seller/dashboard')}
                >
                  Seller Dashboard
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-gray-500">Please login to access your dashboard.</div>
        )}
      </div>
    </div>
  );
};

export default Home;
