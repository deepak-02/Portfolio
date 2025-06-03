class SnakeGame {
    constructor(containerId) {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.canvas.id = 'snakeCanvas';
        this.canvas.style.border = '3px solid #333';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.display = 'block';
        this.canvas.style.background = '#0a192f';
        this.canvas.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';

        // Get the container and append the canvas
        this.container = document.getElementById(containerId);
        if (this.container) {
            this.container.style.position = 'relative';
            this.container.appendChild(this.canvas);
            this.setupGameUI();
        } else {
            console.error('Container element not found!');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.gridSize = 20;
        this.tileSize = this.canvas.width / this.gridSize;
        this.gameSpeed = 150; // Initial speed in milliseconds
        this.speedIncrement = 2; // How much to increase speed by
        this.minSpeed = 50; // Fastest possible speed
        
        // Game state
        this.gameOver = false;
        this.score = 0;
        this.gameStarted = false;
        this.isPaused = false;
        
        // Snake properties
        this.snake = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        
        // Food properties
        this.food = null;
        this.specialFood = null;
        this.specialFoodTimer = null;
        this.specialFoodDuration = 5000; // 5 seconds
        
        // Effects
        this.particles = [];
        this.glowIntensity = 0;
        this.glowIncreasing = true;
        
        // Initialize game
        this.init();
    }

    setupGameUI() {
        // Create start screen
        this.startScreen = document.createElement('div');
        this.startScreen.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 25, 47, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10;
        `;

        const startTitle = document.createElement('h3');
        startTitle.textContent = 'Snake';
        startTitle.style.cssText = `
            color: #64ffda;
            font-size: 28px;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        const startInstructions = document.createElement('div');
        startInstructions.style.cssText = `
            color: #8892b0;
            text-align: center;
            margin-bottom: 30px;
            line-height: 1.6;
        `;
        startInstructions.innerHTML = `
            <p>Use Arrow Keys to control the snake</p>
            <p>Collect food to grow and score points</p>
            <p>Special food appears occasionally for bonus points!</p>
        `;

        const startButton = document.createElement('button');
        startButton.textContent = 'Start Game';
        startButton.style.cssText = `
            padding: 12px 30px;
            font-size: 18px;
            color: white;
            background: linear-gradient(90deg, #64ffda, #00b4d8);
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        startButton.addEventListener('mouseover', () => {
            startButton.style.transform = 'translateY(-2px)';
            startButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });
        startButton.addEventListener('mouseout', () => {
            startButton.style.transform = 'translateY(0)';
            startButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        });
        startButton.addEventListener('click', () => this.startGame());

        this.startScreen.appendChild(startTitle);
        this.startScreen.appendChild(startInstructions);
        this.startScreen.appendChild(startButton);

        // Create game over overlay
        this.gameOverOverlay = document.createElement('div');
        this.gameOverOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10;
        `;

        const gameOverContent = document.createElement('div');
        gameOverContent.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            color: white;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        `;

        const gameOverTitle = document.createElement('h2');
        gameOverTitle.textContent = 'Game Over!';
        gameOverTitle.style.cssText = `
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 28px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        `;

        const scoreText = document.createElement('p');
        scoreText.innerHTML = 'Your Score: <span id="snakeFinalScore">0</span>';
        scoreText.style.cssText = `
            font-size: 18px;
            margin-bottom: 25px;
        `;

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Play Again';
        restartButton.style.cssText = `
            padding: 15px 30px;
            font-size: 18px;
            color: white;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        restartButton.addEventListener('click', () => this.restartGame());

        gameOverContent.appendChild(gameOverTitle);
        gameOverContent.appendChild(scoreText);
        gameOverContent.appendChild(restartButton);
        this.gameOverOverlay.appendChild(gameOverContent);

        // Append overlays to container
        this.container.appendChild(this.startScreen);
        this.container.appendChild(this.gameOverOverlay);
    }

    init() {
        this.setupEventListeners();
        this.resetGame();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameStarted || this.gameOver) return;

            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault(); // Prevent scrolling
                    if (this.direction !== 'down') this.nextDirection = 'up';
                    break;
                case 'ArrowDown':
                    e.preventDefault(); // Prevent scrolling
                    if (this.direction !== 'up') this.nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                    e.preventDefault(); // Prevent scrolling
                    if (this.direction !== 'right') this.nextDirection = 'left';
                    break;
                case 'ArrowRight':
                    e.preventDefault(); // Prevent scrolling
                    if (this.direction !== 'left') this.nextDirection = 'right';
                    break;
                case 'p':
                    this.togglePause();
                    break;
            }
        });
    }

    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startScreen.style.display = 'none';
            this.gameLoop();
            this.spawnSpecialFood();
        }
    }

    resetGame() {
        // Initialize snake at the center
        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameSpeed = 150;
        this.spawnFood();
        this.particles = [];
    }

    spawnFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.isPositionOccupied(newFood));
        this.food = newFood;
    }

    spawnSpecialFood() {
        if (this.specialFood || !this.gameStarted || this.gameOver) return;

        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (this.isPositionOccupied(newFood) || 
                (this.food && newFood.x === this.food.x && newFood.y === this.food.y));
        
        this.specialFood = newFood;
        
        // Remove special food after duration
        this.specialFoodTimer = setTimeout(() => {
            this.specialFood = null;
            // Schedule next special food
            setTimeout(() => this.spawnSpecialFood(), Math.random() * 10000 + 5000);
        }, this.specialFoodDuration);
    }

    isPositionOccupied(pos) {
        return this.snake.some(segment => segment.x === pos.x && segment.y === pos.y);
    }

    moveSnake() {
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check for collisions
        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check for food collision
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.spawnFood();
            this.createParticles(head.x * this.tileSize, head.y * this.tileSize, '#64ffda');
            // Increase speed
            this.gameSpeed = Math.max(this.minSpeed, this.gameSpeed - this.speedIncrement);
        } else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            this.score += 50;
            this.specialFood = null;
            clearTimeout(this.specialFoodTimer);
            this.createParticles(head.x * this.tileSize, head.y * this.tileSize, '#ffd700');
            setTimeout(() => this.spawnSpecialFood(), Math.random() * 10000 + 5000);
        } else {
            // Remove tail if no food was eaten
            this.snake.pop();
        }
    }

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            return true;
        }

        // Self collision
        return this.snake.some((segment, index) => {
            if (index === 0) return false; // Skip head
            return segment.x === head.x && segment.y === head.y;
        });
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const velocity = 2;
            this.particles.push({
                x: x + this.tileSize / 2,
                y: y + this.tileSize / 2,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1,
                color: color
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a192f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update glow effect
        if (this.glowIncreasing) {
            this.glowIntensity += 0.05;
            if (this.glowIntensity >= 1) this.glowIncreasing = false;
        } else {
            this.glowIntensity -= 0.05;
            if (this.glowIntensity <= 0) this.glowIncreasing = true;
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            const isHead = index === 0;
            this.ctx.fillStyle = isHead ? '#64ffda' : '#4a8f82';
            this.ctx.shadowColor = '#64ffda';
            this.ctx.shadowBlur = isHead ? 15 : 5;
            this.ctx.fillRect(
                segment.x * this.tileSize,
                segment.y * this.tileSize,
                this.tileSize - 1,
                this.tileSize - 1
            );
        });

        // Draw food
        if (this.food) {
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.shadowColor = '#ff6b6b';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(
                this.food.x * this.tileSize + this.tileSize / 2,
                this.food.y * this.tileSize + this.tileSize / 2,
                this.tileSize / 2 - 1,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }

        // Draw special food
        if (this.specialFood) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.shadowColor = '#ffd700';
            this.ctx.shadowBlur = 15 * this.glowIntensity;
            this.ctx.beginPath();
            this.ctx.arc(
                this.specialFood.x * this.tileSize + this.tileSize / 2,
                this.specialFood.y * this.tileSize + this.tileSize / 2,
                this.tileSize / 2 - 1,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }

        // Draw particles
        this.ctx.shadowBlur = 0;
        this.particles.forEach(particle => {
            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    gameLoop() {
        if (!this.gameStarted || this.gameOver || this.isPaused) return;

        this.moveSnake();
        this.updateParticles();
        this.draw();

        setTimeout(() => requestAnimationFrame(() => this.gameLoop()), this.gameSpeed);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) this.gameLoop();
    }

    endGame() {
        this.gameOver = true;
        this.gameStarted = false;
        this.container.querySelector('#snakeFinalScore').textContent = this.score;
        this.gameOverOverlay.style.display = 'flex';
    }

    restartGame() {
        this.gameOver = false;
        this.resetGame();
        this.gameOverOverlay.style.display = 'none';
        this.startGame();
    }
} 