import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

const Signup = () => {
  const navigate = useNavigate()
  const { role } = useParams()

  const selectedRole = role === "seller" ? "seller" : "buyer"
  const switchRole = selectedRole === "seller" ? "buyer" : "seller"

  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:8001/user/register", {
        userName,
        email,
        password,
        role: selectedRole
      })

      toast.success("Signup successful, please verify your email")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur border-b border-gray-200 px-4 sm:px-10 py-4 flex justify-between items-center">
        <button
          type="button"
          className="flex items-center gap-3"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm">
            E
          </div>
          <div className="leading-tight text-left">
            <div className="text-lg sm:text-xl font-extrabold text-gray-900">EKart</div>
            <div className="text-xs text-gray-500">Create your account</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition"
        >
          Login →
        </button>
      </nav>

      {/* Signup Card */}
      <div className="flex flex-1 justify-center items-center">
        <div className="bg-white/80 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow border border-gray-200 w-full max-w-md mx-4">

          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Register as {selectedRole.toUpperCase()}
              </h2>
              <p className="text-sm text-gray-600 mt-1">It only takes a minute</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700">
              {selectedRole}
            </span>
          </div>

          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
          />

          <button
            onClick={handleSignup}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-extrabold hover:bg-blue-700 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Sign Up
          </button>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-700 font-extrabold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => navigate(`/register/${switchRole}`)}
              className="text-sm font-extrabold text-gray-900 hover:underline"
            >
              Register as {switchRole.toUpperCase()} instead
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Signup
