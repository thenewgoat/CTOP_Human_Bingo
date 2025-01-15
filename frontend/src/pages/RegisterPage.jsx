import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode"; // Install using: npm install jwt-decode

const RegisterPage = () => {
  const [nickname, setNickname] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // For navigation

  // Check if a valid JWT token exists and redirect
  useEffect(() => {
    const token = localStorage.getItem("playerToken");

    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode the token to retrieve player ID
        if (decoded && decoded.id) {
          navigate(`/bingo-sheet/${decoded.id}`); // Redirect to bingo sheet page
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("playerToken"); // Remove invalid token
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nickname || !groupName) {
      setMessage("Both fields are required!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://ctop-human-bingo.onrender.com/api/players",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname, group_name: groupName }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register");
      }

      const data = await response.json();
      setMessage("Player registered successfully!");
      console.log("Player data:", data);

      // Save the JWT token to localStorage
      localStorage.setItem("playerToken", data.token);

      // Redirect to the bingo sheet page
      navigate(`/bingo-sheet/${data.player.id}`);
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Fill in the blanks</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterPage;
