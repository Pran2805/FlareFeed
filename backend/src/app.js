import express from 'express'
import router from './routes/index.js';
import {clerkMiddleware} from '@clerk/express'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))
app.use(express.json())
app.use(clerkMiddleware())

app.use("/api/v1", router)

// not going to used but just for safety
app.use((err, _, res)=>{
    return res.status(500).json({
        message: err.message || "Internal Server Error"
    })
})

app.use("*", (req, res)=>{
    return res.status({
        success: false,
        message: "Invalid Route - Check route again!!!"
    })
})
export default app;