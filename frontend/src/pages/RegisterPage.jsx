import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [nickname, setNickname] = useState("");
  const [groupName, setGroupName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Redirect if a JWT token exists
  useEffect(() => {
    const token = localStorage.getItem("playerToken");
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token to extract player ID
        if (decoded && decoded.id) {
          navigate(`/game/${decoded.id}`); // Redirect to the correct game page
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
      // Store the JWT token in localStorage
      localStorage.setItem("playerToken", data.token);
      // Redirect to the game page
      navigate(`/game/${data.player.id}`);
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
