import React, { useState, useEffect } from "react";
import { ArrowUpDown, Trophy } from "lucide-react";
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
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-center text-gray-600 py-4">No leaderboard data available.</p>;
  }

  const [sortField, setSortField] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(order);
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortOrder === "asc") return (a[sortField] || 0) > (b[sortField] || 0) ? 1 : -1;
    return (a[sortField] || 0) < (b[sortField] || 0) ? 1 : -1;
  });

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden border">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-4 py-3 text-left">Rank</th>
            {type === "clan" && (
              <>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("clan_name")}>
                  Clan <ArrowUpDown size={14} className="inline ml-1" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("score")}>
                  Score <ArrowUpDown size={14} className="inline ml-1" />
                </th>
              </>
            )}
            {type === "group" && (
              <>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("group_name")}>
                  Group <ArrowUpDown size={14} className="inline ml-1" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("clan_name")}>
                  Clan <ArrowUpDown size={14} className="inline ml-1" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("score")}>
                  Score <ArrowUpDown size={14} className="inline ml-1" />
                </th>
              </>
            )}
            {type === "individual" && (
              <>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("nickname")}>
                  Nickname <ArrowUpDown size={14} className="inline ml-1" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("group_name")}>
                  Group <ArrowUpDown size={14} className="inline ml-1" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("score")}>
                  Score <ArrowUpDown size={14} className="inline ml-1" />
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className={`border-b ${index === 0 ? "bg-yellow-100" : "hover:bg-gray-100"}`}>
              <td className="px-4 py-3">
                {index === 0 ? <Trophy className="text-yellow-500" size={16} /> : index + 1}
              </td>
              {type === "clan" && (
                <>
                  <td className="px-4 py-3">{row.clan_name || "?"}</td>
                  <td className="px-4 py-3 font-bold">{row.score || 0}</td>
                </>
              )}
              {type === "group" && (
                <>
                  <td className="px-4 py-3">{row.group_name || "?"}</td>
                  <td className="px-4 py-3">{row.clan_name || "?"}</td>
                  <td className="px-4 py-3 font-bold">{row.score || 0}</td>
                </>
              )}
              {type === "individual" && (
                <>
                  <td className="px-4 py-3">{row.nickname || "?"}</td>
                  <td className="px-4 py-3">{row.group_name || "?"}</td>
                  <td className="px-4 py-3 font-bold">{row.score || 0}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default GamePage;
