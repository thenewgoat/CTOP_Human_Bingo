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
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer)); // Parse and set the player data
    }
  }, []);

  const handleRegister = (playerData) => {
    setPlayer(playerData); // Update state
    localStorage.setItem("playerData", JSON.stringify(playerData)); // Persist to localStorage
  };

  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Register Page */}
        <Route
          path="/register"
          element={
            player ? (
              <Navigate to="/game" replace /> // Redirect if already registered
            ) : (
              <RegisterPage onRegister={handleRegister} />
            )
          }
        />

        {/* Game Page */}
        <Route
          path="/game"
          element={
            player ? (
              <GamePage player={player} />
            ) : (
              <Navigate to="/register" replace /> // Redirect if not registered
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
