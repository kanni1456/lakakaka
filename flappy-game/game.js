const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// GAME SETTINGS (Easy Mode)
let gravity = 0.4;
let jumpForce = -8;
let velocity = 0;
let pipeGap = 230; // easier
let pipeWidth = 70;
let pipeSpeed = 2;
let gameOver = false;
let score = 0;

// IMAGES
const birdImg = new Image();
birdImg.src = "player.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

const bgImg = new Image();
bgImg.src = "bg.png";

// SOUNDS
const jumpSound = new Audio("jump.wav");
const hitSound = new Audio("hit.wav");

// BIRD
let bird = {
    x: 80,
    y: canvas.height / 2,
    width: 50,
    height: 40
};

// PIPES
let pipes = [];

function createPipe() {
    let topHeight = Math.random() * (canvas.height / 2);
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - topHeight - pipeGap
    });
}

setInterval(createPipe, 1800);

function drawBackground() {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.drawImage(pipeImg, pipe.x, 0, pipeWidth, pipe.top);

        // Bottom pipe
        ctx.drawImage(
            pipeImg,
            pipe.x,
            canvas.height - pipe.bottom,
            pipeWidth,
            pipe.bottom
        );
    });
}

function update() {
    if (gameOver) return;

    velocity += gravity;
    bird.y += velocity;

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        // Collision check
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top ||
            bird.y + bird.height > canvas.height - pipe.bottom)
        ) {
            endGame();
        }

        // Score
        if (pipe.x + pipeWidth === bird.x) {
            score++;
        }
    });

    // Ground collision
    if (bird.y + bird.height >= canvas.height) {
        endGame();
    }
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 20, 50);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawBird();
    drawPipes();
    drawScore();
    update();

    requestAnimationFrame(gameLoop);
}

function flap() {
    if (gameOver) return;
    velocity = jumpForce;
    jumpSound.currentTime = 0;
    jumpSound.play();
}

function endGame() {
    if (gameOver) return;
    gameOver = true;

    hitSound.play();

    const overlay = document.getElementById("videoOverlay");
    const video = document.getElementById("gameOverVideo");

    overlay.style.display = "flex";
    video.play();
}

// CONTROLS
document.addEventListener("keydown", e => {
    if (e.code === "Space") flap();
});

document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

gameLoop();