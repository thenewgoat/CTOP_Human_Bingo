const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { Pool } = require('pg');

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



// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from Render
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Connected to database:', res.rows[0]);
  }
});

// Example route to interact with DB
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Connected to database!', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Database query failed' });
  }
});



// Start the server
const PORT = process.env.PORT || 5000; // Use environment variable or fallback to 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

