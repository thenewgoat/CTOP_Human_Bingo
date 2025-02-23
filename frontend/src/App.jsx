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
      const playerData = JSON.parse(savedPlayer);
      
      // Check if registration is older than 1 hour
      const createdAt = new Date(playerData.created_at); // Parse created_at timestamp
      const now = new Date();
      const oneHourInMillis = 60 * 60 * 1000;

      if (now - createdAt > oneHourInMillis) {
        // Registration expired
        localStorage.removeItem("playerData"); // Clear expired data
        localStorage.removeItem("playerToken"); // Clear token
        setPlayer(null); // Reset state
      } else {
        setPlayer(playerData); // Set valid player data
      }
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
        {/* Fallback Route -- shouldn't be used by the internal logic (manual redirection handled in vercel.json*/}
        <Route 
          path="*" element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;
