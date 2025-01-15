const TRAITS_POOL = require("../traits");

const express = require("express");
const router = express.Router();
const pool = require("../db");

// Function to generate a random bingo sheet
const generateBingoSheet = (playerId, size = 5) => {
  const shuffledTraits = [...TRAITS_POOL].sort(() => 0.5 - Math.random());
  const selectedTraits = shuffledTraits.slice(0, size * size); // 5x5 grid by default

  // Convert traits into bingo sheet squares for the player
  return selectedTraits.map((trait) => ({
    player_id: playerId,
    trait,
    is_filled: false, // All traits are unfilled initially
  }));
};


// Generate and store a bingo sheet for a player
router.post("/generate", async (req, res) => {
  const { playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: "Player ID is required" });
  }

  try {
    // Generate bingo sheet squares
    const bingoSheet = generateBingoSheet(playerId);

    // Insert bingo sheet squares into the database
    const values = bingoSheet.map((square) => [square.player_id, square.trait, square.is_filled]);
    const placeholders = values.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(", ");
    const query = `
      INSERT INTO bingo_sheets (player_id, trait, is_filled)
      VALUES ${placeholders}
      RETURNING *;
    `;
    const flattenedValues = values.flat();
    const result = await pool.query(query, flattenedValues);

    res.status(201).json({
      message: "Bingo sheet generated successfully",
      bingoSheet: result.rows,
    });
  } catch (error) {
    console.error("Error generating bingo sheet:", error);
    res.status(500).json({ error: "Failed to generate bingo sheet" });
  }
});


// Get bingo sheets for a specific player
router.get("/:playerId", async (req, res) => {
  const { playerId } = req.params;

  try {
    // Query the database for the player's bingo sheets
    const result = await pool.query(
      "SELECT * FROM bingo_sheets WHERE player_id = $1 ORDER BY created_at",
      [playerId]
    );

    res.status(200).json({
      message: "Bingo sheets retrieved successfully",
      bingoSheets: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving bingo sheets:", error);
    res.status(500).json({ error: "Failed to retrieve bingo sheets" });
  }
});


module.exports = router;

