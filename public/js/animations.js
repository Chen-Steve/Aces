document.addEventListener("DOMContentLoaded", () => {
  createCoinAnimation();

  const cards = document.querySelectorAll(".floating-cards .card");

  cards.forEach(card => {
    const rotation = Math.random() * 720 - 360; // Random rotation
    const rotationDuration = Math.random() * 20 + 10; // Duration between 10 and 30 seconds

    gsap.to(card, {
      duration: rotationDuration,
      rotation: rotation,
      repeat: -1,
      ease: "linear",
    });

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
    });

    Draggable.create(card, {
      type: "x,y",
      edgeResistance: 0.65,
      bounds: window,
      throwProps: true,
      onPress: function () {
        this.target.style.zIndex = 1000;
      },
      onRelease: function () {
        this.target.style.zIndex = "";
      },
    });
  });
});

function createCoinAnimation() {
  const coinAnimation =
    document.getElementById("coin-animation") || document.createElement("div");
  coinAnimation.id = "coin-animation";
  coinAnimation.style.display = "none";
  document.body.appendChild(coinAnimation);

  coinAnimation.style.width = "16px";
  coinAnimation.style.height = "16px";
  coinAnimation.style.backgroundImage = 'url("../images/coin.png")';
  coinAnimation.style.backgroundRepeat = "no-repeat";
  coinAnimation.style.animation = "spinCoin 0.5s steps(10) infinite";
}