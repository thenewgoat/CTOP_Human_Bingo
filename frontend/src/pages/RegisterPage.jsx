import React, { useState } from 'react';

const RegisterPage = () => {
    const [nickname, setNickname] = useState('');
    const [groupName, setGroupName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://ctop-human-bingo.onrender.com/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, group_name: groupName }),
            });

            if (!response.ok) {
                throw new Error('Failed to register');
            }

            const data = await response.json();
            setMessage(`Player registered successfully!`);
            console.log('Player data:', data);

            // Redirect to the bingo sheet page (example)
            window.location.href = `/bingo-sheet/${data.player.id}`;
        } catch (error) {
            setMessage('Registration failed. Please try again.');
        }
    };

    return (
        <div>
            <h1>Register for Human Bingo</h1>
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
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RegisterPage;
