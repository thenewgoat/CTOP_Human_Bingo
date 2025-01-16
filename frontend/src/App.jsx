import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";

const App = () => {
  const [player, setPlayer] = useState(null);

  // Load player from sessionStorage on app load
  useEffect(() => {
    const savedPlayer = sessionStorage.getItem("playerData");
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer)); // Parse and set the player data
    }
  }, []);

  const handleRegister = (playerData) => {
    setPlayer(playerData); // Update state
    sessionStorage.setItem("playerData", JSON.stringify(playerData)); // Persist to sessionStorage
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
