/*
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/

import React, { useState } from 'react';
import { createPlayer, getBingoSheets, signTrait } from './api';

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

