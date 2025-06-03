class GamesBackground {
    constructor() {
        this.container = document.getElementById('games-background');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.particles = [];
        this.mouse = new THREE.Vector2(0, 0); // Initialize mouse with default values
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 30;

        // Create particles
        const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x64ffda,
            transparent: true,
            opacity: 0.6
        });

        for (let i = 0; i < 100; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
            particle.position.x = Math.random() * 60 - 30;
            particle.position.y = Math.random() * 60 - 30;
            particle.position.z = Math.random() * 30 - 15;
            
            // Add some random movement properties
            particle.velocity = new THREE.Vector3(
                Math.random() * 0.02 - 0.01,
                Math.random() * 0.02 - 0.01,
                Math.random() * 0.02 - 0.01
            );
            
            this.particles.push(particle);
            this.scene.add(particle);
        }

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start animation
        this.animate();

        // Add mouse interaction
        this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onMouseMove(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update particles
        this.particles.forEach(particle => {
            particle.position.add(particle.velocity);

            // Add mouse influence
            const mouseInfluence = 0.001;
            particle.position.x += this.mouse.x * mouseInfluence;
            particle.position.y += this.mouse.y * mouseInfluence;

            // Wrap around edges
            if (particle.position.x > 30) particle.position.x = -30;
            if (particle.position.x < -30) particle.position.x = 30;
            if (particle.position.y > 30) particle.position.y = -30;
            if (particle.position.y < -30) particle.position.y = 30;
            if (particle.position.z > 15) particle.position.z = -15;
            if (particle.position.z < -15) particle.position.z = 15;

            // Pulse effect
            const time = Date.now() * 0.001;
            particle.material.opacity = 0.3 + Math.sin(time + particle.position.x) * 0.2;
            particle.scale.setScalar(0.8 + Math.sin(time * 2 + particle.position.y) * 0.2);
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the background when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GamesBackground();
}); 