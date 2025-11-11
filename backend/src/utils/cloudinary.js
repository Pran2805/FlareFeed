import {v2 as cloudinary} from "cloudinary"
import { ENV } from "./env.js"

cloudinary.config({
    cloud_name: ENV.cloudName,
    api_key: ENV.cloudApiKey,
    api_secret: ENV.cloudApiSecret
})

export default cloudinary;