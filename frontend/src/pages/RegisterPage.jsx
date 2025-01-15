import React, { useState } from 'react';

const RegisterPage = () => {
    const [nickname, setNickname] = useState('');
    const [groupName, setGroupName] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nickname || !groupName) {
            setMessage('Both fields are required!');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('https://ctop-human-bingo.onrender.com/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, group_name: groupName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to register');
            }

            const data = await response.json();
            setMessage(`Player registered successfully!`);
            console.log('Player data:', data);

            // Redirect to the bingo sheet page
            window.location.href = `/bingo-sheet/${data.player.id}`;
        } catch (error) {
            console.error('Error:', error);
            setMessage(error.message || 'Registration failed. Please try again.');
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
                    {isLoading ? 'Registering...' : 'Register'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default RegisterPage;
