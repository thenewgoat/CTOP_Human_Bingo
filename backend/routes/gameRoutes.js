const express = require("express");
const router = express.Router();
const pool = require("../db");

// Traits pool (can be moved to a separate file if dynamic)
const TRAITS_POOL = [
  "Loves coding",
  "Has visited 3+ countries",
  "Plays a musical instrument",
  "Speaks 2+ languages",
  "Prefers tea over coffee",
  "Owns a pet",
  "Has run a marathon",
  "Is a morning person",
  "Enjoys video games",
  "Knows how to swim",
  "Can cook a signature dish",
  "Has a hidden talent",
  "Is afraid of heights",
  "Has tried skydiving",
  "Likes pineapple on pizza",
];

// Generate a new bingo sheet
router.post("/generate", async (req, res) => {
  const { playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: "Player ID is required" });
  }

  try {
    // Insert the bingo sheet
    const sheetResult = await pool.query(
      "INSERT INTO bingo_sheets (player_id) VALUES ($1) RETURNING id",
      [playerId]
    );
    const bingoSheetId = sheetResult.rows[0].id;

    // Generate 25 unique traits for the sheet
    const shuffledTraits = [...TRAITS_POOL].sort(() => 0.5 - Math.random());
    const selectedTraits = shuffledTraits.slice(0, 25);

    // Insert the boxes into the bingo_boxes table
    const boxInsertValues = selectedTraits
      .map((trait, index) => `(${bingoSheetId}, '${trait}')`)
      .join(", ");
    await pool.query(
      `INSERT INTO bingo_boxes (bingo_sheet_id, trait) VALUES ${boxInsertValues}`
    );

    res.status(201).json({
      message: "Bingo sheet generated successfully",
      bingoSheetId,
    });
  } catch (error) {
    console.error("Error generating bingo sheet:", error);
    res.status(500).json({ error: "Failed to generate bingo sheet" });
  }
});

// Retrieve a bingo sheet for a player
router.get("/:playerId", async (req, res) => {
  const { playerId } = req.params;

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
