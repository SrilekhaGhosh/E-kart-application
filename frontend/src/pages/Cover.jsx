import { useNavigate } from "react-router-dom"

const Cover = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-purple-200 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold"> EKart</h1>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/register/buyer")}
            className="border border-red-400 text-red-500 px-4 py-1 rounded-md hover:bg-red-50 transition"
          >
            Register as Buyer
          </button>

          <button
            onClick={() => navigate("/register/seller")}
            className="border border-red-400 text-red-500 px-4 py-1 rounded-md hover:bg-red-50 transition"
          >
            Register as Seller
          </button>

          <button
            onClick={() => navigate("/login")}
            className="border px-4 py-1 rounded-md hover:bg-gray-100 transition"
          >
            Login →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-1 justify-center items-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Welcome to EKart</h2>
          <p className="text-gray-700">
            Buy and Sell Products Easily
          </p>
        </div>
      </div>
    </div>
  )
}

export default Cover
