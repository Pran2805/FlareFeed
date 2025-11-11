import app from "./app.js";
import connectDB from "./utils/db.js";

const port = process.env.PORT || 8000

app.listen(port, async() => {
    await connectDB()
    console.info("Server is running on Port", port)
})