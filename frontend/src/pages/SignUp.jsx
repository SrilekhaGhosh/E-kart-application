import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"

const Signup = () => {
  const navigate = useNavigate()
  const { role } = useParams()

  const selectedRole = role === "seller" ? "seller" : "buyer"

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
    <div className="min-h-screen bg-purple-200 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center">
        <h1
          className="text-2xl font-semibold cursor-pointer"
          onClick={() => navigate("/")}
        >
          E Kart
        </h1>
      </nav>

      {/* Signup Card */}
      <div className="flex flex-1 justify-center items-center">
        <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">

          <h2 className="text-center text-2xl font-semibold mb-2">
            Register as {selectedRole.toUpperCase()}
          </h2>

          <p className="text-center text-sm text-gray-500 mb-6">
            Create your account
          </p>

          <input
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-3 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-3 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-3 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            onClick={handleSignup}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-500 font-bold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Signup
