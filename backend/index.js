const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { Pool } = require('pg');
const QRCode = require('qrcode'); // For generating QR codes

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


// Endpoint to register a new player
app.post('/api/players', async (req, res) => {
  const { nickname, group_name } = req.body;

  if (!nickname || !group_name) {
    console.log('Invalid input:', req.body); // Log invalid input
    return res.status(400).json({ error: 'Nickname and Group Name are required' });
  }

  try {
    console.log('Inserting player into database...');
    const result = await pool.query(
      'INSERT INTO players (nickname, group_name) VALUES ($1, $2) RETURNING *',
      [nickname, group_name]
    );

    const player = result.rows[0];
    console.log('Player ', player, ' inserted into group ', group_name);

    console.log('Generating QR code...');
    const qrData = JSON.stringify({ id: player.id, group_name });
    const qrCode = await QRCode.toDataURL(qrData);
    console.log('QR code generated');

    console.log('Updating player record with QR code...');
    await pool.query('UPDATE players SET qr_code = $1 WHERE id = $2', [qrCode, player.id]);

    res.status(201).json({
      message: 'Player registered successfully',
      player: { ...player, qr_code: qrCode },
    });
  } catch (error) {
    console.error('Error registering player:', error);
    res.status(500).json({ error: 'Failed to register player' });
  }
});

// Add a cleanup endpoint (for testing/admin use)
app.delete('/api/players', async (req, res) => {
  try {
      await pool.query('DELETE FROM players');
      res.status(200).json({ message: 'All players deleted successfully' });
  } catch (error) {
      console.error('Error deleting players:', error);
      res.status(500).json({ error: 'Failed to delete players' });
  }
});



// Start the server
const PORT = process.env.PORT || 5000; // Use environment variable or fallback to 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

