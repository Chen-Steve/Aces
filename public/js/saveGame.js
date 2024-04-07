document.addEventListener("DOMContentLoaded", () => {
  const toggleMusicButton = document.getElementById("toggleMusicBtn");

  if (toggleMusicButton) {
    toggleMusicButton.addEventListener("click", toggleMusic);
  } else {
    console.error("Music toggle button not found.");
  }

  // Set up an interval to save the game state automatically every minute
  setInterval(saveGameState, 60000); // 60000 milliseconds = 1 minute
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
      showSaveMessage(); // Optionally, show confirmation every minute or adjust according to UX needs.
    } else {
      console.error('Failed to save game state to server. Response not OK.');
    }
  } catch (e) {
    console.error('Failed to save game state to server:', e);
  }
}

function showSaveMessage() {
  const message = document.createElement("div");
  message.textContent = "Game state automatically saved!";
  message.classList.add("save-message");
  document.body.appendChild(message);
  setTimeout(() => document.body.removeChild(message), 2000);
}

function toggleMusic() {
  const music = document.getElementById("bgMusic");
  music.paused ? music.play() : music.pause();
}