import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
              <div>
                <p>You need to register first!</p>
                <a href="/register">Go to Register Page</a>
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
