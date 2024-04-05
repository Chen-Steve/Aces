document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.getElementById('download-save-btn');
    const loadGameInput = document.getElementById('load-game-file');
    const saveButton = document.getElementById('save-score-btn');
    const toggleMusicButton = document.getElementById('toggleMusicBtn');

    if (downloadButton) {
        downloadButton.addEventListener('click', downloadGameState);
    } else {
        console.error('Download button not found.');
    }

    if (loadGameInput) {
        loadGameInput.addEventListener('change', handleFileUpload);
    } else {
        console.error('Load game input not found.');
    }

    if (saveButton) {
        saveButton.addEventListener('click', () => {
            saveGameState();
            showSaveMessage();
        });
    } else {
        console.error('Save button not found.');
    }

    if (toggleMusicButton) {
        toggleMusicButton.addEventListener('click', toggleMusic);
    } else {
        console.error('Music toggle button not found.');
    }

    // Load any existing saved game state
    loadGameState();
});

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
            updateUIWithGameState(gameState);
            console.log('Game state loaded:', gameState);
        }
    } catch (e) {
        console.error('Failed to load game state:', e);
    }
}

function updateUIWithGameState(gameState) {
    // Update UI elements with the loaded game state
    document.getElementById('funds').textContent = gameState.funds;
    document.getElementById('wins').textContent = gameState.wins;
    document.getElementById('losses').textContent = gameState.losses;
    document.getElementById('draws').textContent = gameState.draws;
    // ...include other UI updates if necessary
}

function downloadGameState() {
    const gameState = {
        wins: BJgame.wins,
        losses: BJgame.losses,
        draws: BJgame.draws,
        funds: BJgame.playerFunds
        // Include any other relevant game state information here
    };
    const gameStateStr = JSON.stringify(gameState);
    const blob = new Blob([gameStateStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'game-state.json';
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('load-game-file').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const gameState = JSON.parse(event.target.result);
                BJgame.wins = gameState.wins;
                BJgame.losses = gameState.losses;
                BJgame.draws = gameState.draws;
                BJgame.playerFunds = gameState.funds;
                // Call a function to update the UI with the loaded game state
                updateUIWithGameState(gameState);
            } catch (e) {
                console.error('Failed to load game state:', e);
                alert('Failed to load the game state. Please check the file.');
            }
        };
        reader.readAsText(file);
    }
}

function showSaveMessage() {
    const message = document.createElement('div');
    message.textContent = 'Saved!';
    message.classList.add('save-message');
    document.body.appendChild(message);
    setTimeout(() => document.body.removeChild(message), 2000);
}

function resetGameState() {
    localStorage.removeItem('BJgameState');
    console.log('Game state reset');
}

function toggleMusic() {
    const music = document.getElementById('bgMusic');
    music.paused ? music.play() : music.pause();
}
