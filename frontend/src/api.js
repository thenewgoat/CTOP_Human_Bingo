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

export const fetchBingoSheet = async (playerId) => {
  const token = localStorage.getItem("playerToken"); // Retrieve the JWT from localStorage

  const response = await fetch(`/api/bingo/${playerId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`, // Include the token in the request
    },
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve bingo sheet");
  }

  return response.json();
};



