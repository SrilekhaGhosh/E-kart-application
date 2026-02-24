import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { apiUrl, API_BASE_URL } from "../config/api"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const normalizeProfileImageUrl = (value) => {
    if (!value) return null
    if (typeof value !== "string") return null
    return value.startsWith("http") ? value : `${API_BASE_URL}${value}`
  }

  const handleLogin = async () => {
    try {
      const res = await axios.post(apiUrl("/user/login"), {
        email,
        password,
      })

      localStorage.clear()

      localStorage.setItem("accessToken", res.data.accessToken)
      localStorage.setItem("userName", res.data.user.userName)
      localStorage.setItem("userId", res.data.user._id)
      localStorage.setItem("email", res.data.user.email)
      localStorage.setItem("token", res.data.accessToken)

      const imgUrl = normalizeProfileImageUrl(res.data.user.profileImage)
      if (imgUrl) localStorage.setItem("profileImage", imgUrl)
      else localStorage.removeItem("profileImage")

      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/home")
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm">
            E
          </div>
          <div className="text-left leading-tight">
            <div className="text-xl font-extrabold text-gray-900">EKart</div>
            <div className="text-xs text-gray-500">Welcome back</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow border border-gray-200">
          <h2 className="text-center text-2xl font-extrabold text-gray-900">
            Login
          </h2>
          <p className="text-center text-sm text-gray-600 mt-2 mb-8">Sign in to continue shopping</p>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Email</div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
              />
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Password</div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3.5 mt-6 mb-5 bg-blue-600 text-white rounded-2xl text-base font-extrabold transition hover:-translate-y-0.5 hover:shadow-xl hover:bg-blue-700"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <span
              onClick={() => navigate("/register/buyer")}
              className="text-indigo-700 font-extrabold cursor-pointer hover:underline"
            >
             Register
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login