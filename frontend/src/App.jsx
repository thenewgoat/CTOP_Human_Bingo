import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";

const App = () => {
  const [player, setPlayer] = useState(null); // State to store the registered player

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Homepage */}
        <Route
          path="/register"
          element={<RegisterPage onRegister={setPlayer} />} // Pass the onRegister callback
        />
        <Route
          path="/game"
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
