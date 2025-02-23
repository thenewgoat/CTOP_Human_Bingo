// routes/leaderboard.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
/**
 * GET /api/leaderboard?type=clan|group|individual
 * 
 * Returns an array of leaderboard data specific to the requested type.
 * For example:
 *   /api/leaderboard?type=clan       -> [ { clan_name: 'C', score: 10 }, ... ]
 *   /api/leaderboard?type=group      -> [ { group_name: 'C1', clan_name: 'C', score: 4 }, ... ]
 *   /api/leaderboard?type=individual -> [ { id: 1, nickname: 'Alice', group_name: 'C3', clan_name: 'C', score: 7 }, ... ]
 */
router.get("/", async (req, res) => {
    const type = req.query.type || "clan"; // Default to "clan" if not specified
  
    try {
      if (type === "clan") {
        // 1) Fetch all clans with their scores
        const clansResult = await pool.query(`
          SELECT clan_name, score
          FROM clans
          ORDER BY score DESC
        `);
  
        return res.status(200).json(clansResult.rows);
  
      } else if (type === "group") {
        // 2) Fetch all groups with their scores
        const groupsResult = await pool.query(`
          SELECT group_name, clan_name, score
          FROM groups
          ORDER BY score DESC
        `);
  
        return res.status(200).json(groupsResult.rows);
  
      } else if (type === "individual") {
        // 3) Fetch all players with their scores
        //    assuming 'score' column exists on the 'players' table
        const playersResult = await pool.query(`
          SELECT p.id,
                 p.nickname,
                 p.group_name,
                 g.clan_name,
                 COALESCE(p.score, 0) AS score
          FROM players p
          JOIN groups g ON p.group_name = g.group_name
          ORDER BY p.score DESC
        `);
  
        return res.status(200).json(playersResult.rows);
  
      } else {
        // Invalid type param
        return res.status(400).json({
          error: "Invalid 'type' parameter. Use 'clan', 'group', or 'individual'.",
        });
      }
    } catch (error) {
      console.error("Error retrieving leaderboard:", error);
      return res.status(500).json({ error: "Failed to retrieve leaderboard." });
    }
  });
  
  module.exports = router;