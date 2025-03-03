const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authenticateTokens");

/**
 * HELPER FUNCTION to count bingos
 * Count how many complete lines (rows, columns, diagonals) on a 5x5 board.
 * boxes: array of { id, is_signed }, with consecutive IDs from `minId` to `minId + 24`.
 */
function countBingos(boxes) {
  // 1) Find the smallest box ID for this sheet
  const minId = Math.min(...boxes.map((b) => b.id));

  // 2) Create a 5x5 boolean grid
  const grid = Array(5).fill(null).map(() => Array(5).fill(false));

  // 3) Populate the grid with is_signed
  boxes.forEach((box) => {
    const normalizedId = box.id - minId; 
    const row = Math.floor(normalizedId / 5);
    const col = normalizedId % 5;
    grid[row][col] = box.is_signed;
  });

  // 4) Count how many lines are fully true
  let bingoCount = 0;

  // Check 5 rows
  for (let r = 0; r < 5; r++) {
    if (grid[r].every((val) => val)) {
      bingoCount++;
    }
  }

  // Check 5 columns
  for (let c = 0; c < 5; c++) {
    const colAllSigned = grid.map((row) => row[c]).every((val) => val);
    if (colAllSigned) {
      bingoCount++;
    }
  }

  // Check 2 diagonals
  const leftDiagonal = grid.map((row, i) => row[i]);       // top-left to bottom-right
  const rightDiagonal = grid.map((row, i) => row[4 - i]);  // top-right to bottom-left
  if (leftDiagonal.every((val) => val)) bingoCount++;
  if (rightDiagonal.every((val) => val)) bingoCount++;

  return bingoCount; // max 12
}


/*
    Actual Routes all below
*/

// routes/gameRoutes.js

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

router.post("/boxes/:id/sign", async (req, res) => {
  const { id } = req.params;       // Bingo box ID
  const { signer_id, signed_at } = req.body; // Player signing the box + timestamp

  if (!signer_id || !signed_at) {
    return res
      .status(400)
      .json({ error: "Signer ID and signed timestamp are required." });
  }

  try {
    // 1) Check if the box exists + is not signed yet
    const boxCheck = await pool.query("SELECT * FROM bingo_boxes WHERE id = $1", [id]);
    if (boxCheck.rows.length === 0) {
      return res.status(404).json({ error: "Bingo box not found." });
    }
    const box = boxCheck.rows[0];
    if (box.is_signed) {
      return res.status(409).json({ error: "This box has already been signed." });
    }

    const alreadySignedCheck = await pool.query(
      `SELECT * 
       FROM bingo_boxes 
       WHERE bingo_sheet_id = $1 
         AND signer_id = $2 
         AND is_signed = TRUE`,
      [box.bingo_sheet_id, signer_id]
    );

    if (alreadySignedCheck.rows.length > 0) {
      // They already signed at least one box in this sheet
      return res
        .status(409)
        .json({ error: "This player has already signed a box for this bingo sheet." });
    }


    // 2) Retrieve all boxes for the bingo sheet (BEFORE signing)
    const allBoxesBefore = await pool.query(
      "SELECT * FROM bingo_boxes WHERE bingo_sheet_id = $1 ORDER BY id",
      [box.bingo_sheet_id]
    );
    const boxesBefore = allBoxesBefore.rows;
    // Count bingos before
    const bingosBefore = countBingos(boxesBefore);

    // 3) Sign the box
    await pool.query(
      "UPDATE bingo_boxes SET is_signed = true, signer_id = $1, signed_at = $2 WHERE id = $3",
      [signer_id, signed_at, id]
    );

    // 4) Re-fetch all boxes (AFTER signing)
    const allBoxesAfter = await pool.query(
      "SELECT * FROM bingo_boxes WHERE bingo_sheet_id = $1 ORDER BY id",
      [box.bingo_sheet_id]
    );
    const boxesAfter = allBoxesAfter.rows;
    // Count bingos after
    const bingosAfter = countBingos(boxesAfter);

    // 5) Compute how many new bingos formed
    const newBingos = bingosAfter - bingosBefore;

    // 6) If there's a new Bingo line, we might update the sheet’s is_completed if you want to 
    //    treat even 1 Bingo as "completed." 
    //    For example: if (bingosAfter > 0 && !sheet.is_completed) { ... } 
    //    However, in your logic, "is_completed" might be only if max bingos are achieved or some other condition.

    // 7) Update the player's, group's, and clan's score by the difference (newBingos)
    //    First, find the player's group and clan

    const sheetResult = await pool.query(
      "SELECT * FROM bingo_sheets WHERE player_id = $1 ORDER BY created_at DESC LIMIT 1",
      [id]
    );

    const bingoSheet = sheetResult.rows[0];
    if (bingosAfter > 0 && bingoSheet.is_completed === false) {
      // Mark sheet as completed if it wasn't already
      await pool.query(
        "UPDATE bingo_sheets SET is_completed = true, completed_at = NOW() WHERE id = $1",
        [bingoSheet.id]
      );
    }
    
    const playerResult = await pool.query("SELECT * FROM players WHERE id = $1", [signer_id]);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: "Signer player not found." });
    }
    const signerPlayer = playerResult.rows[0];

    // If newBingos > 0 => increment
    if (newBingos > 0) {
      // Player score
      await pool.query("UPDATE players SET score = score + $1 WHERE id = $2", [
        newBingos,
        signer_id,
      ]);

      // Group
      await pool.query("UPDATE groups SET score = score + $1 WHERE group_name = $2", [
        newBingos,
        signerPlayer.group_name,
      ]);

      // Clan
      const groupResult = await pool.query(
        "SELECT clan_name FROM groups WHERE group_name = $1",
        [signerPlayer.group_name]
      );
      if (groupResult.rows.length) {
        const clanName = groupResult.rows[0].clan_name;
        await pool.query("UPDATE clans SET score = score + $1 WHERE clan_name = $2", [
          newBingos,
          clanName,
        ]);
      };
      return res.status(200).json({ message: "Bingo!", isBingo: true });
    }

    // Return the result
    return res.status(200).json({
      message: "Bingo box signed successfully",
    });
  } catch (error) {
    console.error("Error updating bingo box:", error);
    res.status(500).json({ error: "Failed to update bingo box." });
  }
});



module.exports = router;



