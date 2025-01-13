const express = require("express");
const router = express.Router();

// Route for generating random bingo sheets
router.get("/generate-sheets", (req, res) => {
  // Generate and return randomized bingo sheet
  const traits = ["Loves cats", "Speaks two languages", "Has traveled abroad"]; // Example traits
  const sheet = Array.from({ length: 25 }, () =>
    traits[Math.floor(Math.random() * traits.length)]
  );

  res.json({ sheet });
});

// Route for submitting a signed trait
router.post("/submit-signature", (req, res) => {
  const { playerId, trait } = req.body;

  // Simulate storing the signature (In a real app, use a database)
  console.log(`Player ${playerId} signed trait: ${trait}`);
  res.json({ message: "Signature recorded!" });
});

module.exports = router;



