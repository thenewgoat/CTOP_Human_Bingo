import React, { useState, useEffect } from "react";
import { fetchBingoSheet } from "../api";

const GamePage = ({ player }) => {
  const [bingoSheet, setBingoSheet] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (player) {
      console.log("Player object in GamePage:", player); // Debugging log
      loadBingoSheet(player.id);
    } else {
      console.warn("Player object is null or undefined.");
    }
  }, [player]);

  const loadBingoSheet = async (playerId) => {
    console.log("Loading bingo sheet for playerId:", playerId); // Debugging log
    try {
      const data = await fetchBingoSheet(playerId);
      setBingoSheet(data.bingoSheet);
      setBoxes(data.boxes);
      setMessage("Bingo sheet loaded successfully!");
    } catch (error) {
      if (error.message === "Failed to retrieve bingo sheet") {
        setMessage("Access denied. Please register again.");
        localStorage.removeItem("playerToken"); // Clear invalid token
      } else {
        setMessage("Failed to load bingo sheet");
      }
      console.error(error);
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
