const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const playersRoutes = require("./routes/playerRoutes");
app.use("/api/players", playersRoutes); // Mount the players-related routes

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// PostgreSQL connection (optional, but better to move to a separate file)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Connected to database:", res.rows[0]);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
