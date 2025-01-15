import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';

import { createPlayer, getBingoSheets, signTrait } from './api';

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        {/* Add other routes for additional pages */}
        <Route
          path="/game"
          element={
            <div>
              <h1>Human Bingo</h1>
              <button onClick={handleCreatePlayer}>Create Player</button>
              <button onClick={handleGetBingoSheets}>Get Bingo Sheets</button>
              <button onClick={handleSignTrait}>Sign a Trait</button>
              <p>{message}</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
