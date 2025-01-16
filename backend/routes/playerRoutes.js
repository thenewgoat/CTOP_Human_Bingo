const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const pool = require("../db"); // Use the centralized database connection

const jwtSecret = process.env.JWT_SECRET || "default_secret_key";

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
  "Can solve a Rubik's Cube",
  "Has read 50+ books in a year",
  "Is left-handed",
  "Has been scuba diving",
  "Loves spicy food",
  "Knows how to knit or crochet",
  "Has been on TV",
  "Owns a collection of something",
  "Has broken a bone",
  "Loves hiking",
  "Is a twin or has twins in the family",
  "Can juggle",
  "Speaks 3+ languages",
  "Has won a competition",
  "Enjoys gardening",
  "Has climbed a mountain",
  "Can whistle a tune",
  "Loves horror movies",
  "Has a tattoo",
  "Can touch their toes without bending knees",
  "Plays chess",
  "Loves board games",
  "Has attended a concert",
  "Knows sign language",
  "Has written a poem",
  "Is a great storyteller",
  "Knows how to sew",
  "Enjoys photography",
  "Has dyed their hair a bright color",
  "Has met a celebrity",
  "Can do impressions",
  "Has run a 5K race",
  "Loves sushi",
  "Has baked bread from scratch",
  "Has stayed awake for 24+ hours",
  "Can do a handstand",
  "Has been camping",
  "Knows martial arts",
  "Has been to a theme park",
  "Can name all 50 U.S. states",
  "Has lived in more than 3 cities",
  "Enjoys painting or drawing",
  "Is a cat person",
  "Is a dog person",
  "Has ridden a horse",
  "Can play poker",
  "Knows how to surf",
  "Is good at trivia",
  "Can bake a cake",
  "Has performed on stage",
  "Can recite a movie quote perfectly",
  "Has built something with wood",
  "Loves romantic comedies",
  "Has been on a road trip",
  "Is afraid of spiders",
  "Has volunteered for a charity",
  "Has worked in customer service",
  "Has taken a dance class",
  "Knows how to play darts",
  "Can make origami",
  "Is always early",
  "Has written a book or short story",
  "Loves the beach",
  "Can do magic tricks",
  "Has visited a famous landmark",
  "Loves classic rock music",
  "Has made a YouTube video",
  "Knows how to play an unusual instrument",
  "Has tried a food challenge",
  "Is good at math",
  "Can name all the planets in order",
  "Has worked in a restaurant",
  "Knows a lot about history",
  "Can name 10 types of animals",
  "Is a fan of sci-fi movies",
  "Has played a team sport",
  "Is good at public speaking",
  "Loves mystery novels",
  "Has tried a unique hobby",
  "Has ridden in a hot air balloon",
  "Enjoys stargazing",
  "Has attended a music festival",
  "Knows how to play pool",
  "Has never broken a bone",
  "Is a fan of anime",
  "Has been to a zoo or aquarium"
];


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
      jwtSecret, // Secret key
      { expiresIn: "1h" } // Token validity
    );

    // Generate a QR code for the player
    const qrData = JSON.stringify({ id: player.id, group_name });
    const qrCode = await QRCode.toDataURL(qrData); // Generate QR code as Base64 string

    // Update the player record with the QR code
    await pool.query("UPDATE players SET qr_code = $1 WHERE id = $2", [qrCode, player.id]);

    // **Directly Generate the Bingo Sheet**
    try {
      // Insert the bingo sheet
      const sheetResult = await pool.query(
        "INSERT INTO bingo_sheets (player_id) VALUES ($1) RETURNING id",
        [player.id]
      );
      const bingoSheetId = sheetResult.rows[0].id;

      // Generate 25 unique traits for the sheet
      const shuffledTraits = [...TRAITS_POOL].sort(() => 0.5 - Math.random());
      const selectedTraits = shuffledTraits.slice(0, 25);

      // Insert the boxes into the bingo_boxes table
      const boxInsertValues = selectedTraits
        .map((trait) => `(${bingoSheetId}, '${trait}')`)
        .join(", ");
      await pool.query(
        `INSERT INTO bingo_boxes (bingo_sheet_id, trait) VALUES ${boxInsertValues}`
      );

      // Return the player info, token, and generated bingo sheet ID
      res.status(201).json({
        message: "Player registered and bingo sheet generated successfully",
        player: { ...player, qr_code: qrCode },
        token, // Send token to the client
        bingoSheetId, // Include the bingo sheet ID in the response
      });
    } catch (error) {
      console.error("Error generating bingo sheet:", error);
      return res.status(500).json({ error: "Player registered but failed to generate bingo sheet" });
    }
  } catch (error) {
    console.error("Error registering player:", error);
    res.status(500).json({ error: "Failed to register player" });
  }
});

module.exports = router;
