// routes/leaderboard.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * GET /api/leaderboard
 * Returns leaderboard data for clans, groups, and players, sorted by score descending.
 *
 * Example structure of the returned JSON:
 * {
 *   clans: [...],
 *   groups: [...],
 *   players: [...]
 * }
 */
router.get("/", async (req, res) => {
  try {
    // 1) Fetch all clans with their scores
    const clansResult = await pool.query(`
      SELECT clan_name, score
      FROM clans
      ORDER BY score DESC
    `);

    // 2) Fetch all groups with their scores
    const groupsResult = await pool.query(`
      SELECT group_name, clan_name, score
      FROM groups
      ORDER BY score DESC
    `);

    // 3) Fetch all players with their scores
    //    In this schema, 'players' table does not have a 'score' column by default;
    //    If you've added one, this will work. If not, you can retrieve from game logic.
    const playersResult = await pool.query(`
      SELECT p.id, p.nickname, p.group_name, g.clan_name,
             (SELECT COALESCE(score, 0) FROM players WHERE players.id = p.id) AS score
      FROM players p
      JOIN groups g ON p.group_name = g.group_name
      ORDER BY score DESC
    `);

    return res.status(200).json({
      clans: clansResult.rows,
      groups: groupsResult.rows,
      players: playersResult.rows,
    });
  } catch (error) {
    console.error("Error retrieving leaderboard:", error);
    return res.status(500).json({ error: "Failed to retrieve leaderboard." });
  }
});

module.exports = router;
