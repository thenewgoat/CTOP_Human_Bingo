import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = ({ onRegister }) => {
  const [nickname, setNickname] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const groupOptions = [
    "C1", "C2", "C3", "C4",
    "R1", "R2", "R3", "R4",
    "E1", "E2", "E3", "E4",
    "S1", "S2", "S3", "S4",
  ];

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

      // Store player data and token
      localStorage.setItem("playerToken", data.token);
      localStorage.setItem("playerData", JSON.stringify(data.player));

      // Update the App state with the registered player
      onRegister(data.player);

      // Redirect to the game page
      navigate("/game");
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <select
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        >
          <option value="" disabled>
            Select a group
          </option>
          {groupOptions.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterPage;
