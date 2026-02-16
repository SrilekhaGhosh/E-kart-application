import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8001/user/login", {
        email,
        password,
      })

      localStorage.clear()

      localStorage.setItem("accessToken", res.data.accessToken)
      localStorage.setItem("userName", res.data.user.userName)
      localStorage.setItem("userId", res.data.user._id)
      localStorage.setItem("email", res.data.user.email)
      localStorage.setItem("token", res.data.accessToken)

      if (res.data.user.profileImage) {
        localStorage.setItem(
          "profileImage",
          `http://localhost:8001${res.data.user.profileImage}`
        )
      } else {
        localStorage.removeItem("profileImage")
      }

      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/home")
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-blue-300">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold text-gray-800 mb-8">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-3 mb-4 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-3 mb-6 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 mb-5 bg-gradient-to-br bg-blue-500 text-white rounded-md text-base font-bold transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-indigo-500 font-bold cursor-pointer hover:text-purple-600 hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login