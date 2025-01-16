import React, { useState, useEffect } from "react";
import { fetchBingoSheet } from "../api";
import "../theme/BingoBoard.css"; // Import the CSS file

const GamePage = ({ player }) => {
  const [bingoSheet, setBingoSheet] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (player) {
      loadBingoSheet(player.id);
    }
  }, [player]);

  const loadBingoSheet = async (playerId) => {
    try {
      const data = await fetchBingoSheet(playerId);
      setBingoSheet(data.bingoSheet);
      setBoxes(data.boxes);
      setMessage("Bingo sheet loaded successfully!");
    } catch (error) {
      console.error("Error loading bingo sheet:", error);
      setMessage("Failed to load bingo sheet. Please try again.");
    }
  };

  return (
    <div>
      <h1>Welcome, {player.nickname}</h1>
      <h2>Group: {player.group_name}</h2>
      <h3>Bingo Sheet</h3>
      {bingoSheet && (
        <div>
          <p>Sheet ID: {bingoSheet.id}</p>
          <p>Completed: {bingoSheet.is_completed ? "Yes" : "No"}</p>
        </div>
      )}
      <div className="bingo-board">
        {boxes.map((box, index) => (
          <div key={index} className={`bingo-box ${box.is_signed ? "signed" : ""}`}>
            <p>{box.trait}</p>
            {box.is_signed && <p>Signed by Player ID: {box.signer_id}</p>}
          </div>
        ))}
      </div>
      <p>{message}</p>
    </div>
  );
};

export default GamePage;
