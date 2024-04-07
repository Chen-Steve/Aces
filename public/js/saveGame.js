document.addEventListener("DOMContentLoaded", () => {
  const toggleMusicButton = document.getElementById("toggleMusicBtn");
  const saveButton = document.getElementById("save-game-btn");

  if (toggleMusicButton) {
    toggleMusicButton.addEventListener("click", toggleMusic);
  } else {
    console.error("Music toggle button not found.");
  }

  if (saveButton) {
    saveButton.addEventListener("click", saveGameState);
  } else {
    console.error("Save button not found.");
  }
});

async function saveGameState() {
  const gameState = {
    wins: BJgame.wins,
    losses: BJgame.losses,
    draws: BJgame.draws,
    funds: BJgame.playerFunds,
  };

  const token = localStorage.getItem('jwt');
  if (!token) {
    console.log('Attempting to save game state without a JWT token. User might not be signed in.');
    return;
  }

  try {
    const response = await fetch('https://aces-nu.vercel.app/api/updateStats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(gameState),
    });

    if (response.ok) {
      console.log('Game state saved to server:', gameState);
      showSaveMessage("Game state saved successfully!");
    } else {
      console.error('Failed to save game state to server. Response not OK.');
      showSaveMessage("Failed to save game state.", "error");
    }
  } catch (e) {
    console.error('Failed to save game state to server:', e);
    showSaveMessage("Failed to save game state.", "error");
  }
}

function showSaveMessage(messageText, messageType = "success") {
  const message = document.createElement("div");
  message.textContent = messageText;
  message.classList.add("save-message", messageType);
  document.body.appendChild(message);
  setTimeout(() => document.body.removeChild(message), 2000);
}

function toggleMusic() {
  const music = document.getElementById("bgMusic");
  music.paused ? music.play() : music.pause();
}