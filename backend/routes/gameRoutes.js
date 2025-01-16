const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authenticateTokens");

/*
    Helper function to check for bingo
*/

function checkBingo(boxes) {
  // Find the smallest box ID to normalize the grid indices
  const minId = Math.min(...boxes.map((box) => box.id));

  // Create a 5x5 grid
  const grid = Array(5)
    .fill(null)
    .map(() => Array(5).fill(false));

  // Populate the grid with signed status
  boxes.forEach((box) => {
    const normalizedId = box.id - minId; // Normalize ID
    const row = Math.floor(normalizedId / 5); // Calculate row
    const col = normalizedId % 5; // Calculate column
    grid[row][col] = box.is_signed;
  });

  // Check rows and columns for bingo
  for (let i = 0; i < 5; i++) {
    if (grid[i].every((val) => val)) return true; // Row is complete
    if (grid.map((row) => row[i]).every((val) => val)) return true; // Column is complete
  }

  // Check diagonals for bingo
  const leftDiagonal = grid.map((row, i) => row[i]);
  const rightDiagonal = grid.map((row, i) => row[4 - i]);
  if (leftDiagonal.every((val) => val) || rightDiagonal.every((val) => val)) return true;

  return false;
}

/*
    Actual Routes all below
*/

// Retrieve a bingo sheet for a player
router.get("/:playerId", authenticateToken, async (req, res) => {
  const { playerId } = req.params;

  // Ensure the token belongs to the player requesting the data
  if (!req.player || req.player.id !== parseInt(playerId)) {
    console.error("Player ID mismatch or invalid token.");
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



// Update Bingo Box after Successful Scan
router.post("/boxes/:id/sign", async (req, res) => {

  const { id } = req.params; // Bingo box ID
  const { signer_id, signed_at } = req.body; // Signer ID and timestamp

  if (!signer_id || !signed_at) {
    return res.status(400).json({ error: "Signer ID and signed timestamp are required." });
  }

  try {
    // Check if the box is already signed
    const boxCheck = await pool.query("SELECT * FROM bingo_boxes WHERE id = $1", [id]);

    if (boxCheck.rows.length === 0) {
      return res.status(404).json({ error: "Bingo box not found." });
    }

    const box = boxCheck.rows[0];

    if (box.is_signed) {
      return res.status(409).json({ error: "This box has already been signed." });
    }

    // Update the box as signed
    await pool.query(
      "UPDATE bingo_boxes SET is_signed = true, signer_id = $1, signed_at = $2 WHERE id = $3",
      [signer_id, signed_at, id]
    );

    // Query all boxes for this bingo sheet
    const allBoxes = await pool.query(
      "SELECT * FROM bingo_boxes WHERE bingo_sheet_id = $1",
      [box.bingo_sheet_id]
    );

    const boxes = allBoxes.rows;

    // Query sheet for completion status
    const sheet = await pool.query(
      "SELECT * FROM bingo_sheets WHERE id = $1",
      [box.bingo_sheet_id]
    );

    // Check for bingo
    const isBingo = checkBingo(boxes);
    if (isBingo && sheet.rows[0].is_completed === false) { // if bingo and not already completed
      await pool.query(
        "UPDATE bingo_sheets SET is_completed = true, completed_at = NOW() WHERE id = $1",
        [box.bingo_sheet_id]
      );

      return res.status(200).json({ message: "Bingo achieved!", isBingo: true });
    }

    res.status(200).json({ message: "Box signed successfully.", isBingo: false });
  } catch (error) {
    console.error("Error updating bingo box:", error);
    res.status(500).json({ error: "Failed to update bingo box." });
  }
});





module.exports = router;
