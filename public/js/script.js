function generateDeck() {
  const suits = ['C', 'D', 'H', 'S'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return suits.flatMap(suit => ranks.map(rank => `${rank}${suit}`));
}

function getCardValue(card) {
  const rank = card.slice(0, -1);
  if (rank === 'A') return [1, 11]; 
  if (['J', 'Q', 'K'].includes(rank)) return 10; 
  return parseInt(rank);
}

const initialDeck = generateDeck();

let BJgame = {
  you: { scoreSpan: "#yourscore", div: "#your-box", score: 0, cards: [] },
  dealer: {
    scoreSpan: "#dealerscore",
    div: "#dealer-box",
    score: 0,
    cards: [],
  },
  cards: [...initialDeck],
  playerFunds: 1000,
  currentBet: 0,
  // Update player funds
  updateFunds: function (amount) {
    this.playerFunds += amount;
    // Update UI with new funds
    document.getElementById("funds").textContent = this.playerFunds;
  },
  hasPlayerHit: false,
  wins: 0,
  losses: 0,
  draws: 0,
};

const cardSymbols = {
  hearts: ["2♥","3♥","4♥","5♥","6♥","7♥","8♥","9♥","10♥","J♥","Q♥","K♥","A♥",],
  diamonds: ["2♦","3♦","4♦","5♦","6♦","7♦","8♦","9♦","10♦","J♦","Q♦","K♦","A♦",],
  clubs: ["2♣","3♣","4♣","5♣","6♣","7♣","8♣","9♣","10♣","J♣","Q♣","K♣","A♣",],
  spades: ["2♠","3♠","4♠","5♠","6♠","7♠","8♠","9♠","10♠","J♠","Q♠","K♠","A♠",],
};

function updateGameMessage(message, color = "white") {
  const messageEl = document.getElementById("game-message");
  messageEl.textContent = message;
  messageEl.style.color = color;
}

const winSound = new Audio("sound_effects/cha-ching.mp3");
const cheers = new Audio("sound_effects/cheer.mp3");
const loseSound = new Audio("sound_effects/aww.mp3");
const drawSound = new Audio("sound_effects/aww.mp3");
const hitsound = new Audio("sound_effects/swish.mp3");

document.getElementById('betAmount').addEventListener('input', function (e) {
  var value = this.value;
  if(value.includes('.') || !Number.isInteger(+value)){
    this.value = value.split('.')[0];
  }
});


function displayCard(containerId, cardSymbol, fragment) {
  const cardText = document.createElement("div");
  cardText.textContent = cardSymbol;
  fragment.appendChild(cardText);
}

//MARK: displayHands
function displayHands() {
  // Create document fragments to hold card displays
  const yourBoxFragment = document.createDocumentFragment();
  const dealerBoxFragment = document.createDocumentFragment();

  // Create card elements and append them to the fragments
  for (const card of You["cards"]) {
    const cardText = document.createElement("div");
    cardText.textContent = getCardSymbol(card);
    yourBoxFragment.appendChild(cardText);
  }

  displayCard("dealer-box", You["cards"][0], dealerBoxFragment);

  // Append the fragments to the DOM in a single operation
  document.getElementById("your-box").appendChild(yourBoxFragment);
  document.getElementById("dealer-box").appendChild(dealerBoxFragment);
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // ES6 swap
  }
}

function replenishDeck() {
  if (BJgame.cards.length < 10) {
    BJgame.cards = generateDeck();
    shuffleDeck(BJgame.cards);
  }
}

function initializeDeck() {
  let deck = [];
  for (const suit of Object.keys(cardSymbols)) {
    for (let rank = 2; rank <= 14; rank++) {
      deck.push({ rank, suit });
    }
  }
  BJgame.currentBet = 0;
  document.getElementById("hit").disabled = true;
  document.getElementById("stand").disabled = true;
}

const You = BJgame["you"];
const Dealer = BJgame["dealer"];

function showCard(activePlayer, cardCode) {
  let cardNumber = cardCode.slice(0, -1); // Extract card number
  let cardSuitChar = cardCode.slice(-1); // Extract suit character
  let suitName = "";

  switch (cardSuitChar) {
    case "C":
      suitName = "clubs";
      break;
    case "D":
      suitName = "diamonds";
      break;
    case "H":
      suitName = "hearts";
      break;
    case "S":
      suitName = "spades";
      break;
  }

  // Adjusting the cardNumber for face cards and aces
  if (["J", "Q", "K", "A"].includes(cardNumber)) {
    cardNumber =
      cardNumber === "J"
        ? "jack"
        : cardNumber === "Q"
        ? "queen"
        : cardNumber === "K"
        ? "king"
        : "ace";
  }

  let imageName = `${suitName}_${cardNumber.toLowerCase()}.png`;

  const cardImage = document.createElement("img");
  cardImage.src = `svg_playing_cards/fronts/pngVersion/${imageName}`;
  cardImage.classList.add("card-image");
  document.querySelector(activePlayer["div"]).appendChild(cardImage);
}

function drawCard(activePlayer, isFaceDown = false) {
  console.log(
    `Drawing card for ${
      activePlayer === You ? "player" : "dealer"
    }. Cards before draw:`,
    activePlayer["cards"]
  );
  if (BJgame["cards"].length === 0) {
    console.error("Deck is empty. Cannot draw a card.");
    return; // Exit the function if the deck is empty
  }
  const randomNumber = Math.floor(Math.random() * BJgame["cards"].length);
  const currentCard = BJgame["cards"].splice(randomNumber, 1)[0];

  if (!currentCard) {
    console.error("Failed to draw a card. CurrentCard is undefined.");
    return; // Exit the function if no card was drawn
  }

  if (!isFaceDown) {
    activePlayer["cards"].push(currentCard); // Add the drawn card to the player's cards array
    showCard(activePlayer, currentCard);
    updateScore(currentCard, activePlayer); // Update Score
  } else {
    // For the dealer's face-down card
    const cardImage = document.createElement("img");
    cardImage.src = "red.png"; // Placeholder for face-down card
    cardImage.classList.add("card-image");
    document.querySelector(activePlayer["div"]).appendChild(cardImage);
  }

  hitsound.play();

  // Show Score only for face-up cards
  if (!isFaceDown) {
    showScore(activePlayer);
  }
}

function getCardSymbol(card) {
  for (const suit of Object.keys(cardSymbols)) {
    for (const symbol of cardSymbols[suit]) {
      if (card === symbol) {
        return symbol;
      }
    }
  }
  return "";
}

function showScore(activeplayer) {
  const scoreSpan = document.querySelector(activeplayer["scoreSpan"]);
  const score = activeplayer["score"] > 21 ? "BUST!" : activeplayer["score"];
  const color = activeplayer["score"] > 21 ? "yellow" : "inherit";
  scoreSpan.textContent = score;
  scoreSpan.style.color = color;
}

// Betting event listener
document.getElementById("placeBet").addEventListener("click", function () {
  let betAmount = parseInt(document.getElementById("betAmount").value);
  if (betAmount > 0 && betAmount <= BJgame.playerFunds) {
    placeBet(betAmount); // Pass the bet amount to the function
  } else {
    updateGameMessage("Invalid bet amount!", "red");
  }
});

function dealInitialCards() {
  drawCard(You);
  drawCard(You);
  checkDoubleDownEligibility();
}

function placeBet(betAmount) {
  console.log(
    `Placing bet: ${betAmount}. Player funds before bet: ${BJgame.playerFunds}`
  );

  if (betAmount > BJgame.playerFunds) {
    updateGameMessage("You cannot bet more than your current funds.", "red");
    return;
  }
  BJgame.currentBet = betAmount;
  BJgame.updateFunds(-betAmount); // Deduct the bet from funds
  document.getElementById("betAmount").disabled = true;
  document.getElementById("placeBet").disabled = true;
  // Enable game controls
  document.getElementById("hit").disabled = false;
  document.getElementById("stand").disabled = false;

  dealInitialCards(); // Deal two cards to the player after placing a bet
}

function payoutWin() {
  console.log(
    `Payout before update: Bet = ${BJgame.currentBet}, Player Funds = ${BJgame.playerFunds}`
  );
  BJgame.updateFunds(BJgame.currentBet * 2);
  console.log(`Payout after update: Player Funds = ${BJgame.playerFunds}`);
}

function checkDoubleDownEligibility() {
  if (
    You["cards"].length === 2 &&
    BJgame.playerFunds >= BJgame.currentBet * 2 &&
    !BJgame.hasPlayerHit // Only allow double down if the player hasn't hit yet
  ) {
    document.getElementById("doubleDown").disabled = false;
  } else {
    document.getElementById("doubleDown").disabled = true;
  }
}

checkDoubleDownEligibility();

function doubleDown() {
  console.log("Double down clicked. Checking conditions...");
  if (
    You["cards"].length === 2 &&
    BJgame.currentBet > 0 &&
    BJgame.playerFunds >= BJgame.currentBet
  ) {
    console.log("Double down conditions met.");
    BJgame.updateFunds(-BJgame.currentBet);
    BJgame.currentBet *= 2;
    drawCard(You);
    BJstand();
    document.getElementById("doubleDown").disabled = true;
    document.getElementById("hit").disabled = true;
    console.log("Double down executed. New bet:", BJgame.currentBet);
  } else {
    console.log("Double down conditions not met.");
    updateGameMessage("Double down is not allowed at this time.", "red");
  }
}

document.getElementById("doubleDown").addEventListener("click", doubleDown);

function updateScore(card, activePlayer) {
  const value = getCardValue(card);
  if (Array.isArray(value)) {
    // Handle Ace's value dynamically
    const bestScore = (activePlayer.score + 11 <= 21) ? 11 : 1;
    activePlayer.score += bestScore;
  } else {
    activePlayer.score += value;
  }
  showScore(activePlayer);
}

// Compute Winner Function
function findwinner() {
  let winner;
  if (
    You["score"] <= 21 &&
    (Dealer["score"] < You["score"] || Dealer["score"] > 21)
  ) {
    BJgame["wins"]++;
    winner = You;
    payoutWin(); // Player wins and receives winnings
  } else if (
    You["score"] === Dealer["score"] ||
    (You["score"] > 21 && Dealer["score"] > 21)
  ) {
    BJgame["draws"]++;
    BJgame.updateFunds(BJgame.currentBet); // Return the bet to the player in case of a draw
  } else {
    BJgame["losses"]++;
    winner = Dealer;
  }
  return winner;
}

function showresults(winner) {
  if (winner == You) {
    updateGameMessage("You Won!", "green");
    winSound.play();
    cheers.play();
    cheers.volume = 0.4;

    // If the player has won 5 games, display the coin animation
    if (BJgame["wins"] % 5 === 0) {
      const coinAnimation = document.getElementById("coin-animation");
      if (coinAnimation) {
        coinAnimation.style.display = "block"; // Make the coin animation visible
      }
    }
  } else if (winner == Dealer) {
    updateGameMessage("You Lost!", "red");
    loseSound.play();
  } else {
    updateGameMessage("You Drew!", "orange");
    drawSound.play();
  }
}

function scoreboard() {
  document.querySelector("#wins").textContent = BJgame["wins"];
  document.querySelector("#losses").textContent = BJgame["losses"];
  document.querySelector("#draws").textContent = BJgame["draws"];
}

document.querySelector("#hit").addEventListener("click", BJhit);

function BJhit() {
  if (Dealer["score"] === 0) {
    if (You["score"] < 21) {
      BJgame.hasPlayerHit = true;
      document.getElementById("doubleDown").disabled = true;
      drawCard(You);
      if (You["cards"].length > 2) {
        document.getElementById("doubleDown").disabled = true;
      }
    }
  } else {
    // If the dealer has already played, typically the player should not be allowed to hit. This could be an end-of-round scenario.
    console.log("Round over, cannot hit.");
  }
}

function resetBettingUI() {
  document.getElementById("betAmount").value = "";
  document.getElementById("betAmount").disabled = false;
  document.getElementById("placeBet").disabled = false;
  document.getElementById("hit").disabled = true;
  document.getElementById("stand").disabled = true;
}

function BJdeal() {
  if (You["score"] > 21 || Dealer["score"] > 0) {
    // Clear the cards and reset scores
    document.getElementById("your-box").innerHTML =
      '<h2>Your Hand</h2><div id="yourscore" class="score">0</div>';
    document.getElementById("dealer-box").innerHTML =
      '<h2>Dealer\'s Hand</h2><div id="dealerscore" class="score">0</div>';
    You["score"] = 0;
    Dealer["score"] = 0;
    You["cards"] = []; // Clear the player's cards array
    Dealer["cards"] = []; // Clear the dealer's cards array
    BJgame.hasPlayerHit = false; // Reset the flag when dealing a new hand
    document.querySelector("#command").textContent = "Let's Play";
    document.querySelector("#command").style.color = "black";
    // Reset betting UI for the next game
  } else {
    // Player hasn't busted and dealer hasn't played yet
    updateGameMessage("Please Press Stand Key Before Deal...", "red");
  }
}

document.querySelector("#deal").addEventListener("click", BJdeal);

function BJstand() {
  if (You["cards"].length < 2) {
    updateGameMessage("You need to have at least two cards to stand.", "red");
    return; // Exit the function if the player has less than two cards
  }
  if (You["score"] <= 21) {
    while (Dealer["score"] < 16) {
      drawCard(Dealer);
    }
  }
  // Finalize the game
  setTimeout(function () {
    showresults(findwinner());
    scoreboard();
  }, 800);
  resetBettingUI();
}

document.querySelector("#stand").addEventListener("click", BJstand);
