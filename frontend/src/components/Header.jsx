

import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchBuyerOrders, fetchBuyerProfile } from "../slices/buyerSlice"

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { profile, orders } = useSelector((state) => state.buyer)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "")
  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const normalizeProfileImageUrl = (value) => {
    if (!value) return null
    if (typeof value !== "string") return null
    return value.startsWith("http") ? value : `http://localhost:8001${value}`
  }

  const [userProfileImage, setUserProfileImage] = useState(() => {
    const stored = localStorage.getItem("profileImage")
    if (stored) return stored
    try {
      const u = JSON.parse(localStorage.getItem("user"))
      return normalizeProfileImageUrl(u?.profileImage) || null
    } catch {
      return null
    }
  })
  

  const userEmail = localStorage.getItem("email") || ""

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"))
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) return
    if (user?.role !== "buyer") return

    // Fetch profile/orders once so header can show address + order history
    dispatch(fetchBuyerProfile(token))
    dispatch(fetchBuyerOrders(token))
  }, [dispatch, user?.role])

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData()
      formData.append("userName", userName)
      if (profileImage) formData.append("profileImage", profileImage)

      const token = localStorage.getItem("accessToken")
      const res = await fetch("http://localhost:8001/user/update-profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      const data = await res.json()

      if (data.status) {
        localStorage.setItem("userName", data.user.userName)

        // Keep the stored user object in sync
        try {
          localStorage.setItem("user", JSON.stringify(data.user))
        } catch {
          // ignore
        }

        if (data.user.profileImage) {
          const imgUrl = normalizeProfileImageUrl(data.user.profileImage)
          if (imgUrl) {
            localStorage.setItem("profileImage", imgUrl)
            setUserProfileImage(imgUrl)
          } else {
            localStorage.removeItem("profileImage")
            setUserProfileImage(null)
          }
        } else {
          localStorage.removeItem("profileImage")
          setUserProfileImage(null)
        }

        setIsUpdateModalOpen(false)
        setIsDropdownOpen(false)
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error(err)
      alert("Error updating profile")
    }
  }

  const handleSignOut = () => {
    localStorage.clear()
    navigate("/login")
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-20 py-4  bg-blue-500 shadow-md">
     

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-xl bg-white/20">
                👤
              </div>
            )}
            <span className="text-white   text-sm font-semibold max-w-[100px] truncate">
              {userName}
            </span>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-100 top-[70px] w-[300px] bg-white rounded-lg shadow-xl p-5 z-50">
              <div className="flex items-center gap-4 mb-4">
                {userProfileImage ? (
                  <img
                    src={userProfileImage}
                    className="w-20 h-20 rounded-full border-2 border-indigo-500 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-indigo-500 flex items-center justify-center text-3xl bg-gray-100">
                    👤
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-800">{userName}</h3>
                  <p className="text-sm text-gray-500">{userEmail}</p>
                </div>
              </div>

              {user?.role === "buyer" && (
                <div className="mb-4 rounded-md bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Shipping Address</div>
                  <div className="text-sm text-gray-700">
                    {profile?.address?.street ? (
                      <>
                        {profile.address.street}, {profile.address.city}, {profile.address.country}
                      </>
                    ) : (
                      <span className="text-gray-500">No address saved</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Phone: {profile?.address?.phone || "-"}
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      navigate("/buyer/dashboard", { state: { openAddressEditor: true } })
                    }}
                    className="mt-3 w-full text-left px-3 py-2 bg-white border rounded-md font-medium transition-all hover:bg-indigo-500 hover:text-white"
                  >
                    🏠 Edit Address
                  </button>
                </div>
              )}

              <hr className="my-4" />

              {user?.role === "buyer" && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Order History</div>
                  {Array.isArray(orders) && orders.length > 0 ? (
                    <div className="space-y-2">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order._id} className="text-sm text-gray-700">
                          <div className="font-medium truncate">#{order._id}</div>
                          <div className="text-xs text-gray-500">{order.status} • ₹{order.totalAmount}</div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          navigate("/buyer/dashboard")
                        }}
                        className="w-full text-left px-3 py-2 bg-gray-100 rounded-md font-medium transition-all hover:bg-indigo-500 hover:text-white"
                      >
                        📦 View All Orders
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No orders found.</div>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="w-full text-left px-3 py-3 mb-3 bg-gray-100 rounded-md font-medium transition-all hover:bg-indigo-500 hover:text-white hover:translate-x-1"
              >
                ✏️ Update Profile picture
              </button>
               
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-3 bg-gray-100 rounded-md font-medium transition-all hover:bg-indigo-500 hover:text-white hover:translate-x-1"
              >
                🚪 Sign Out
              </button>
             

            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-br from-indigo-500 to-purple-600">
              <h2 className="text-white text-lg font-semibold">Update Profile</h2>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-white text-2xl hover:scale-110 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center mb-6">
                {previewImage || userProfileImage ? (
                  <img
                    src={previewImage || userProfileImage}
                    className="w-24 h-24 rounded-full border-4 border-indigo-500 object-cover mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-500 flex items-center justify-center text-4xl bg-gray-100 mb-4">
                    👤
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="w-full cursor-pointer"
                />
              </div>

              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="User Name"
                className="w-full px-3   py-3 border rounded-md focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex gap-3 px-5 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="flex-1 py-3 bg-gray-300 rounded-md font-bold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-md font-bold hover:-translate-y-0.5 hover:shadow-lg transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header

