const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authenticateToken");

// Retrieve a bingo sheet for a player
router.get("/:playerId", authenticateToken, async (req, res) => {
  const { playerId } = req.params;

  // Ensure the token belongs to the player requesting the data
  if (!req.player || req.player.id !== parseInt(playerId)) {
    return res.status(403).json({ error: "Access denied. Invalid token or player mismatch." });
  }

  try {
    // Get the bingo sheet metadata
    const sheetResult = await pool.query(
      "SELECT * FROM bingo_sheets WHERE player_id = $1 ORDER BY created_at DESC LIMIT 1",
      [playerId]
    );

    if (sheetResult.rows.length === 0) {
      return res.status(404).json({ error: "No bingo sheet found for this player" });
    }

    const bingoSheet = sheetResult.rows[0];

    // Get the 25 boxes for the sheet
    const boxesResult = await pool.query(
      "SELECT * FROM bingo_boxes WHERE bingo_sheet_id = $1 ORDER BY id",
      [bingoSheet.id]
    );

    res.status(200).json({
      message: "Bingo sheet retrieved successfully",
      bingoSheet,
      boxes: boxesResult.rows,
    });
  } catch (error) {
    console.error("Error retrieving bingo sheet:", error);
    res.status(500).json({ error: "Failed to retrieve bingo sheet" });
  }
});

module.exports = router;
