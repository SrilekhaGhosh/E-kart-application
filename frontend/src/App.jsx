import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import Home from './pages/Home'
import VerifyMail from './pages/VerifyMail'
import Cover from './pages/Cover'
import ProductList from './pages/ProductList'
import ProductDetails from './pages/ProductDetails'   // 👈 ADD THIS
import CartPage from './pages/CartPage'
import SellerDashboard from './pages/SellerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Cover />} />
        <Route path="/register/:role" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/user/verify/:token" element={<VerifyMail />} />

        <Route path="/products" element={<ProductList />} />

        {/* 👇 ADD THIS ROUTE */}
        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App