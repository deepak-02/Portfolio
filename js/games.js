// Memory Game
class MemoryGame {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isLocked = false;
        this.icons = [
            'fas fa-star', 'fas fa-heart', 'fas fa-bolt', 'fas fa-cloud',
            'fas fa-moon', 'fas fa-sun', 'fas fa-tree', 'fas fa-bell'
        ];
        this.init();
    }

    init() {
        // Create the game board
        const gameBoard = document.createElement('div');
        gameBoard.className = 'memory-board';
        
        // Create pairs of cards
        const cardPairs = [...this.icons, ...this.icons];
        this.shuffleArray(cardPairs);

        // Create card elements
        cardPairs.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front"></div>
                    <div class="card-back">
                        <i class="${icon}"></i>
                    </div>
                </div>
            `;
            card.dataset.icon = icon;
            card.addEventListener('click', () => this.flipCard(card));
            gameBoard.appendChild(card);
            this.cards.push(card);
        });

        this.container.innerHTML = '';
        this.container.appendChild(gameBoard);
    }

    flipCard(card) {
        if (this.isLocked || this.flippedCards.includes(card) || card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.isLocked = true;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.icon === card2.dataset.icon;

        if (match) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.matchedPairs++;

        if (this.matchedPairs === this.icons.length) {
            setTimeout(() => {
                alert('Congratulations! You won!');
                this.resetGame();
            }, 500);
        }

        this.resetTurn();
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            this.resetTurn();
        }, 1000);
    }

    resetTurn() {
        this.flippedCards = [];
        this.isLocked = false;
    }

    resetGame() {
        this.matchedPairs = 0;
        this.init();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Snake Game
class SnakeGame {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.isGameStarted = false;
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        
        // Add score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'snake-score';
        scoreDisplay.textContent = `Score: ${this.score}`;
        this.container.appendChild(scoreDisplay);
        this.scoreDisplay = scoreDisplay;

        // Add start button
        const startButton = document.createElement('button');
        startButton.className = 'btn primary';
        startButton.textContent = 'Start Game';
        startButton.addEventListener('click', () => this.startGame());
        this.container.appendChild(startButton);
        this.startButton = startButton;

        // Add controls
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Initial draw
        this.draw();
    }

    startGame() {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.startButton.style.display = 'none';
            this.gameLoop = setInterval(() => this.update(), 100);
        }
    }

    generateFood() {
        let x, y;
        do {
            x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
            y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        } while (this.snake.some(segment => segment.x === x && segment.y === y));
        return {x, y};
    }

    update() {
        if (!this.isGameStarted) return;

        const head = {...this.snake[0]};

        // Update snake position
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision with walls
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }

        // Check collision with self (excluding the tail that will be removed)
        const willEatFood = head.x === this.food.x && head.y === this.food.y;
        const snakeBody = willEatFood ? this.snake : this.snake.slice(0, -1);
        if (snakeBody.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if food is eaten
        if (willEatFood) {
            this.score += 10;
            this.scoreDisplay.textContent = `Score: ${this.score}`;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a192f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#64ffda';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#ff5555';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );

        // Draw game start message
        if (!this.isGameStarted) {
            this.ctx.fillStyle = '#e6f1ff';
            this.ctx.font = '20px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Click Start Game to play!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    handleKeyPress(event) {
        if (!this.isGameStarted) return;

        switch(event.key) {
            case 'ArrowUp':
                if (this.direction !== 'down') this.direction = 'up';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.direction = 'down';
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') this.direction = 'left';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.direction = 'right';
                break;
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isGameStarted = false;
        this.startButton.style.display = 'block';
        this.startButton.textContent = 'Play Again';
        alert(`Game Over! Score: ${this.score}`);
        this.resetGame();
    }

    resetGame() {
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.draw();
    }
}

// Initialize games when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const memoryGameContainer = document.querySelector('#memory-game .game-preview');
    const snakeGameContainer = document.querySelector('#snake-game .game-preview');

    if (memoryGameContainer) {
        new MemoryGame(memoryGameContainer);
    }

    if (snakeGameContainer) {
        new SnakeGame(snakeGameContainer);
    }
}); 