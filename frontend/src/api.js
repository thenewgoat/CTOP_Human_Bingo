const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-backend.onrender.com/api' // Render backend URL for production
    : '/api'; // Proxy for local development

// Function to create a player
export const createPlayer = async (name, email) => {
  const response = await fetch(`${BASE_URL}/players`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email }),
  });
  if (!response.ok) {
    throw new Error('Failed to create player');
  }
  return response.json();
};

// Function to fetch bingo sheets for a player
export const getBingoSheets = async (playerId) => {
  const response = await fetch(`${BASE_URL}/bingo-sheets/${playerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch bingo sheets');
  }
  return response.json();
};

// Function to sign a trait
export const signTrait = async (sheetId, trait, signerId) => {
  const response = await fetch(`${BASE_URL}/signatures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sheet_id: sheetId, trait, signer_id: signerId }),
  });
  if (!response.ok) {
    throw new Error('Failed to sign trait');
  }
  return response.json();
};
