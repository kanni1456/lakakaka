// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

// Images
const bgImg = new Image();
bgImg.src = "bg.png";

const playerImg = new Image();
playerImg.src = "player.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

// Sounds
const jumpSound = new Audio("jump.wav");
const hitSound = new Audio("hit.wav");

// UI Elements
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const overlay = document.getElementById("videoOverlay");
const video = document.getElementById("gameOverVideo");

// Game variables
let gameStarted = false;
let gameOver = false;
let score = 0;

let gravity = 0.4;        // easier game
let jumpPower = -8;
let pipeGap = 180;        // bigger gap = easier
let pipeWidth = 60;
let pipeSpeed = 2;

let pipes = [];

let player = {
    x: 80,
    y: 200,
    width: 40,
    height: 40,
    velocity: 0
};

// Start button
startBtn.onclick = () => {
    startScreen.style.display = "none";
    gameStarted = true;
};

// Restart button
restartBtn.onclick = () => {
    video.pause();
    video.currentTime = 0;
    overlay.style.display = "none";

    resetGame();
    gameStarted = true;
    requestAnimationFrame(gameLoop);
};

// Controls (PC + Mobile)
function jump() {
    if (!gameStarted || gameOver) return;

    player.velocity = jumpPower;
    jumpSound.currentTime = 0;
    jumpSound.play();
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});

canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", jump);

// Reset game
function resetGame() {
    gameOver = false;
    score = 0;
    pipes = [];
    player.y = 200;
    player.velocity = 0;
}

// Create pipes
function createPipe() {
    let topHeight = Math.random() * 250 + 50;

    pipes.push({
        x: canvas.width,
        topHeight: topHeight
    });
}

// End game
function endGame() {
    if (gameOver) return;
    gameOver = true;

    hitSound.currentTime = 0;
    hitSound.play();

    overlay.style.display = "flex";

    video.currentTime = 0;

    setTimeout(() => {
        video.play().catch(err => {
            console.log("Video blocked:", err);
        });
    }, 100);
}

// Collision detection
function checkCollision(pipe) {
    if (
        player.x < pipe.x + pipeWidth &&
        player.x + player.width > pipe.x &&
        (
            player.y < pipe.topHeight ||
            player.y + player.height > pipe.topHeight + pipeGap
        )
    ) {
        return true;
    }
    return false;
}

// Game loop
function gameLoop() {
    if (!gameStarted || gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // Player physics
    player.velocity += gravity;
    player.y += player.velocity;

    // Ground collision
    if (player.y + player.height >= canvas.height || player.y <= 0) {
        endGame();
    }

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Pipes
    for (let i = 0; i < pipes.length; i++) {
        let pipe = pipes[i];
        pipe.x -= pipeSpeed;

        // Top pipe
        ctx.drawImage(pipeImg, pipe.x, 0, pipeWidth, pipe.topHeight);

        // Bottom pipe
        ctx.drawImage(
            pipeImg,
            pipe.x,
            pipe.topHeight + pipeGap,
            pipeWidth,
            canvas.height - pipe.topHeight - pipeGap
        );

        // Collision
        if (checkCollision(pipe)) {
            endGame();
        }

        // Score
        if (pipe.x + pipeWidth === player.x) {
            score++;
        }
    }

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    // Generate new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < 250) {
        createPipe();
    }

    // Score display
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);

    requestAnimationFrame(gameLoop);
}

// Start animation loop
requestAnimationFrame(gameLoop);
