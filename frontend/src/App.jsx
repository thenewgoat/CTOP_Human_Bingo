import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import { createPlayer, getBingoSheets, signTrait } from './api';

const App = () => {
  const [player, setPlayer] = useState(null);
  const [bingoSheets, setBingoSheets] = useState([]);
  const [message, setMessage] = useState('');

  const handleCreatePlayer = async () => {
    try {
      const newPlayer = await createPlayer('Alice', 'TeamA'); // Update: Removed email as per new requirements
      setPlayer(newPlayer);
      setMessage(`Player created: ${newPlayer.nickname}`);
    } catch (error) {
      console.error(error);
      setMessage('Failed to create player');
    }
  };

  const handleGetBingoSheets = async () => {
    try {
      if (!player) {
        alert('Create a player first!');
        return;
      }
      const sheets = await getBingoSheets(player.id);
      setBingoSheets(sheets);
      setMessage('Fetched bingo sheets');
    } catch (error) {
      console.error(error);
      setMessage('Failed to fetch bingo sheets');
    }
  };

  const handleSignTrait = async () => {
    try {
      if (!bingoSheets.length) {
        alert('Create a bingo sheet first!');
        return;
      }
      const signedTrait = await signTrait(bingoSheets[0].id, 'Loves coding', 2);
      setMessage('Trait signed successfully');
    } catch (error) {
      console.error(error);
      setMessage('Failed to sign trait');
    }
  };

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
