function setupEventListener(elementId, eventType, handler) {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener(eventType, handler);
  } else {
    console.error(`${elementId} not found.`);
  }
}

function toggleMusic() {
  const music = document.getElementById("bgMusic");
  if (!music) {
    console.error("Background music element not found.");
    return;
  }
  if (music.paused) {
    music.play().catch(e => console.error("Error playing music:", e));
  } else {
    music.pause();
  }
}

function debounce(func, delay) {
  let debounceTimer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

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

const debouncedSaveGameState = debounce(async () => {
  await saveGameState();
}, 1000);

document.addEventListener("DOMContentLoaded", () => {
  setupEventListener("toggleMusicBtn", "click", toggleMusic);
  setupEventListener("save-game-btn", "click", debouncedSaveGameState);
});

function showSaveMessage(messageText, messageType = "success") {
  const message = document.createElement("div");
  message.textContent = messageText;
  message.classList.add("save-message", messageType);
  document.body.appendChild(message);
  setTimeout(() => document.body.removeChild(message), 2000);
}