const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bookingRoutes = require("./routes/bookings");
const chatRoutes = require("./routes/chat");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/bookings", authMiddleware, bookingRoutes);
app.use("/api/chat", authMiddleware, chatRoutes);



const PORT = process.env.PORT || 5000;
console.log("Connecting to:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err));
