import { useNavigate } from "react-router-dom"

const Cover = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 px-4 sm:px-10 py-4 flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm">
            E
          </div>
          <div className="leading-tight text-left">
            <div className="text-lg sm:text-xl font-extrabold text-gray-900">EKart</div>
            <div className="text-xs text-gray-500">Buy • Sell • Deliver</div>
          </div>
        </button>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/register/buyer")}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-sm hover:shadow-md hover:bg-blue-700 transition"
          >
            Register as Buyer
          </button>

          <button
            onClick={() => navigate("/register/seller")}
            className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
          >
            Register as Seller
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
          >
            Login →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white/70 text-xs font-semibold text-gray-700">
                Trusted marketplace for buyers and sellers
              </div>
              <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Everything you need to <span className="text-blue-700">buy</span> and <span className="text-indigo-700">sell</span>—fast.
              </h2>
              <p className="mt-4 text-gray-700 text-lg">
                Discover products, manage your cart, and track orders in one place. Sellers can upload products and see performance.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/register/buyer")}
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Create Buyer Account
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/register/seller")}
                  className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition"
                >
                  Create Seller Account
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4">
                  <div className="text-sm font-extrabold text-gray-900">Secure</div>
                  <div className="text-xs text-gray-600 mt-1">Login and sessions handled safely</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4">
                  <div className="text-sm font-extrabold text-gray-900">Fast</div>
                  <div className="text-xs text-gray-600 mt-1">Smooth browsing and checkout</div>
                </div>
                <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4">
                  <div className="text-sm font-extrabold text-gray-900">Simple</div>
                  <div className="text-xs text-gray-600 mt-1">Clean dashboards for both roles</div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-3xl border border-gray-200 shadow p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500">Get started</div>
                  <div className="text-2xl font-extrabold text-gray-900">Choose your role</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl">
                  🛒
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-gray-200 p-5 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">Buyer</div>
                      <div className="text-sm text-gray-600 mt-1">Shop products, manage cart, place orders</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/register/buyer")}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    >
                      Register
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">Seller</div>
                      <div className="text-sm text-gray-600 mt-1">List products, manage inventory, view analytics</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/register/seller")}
                      className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition"
                    >
                      Register
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">Already have an account?</div>
                      <div className="text-sm text-gray-600 mt-1">Sign in and continue</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cover
