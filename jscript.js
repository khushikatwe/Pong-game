const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");

let gameRunning = false;

// paddles
const paddleH = 90, paddleW = 12;
let leftY = 200, rightY = 200;
const paddleSpeed = 6;

// ball
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballVX = 5;
let ballVY = 4;
const ballR = 8;

// scores
let leftScore = 0;
let rightScore = 0;

// obstacle
let obstacle = {
  x: canvas.width / 2 - 20,
  y: 150,
  w: 40,
  h: 200,
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

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballVX *= -1;
}

// draw
function drawRect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "white";
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawScore() {
  ctx.fillStyle = "cyan";
  ctx.font = "28px monospace";
  ctx.fillText(leftScore, canvas.width / 4, 40);
  ctx.fillText(rightScore, canvas.width * 3 / 4, 40);
}

// update
function update() {
  if (!gameRunning) return;

  // paddles
  if (keys["w"] && leftY > 0) leftY -= paddleSpeed;
  if (keys["s"] && leftY < canvas.height - paddleH) leftY += paddleSpeed;
  if (keys["ArrowUp"] && rightY > 0) rightY -= paddleSpeed;
  if (keys["ArrowDown"] && rightY < canvas.height - paddleH) rightY += paddleSpeed;

  // ball move
  ballX += ballVX;
  ballY += ballVY;

  if (ballY < 0 || ballY > canvas.height) ballVY *= -1;

  // paddle collision
  if (
    ballX < paddleW + 10 &&
    ballY > leftY &&
    ballY < leftY + paddleH
  ) ballVX *= -1.1;

  if (
    ballX > canvas.width - paddleW - 10 &&
    ballY > rightY &&
    ballY < rightY + paddleH
  ) ballVX *= -1.1;

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
    rightScore++;
    resetBall();
  }
  if (ballX > canvas.width) {
    leftScore++;
    resetBall();
  }
}

// render
function render() {
  drawRect(0, 0, canvas.width, canvas.height, "#050510");

  drawRect(10, leftY, paddleW, paddleH, "cyan");
  drawRect(canvas.width - 22, rightY, paddleW, paddleH, "hotpink");

  drawRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h, "#444");

  drawBall();
  drawScore();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

loop();
