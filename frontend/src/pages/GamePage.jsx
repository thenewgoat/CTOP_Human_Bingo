import React, { useState, useEffect } from "react";
import { generateBingoSheet, fetchBingoSheet } from "../api";

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
      setMessage("Failed to load bingo sheet");
      console.error(error);
    }
  };

  const handleGenerateBingoSheet = async () => {
    try {
      const data = await generateBingoSheet(player.id);
      setMessage("Bingo sheet generated successfully!");
      loadBingoSheet(player.id);
    } catch (error) {
      setMessage("Failed to generate bingo sheet");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Welcome, {player.nickname}</h1>
      <h2>Group: {player.group_name}</h2>
      <button onClick={handleGenerateBingoSheet}>Generate Bingo Sheet</button>
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
