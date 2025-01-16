const express = require("express");
const router = express.Router();
const pool = require("../db"); // Centralized database connection

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

    // Check if all boxes in the sheet are now signed
    const incompleteBoxes = await pool.query(
      "SELECT * FROM bingo_boxes WHERE bingo_sheet_id = $1 AND is_signed = false",
      [box.bingo_sheet_id]
    );

    if (incompleteBoxes.rowCount === 0) {
      // Mark the bingo sheet as completed
      await pool.query(
        "UPDATE bingo_sheets SET is_completed = true, completed_at = NOW() WHERE id = $1",
        [box.bingo_sheet_id]
      );
    }

    res.status(200).json({ message: "Box signed successfully." });
  } catch (error) {
    console.error("Error updating bingo box:", error);
    res.status(500).json({ error: "Failed to update bingo box." });
  }
});

module.exports = router;
