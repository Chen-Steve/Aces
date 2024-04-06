let BJgame = {
    'you': {'scoreSpan': '#yourscore', 'div': '#your-box', 'score': 0, 'cards': []},
    'dealer': {'scoreSpan': '#dealerscore', 'div': '#dealer-box', 'score': 0, 'cards': []},
    
    'cards': ['2C','3C','4C','5C','6C','7C','8C','9C','10C','KC','QC','JC','AC','2D','3D','4D','5D','6D','7D','8D','9D','10D','KD','QD','JD','AD','2H','3H','4H','5H','6H','7H','8H','9H','10H','KH','QH','JH','AH','2S','3S','4S','5S','6S','7S','8S','9S','10S','KS','QS','JS','AS'],
    
    'cardsmap': {'2C':2,'3C':3,'4C':4,'5C':5,'6C':6,'7C':7,'8C':8,'9C':9,'10C':10,'KC':10,'QC':10,'JC':10,'AC':[1, 11],'2D':2,'3D':3,'4D':4,'5D':5,'6D':6,'7D':7,'8D':8,'9D':9,'10D':10,'KD':10,'QD':10,'JD':10,'AD':[1, 11],'2H':2,'3H':3,'4H':4,'5H':5,'6H':6,'7H':7,'8H':8,'9H':9,'10H':10,'KH':10,'QH':10,'JH':10,'AH':[1, 11],'2S':2,'3S':3,'4S':4,'5S':5,'6S':6,'7S':7,'8S':8,'9S':9,'10S':10,'KS':10,'QS':10,'JS':10,'AS':[1, 11]},
       
    'playerFunds': 1000, 
    'currentBet': 0,

    // Update player funds
    updateFunds: function(amount) {
        this.playerFunds += amount;
        // Update UI with new funds
        document.getElementById('funds').textContent = this.playerFunds;
    },

    'wins':0,
    'losses':0,
    'draws':0
};

const cardSymbols = {
    'hearts': ['2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥'],
    'diamonds': ['2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦'],
    'clubs': ['2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣'],
    'spades': ['2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠', 'A♠'],
};

function updateGameMessage(message, color = 'white') {
    const messageEl = document.getElementById('game-message');
    messageEl.textContent = message;
    messageEl.style.color = color;
}

const winSound = new Audio('sound_effects/cha-ching.mp3'); 
const cheers = new Audio('sound_effects/cheer.mp3');
const loseSound = new Audio('sound_effects/aww.mp3');
const drawSound = new Audio('sound_effects/aww.mp3');
const hitsound = new Audio('sound_effects/swish.mp3');

function displayCard(containerId, cardSymbol) {
    const container = document.getElementById(containerId);
    const cardText = document.createElement('div');
    cardText.textContent = cardSymbol;
    container.appendChild(cardText);
}

function displayHands() {
    // Clear previous card displays
    document.getElementById('your-box').innerHTML = '<h2>Your Hand</h2>';
    document.getElementById('dealer-box').innerHTML = '<h2>Dealer\'s Hand</h2>';

    // Display player's cards
    for (const card of You['cards']) {
        displayCard('your-box', card);
    }

    // Display dealer's first card (hide the second card)
    displayCard('dealer-box', You['cards'][0]);
}

// Define shuffleDeck function
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // ES6 swap
    }
}

// Define replenishDeck function
function replenishDeck() {
    if (BJgame['cards'].length < 10) { // Threshold, e.g., 10 cards
        BJgame['cards'] = ['2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC', 'AC',
                          '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD', 'AD',
                          '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH', 'AH',
                          '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS', 'AS'];
        shuffleDeck(BJgame['cards']);
    }
}
// Function to initialize the deck with all cards
function initializeDeck() {
    let deck = [];
    for (const suit of Object.keys(cardSymbols)) {
        for (let rank = 2; rank <= 14; rank++) {
            deck.push({ rank, suit });
        }
    }
    BJgame.currentBet = 0;
    document.getElementById('hit').disabled = true;
    document.getElementById('stand').disabled = true;
}

const You = BJgame['you'];
const Dealer = BJgame['dealer'];

function showCard(activePlayer, cardCode) {
    let cardNumber = cardCode.slice(0, -1); // Extract card number
    let cardSuitChar = cardCode.slice(-1); // Extract suit character
    let suitName = '';

    switch(cardSuitChar) {
        case 'C': suitName = 'clubs'; break;
        case 'D': suitName = 'diamonds'; break;
        case 'H': suitName = 'hearts'; break;
        case 'S': suitName = 'spades'; break;
    }

    // Adjusting the cardNumber for face cards and aces
    if (['J', 'Q', 'K', 'A'].includes(cardNumber)) {
        cardNumber = cardNumber === 'J' ? 'jack' :
                     cardNumber === 'Q' ? 'queen' :
                     cardNumber === 'K' ? 'king' : 'ace';
    }

    let imageName = `${suitName}_${cardNumber.toLowerCase()}.png`;

    const cardImage = document.createElement('img');
    cardImage.src = `svg_playing_cards/fronts/pngVersion/${imageName}`;
    cardImage.classList.add('card-image');
    document.querySelector(activePlayer['div']).appendChild(cardImage);
}

function drawCard(activePlayer, isFaceDown = false) {
    console.log(`Drawing card for ${activePlayer === You ? "player" : "dealer"}. Cards before draw:`, activePlayer['cards']);
    if (BJgame['cards'].length === 0) {
        console.error("Deck is empty. Cannot draw a card.");
        return; // Exit the function if the deck is empty
    }
    const randomNumber = Math.floor(Math.random() * BJgame['cards'].length);
    const currentCard = BJgame['cards'].splice(randomNumber, 1)[0];

    if (!currentCard) {
        console.error("Failed to draw a card. CurrentCard is undefined.");
        return; // Exit the function if no card was drawn
    }

    if (!isFaceDown) {
        activePlayer['cards'].push(currentCard); // Add the drawn card to the player's cards array
        showCard(activePlayer, currentCard);
        updateScore(currentCard, activePlayer); // Update Score
    } else {
        // For the dealer's face-down card
        const cardImage = document.createElement('img');
        cardImage.src = 'red.png'; // Placeholder for face-down card
        cardImage.classList.add('card-image');
        document.querySelector(activePlayer['div']).appendChild(cardImage);
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
    return '';
}

function showScore(activeplayer) {
    if (activeplayer['score'] > 21) {
        document.querySelector(activeplayer['scoreSpan']).textContent = 'BUST!';
        document.querySelector(activeplayer['scoreSpan']).style.color = 'yellow';
    } else {
        document.querySelector(activeplayer['scoreSpan']).textContent = activeplayer['score'];
    }
}

// Betting event listener
document.getElementById('placeBet').addEventListener('click', function() {
    let betAmount = parseInt(document.getElementById('betAmount').value);
    if (betAmount > 0 && betAmount <= BJgame.playerFunds) {
        placeBet(betAmount); // Pass the bet amount to the function
    } else {
        updateGameMessage("Invalid bet amount!", 'red');
    }
});

function dealInitialCards() {
    // Draw two cards for the player
    drawCard(You);
    drawCard(You);
    // Adjust the UI as needed (e.g., disable the "Double Down" button if the player's initial two cards don't meet the criteria)
    checkDoubleDownEligibility();
}

function placeBet(betAmount) {
    console.log(`Placing bet: ${betAmount}. Player funds before bet: ${BJgame.playerFunds}`);
    
    if (betAmount > BJgame.playerFunds) {
        updateGameMessage("You cannot bet more than your current funds.", 'red');
        return;
    }
    BJgame.currentBet = betAmount;
    BJgame.updateFunds(-betAmount); // Deduct the bet from funds
    document.getElementById('betAmount').disabled = true;
    document.getElementById('placeBet').disabled = true;
    // Enable game controls
    document.getElementById('hit').disabled = false;
    document.getElementById('stand').disabled = false;

    dealInitialCards(); // Deal two cards to the player after placing a bet
}

function payoutWin() {
    console.log(`Payout before update: Bet = ${BJgame.currentBet}, Player Funds = ${BJgame.playerFunds}`);
    BJgame.updateFunds(BJgame.currentBet * 2);
    console.log(`Payout after update: Player Funds = ${BJgame.playerFunds}`);
}

function handleLoss() {
    BJgame.updateFunds(-BJgame.currentBet);
}

function checkDoubleDownEligibility() {
    console.log("Checking double down eligibility. Player's cards:", You['cards'].length, "Player's funds:", BJgame.playerFunds, "Current Bet:", BJgame.currentBet);
    if (You['cards'].length === 2 && BJgame.playerFunds >= BJgame.currentBet * 2) {
        document.getElementById('doubleDown').disabled = false;
        console.log("Double down enabled.");
    } else {
        document.getElementById('doubleDown').disabled = true;
        console.log("Double down disabled.");
    }
}

checkDoubleDownEligibility();

function doubleDown() {
    console.log("Double down clicked. Checking conditions...");
    if (You['cards'].length === 2 && BJgame.currentBet > 0 && BJgame.playerFunds >= BJgame.currentBet) {
        console.log("Double down conditions met.");
        BJgame.updateFunds(-BJgame.currentBet);
        BJgame.currentBet *= 2;
        drawCard(You);
        BJstand();
        document.getElementById('doubleDown').disabled = true;
        document.getElementById('hit').disabled = true;
        console.log("Double down executed. New bet:", BJgame.currentBet);
    } else {
        console.log("Double down conditions not met.");
        updateGameMessage("Double down is not allowed at this time.", 'red');
    }
}

document.getElementById('doubleDown').addEventListener('click', doubleDown);

function updateScore(currentCard, activePlayer) {
    const rank = currentCard.slice(0, -1); // Extract the rank from the card symbol
    if (rank === 'A') {
        // If adding 11 keeps the score under or equal to 21, use 11, otherwise use 1
        if (activePlayer['score'] + 11 <= 21) {
            activePlayer['score'] += 11;
        } else {
            activePlayer['score'] += 1;
        }
    } else if (['K', 'Q', 'J'].includes(rank)) {
        // Face cards (King, Queen, Jack) are worth 10
        activePlayer['score'] += 10;
    } else {
        // Other cards are worth their face value
        activePlayer['score'] += parseInt(rank);
    }
    showScore(activePlayer);
}

// Compute Winner Function
function findwinner() {
    let winner;
    if (You['score'] <= 21 && (Dealer['score'] < You['score'] || Dealer['score'] > 21)) {
        BJgame['wins']++;
        winner = You;
        payoutWin(); // Player wins and receives winnings
    } 
    else if (You['score'] === Dealer['score'] || (You['score'] > 21 && Dealer['score'] > 21)) {
        BJgame['draws']++;
        BJgame.updateFunds(BJgame.currentBet); // Return the bet to the player in case of a draw
    } 
    else {
        BJgame['losses']++;
        winner = Dealer;
        handleLoss(); // Player loses the bet
    }
    return winner;
}

function showresults(winner){
    if(winner == You){
        updateGameMessage('You Won!', 'green');
        winSound.play();
        cheers.play();
        cheers.volume = 0.4;

        // If the player has won 5 games, display the coin animation
        if (BJgame['wins'] % 5 === 0) {
            const coinAnimation = document.getElementById('coin-animation');
            if (coinAnimation) {
                coinAnimation.style.display = 'block'; // Make the coin animation visible
            }
        }
    }
    else if(winner == Dealer){
        updateGameMessage("You Lost!", 'red');
        loseSound.play();
    }
    else{
        updateGameMessage('You Drew!', 'orange');
        drawSound.play();
    }

}

function scoreboard(){
    document.querySelector('#wins').textContent = BJgame['wins'];
    document.querySelector('#losses').textContent = BJgame['losses'];
    document.querySelector('#draws').textContent = BJgame['draws'];
}

document.querySelector('#hit').addEventListener('click', BJhit);

function BJhit() {
    if (Dealer['score'] === 0) {
        if (You['score'] < 21) {
            drawCard(You);
            // Disable "Double Down" only if more than two cards are now in the player's hand
            if (You['cards'].length > 2) {
                document.getElementById('doubleDown').disabled = true;
            }
        }
    } else {
        // If the dealer has already played, typically the player should not be allowed to hit. This could be an end-of-round scenario.
        console.log("Round over, cannot hit.");
    }
}

function resetBettingUI() {
    document.getElementById('betAmount').value = '';
    document.getElementById('betAmount').disabled = false;
    document.getElementById('placeBet').disabled = false;
    document.getElementById('hit').disabled = true;
    document.getElementById('stand').disabled = true;
}

function BJdeal() {
    if (You['score'] > 21 || Dealer['score'] > 0) {
        // Clear the cards and reset scores
        document.getElementById('your-box').innerHTML = '<h2>Your Hand</h2><div id="yourscore" class="score">0</div>';
        document.getElementById('dealer-box').innerHTML = '<h2>Dealer\'s Hand</h2><div id="dealerscore" class="score">0</div>';
        You['score'] = 0;
        Dealer['score'] = 0;
        You['cards'] = []; // Clear the player's cards array
        Dealer['cards'] = []; // Clear the dealer's cards array
        // Reset command/message text
        document.querySelector('#command').textContent = "Let's Play";
        document.querySelector('#command').style.color = 'black';
        // Reset betting UI for the next game
    } else {
        // Player hasn't busted and dealer hasn't played yet
        updateGameMessage('Please Press Stand Key Before Deal...', 'red');
    }
}

document.querySelector('#deal').addEventListener('click', BJdeal);

function BJstand() {
    if (You['cards'].length < 2) {
        updateGameMessage("You need to have at least two cards to stand.", 'red');
        return; // Exit the function if the player has less than two cards
    }

    if (You['score'] <= 21) {
        while (Dealer['score'] < 16) {
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

document.querySelector('#stand').addEventListener('click', BJstand);