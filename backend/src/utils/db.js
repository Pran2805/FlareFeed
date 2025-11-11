import mongoose from 'mongoose'
import { ENV } from './env.js'

export default async function connectDB() {
    try {
        const connection = await mongoose.connect(ENV.databaseUrl)
        console.info("Database Connected Successfully!!", connection.connection.host)
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}