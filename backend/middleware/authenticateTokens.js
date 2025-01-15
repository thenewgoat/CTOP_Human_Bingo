const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const pool = require("../db"); // Use the centralized database connection

// Player Registration Endpoint
router.post("/", async (req, res) => {
  const { nickname, group_name } = req.body;

  if (!nickname || !group_name) {
    return res.status(400).json({ error: "Nickname and Group Name are required" });
  }

  try {
    // Check for duplicate nickname within the same group
    const duplicateCheck = await pool.query(
      "SELECT * FROM players WHERE nickname = $1 AND group_name = $2",
      [nickname, group_name]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        error: "A player with this nickname already exists in the group",
      });
    }

    // Insert the new player into the database
    const result = await pool.query(
      "INSERT INTO players (nickname, group_name) VALUES ($1, $2) RETURNING *",
      [nickname, group_name]
    );

    const player = result.rows[0];

    // Generate a JWT for the player
    const token = jwt.sign(
      { id: player.id, group_name }, // Payload
      process.env.JWT_SECRET,       // Secret key
      { expiresIn: "1h" }           // Token validity
    );

    // Generate a QR code for the player
    const qrData = JSON.stringify({ id: player.id, group_name });
    const qrCode = await QRCode.toDataURL(qrData); // Generate QR code as Base64 string

    // Update the player record with the QR code
    await pool.query("UPDATE players SET qr_code = $1 WHERE id = $2", [qrCode, player.id]);

    // Return the player info along with their token
    res.status(201).json({
      message: "Player registered successfully",
      player: { ...player, qr_code: qrCode },
      token, // Send token to the client
    });
  } catch (error) {
    console.error("Error registering player:", error);
    res.status(500).json({ error: "Failed to register player" });
  }
});

// Export the router
module.exports = router;
