import React, { useState, useEffect } from "react";
import { fetchBingoSheet } from "../api";
import QrScannerModal from "../components/QrScannerModal";
import "../theme/BingoBoard.css";

const GamePage = ({ player }) => {
  const [bingoSheet, setBingoSheet] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("bingoSheet");
  const [showScanner, setShowScanner] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);

  // Leaderboard states
  const [leaderboardTab, setLeaderboardTab] = useState("clan"); // "clan", "group", "individual"
  const [leaderboardData, setLeaderboardData] = useState([]);

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

  // When user clicks on a box
  const handleBoxClick = (box) => {
    if (box.is_signed) {
      alert(`Box already signed by ${box.signer_nickname} on ${box.timestamp}`);
      return;
    }
    setSelectedBox(box);
    setShowScanner(true);
  };

  // Handle the QR scan
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
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to sign the box.");
      }

      const data = await response.json();
      console.log("Response from server:", data);

      // If there's a bingo and the sheet is not yet completed
      if (data.isBingo && bingoSheet.is_completed === false) {
        alert("Congratulations! Bingo achieved!");
        setMessage("Bingo achieved!");
        bingoSheet.is_completed = true; // update local state
      } else {
        setMessage(data.message || `Box signed by ${scannedPlayer.nickname}.`);
      }

      // Update local boxes state
      setBoxes((prevBoxes) =>
        prevBoxes.map((b) =>
          b.id === selectedBox.id
            ? {
                ...b,
                is_signed: true,
                signer_nickname: scannedPlayer.nickname,
                timestamp: new Date().toISOString(),
              }
            : b
        )
      );

      setMessage(`Box signed by ${scannedPlayer.nickname}!`);
    } catch (error) {
      console.error("Error during QR scan:", error.message);
      alert(error.message);
    }
  };

  // Tabs: Bingo Sheet, QR Code, Leaderboard
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "leaderboard") {
      // Load the default sub-tab (clan) or keep the existing sub-tab
      loadLeaderboardData(leaderboardTab);
    }
  };

  // Leaderboard Sub-Tabs: clan, group, individual
  const handleLeaderboardTabClick = (subTab) => {
    setLeaderboardTab(subTab);
    loadLeaderboardData(subTab);
  };

  // Fetch the leaderboard data based on the sub-tab
  const loadLeaderboardData = async (type) => {
    try {
      setMessage("Loading leaderboard...");
      // Example endpoint: /api/leaderboard?type=clan / group / individual
      const res = await fetch(`https://ctop-human-bingo.onrender.com/api/leaderboard?type=${type}`);
      if (!res.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await res.json();
      setLeaderboardData(data);
      setMessage(`Loaded ${type} leaderboard successfully!`);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setMessage("Failed to load leaderboard.");
    }
  };

  return (
    <div className="game-page">
      <h1>Welcome, {player.nickname}</h1>
      <h2>Group: {player.group_name}</h2>

      {/* Main Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "bingoSheet" ? "active" : ""}`}
          onClick={() => handleTabClick("bingoSheet")}
        >
          Bingo Sheet
        </button>
        <button
          className={`tab ${activeTab === "qrCode" ? "active" : ""}`}
          onClick={() => handleTabClick("qrCode")}
        >
          QR Code
        </button>
        <button
          className={`tab ${activeTab === "leaderboard" ? "active" : ""}`}
          onClick={() => handleTabClick("leaderboard")}
        >
          Leaderboard
        </button>
      </div>

      <div className="tab-content">
        {/* Bingo Sheet */}
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
                  {box.is_signed && <p>Signed by {box.signer_nickname}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* QR Code */}
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

        {/* Leaderboard */}
        {activeTab === "leaderboard" && (
          <>
            <h3>Leaderboard</h3>
            {/* Sub-tabs for clan, group, individual */}
            <div className="leaderboard-subtabs">
              <button
                className={`subtab ${leaderboardTab === "clan" ? "active" : ""}`}
                onClick={() => handleLeaderboardTabClick("clan")}
              >
                Clans
              </button>
              <button
                className={`subtab ${leaderboardTab === "group" ? "active" : ""}`}
                onClick={() => handleLeaderboardTabClick("group")}
              >
                Groups
              </button>
              <button
                className={`subtab ${leaderboardTab === "individual" ? "active" : ""}`}
                onClick={() => handleLeaderboardTabClick("individual")}
              >
                Individuals
              </button>
            </div>

            <LeaderboardTable data={leaderboardData} type={leaderboardTab} />
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

/**
 * LeaderboardTable: simple table to show clan / group / individual data
 */
const LeaderboardTable = ({ data, type }) => {
  // data is expected to be an array of objects, e.g.
  // For "clan":  [{ clan_name: 'C', score: 10 }, ...]
  // For "group": [{ group_name: 'C1', clan_name: 'C', score: 4 }, ...]
  // For "individual": [{ player_id: 1, nickname: 'Alice', group_name: 'C3', score: 7 }, ...]

  if (!Array.isArray(data) || data.length === 0) {
    return <p>No leaderboard data.</p>;
  }

  // Sort by score descending as example
  const sortedData = [...data].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <table className="leaderboard-table">
      <thead>
        <tr>
          <th>Rank</th>
          {type === "clan" && (
            <>
              <th>Clan</th>
              <th>Score</th>
            </>
          )}
          {type === "group" && (
            <>
              <th>Group</th>
              <th>Clan</th>
              <th>Score</th>
            </>
          )}
          {type === "individual" && (
            <>
              <th>Nickname</th>
              <th>Group</th>
              <th>Score</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            {type === "clan" && (
              <>
                <td>{row.clan_name || "?"}</td>
                <td>{row.score || 0}</td>
              </>
            )}
            {type === "group" && (
              <>
                <td>{row.group_name || "?"}</td>
                <td>{row.clan_name || "?"}</td>
                <td>{row.score || 0}</td>
              </>
            )}
            {type === "individual" && (
              <>
                <td>{row.nickname || "?"}</td>
                <td>{row.group_name || "?"}</td>
                <td>{row.score || 0}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default GamePage;
