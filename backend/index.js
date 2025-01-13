const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(bodyParser.json()); // Parse JSON bodies

// Import routes
const gameRoutes = require("./routes/gameRoutes");

// Use routes
app.use("/api/game", gameRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Start the server
const PORT = process.env.PORT || 5000; // Use environment variable or fallback to 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

