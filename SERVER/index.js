const express = require("express");
const app = express();

//api route mount krna hai
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");
const userRoutes = require("./routes/User");

const db = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileupload = require("express-fileupload");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

//db connect
db.connect();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
)
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

//cloud se connect krna hai
cloudinaryConnect();

//routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/payment', paymentRoutes);

//def route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: 'Your server is up and running....',
    })
})

//active server
app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`);
})