function saveGameState() {
    const gameState = {
        wins: BJgame.wins,
        losses: BJgame.losses,
        draws: BJgame.draws,
        funds: BJgame.playerFunds
    };

    try {
        localStorage.setItem('BJgameState', JSON.stringify(gameState));
        console.log('Game state saved:', gameState);
    } catch (e) {
        console.error('Failed to save game state:', e);
    }
}

function loadGameState() {
    try {
        const savedGameState = localStorage.getItem('BJgameState');
        if (savedGameState) {
            const gameState = JSON.parse(savedGameState);
            BJgame.wins = gameState.wins;
            BJgame.losses = gameState.losses;
            BJgame.draws = gameState.draws;
            BJgame.playerFunds = gameState.funds;

            // Update the UI with loaded game state
            document.getElementById('funds').textContent = BJgame.playerFunds;
            document.getElementById('wins').textContent = BJgame.wins;
            document.getElementById('losses').textContent = BJgame.losses;
            document.getElementById('draws').textContent = BJgame.draws;

            console.log('Game state loaded:', gameState);
        }
    } catch (e) {
        console.error('Failed to load game state:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadGameState();

    const saveButton = document.getElementById('save-score-btn');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            saveGameState();
            showSaveMessage();
        });
    } else {
        console.error('Save button not found.');
    }
});

function showSaveMessage() {
    // Create the message element
    const message = document.createElement('div');
    message.textContent = 'Saved!';
    message.style.position = 'fixed';
    message.style.bottom = '20px';
    message.style.right = '20px';
    message.style.backgroundColor = 'rgba(0, 128, 0, 0.7)';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '1000';
    document.body.appendChild(message);

    // Remove the message after 2 seconds
    setTimeout(() => {
        document.body.removeChild(message);
    }, 2000);
}

function resetGameState() {
    try {
        localStorage.removeItem('BJgameState');
        console.log('Game state reset');
    } catch (e) {
        console.error('Failed to reset game state:', e);
    }
}

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('toggleMusicBtn').addEventListener('click', toggleMusic);
});

function toggleMusic() {
    var music = document.getElementById('bgMusic');
    if (music.paused) {
        music.play();
    } else {
        music.pause();
    }
}

