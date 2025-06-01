const express = require("express");
const authMiddleware = require("./middleware/middleware.js");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const routes = require("./routes");

const app = express();
app.use(
  cors({
    origin: "https://content-moderator-ui.vercel.app",
    credentials: true,
  })
);

app.use(express.json());

// ✅ Central route handler
app.use("/moderate", authMiddleware, routes);
app.use("/auth", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
