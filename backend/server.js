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
app.use('/uploads', express.static('uploads'));


app.use("/upload", express.static(path.join(__dirname, "src/upload")))


app.use("/user", userRoute)      

app.use("/market", marketRoute)  


dbConnect()

app.listen(port, () => {
    console.log(`Server is Running at port ${port}`)
})