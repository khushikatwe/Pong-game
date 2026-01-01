// Simple Pong game
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const playerScoreEl = document.getElementById('playerScore');
  const computerScoreEl = document.getElementById('computerScore');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  // Game settings
  const PADDLE_WIDTH = 12;
  const PADDLE_HEIGHT = 110;
  const PADDLE_MARGIN = 14;
  const PLAYER_SPEED = 6;          // speed from arrow keys
  const COMPUTER_SPEED = 4.0;      // AI paddle max speed
  const BALL_RADIUS = 8;
  const BALL_SPEED_START = 5;
  const WIN_SCORE = 10;

  let running = true;
  let paused = false;

  // Game objects
  const player = {
    x: PADDLE_MARGIN,
    y: (HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
  };

  const computer = {
    x: WIDTH - PADDLE_WIDTH - PADDLE_MARGIN,
    y: (HEIGHT - PADDLE_HEIGHT) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
  };

  const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: BALL_SPEED_START,
    vy: 0,
    radius: BALL_RADIUS,
    speed: BALL_SPEED_START
  };

  let scores = { player: 0, computer: 0 };

  // Input state
  const keys = { ArrowUp: false, ArrowDown: false };
  let lastMouseY = null;

  // Initialize ball with random vertical angle
  function resetBall(favorRight = Math.random() < 0.5) {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.speed = BALL_SPEED_START;
    const angle = (Math.random() * Math.PI / 4) - (Math.PI / 8); // -22.5deg to 22.5deg
    ball.vx = (favorRight ? 1 : -1) * ball.speed * Math.cos(angle);
    ball.vy = ball.speed * Math.sin(angle);
  }

  resetBall(true);

  // Event listeners
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    lastMouseY = y;
    // center paddle on cursor
    player.y = y - player.height / 2;
    clampPlayer();
  });

  // Click to pause/resume
  canvas.addEventListener('click', () => {
    paused = !paused;
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      keys[e.code] = true;
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      keys[e.code] = false;
      e.preventDefault();
    }
  });

  function clampPlayer() {
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
  }

  function clampComputer() {
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > HEIGHT) computer.y = HEIGHT - computer.height;
  }

  // Collision detection between ball and paddle
  function paddleCollision(paddle) {
    // AABB vs circle simplified
    const closestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
    const closestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    return (dx * dx + dy * dy) <= (ball.radius * ball.radius);
  }

  // Update AI paddle
  function updateComputer() {
    // Simple AI: move toward ball's y with max speed
    const target = ball.y - computer.height / 2;
    const diff = target - computer.y;
    const move = Math.sign(diff) * Math.min(COMPUTER_SPEED, Math.abs(diff));
    computer.y += move;
    clampComputer();
  }

  // Update player with arrow keys
  function updatePlayerFromKeys() {
    if (keys.ArrowUp) {
      player.y -= PLAYER_SPEED;
    }
    if (keys.ArrowDown) {
      player.y += PLAYER_SPEED;
    }
    clampPlayer();
  }

  // Draw everything
  function draw() {
    // clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // center dashed line
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // paddles
    ctx.fillStyle = '#00d1ff';
    roundRect(ctx, player.x, player.y, player.width, player.height, 4);
    ctx.fill();

    ctx.fillStyle = '#ffb86b';
    roundRect(ctx, computer.x, computer.y, computer.width, computer.height, 4);
    ctx.fill();

    // ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // subtle score center display (optional)
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Main update
  function update() {
    if (!running || paused) return;

    // Player input
    updatePlayerFromKeys();
    // mouse option already updates player.y in mousemove

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom collision
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
    } else if (ball.y + ball.radius >= HEIGHT) {
      ball.y = HEIGHT - ball.radius;
      ball.vy = -ball.vy;
    }

    // Paddle collisions
    if (ball.vx < 0) {
      // moving left, check player
      if (paddleCollision(player)) {
        // place ball outside paddle to avoid sticking
        ball.x = player.x + player.width + ball.radius;
        reflectFromPaddle(player);
      }
    } else {
      // moving right, check computer
      if (paddleCollision(computer)) {
        ball.x = computer.x - ball.radius;
        reflectFromPaddle(computer);
      }
    }

    // Score detection
    if (ball.x - ball.radius <= 0) {
      // computer scores
      scores.computer += 1;
      computerScoreEl.textContent = scores.computer;
      if (scores.computer >= WIN_SCORE) {
        endGame('Computer wins!');
        return;
      }
      serveAfterScore(true); // serve to right (computer)
    } else if (ball.x + ball.radius >= WIDTH) {
      // player scores
      scores.player += 1;
      playerScoreEl.textContent = scores.player;
      if (scores.player >= WIN_SCORE) {
        endGame('You win!');
        return;
      }
      serveAfterScore(false); // serve to left (player)
    }

    // Update AI
    updateComputer();
  }

  function reflectFromPaddle(paddle) {
    // Calculate hit position relative to paddle center (-1 .. 1)
    const relativeIntersectY = (paddle.y + paddle.height / 2) - ball.y;
    const normalized = relativeIntersectY / (paddle.height / 2);
    // Max bounce angle 75 degrees
    const maxBounce = (75 * Math.PI) / 180;
    const bounceAngle = normalized * maxBounce;
    const direction = (paddle === player) ? 1 : -1; // ball should go right after hitting player, left after computer

    // increase speed slightly each hit
    ball.speed = Math.min(ball.speed + 0.4, 12);
    ball.vx = direction * ball.speed * Math.cos(bounceAngle);
    ball.vy = -ball.speed * Math.sin(bounceAngle);
  }

  let serveTimeout = null;
  function serveAfterScore(toRight) {
    paused = true;
    // Reset ball in center and give it a small delay before serving
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.vx = 0;
    ball.vy = 0;
    if (serveTimeout) clearTimeout(serveTimeout);
    serveTimeout = setTimeout(() => {
      resetBall(toRight);
      paused = false;
    }, 800);
  }

  function endGame(message) {
    paused = true;
    running = false;
    // Display overlay text
    setTimeout(() => {
      alert(message + '\n\nRefresh to play again.');
    }, 100);
  }

  // Game loop
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Start the loop
  requestAnimationFrame(loop);

  // Expose some convenience on window (optional)
  window.pong = { resetBall, scores };

})();
