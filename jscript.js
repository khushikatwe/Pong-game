const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");

let gameRunning = false;

// paddles
const paddleH = 90, paddleW = 12;
let playerY = 200;
let aiY = 200;
const paddleSpeed = 6;

// ball
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballVX = 5;
let ballVY = 4;
const ballR = 8;

// score
let playerScore = 0;
let aiScore = 0;

// obstacle
let obstacle = {
  x: canvas.width / 2 - 20,
  y: 120,
  w: 40,
  h: 260,
  vy: 2
};

// keyboard
const keys = {};
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.code === "Space") {
    gameRunning = !gameRunning;
    overlay.style.display = gameRunning ? "none" : "block";
  }
});
document.addEventListener("keyup", e => keys[e.key] = false);

// reset
function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballVX *= -1;
}

// draw helpers
function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

function ball() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "white";
  ctx.fill();
  ctx.shadowBlur = 0;
}

function score() {
  ctx.fillStyle = "cyan";
  ctx.font = "28px monospace";
  ctx.fillText(playerScore, canvas.width / 4, 40);
  ctx.fillText(aiScore, canvas.width * 3 / 4, 40);
}

// update
function update() {
  if (!gameRunning) return;

  // PLAYER
  if (keys["w"] && playerY > 0) playerY -= paddleSpeed;
  if (keys["s"] && playerY < canvas.height - paddleH) playerY += paddleSpeed;

  // AI (simple follow logic)
  const aiCenter = aiY + paddleH / 2;
  if (aiCenter < ballY - 10) aiY += 4;
  else if (aiCenter > ballY + 10) aiY -= 4;

  // ball
  ballX += ballVX;
  ballY += ballVY;

  if (ballY < 0 || ballY > canvas.height) ballVY *= -1;

  // collisions
  if (
    ballX < paddleW + 10 &&
    ballY > playerY &&
    ballY < playerY + paddleH
  ) ballVX *= -1.1;

  if (
    ballX > canvas.width - paddleW - 10 &&
    ballY > aiY &&
    ballY < aiY + paddleH
  ) ballVX *= -1.05;

  // obstacle move
  obstacle.y += obstacle.vy;
  if (obstacle.y < 0 || obstacle.y + obstacle.h > canvas.height)
    obstacle.vy *= -1;

  // obstacle collision
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

// render
function render() {
  rect(0, 0, canvas.width, canvas.height, "#050510");

  rect(10, playerY, paddleW, paddleH, "cyan");
  rect(canvas.width - 22, aiY, paddleW, paddleH, "hotpink");

  rect(obstacle.x, obstacle.y, obstacle.w, obstacle.h, "#444");

  ball();
  score();
}

// loop
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
loop();
