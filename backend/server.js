import express from "express"
import dotenv from "dotenv/config"
import { dbConnect } from "./src/config/dbConnect.js"
import cors from "cors";
import path from "path"
import { fileURLToPath } from "url"

// --- IMPORT ROUTES ---
import userRoute from "./src/routes/userRoute.js"

import marketRoute from "./src/routes/marketRoute.js" // <--- NEW IMPORT

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const port = process.env.PORT || 8001

// --- MIDDLEWARE ---
app.use(express.json())
app.use(cors());

// Serve static files for profile uploads
app.use("/upload", express.static(path.join(__dirname, "src/upload")))

// --- DEFINE ROUTES ---
app.use("/user", userRoute)      // Your Auth & Profile Image

app.use("/market", marketRoute)  // <--- NEW: Products, Cart, Buying

// --- DATABASE & SERVER ---
dbConnect()

app.listen(port, () => {
    console.log(`Server is Running at port ${port}`)
})