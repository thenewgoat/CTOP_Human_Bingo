import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = ({ onRegister }) => {
  const [nickname, setNickname] = useState("");
  const [groupLetter, setGroupLetter] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Separate options for letters and numbers
  const letterOptions = ["C", "R", "E", "S"];
  const numberOptions = ["1", "2", "3", "4"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct final group name by combining letter and number
    const finalGroupName = groupLetter + groupNumber;

    // Validate fields
    if (!nickname || !finalGroupName) {
      setMessage("All fields are required!");
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
          body: JSON.stringify({
            nickname,
            group_name: finalGroupName,
          }),
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
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="register-form">
        {/* Nickname Input */}
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />

        {/* Group Letter Dropdown */}
        <select
          value={groupLetter}
          onChange={(e) => setGroupLetter(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Clan (C, R, E, S)
          </option>
          {letterOptions.map((letter) => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>

        {/* Group Number Dropdown */}
        <select
          value={groupNumber}
          onChange={(e) => setGroupNumber(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Group No. (1, 2, 3, 4)
          </option>
          {numberOptions.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        {/* Register Button */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
