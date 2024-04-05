document.addEventListener('DOMContentLoaded', () => {
    const dieAnimationDiv = document.createElement('div');
    dieAnimationDiv.id = 'die-animation';
    document.body.appendChild(dieAnimationDiv);
});

function createCoinAnimation() {
    const coinAnimation = document.getElementById('coin-animation') || document.createElement('div');
    coinAnimation.id = 'coin-animation';
    coinAnimation.style.display = 'none'; // Hide it by default
    document.body.appendChild(coinAnimation);
    
    // Add the coin's animation CSS properties
    coinAnimation.style.width = '16px';
    coinAnimation.style.height = '16px';
    coinAnimation.style.backgroundImage = 'url("../images/coin.png")'; 
    coinAnimation.style.backgroundRepeat = 'no-repeat';
    coinAnimation.style.animation = 'spinCoin 0.5s steps(10) infinite';
}

document.addEventListener('DOMContentLoaded', createCoinAnimation);

//Background cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.floating-cards .card');

    cards.forEach((card, index) => {
        const cards = document.querySelectorAll('.floating-cards .card');
        // Random rotation and duration for spinning
        const rotation = Math.random() * 720 - 360; // Random rotation between -360 and 360 degrees
        const rotationDuration = Math.random() * 20 + 10; // Duration between 10 and 30 seconds

        // GSAP rotation animation
        gsap.to(card, {
            duration: rotationDuration,
            rotation: rotation,
            repeat: -1,
            ease: "linear"
        });

        // Randomized movement parameters
        const xMove = Math.random() * window.innerWidth / 4;
        const yMove = Math.random() * window.innerHeight / 4;
        const moveDuration = Math.random() * 20 + 10;

        // GSAP movement animation
        gsap.to(card, {
            duration: moveDuration,
            x: xMove,
            y: yMove,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
        Draggable.create(card, {
            type: "x,y", // Allow dragging on both x and y axes
            edgeResistance: 0.65, // Control the bounds resistance
            bounds: window, // Set the bounds to the window
            throwProps: true, // Allow flicking the cards

            // Event handlers for dragging
            onPress: function() {
                this.target.style.zIndex = 1000; // Bring to front
            },
            onRelease: function() {
                this.target.style.zIndex = ''; // Reset z-index
            }
        });
    });
});
