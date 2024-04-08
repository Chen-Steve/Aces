document.addEventListener("DOMContentLoaded", () => {
  // Initialize all on DOMContentLoaded to avoid multiple listeners
  initDieAnimation();
  createCoinAnimation();
  initBackgroundCards();
});

function initDieAnimation() {
  const dieAnimationDiv = document.createElement("div");
  dieAnimationDiv.id = "die-animation";
  document.body.appendChild(dieAnimationDiv);
}

function createCoinAnimation() {
  let coinAnimation = document.getElementById("coin-animation");
  if (!coinAnimation) {
    coinAnimation = document.createElement("div");
    coinAnimation.id = "coin-animation";
    document.body.appendChild(coinAnimation);
  }
  coinAnimation.style.cssText = `
    display: none; /* Hide it by default */
    width: 16px;
    height: 16px;
    background-image: 'url("../images/coin.png")';
    background-repeat: no-repeat;
    animation: spinCoin 0.5s steps(10) infinite;
  `;
}

function initBackgroundCards() {
  const cards = document.querySelectorAll(".floating-cards .card");
  cards.forEach((card) => {
    // Random rotation and duration for spinning
    const rotation = Math.random() * 720 - 360;
    const rotationDuration = Math.random() * 20 + 10;

    gsap.to(card, {
      duration: rotationDuration,
      rotation: rotation,
      repeat: -1,
      ease: "linear",
      force3D: true,
    });

    // Randomized movement parameters
    const xMove = (Math.random() * window.innerWidth) / 4;
    const yMove = (Math.random() * window.innerHeight) / 4;
    const moveDuration = Math.random() * 20 + 10;

    gsap.to(card, {
      duration: moveDuration,
      x: xMove,
      y: yMove,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      force3D: true,
    });

    Draggable.create(card, {
      type: "x,y",
      edgeResistance: 0.65,
      bounds: "body",
      throwProps: true,
      onPress: function () { this.target.style.zIndex = 1000; },
      onRelease: function () { this.target.style.zIndex = ""; },
    });
  });
}