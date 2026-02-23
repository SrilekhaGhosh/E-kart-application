// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import Header from '../components/Header';

// const Home = () => {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem('user'));

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
//       <div className="bg-white rounded-lg shadow p-8 w-full max-w-md text-center">
//         <h2 className="text-3xl font-bold mb-4">Welcome to EKart</h2>
//         <Header/>
//         {user ? (
//           <>
//             <div className="mb-4">
//               <span className="font-semibold">Hello, {user.userName}!</span>
//               <div className="text-sm text-gray-500">Role: {user.role}</div>
//             </div>
//             <div className="flex flex-col gap-4">
//               <button
//                 className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//                 onClick={() => navigate('/products')}
//               >
//                 View Products
//               </button>
//               {user.role === 'buyer' && (
//                 <>
//                   <button
//                     className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//                     onClick={() => navigate('/buyer/dashboard')}
//                   >
//                     Buyer Dashboard
//                   </button>
//                   <button
//                     className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center justify-center gap-2"
//                     onClick={() => navigate('/cart')}
//                   >
//                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                     My Cart
//                   </button>
//                 </>
//               )}
//               {user.role === 'seller' && (
//                 <button
//                   className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
//                   onClick={() => navigate('/seller/dashboard')}
//                 >
//                   Seller Dashboard
//                 </button>
//               )}
//             </div>
//           </>
//         ) : (
//           <div className="text-gray-500">Please login to access your dashboard.</div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;



import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-200">

          {/* Logo / Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              EKart
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Your Smart Shopping Destination
            </p>
          </div>

          {user ? (
            <>
              {/* User Info Card */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-4 mb-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700">
                  Welcome back,
                </h2>
                <p className="text-2xl font-bold text-blue-700">
                  {user.userName}
                </p>
                <span className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full mt-2 inline-block capitalize">
                  {user.role}
                </span>
              </div>

              {/* Buttons Section */}
              <div className="space-y-4">

                <button
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
                  onClick={() => navigate('/products')}
                >
                  View Products
                </button>

                {user.role === 'buyer' && (
                  <>
                    <button
                      className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
                      onClick={() => navigate('/buyer/dashboard')}
                    >
                      Buyer Dashboard
                    </button>

                    <button
                      className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
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
                    className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
                    onClick={() => navigate('/seller/dashboard')}
                  >
                    Seller Dashboard
                  </button>
                )}

              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-6">
              <p className="text-lg font-medium">
                Please login to access your dashboard.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;
