const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");

let running = false;

// sizes
const PADDLE_H = 90;
const PADDLE_W = 12;
const BALL_R = 8;

// player & AI
let playerY = canvas.height / 2 - PADDLE_H / 2;
let aiY = canvas.height / 2 - PADDLE_H / 2;

// ball
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballVX = 5;
let ballVY = 4;

// scores
let playerScore = 0;
let aiScore = 0;

// obstacle
let obstacle = {
  x: canvas.width / 2 - 15,
  y: 150,
  w: 30,
  h: 200,
  vy: 2
};

// keys
let up = false, down = false;

document.addEventListener("keydown", e => {
  if (e.key === "w") up = true;
  if (e.key === "s") down = true;

  if (e.code === "Space") {
    running = !running;
    overlay.style.display = running ? "none" : "block";
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "w") up = false;
  if (e.key === "s") down = false;
});

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballVX *= -1;
}

function update() {
  if (!running) return;

  // PLAYER (LEFT)
  if (up && playerY > 0) playerY -= 6;
  if (down && playerY < canvas.height - PADDLE_H) playerY += 6;

  // AI (RIGHT) — intentionally dumb
  if (Math.random() < 0.5) {
    const aiCenter = aiY + PADDLE_H / 2;
    if (aiCenter < ballY - 30) aiY += 3;
    else if (aiCenter > ballY + 30) aiY -= 3;
  }

  // ball move
  ballX += ballVX;
  ballY += ballVY;

  if (ballY < 0 || ballY > canvas.height) ballVY *= -1;

  // player collision
  if (
    ballX < 22 &&
    ballY > playerY &&
    ballY < playerY + PADDLE_H
  ) ballVX *= -1.1;

  // AI collision
  if (
    ballX > canvas.width - 22 &&
    ballY > aiY &&
    ballY < aiY + PADDLE_H
  ) ballVX *= -1.05;

  // obstacle
  obstacle.y += obstacle.vy;
  if (obstacle.y < 0 || obstacle.y + obstacle.h > canvas.height)
    obstacle.vy *= -1;

  if (
    ballX > obstacle.x &&
    ballX < obstacle.x + obstacle.w &&
    ballY > obstacle.y &&
    ballY < obstacle.y + obstacle.h
  ) ballVX *= -1;

  // scoring
  if (ballX < 0) {
    aiScore++;
    resetBall();
  }
  if (ballX > canvas.width) {
    playerScore++;
    resetBall();
  }
}

function draw() {
  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // paddles
  ctx.fillStyle = "cyan";
  ctx.fillRect(10, playerY, PADDLE_W, PADDLE_H);

  ctx.fillStyle = "hotpink";
  ctx.fillRect(canvas.width - 22, aiY, PADDLE_W, PADDLE_H);

  // obstacle
  ctx.fillStyle = "#555";
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);

  // ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "white";
  ctx.fill();
  ctx.shadowBlur = 0;

  // score
  ctx.fillStyle = "cyan";
  ctx.font = "28px monospace";
  ctx.fillText(playerScore, canvas.width / 4, 40);
  ctx.fillText(aiScore, canvas.width * 3 / 4, 40);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
