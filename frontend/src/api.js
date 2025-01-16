const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ctop-human-bingo.onrender.com/api" // Render backend URL for production
    : "/api"; // Proxy for local development

export const fetchBingoSheet = async (playerId) => {
  const token = localStorage.getItem("playerToken"); // Retrieve the JWT from localStorage

  const response = await fetch(`${BASE_URL}/bingo/${playerId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the request
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to fetch bingo sheet:", errorData); // Debugging log
    throw new Error("Failed to retrieve bingo sheet");
  }

  return response.json();
};
