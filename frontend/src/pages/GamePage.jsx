import React, { useState, useEffect } from "react";
import { fetchBingoSheet } from "../api";
import QrScannerModal from "../components/QrScannerModal";
import "../theme/BingoBoard.css";


const GamePage = ({ player }) => {
  const [bingoSheet, setBingoSheet] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("bingoSheet");
  const [showScanner, setShowScanner] = useState(false); // State for showing the QR scanner
  const [selectedBox, setSelectedBox] = useState(null); // Track which box is selected for signing

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

  const handleBoxClick = (box) => {
    if (box.is_signed) {
      alert(`Box already signed by ${box.signer_nickname} on ${box.timestamp}`);
      return;
    }
    setSelectedBox(box); // Set the box to be signed
    setShowScanner(true); // Show the QR scanner
  };



  const handleQrScan = async (qrData) => {
    try {
      const scannedPlayer = JSON.parse(qrData);
  
      // Validation checks
      if (!scannedPlayer.nickname || !scannedPlayer.id || !scannedPlayer.group_name) {
        throw new Error("Invalid QR code. Missing required fields.");
      }
  
      if (scannedPlayer.group_name !== player.group_name) {
        throw new Error("Player is not in the same group.");
      }
  
      // API call to update the database
      const response = await fetch(
        `https://ctop-human-bingo.onrender.com/api/bingo/boxes/${selectedBox.id}/sign`, 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signer_id: scannedPlayer.id,
          signed_at: new Date().toISOString(),
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sign the box.");
      }
  
      // Update the box in the frontend state
      setBoxes((prevBoxes) =>
        prevBoxes.map((box) =>
          box.id === selectedBox.id
            ? {
                ...box,
                is_signed: true,
                signer_nickname: scannedPlayer.nickname,
                timestamp: new Date().toISOString(),
              }
            : box
        )
      );
  
      setMessage(`Box signed by ${scannedPlayer.nickname}!`);
    } catch (error) {
      console.error("Error during QR scan:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="game-page">
      <h1>Welcome, {player.nickname}</h1>
      <h2>Group: {player.group_name}</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "bingoSheet" ? "active" : ""}`}
          onClick={() => setActiveTab("bingoSheet")}
        >
          Bingo Sheet
        </button>
        <button
          className={`tab ${activeTab === "qrCode" ? "active" : ""}`}
          onClick={() => setActiveTab("qrCode")}
        >
          QR Code
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "bingoSheet" && (
          <>
            <h3>Bingo Sheet</h3>
            {bingoSheet && (
              <div>
                <p>Sheet ID: {bingoSheet.id}</p>
                <p>Completed: {bingoSheet.is_completed ? "Yes" : "No"}</p>
              </div>
            )}
            <div className="bingo-board">
              {boxes.map((box) => (
                <div
                  key={box.id}
                  className={`bingo-box ${box.is_signed ? "signed" : ""}`}
                  onClick={() => handleBoxClick(box)}
                >
                  <p>{box.trait}</p>
                  {box.is_signed}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "qrCode" && (
          <>
            <h3>Your QR Code</h3>
            {player.qr_code ? (
              <img src={player.qr_code} alt="Player QR Code" className="qr-code" />
            ) : (
              <p>No QR code available.</p>
            )}
          </>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QrScannerModal
          onClose={() => setShowScanner(false)}
          onScan={handleQrScan}
        />
      )}

      <p>{message}</p>
    </div>
  );
};

export default GamePage;
