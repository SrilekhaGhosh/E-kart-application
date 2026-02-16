import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import Home from './pages/Home'
import VerifyMail from './pages/VerifyMail'
import Cover from './pages/Cover'

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
        
          <Route path="/" element={<Cover />} />
        <Route path="/register/:role" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
          <Route path="/user/verify/:token" element={<VerifyMail />} />

        </Routes>



      </BrowserRouter>
    </>
  )
}

export default App
