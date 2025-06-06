class ParticleNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.numberOfParticles = 150;
        if (window.innerWidth < 768) {
            this.numberOfParticles = 60;
        }
        this.minDistance = 120;
        this.mousePosition = { x: 0, y: 0 };
        this.mouseMoved = false;
        this.colors = [
            { r: 100, g: 255, b: 218 },  // Original teal
            { r: 111, g: 99, b: 255 },    // Purple
            { r: 66, g: 134, b: 244 },    // Blue
            { r: 255, g: 107, b: 180 },   // Pink
            { r: 76, g: 230, b: 175 }     // Light green
        ];

        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.numberOfParticles; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const opacity = Math.random() * 0.5 + 0.2; // Between 0.2 and 0.7
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`,
                baseColor: color // Store the base color for connections
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Move particles
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();

            // Connect particles
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.minDistance) {
                    // Create gradient for connection
                    const gradient = this.ctx.createLinearGradient(
                        particle.x, particle.y, 
                        otherParticle.x, otherParticle.y
                    );
                    
                    const opacity = 0.2 * (1 - distance/this.minDistance);
                    gradient.addColorStop(0, `rgba(${particle.baseColor.r}, ${particle.baseColor.g}, ${particle.baseColor.b}, ${opacity})`);
                    gradient.addColorStop(1, `rgba(${otherParticle.baseColor.r}, ${otherParticle.baseColor.g}, ${otherParticle.baseColor.b}, ${opacity})`);

                    this.ctx.beginPath();
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });

            // Connect to mouse if moved
            if (this.mouseMoved) {
                const dx = particle.x - this.mousePosition.x;
                const dy = particle.y - this.mousePosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.minDistance * 1.5) {
                    const opacity = 0.3 * (1 - distance/(this.minDistance * 1.5));
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(${particle.baseColor.r}, ${particle.baseColor.g}, ${particle.baseColor.b}, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(this.mousePosition.x, this.mousePosition.y);
                    this.ctx.stroke();

                    // Add slight attraction to mouse
                    particle.vx += dx * 0.0001;
                    particle.vy += dy * 0.0001;
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
            this.mouseMoved = true;
        });

        // For touch devices
        window.addEventListener('touchmove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.touches[0].clientX - rect.left;
            this.mousePosition.y = e.touches[0].clientY - rect.top;
            this.mouseMoved = true;
        });

        window.addEventListener('touchend', () => {
            this.mouseMoved = false;
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-network');
    new ParticleNetwork(canvas);
}); 