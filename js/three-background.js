class ThreeBackground {
    constructor() {
        this.container = document.getElementById('three-background');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.particles = [];
        this.wave = null;
        this.mouse = new THREE.Vector2();
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
        this.createParticles();
        this.createWave();

        // Add event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Start animation
        this.animate();
    }

    createParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;

            colors[i] = Math.random();
            colors[i + 1] = Math.random();
            colors[i + 2] = Math.random();
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }

    createWave() {
        const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const material = new THREE.MeshBasicMaterial({
            color: 0x64ffda,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });

        this.wave = new THREE.Mesh(geometry, material);
        this.wave.rotation.x = -Math.PI / 2;
        this.wave.position.y = -20;
        this.scene.add(this.wave);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    animateParticles() {
        const positions = this.particles.geometry.attributes.position.array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i]) * 0.01;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.rotation.y += 0.001;
    }

    animateWave() {
        const positions = this.wave.geometry.attributes.position.array;
        const time = Date.now() * 0.001;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            positions[i + 1] = Math.sin(x * 0.05 + time) * Math.cos(z * 0.05 + time) * 5;
        }

        this.wave.geometry.attributes.position.needsUpdate = true;
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.animateParticles();
        this.animateWave();

        // Camera movement based on mouse position
        this.camera.position.x += (this.mouse.x * 10 - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouse.y * 10 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize Three.js background
window.addEventListener('load', () => {
    new ThreeBackground();
}); 