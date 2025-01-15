import React, { useState } from 'react';
import { createPlayer, getBingoSheets, signTrait } from './api';
import RegisterPage from './RegisterPage';

const App = () => {
  const [player, setPlayer] = useState(null);
  const [bingoSheets, setBingoSheets] = useState([]);
  const [message, setMessage] = useState('');

  const handleCreatePlayer = async () => {
    try {
      const newPlayer = await createPlayer('Alice', 'alice@example.com');
      setPlayer(newPlayer);
      setMessage(`Player created: ${newPlayer.name}`);
    } catch (error) {
      console.error(error);
      setMessage('Failed to create player');
    }
    return (
      <Router>
          <Routes>
              <Route path="/" element={<RegisterPage />} />
              {/* Add other routes as needed */}
          </Routes>
      </Router>
    );
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
    <div>
      <h1>Human Bingo</h1>
      <button onClick={handleCreatePlayer}>Create Player</button>
      <button onClick={handleGetBingoSheets}>Get Bingo Sheets</button>
      <button onClick={handleSignTrait}>Sign a Trait</button>
      <p>{message}</p>
    </div>
  );
};

export default App;

