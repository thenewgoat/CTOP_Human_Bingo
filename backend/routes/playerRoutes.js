const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../db");
const QRCode = require("qrcode");


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

    // Insert player into the database
    const result = await pool.query(
      "INSERT INTO players (nickname, group_name) VALUES ($1, $2) RETURNING *",
      [nickname, group_name]
    );

    const player = result.rows[0];

    // Generate a JWT for the player
    const token = jwt.sign(
      { id: player.id, group_name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Generate a QR code for the player
    const qrData = JSON.stringify({ id: player.id, group_name });
    const qrCode = await QRCode.toDataURL(qrData);

    // Update player record with the QR code
    await pool.query("UPDATE players SET qr_code = $1 WHERE id = $2", [qrCode, player.id]);

    // Return the player info, including the token and QR code
    res.status(201).json({
      message: "Player registered successfully",
      player: { ...player, qr_code: qrCode },
      token, // Send the token to the client
    });
  } catch (error) {
    console.error("Error registering player:", error);
    res.status(500).json({ error: "Failed to register player" });
  }
});

module.exports = router;
