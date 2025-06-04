// Update copyright year
function updateCopyrightYear() {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Run immediately
updateCopyrightYear();

// Also run when DOM is loaded to ensure it works
document.addEventListener('DOMContentLoaded', updateCopyrightYear);

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

hamburger.addEventListener('click', toggleMenu);
navLinksItems.forEach(item => item.addEventListener('click', closeMenu));

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
        closeMenu();
    }
});

// Custom cursor with touch device detection
const cursor = document.querySelector('.cursor');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Add hover class to cursor when hovering over interactive elements
    document.querySelectorAll('a, button, .tech-item').forEach(element => {
        element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
} else {
    cursor.style.display = 'none';
}

// Smooth section transitions with Intersection Observer
const sections = document.querySelectorAll('section');
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
};

const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('about')) {
                animateSkills();
            }
        }
    });
}, observerOptions);

sections.forEach(section => {
    sectionObserver.observe(section);
});

// Animate skill bars with intersection observer
function animateSkills() {
    const skills = document.querySelectorAll('.skill');
    skills.forEach(skill => {
        const progress = skill.querySelector('.progress');
        const progressValue = progress.getAttribute('style').match(/width:\s*(\d+)%/)[1];
        progress.style.width = '0';
        // Small delay to ensure the width reset is registered
        setTimeout(() => {
            progress.style.width = progressValue + '%';
        }, 50);
    });
}

// Skill section observer
const skillSection = document.querySelector('#skills');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSkills();
            // Unobserve after first animation
            skillObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2
});

skillObserver.observe(skillSection);

// Responsive image loading
function loadResponsiveImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
        }
    });
}

// Handle window resize events
let resizeTimer;
window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
});

// Scroll progress indicator
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    if (window.innerWidth > 768) {  // Only show on larger screens
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
    }
});

// Form handling with validation and responsive feedback
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const submitButton = contactForm.querySelector('button[type="submit"]');
    
    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Prepare the data for the API call
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // Make the API call
        const response = await fetch('https://portfolio-backend-yq1y.onrender.com/api/contact/mail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-message success';
        successMessage.textContent = 'Thank you for your message! I will get back to you soon.';
        contactForm.appendChild(successMessage);
        
        // Reset the form
        contactForm.reset();
        
        setTimeout(() => successMessage.remove(), 5000);
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-message error';
        errorMessage.textContent = 'There was an error sending your message. Please try again.';
        contactForm.appendChild(errorMessage);
        
        setTimeout(() => errorMessage.remove(), 5000);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateCopyrightYear();
    loadResponsiveImages();
});

// Particles.js configuration
if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-network', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#64ffda'
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.5,
                random: false
            },
            size: {
                value: 3,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#64ffda',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 6,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'repulse'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            }
        },
        retina_detect: true
    });
}