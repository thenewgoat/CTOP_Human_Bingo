import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";

const App = () => {
  const [player, setPlayer] = useState(null);

  // Load player from localStorage on app load
  useEffect(() => {
    const savedPlayer = localStorage.getItem("playerData");
    console.log("Loaded player from localStorage:", savedPlayer); // Debug log
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer)); // Parse and set the player data
    }
  }, []);

  const handleRegister = (playerData) => {
    console.log("Player registered:", playerData); // Debug log
    setPlayer(playerData);
    localStorage.setItem("playerData", JSON.stringify(playerData)); // Save to localStorage
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/register"
          element={<RegisterPage onRegister={handleRegister} />}
        />
        <Route
          path="/game/:playerId"
          element={
            player ? (
              <GamePage player={player} />
            ) : (
              <Navigate to="/register" replace /> // Redirect if player is not registered
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
