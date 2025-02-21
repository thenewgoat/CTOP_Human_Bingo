const BASE_URL =
  process.env.NODE_ENV === "production"
    //? "https://ctophumanbingo-production.up.railway.app/api" // Railway backend URL
    ? "https://ctop-human-bingo.onrender.com/api" // Render backend URL
    : "/api"; // Proxy for local development

export const fetchBingoSheet = async (playerId) => {
  const token = localStorage.getItem("playerToken");

  const response = await fetch(`${BASE_URL}/bingo/${playerId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Include the token
    },
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve bingo sheet");
  }

  return response.json();
};
