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
      setMessage("Player not found. Please register again.");
    }
  }, [player]);

  const loadBingoSheet = async (playerId) => {
    console.log("Loading bingo sheet for playerId:", playerId); // Debugging log
    try {
      const data = await fetchBingoSheet(playerId);
      console.log("Fetched bingo sheet data:", data); // Debugging log
      setBingoSheet(data.bingoSheet);
      setBoxes(data.boxes);
      setMessage("Bingo sheet loaded successfully!");
    } catch (error) {
      console.error("Error loading bingo sheet:", error); // Debugging log
      if (error.message === "Failed to retrieve bingo sheet") {
        setMessage("Access denied. Please register again.");
        sessionStorage.removeItem("playerToken"); // Clear invalid token
        sessionStorage.removeItem("playerData");
      } else {
        setMessage("Failed to load bingo sheet. Please try again later.");
      }
    }
  };

  return (
    <div>
      <h1>Welcome, {player?.nickname || "Player"}</h1>
      <h2>Group: {player?.group_name || "N/A"}</h2>
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
