// Flappy Bird Game Implementation
class FlappyBirdGame {
    constructor(containerId) {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.canvas.id = 'gameCanvas';
        this.canvas.style.border = '3px solid #333';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.display = 'block';
        this.canvas.style.background = 'linear-gradient(to bottom, #70c5ce 0%, #459ba8 70%, #ded895 70%, #def0a5 100%)';
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
        
        // Game state
        this.gameOver = false;
        this.score = 0;
        this.gameStarted = false;
        
        // Bird properties
        this.birdSize = 35;
        this.birdX = this.canvas.width / 4;
        this.birdY = this.canvas.height / 2 - this.birdSize / 2;
        this.birdVelocity = 0;
        this.gravity = 0.4;
        this.jumpStrength = -8;
        
        // Pipe properties
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 2.5;
        this.pipes = [];
        
        // Power-up properties
        this.isBoosted = false;
        this.boostDuration = 3;
        this.boostStartTime = 0;
        this.reducedGravity = 0.15;
        
        // Clouds
        this.clouds = [];
        
        // Images
        this.images = {};
        this.imagesLoaded = 0;
        this.totalImages = 0;
        
        this.init();
    }

    setupGameUI() {
        // Create loading screen
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.id = 'loadingScreen';
        this.loadingScreen.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 15;
            color: white;
            font-size: 20px;
        `;

        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.style.cssText = `
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-right: 15px;
        `;

        this.loadingScreen.appendChild(spinner);
        this.loadingScreen.appendChild(document.createTextNode('Loading game assets...'));

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
        startTitle.textContent = 'Flappy Bird';
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
            <p>Use SPACE or CLICK to make the bird fly</p>
            <p>Press B for power boost (3 seconds)</p>
            <p>Avoid the pipes and survive as long as you can!</p>
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
        this.gameOverOverlay.id = 'gameOverOverlay';
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
        scoreText.innerHTML = 'Your Score: <span id="finalScore">0</span>';
        scoreText.style.cssText = `
            font-size: 18px;
            margin-bottom: 25px;
        `;

        const restartButton = document.createElement('button');
        restartButton.id = 'restartButton';
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

        gameOverContent.appendChild(gameOverTitle);
        gameOverContent.appendChild(scoreText);
        gameOverContent.appendChild(restartButton);
        this.gameOverOverlay.appendChild(gameOverContent);

        // Append all elements to container
        this.container.appendChild(this.loadingScreen);
        this.container.appendChild(this.startScreen);
        this.container.appendChild(this.gameOverOverlay);
    }
    
    init() {
        this.loadImages();
        this.setupEventListeners();
        this.generateCloud();
        
        // Generate clouds periodically
        setInterval(() => this.generateCloud(), 4000);
    }
    
    loadImages() {
        const imageUrls = {
            bird: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="35" height="25" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="17" cy="12" rx="15" ry="10" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
                    <circle cx="25" cy="8" r="3" fill="#000"/>
                    <polygon points="30,12 35,10 35,14" fill="#FF4500"/>
                    <ellipse cx="8" cy="12" rx="6" ry="8" fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
                </svg>
            `),
            pipeTop: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="60" height="400" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#4CAF50"/>
                            <stop offset="100%" style="stop-color:#2E7D32"/>
                        </linearGradient>
                    </defs>
                    <rect width="60" height="400" fill="url(#pipeGrad)" stroke="#1B5E20" stroke-width="2"/>
                    <rect x="0" y="380" width="60" height="20" fill="#2E7D32"/>
                </svg>
            `),
            pipeBottom: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="60" height="400" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="pipeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#4CAF50"/>
                            <stop offset="100%" style="stop-color:#2E7D32"/>
                        </linearGradient>
                    </defs>
                    <rect width="60" height="400" fill="url(#pipeGrad2)" stroke="#1B5E20" stroke-width="2"/>
                    <rect x="0" y="0" width="60" height="20" fill="#2E7D32"/>
                </svg>
            `),
            cloud: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="80" height="40" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="20" cy="25" rx="15" ry="12" fill="rgba(255,255,255,0.8)"/>
                    <ellipse cx="35" cy="20" rx="18" ry="15" fill="rgba(255,255,255,0.8)"/>
                    <ellipse cx="50" cy="22" rx="12" ry="10" fill="rgba(255,255,255,0.8)"/>
                    <ellipse cx="65" cy="28" rx="10" ry="8" fill="rgba(255,255,255,0.8)"/>
                </svg>
            `)
        };
        
        this.totalImages = Object.keys(imageUrls).length;
        
        for (const [name, url] of Object.entries(imageUrls)) {
            const img = new Image();
            img.onload = () => this.imageLoaded();
            img.onerror = () => this.imageLoaded();
            img.src = url;
            this.images[name] = img;
        }
    }
    
    imageLoaded() {
        this.imagesLoaded++;
        if (this.imagesLoaded >= this.totalImages) {
            this.loadingScreen.style.display = 'none';
            // Don't start the game automatically
            this.birdY = this.canvas.height / 2 - this.birdSize / 2;
            this.draw(); // Draw initial frame
        }
    }
    
    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.gameOver = false;
            this.score = 0;
            this.birdY = this.canvas.height / 2 - this.birdSize / 2;
            this.birdVelocity = 0;
            this.pipes = [];
            this.isBoosted = false;
            
            // Generate first pipe
            this.generatePipe();
            
            // Start game loop
            this.gameLoop();

            // Hide start screen
            this.startScreen.style.display = 'none';
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', () => this.jump());
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            } else if (e.key.toLowerCase() === 'b') {
                this.activateBooster();
            }
        });
        
        this.container.querySelector('#restartButton').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    jump() {
        if (!this.gameOver && this.gameStarted) {
            this.birdVelocity = this.jumpStrength;
        }
    }
    
    activateBooster() {
        if (!this.isBoosted && !this.gameOver && this.gameStarted) {
            this.isBoosted = true;
            this.boostStartTime = Date.now();
        }
    }
    
    generatePipe() {
        const minHeight = 80;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const topPipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        const bottomPipeHeight = this.canvas.height - topPipeHeight - this.pipeGap;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topPipeHeight,
            bottomHeight: bottomPipeHeight,
            passed: false,
            scored: false // Add this flag to prevent multiple score counts
        });
    }
    
    generateCloud() {
        const cloudWidth = 80;
        const cloudHeight = 40;
        const startY = Math.random() * (this.canvas.height / 3);
        const speed = Math.random() * 0.8 + 0.3;
        
        this.clouds.push({
            x: this.canvas.width,
            y: startY,
            width: cloudWidth,
            height: cloudHeight,
            speed: speed
        });
    }
    
    checkCollision(birdX, birdY, birdSize, pipe) {
        const topPipeCollision = birdX < pipe.x + this.pipeWidth &&
                               birdX + birdSize > pipe.x &&
                               birdY < pipe.topHeight;
        
        const bottomPipeCollision = birdX < pipe.x + this.pipeWidth &&
                                  birdX + birdSize > pipe.x &&
                                  birdY + birdSize > this.canvas.height - pipe.bottomHeight;
        
        return topPipeCollision || bottomPipeCollision;
    }
    
    update() {
        if (this.gameOver) return;
        
        // Handle booster
        if (this.isBoosted) {
            const elapsed = (Date.now() - this.boostStartTime) / 1000;
            if (elapsed >= this.boostDuration) {
                this.isBoosted = false;
            }
        }
        
        // Bird physics
        const currentGravity = this.isBoosted ? this.reducedGravity : this.gravity;
        this.birdVelocity += currentGravity;
        this.birdY += this.birdVelocity;
        
        // Boundary checks
        if (this.birdY + this.birdSize > this.canvas.height || this.birdY < 0) {
            this.endGame();
            return;
        }
        
        // Update pipes
        let needNewPipe = true;
        
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check if we need a new pipe
            if (pipe.x > this.canvas.width / 3) {
                needNewPipe = false;
            }
            
            // Check collision (only if not boosted)
            if (!this.isBoosted && this.checkCollision(this.birdX, this.birdY, this.birdSize, pipe)) {
                this.endGame();
                return;
            }
            
            // Score when bird passes pipe
            if (!pipe.scored && this.birdX > pipe.x + this.pipeWidth) {
                this.score++;
                pipe.scored = true;
            }
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Generate new pipe when needed
        if (needNewPipe) {
            this.generatePipe();
        }
        
        // Update clouds
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            const cloud = this.clouds[i];
            cloud.x -= cloud.speed;
            
            if (cloud.x + cloud.width < 0) {
                this.clouds.splice(i, 1);
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.clouds.forEach(cloud => {
            this.ctx.drawImage(this.images.cloud, cloud.x, cloud.y, cloud.width, cloud.height);
        });
        
        // Draw pipes
        this.pipes.forEach(pipe => {
            // Top pipe (flipped)
            this.ctx.save();
            this.ctx.translate(pipe.x + this.pipeWidth/2, pipe.topHeight);
            this.ctx.rotate(Math.PI);
            this.ctx.drawImage(this.images.pipeTop, -this.pipeWidth/2, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.restore();
            
            // Bottom pipe
            this.ctx.drawImage(this.images.pipeBottom, pipe.x, this.canvas.height - pipe.bottomHeight, this.pipeWidth, pipe.bottomHeight);
        });
        
        // Draw bird with glow effect if boosted
        if (this.isBoosted) {
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15;
        }
        this.ctx.drawImage(this.images.bird, this.birdX, this.birdY, this.birdSize, this.birdSize);
        this.ctx.shadowBlur = 0;
        
        // Draw UI
        this.drawUI();
    }
    
    drawUI() {
        // Score
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText('Score: ' + this.score, 20, 40);
        this.ctx.fillText('Score: ' + this.score, 20, 40);
        
        // Booster countdown
        if (this.isBoosted) {
            const elapsed = (Date.now() - this.boostStartTime) / 1000;
            const remaining = Math.max(0, this.boostDuration - elapsed);
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            const boostText = 'BOOST: ' + remaining.toFixed(1) + 's';
            this.ctx.strokeText(boostText, 20, 70);
            this.ctx.fillText(boostText, 20, 70);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        if (!this.gameOver) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.gameStarted = false;
        this.container.querySelector('#finalScore').textContent = this.score;
        this.gameOverOverlay.style.display = 'flex';
    }
    
    restartGame() {
        this.gameOver = false;
        this.score = 0;
        this.birdY = this.canvas.height / 2 - this.birdSize / 2;
        this.birdVelocity = 0;
        this.pipes = [];
        this.isBoosted = false;
        
        // Hide game over overlay
        this.gameOverOverlay.style.display = 'none';
        
        // Start the game immediately
        this.startGame();
    }
}

// Export the game class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlappyBirdGame;
} else {
    window.FlappyBirdGame = FlappyBirdGame;
}
