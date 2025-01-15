const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://ctop-human-bingo.onrender.com/api' // Render backend URL for production
    : '/api'; // Proxy for local development


export const generateBingoSheet = async (playerId) => {
  const response = await fetch("/api/bingo/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerId }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate bingo sheet");
  }
  return response.json();
};




export const fetchBingoSheets = async (playerId) => {
  const response = await fetch(`/api/bingo/${playerId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch bingo sheets");
  }
  return response.json();
};

