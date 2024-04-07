document.addEventListener("DOMContentLoaded", () => {
  const downloadButton = document.getElementById("download-save-btn");
  const loadGameInput = document.getElementById("load-game-file");
  const saveButton = document.getElementById("save-score-btn");
  const toggleMusicButton = document.getElementById("toggleMusicBtn");

  if (downloadButton) {
    downloadButton.addEventListener("click", downloadGameState);
  } else {
    console.error("Download button not found.");
  }

  if (loadGameInput) {
    loadGameInput.addEventListener("change", handleFileUpload);
  } else {
    console.error("Load game input not found.");
  }

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      saveGameState();
      showSaveMessage();
    });
  } else {
    console.error("Save button not found.");
  }

  if (toggleMusicButton) {
    toggleMusicButton.addEventListener("click", toggleMusic);
  } else {
    console.error("Music toggle button not found.");
  }

  // Load any existing saved game state
  loadGameState();
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
    console.error('No JWT token found. Please sign in.');
    return;
  }

  try {
    await fetch('https://aces-nu.vercel.app/api/updateStats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(gameState),
    });
    console.log('Game state saved to server:', gameState);
  } catch (e) {
    console.error('Failed to save game state to server:', e);
  }
}

function updateUIWithGameState(gameState) {
  // Update UI elements with the loaded game state
  document.getElementById("funds").textContent = gameState.funds;
  document.getElementById("wins").textContent = gameState.wins;
  document.getElementById("losses").textContent = gameState.losses;
  document.getElementById("draws").textContent = gameState.draws;
  // ...include other UI updates if necessary
}

function downloadGameState() {
  const gameState = {
    wins: BJgame.wins,
    losses: BJgame.losses,
    draws: BJgame.draws,
    funds: BJgame.playerFunds,
    // Include any other relevant game state information here
  };
  const gameStateStr = JSON.stringify(gameState);
  const blob = new Blob([gameStateStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = "game-state.json";
  a.href = url;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document
  .getElementById("load-game-file")
  .addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  // Check the file type
  if (file.type !== "application/json") {
    alert("Invalid file type. Please upload a JSON file.");
    return;
  }

  // Check the file size (e.g., no more than 1MB)
  const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
  if (file.size > maxSizeInBytes) {
    alert("File is too large. Please upload a file smaller than 1MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const gameState = JSON.parse(event.target.result);

      // Validate the structure of gameState
      if (
        typeof gameState !== "object" ||
        typeof gameState.wins !== "number" ||
        typeof gameState.losses !== "number" ||
        typeof gameState.draws !== "number" ||
        typeof gameState.funds !== "number"
      ) {
        throw new Error("Invalid game state structure.");
      }

      // Update the game state
      BJgame.wins = gameState.wins;
      BJgame.losses = gameState.losses;
      BJgame.draws = gameState.draws;
      BJgame.playerFunds = gameState.funds;

      // Update the UI with the loaded game state
      updateUIWithGameState(gameState);
    } catch (e) {
      console.error("Failed to load game state:", e);
      alert("Failed to load the game state. Please check the file.");
    }
  };

  reader.onerror = function (event) {
    console.error("File could not be read! Code " + event.target.error.code);
  };

  reader.readAsText(file);
}

function showSaveMessage() {
  const message = document.createElement("div");
  message.textContent = "Saved!";
  message.classList.add("save-message");
  document.body.appendChild(message);
  setTimeout(() => document.body.removeChild(message), 2000);
}

function resetGameState() {
  localStorage.removeItem("BJgameState");
  console.log("Game state reset");
}

function toggleMusic() {
  const music = document.getElementById("bgMusic");
  music.paused ? music.play() : music.pause();
}
