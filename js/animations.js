// Glitch Text Effect
document.querySelectorAll('.glitch-text').forEach(element => {
    // Remove any data attributes
    element.removeAttribute('data-text');
});

// Typing Animation
document.querySelectorAll('.typing-text').forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    let charIndex = 0;

    function type() {
        if (charIndex < text.length) {
            element.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        }
    }

    // Start typing animation when element is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                type();
                observer.unobserve(entry.target);
            }
        });
    });

    observer.observe(element);
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax Effect
window.addEventListener('scroll', () => {
    const parallaxElements = document.querySelectorAll('.parallax');
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(window.scrollY * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Fade In Animation for Project Cards
const fadeInElements = document.querySelectorAll('.fade-in');
const fadeInOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, fadeInOptions);

fadeInElements.forEach(element => {
    fadeInObserver.observe(element);
});

// Button Hover Effect
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        button.style.setProperty('--x', `${x}px`);
        button.style.setProperty('--y', `${y}px`);
    });
});

// Navigation Highlight
function highlightNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

highlightNavigation();

// Particle Effect for Hero Section
document.addEventListener('mousemove', (e) => {
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        const speed = particle.dataset.speed;
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        particle.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
});

// Create floating particles
function createParticles() {
    const particlesContainer = document.querySelector('#particles-js');
    if (!particlesContainer) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.dataset.speed = Math.random() * 2 + 1;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particlesContainer.appendChild(particle);
    }
}

createParticles();

// Animations for skill cards
document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.querySelector('.skill-card-inner').style.transform = 'rotateY(180deg)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.querySelector('.skill-card-inner').style.transform = 'rotateY(0deg)';
    });
});

// Role text animation
const roles = document.querySelectorAll('.role-text');
let currentRole = 0;

function cycleRoles() {
    roles.forEach(role => role.classList.remove('active'));
    roles[currentRole].classList.add('active');
    currentRole = (currentRole + 1) % roles.length;
}

setInterval(cycleRoles, 3000);

// Reveal animations
const revealElements = document.querySelectorAll('.reveal-text, .reveal-form');
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2
});

revealElements.forEach(element => revealObserver.observe(element)); 