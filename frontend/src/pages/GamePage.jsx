import React, { useState, useEffect } from "react";
import { generateBingoSheet, fetchBingoSheets } from "../api";

const GamePage = ({ player }) => {
  const [bingoSheets, setBingoSheets] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch bingo sheets when the component mounts
    if (player) {
      fetchPlayerBingoSheets(player.id);
    }
  }, [player]);

  const fetchPlayerBingoSheets = async (playerId) => {
    try {
      setLoading(true);
      const data = await fetchBingoSheets(playerId);
      setBingoSheets(data.bingoSheets);
      setMessage("Bingo sheets loaded successfully");
    } catch (error) {
      setMessage("Failed to load bingo sheets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBingoSheet = async () => {
    try {
      setLoading(true);
      const data = await generateBingoSheet(player.id);
      setBingoSheets(data.bingoSheet);
      setMessage("Bingo sheet generated successfully!");
    } catch (error) {
      setMessage("Failed to generate bingo sheet");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Welcome, {player.nickname}</h1>
      <h2>Group: {player.group_name}</h2>
      <div>
        <button onClick={handleGenerateBingoSheet} disabled={loading}>
          {loading ? "Generating..." : "Generate Bingo Sheet"}
        </button>
      </div>
      <div>
        <h3>Your Bingo Sheets</h3>
        {loading && <p>Loading...</p>}
        {!loading && bingoSheets.length === 0 && <p>No bingo sheets yet!</p>}
        <div className="bingo-board">
          {bingoSheets.map((square, index) => (
            <div key={index} className={`bingo-square ${square.is_filled ? "filled" : ""}`}>
              {square.trait}
            </div>
          ))}
        </div>
      </div>
      <p>{message}</p>
    </div>
  );
};

export default GamePage;
