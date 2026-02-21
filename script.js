// Register GSAP ScrollTrigger plugin (with safety check)
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
} else {
    console.error('GSAP or ScrollTrigger not loaded. Please check CDN links.');
}

// Sidebar Navigation - Active Link Highlighting
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            sidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink(); // Initial call

// Smooth scroll for sidebar links
sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const offset = 80; // Sidebar width
            const targetPosition = targetSection.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Falling Stars Effect - Stars break on text collision
let fallingStarsInterval = null;
let starsActive = false;

function createFallingStars() {
    const container = document.querySelector('.falling-stars-container');
    if (!container) return;
    
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroTitle || !heroSubtitle) return;
    
    function getTextRects() {
        return {
            title: heroTitle.getBoundingClientRect(),
            subtitle: heroSubtitle.getBoundingClientRect(),
            container: container.getBoundingClientRect()
        };
    }
    
    function createStar() {
        if (!starsActive) return;
        
        const star = document.createElement('div');
        star.className = 'falling-star';
        
        const startX = Math.random() * window.innerWidth;
        const speed = 2 + Math.random() * 3;
        
        star.style.left = `${startX}px`;
        star.style.animationDuration = `${speed}s`;
        star.style.animationTimingFunction = 'linear';
        
        container.appendChild(star);
        
        // Check collision with text
        const checkCollision = () => {
            if (!star.parentNode) return true;
            
            const rects = getTextRects();
            const starRect = star.getBoundingClientRect();
            
            const starY = starRect.top - rects.container.top;
            const starX = starRect.left - rects.container.left;
            
            // Check collision with title
            const titleTop = rects.title.top - rects.container.top;
            const titleBottom = rects.title.bottom - rects.container.top;
            const titleLeft = rects.title.left - rects.container.left;
            const titleRight = rects.title.right - rects.container.left;
            
            // Check collision with subtitle
            const subtitleTop = rects.subtitle.top - rects.container.top;
            const subtitleBottom = rects.subtitle.bottom - rects.container.top;
            const subtitleLeft = rects.subtitle.left - rects.container.left;
            const subtitleRight = rects.subtitle.right - rects.container.left;
            
            const hitTitle = starY >= titleTop && starY <= titleBottom && starX >= titleLeft && starX <= titleRight;
            const hitSubtitle = starY >= subtitleTop && starY <= subtitleBottom && starX >= subtitleLeft && starX <= subtitleRight;
            
            if (hitTitle || hitSubtitle) {
                createExplosion(starX, starY);
                if (star.parentNode) {
                    star.remove();
                }
                return true;
            }
            
            return false;
        };
        
        // Check collision every frame
        const collisionInterval = setInterval(() => {
            if (checkCollision() || !star.parentNode || star.offsetTop > container.offsetHeight + 50) {
                clearInterval(collisionInterval);
                if (star.parentNode) {
                    star.remove();
                }
            }
        }, 16);
        
        // Remove star after animation
        setTimeout(() => {
            clearInterval(collisionInterval);
            if (star.parentNode) {
                star.remove();
            }
        }, speed * 1000);
    }
    
    function createExplosion(x, y) {
        const particles = 8;
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#fff';
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = '0 0 10px rgba(139, 10, 31, 0.8)';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '100';
            
            const angle = (Math.PI * 2 * i) / particles;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            container.appendChild(particle);
            
            if (typeof gsap !== 'undefined') {
                gsap.to(particle, {
                    x: vx,
                    y: vy,
                    opacity: 0,
                    scale: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: () => {
                        if (particle.parentNode) {
                            particle.remove();
                        }
                    }
                });
            } else {
                let opacity = 1;
                let scale = 1;
                let frame = 0;
                const fadeInterval = setInterval(() => {
                    frame++;
                    opacity -= 0.02;
                    scale -= 0.02;
                    particle.style.opacity = opacity;
                    particle.style.transform = `scale(${scale}) translate(${vx * frame * 0.1}px, ${vy * frame * 0.1}px)`;
                    if (opacity <= 0 || frame > 50) {
                        clearInterval(fadeInterval);
                        if (particle.parentNode) {
                            particle.remove();
                        }
                    }
                }, 16);
            }
        }
    }
    
    // Start creating stars
    function startStars() {
        if (fallingStarsInterval) return;
        starsActive = true;
        fallingStarsInterval = setInterval(() => {
            if (starsActive) {
                createStar();
            }
        }, 300);
    }
    
    function stopStars() {
        starsActive = false;
        if (fallingStarsInterval) {
            clearInterval(fallingStarsInterval);
            fallingStarsInterval = null;
        }
        // Clean up existing stars
        const stars = container.querySelectorAll('.falling-star');
        stars.forEach(star => {
            if (star.parentNode) {
                star.remove();
            }
        });
    }
    
    // Use IntersectionObserver to start/stop stars
    const heroSection = document.querySelector('#hero');
    if (heroSection && typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    startStars();
                } else {
                    stopStars();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(heroSection);
    } else {
        // Fallback: start immediately
        startStars();
    }
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Stars will recalculate positions automatically
        }, 250);
    }, { passive: true });
}

// Initialize falling stars when hero section is visible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createFallingStars, 500);
    });
} else {
    setTimeout(createFallingStars, 500);
}

// Section Particles - Add particles to all sections
function createSectionParticles() {
    const sections = document.querySelectorAll('.section-particles');
    
    sections.forEach(section => {
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'section-particle';
            
            const startX = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = 15 + Math.random() * 10;
            const drift = (Math.random() - 0.5) * 50;
            
            particle.style.left = `${startX}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            section.appendChild(particle);
        }
    });
}

// Initialize section particles
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSectionParticles);
} else {
    createSectionParticles();
}

// Floating Clouds - Add floating red clouds to all sections
function createFloatingClouds() {
    const cloudContainers = document.querySelectorAll('.floating-clouds');
    
    cloudContainers.forEach(container => {
        const cloudCount = 3 + Math.floor(Math.random() * 3); // 3-5 clouds per section
        
        for (let i = 0; i < cloudCount; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'floating-cloud';
            
            // Random size
            const size = 40 + Math.random() * 60; // 40-100px
            cloud.style.width = `${size}px`;
            cloud.style.height = `${size * 0.6}px`;
            
            // Random starting position
            const startY = Math.random() * 80 + 10; // 10-90% from top
            cloud.style.top = `${startY}%`;
            cloud.style.left = '-100px';
            
            // Random animation duration
            const duration = 15 + Math.random() * 15; // 15-30s
            cloud.style.animationDuration = `${duration}s`;
            cloud.style.animationDelay = `${Math.random() * 5}s`;
            
            // Create SVG cloud shape
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 100 60');
            svg.setAttribute('preserveAspectRatio', 'none');
            
            const cloudPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            cloudPath.setAttribute('d', 'M25,30 Q15,20 5,25 Q0,15 10,10 Q15,0 25,5 Q30,0 40,5 Q50,0 55,10 Q65,5 75,10 Q85,15 80,25 Q90,20 95,30 Q90,40 80,35 Q75,45 65,40 Q55,45 45,40 Q35,45 25,40 Q20,40 25,30 Z');
            cloudPath.setAttribute('fill', '#8B0A1F');
            cloudPath.setAttribute('opacity', '0.6');
            
            svg.appendChild(cloudPath);
            cloud.appendChild(svg);
            
            container.appendChild(cloud);
        }
    });
}

// Initialize floating clouds
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingClouds);
} else {
    createFloatingClouds();
}

// Hero Section Parallax and Animations
const heroTitle = document.querySelector('.hero-title');
const heroSubtitle = document.querySelector('.hero-subtitle');
const heroCta = document.querySelector('.hero-cta');

// Animate hero elements on load
if (typeof gsap !== 'undefined') {
    gsap.timeline()
        .from('.title-line', {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.3,
            ease: 'power3.out'
        })
        .from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.5')
        .from('.hero-cta', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.3');
} else {
    // Fallback: показываем элементы сразу, если GSAP не загружен
    const titleLines = document.querySelectorAll('.title-line');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroCta = document.querySelector('.hero-cta');
    
    titleLines.forEach(line => {
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
    });
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '1';
        heroSubtitle.style.transform = 'translateY(0)';
    }
    if (heroCta) {
        heroCta.style.opacity = '1';
        heroCta.style.transform = 'translateY(0)';
    }
}

// Parallax effect on hero background
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.to('.hero-background', {
        yPercent: 50,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
}

// Smooth scroll for footer links (sidebar links handled separately)
document.querySelectorAll('footer a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const targetPosition = target.offsetTop - 80;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Fade in elements on scroll (portfolio cards are in carousel, excluded here)
// Skills are now visible by default, but will animate on scroll for better UX
const fadeElements = document.querySelectorAll('.skill-item-bar, .reveal-text');

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    fadeElements.forEach((element, index) => {
        // Set initial state only if it's a reveal-text, skills are already visible
        if (element.classList.contains('reveal-text') && !element.classList.contains('about-info')) {
            gsap.set(element, { opacity: 0, y: 30 });
        }
        
        gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            delay: index * 0.1
        });
    });
}

// About Section Text Reveal
const revealTexts = document.querySelectorAll('.reveal-text');
revealTexts.forEach((text, index) => {
    ScrollTrigger.create({
        trigger: text,
        start: 'top 85%',
        onEnter: () => {
            text.classList.add('revealed');
        }
    });
});

// Portfolio carousel fade-in on scroll
gsap.from('.portfolio-carousel-wrapper', {
    opacity: 0,
    y: 40,
    duration: 0.9,
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '.portfolio-carousel-wrapper',
        start: 'top 88%',
        toggleActions: 'play none none none'
    }
});

// Portfolio Carousel
let portfolioCarouselInitialized = false;
const portfolioCarousel = () => {
    if (portfolioCarouselInitialized) return;

    const track = document.querySelector('.portfolio-track');
    const cards = document.querySelectorAll('.portfolio-track .portfolio-card');
    const prevBtn = document.querySelector('.portfolio-btn-prev');
    const nextBtn = document.querySelector('.portfolio-btn-next');
    const dots = document.querySelectorAll('.portfolio-dot');

    if (!track || !cards.length) return;

    portfolioCarouselInitialized = true;
    let currentIndex = 0;
    const totalCards = cards.length;

    function updateButtons() {
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex === totalCards - 1;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function moveToIndex(index) {
        if (index < 0 || index >= totalCards) return;
        gsap.to(track, {
            x: `-${index * 100}%`,
            duration: 0.6,
            ease: 'power2.inOut'
        });
        currentIndex = index;
        updateButtons();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => moveToIndex(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveToIndex(currentIndex + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => moveToIndex(i)));

    gsap.set(track, { x: 0 });
    updateButtons();
};

// Portfolio Cards Hover Glow Effect
const portfolioCards = document.querySelectorAll('.portfolio-card');
portfolioCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (y - centerY) / 10;
        const angleY = (centerX - x) / 10;
        
        gsap.to(card, {
            duration: 0.3,
            rotationX: angleX,
            rotationY: angleY,
            transformPerspective: 1000,
            ease: 'power2.out'
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            duration: 0.5,
            rotationX: 0,
            rotationY: 0,
            ease: 'power2.out'
        });
    });
});

// Skills Progress Bars Animation
const skillItems = document.querySelectorAll('.skill-item-bar');

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    skillItems.forEach((item, index) => {
        const progressFill = item.querySelector('.skill-progress-fill');
        const percentText = item.querySelector('.skill-percent-text');
        const percentage = parseInt(item.dataset.percent) || 0;
        
        // Set initial state
        gsap.set(item, { opacity: 0, x: 30 });
        gsap.set(progressFill, { width: '0%' });
        
        ScrollTrigger.create({
            trigger: item,
            start: 'top 85%',
            onEnter: () => {
                // Animate item appearance
                gsap.to(item, {
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: index * 0.1
                });
                
                // Animate progress bar
                gsap.to(progressFill, {
                    width: `${percentage}%`,
                    duration: 1.5,
                    ease: 'power2.out',
                    delay: index * 0.1 + 0.3
                });
                
                // Animate percentage text
                if (percentText) {
                    gsap.fromTo(percentText, 
                        { textContent: 0 },
                        {
                            textContent: percentage,
                            duration: 1.5,
                            ease: 'power2.out',
                            snap: { textContent: 1 },
                            delay: index * 0.1 + 0.3,
                            onUpdate: function() {
                                percentText.textContent = Math.round(this.targets()[0].textContent) + '%';
                            }
                        }
                    );
                }
                
                item.classList.add('visible');
            }
        });
    });
} else {
    // Fallback: show all progress bars immediately if GSAP is not loaded
    skillItems.forEach((item) => {
        const progressFill = item.querySelector('.skill-progress-fill');
        const percentage = parseInt(item.dataset.percent) || 0;
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        item.classList.add('visible');
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
    });
}

// Certifications Carousel
let carouselInitialized = false;
const certificationsCarousel = () => {
    if (carouselInitialized) return;
    
    const track = document.querySelector('.certifications-track');
    const cards = document.querySelectorAll('.certification-card');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const dots = document.querySelectorAll('.dot');
    
    if (!track || !cards.length) return;
    
    carouselInitialized = true;
    let currentIndex = 0;
    const totalCards = cards.length;
    
    // Initialize first card
    cards[0].classList.add('active');
    updateButtons();
    
    // Update button states
    function updateButtons() {
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex === totalCards - 1;
        }
        
        // Update dots
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Move to specific index
    function moveToIndex(index) {
        if (index < 0 || index >= totalCards) return;
        
        // Remove active class from all cards
        cards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Update track position
        gsap.to(track, {
            x: `-${index * 100}%`,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
                cards[index].classList.add('active');
            }
        });
        
        currentIndex = index;
        updateButtons();
    }
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                moveToIndex(currentIndex - 1);
            }
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < totalCards - 1) {
                moveToIndex(currentIndex + 1);
            }
        });
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            moveToIndex(index);
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const carouselSection = document.getElementById('Certifications');
        if (!carouselSection) return;
        
        const rect = carouselSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isVisible) return;
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            moveToIndex(currentIndex - 1);
        } else if (e.key === 'ArrowRight' && currentIndex < totalCards - 1) {
            moveToIndex(currentIndex + 1);
        }
    });
    
    // Animate cards on scroll
    cards.forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            onEnter: () => {
                if (index === currentIndex) {
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out'
                    });
                }
            }
        });
    });
    
    // Initialize track position
    gsap.set(track, { x: 0 });
};

// Initialize carousels when DOM is ready (only once)
let carouselsInitialized = false;
function initializeCarousels() {
    if (carouselsInitialized) return;
    carouselsInitialized = true;
    certificationsCarousel();
    portfolioCarousel();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCarousels);
} else {
    initializeCarousels();
}

// Sidebar Scroll Effect
let scrollTimeout;
const sidebarNav = document.querySelector('.sidebar-nav');

function handleSidebarScroll() {
    const currentScroll = window.pageYOffset;
    
    if (typeof gsap !== 'undefined' && sidebarNav) {
        if (currentScroll > 100) {
            gsap.to(sidebarNav, {
                background: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(139, 10, 31, 0.5)',
                duration: 0.3,
                ease: 'power2.out'
            });
        } else {
            gsap.to(sidebarNav, {
                background: 'rgba(0, 0, 0, 0.6)',
                borderColor: 'rgba(139, 10, 31, 0.2)',
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }
}

window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(handleSidebarScroll);
}, { passive: true });

// Smooth reveal for section titles
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        gsap.from(title, {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 90%',
                toggleActions: 'play none none none'
            }
        });
    });
}

// Floating particles animation enhancement
if (typeof gsap !== 'undefined') {
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        const randomX = Math.random() * 200 - 100;
        const randomDuration = 15 + Math.random() * 10;
        const randomDelay = Math.random() * 5;
        
        gsap.to(particle, {
            y: -window.innerHeight - 100,
            x: `+=${randomX}`,
            duration: randomDuration,
            repeat: -1,
            ease: 'none',
            delay: randomDelay
        });
        
        // Add subtle scale animation
        gsap.to(particle, {
            scale: 1.5,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
            delay: Math.random() * 2
        });
    });
}

// Dark matter wave distortion effect (subtle background animation)
if (typeof gsap !== 'undefined') {
    const waveEffect = document.createElement('div');
    waveEffect.className = 'wave-effect';
    waveEffect.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.08;
        background: radial-gradient(circle at 20% 50%, rgba(139, 10, 31, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(90, 5, 20, 0.15) 0%, transparent 50%);
    `;
    document.body.appendChild(waveEffect);

    gsap.to(waveEffect, {
        backgroundPosition: '100% 100%',
        duration: 25,
        repeat: -1,
        ease: 'none'
    });
}

// Performance optimization: Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.globalTimeline.timeScale(0.5);
}

// Initialize all animations on page load
window.addEventListener('load', () => {
    // Carousels already initialized, don't call again
    // Smooth page load
    if (typeof gsap !== 'undefined') {
        gsap.to('body', {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
        });
    }
}, { once: true });

// Orbiting Skills Component
const orbitingSkills = [
    { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
    { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
    { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg" },
    { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
    { name: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
    { name: "CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" }
];

let orbitingSkillsInitialized = false;
function initOrbitingSkills() {
    if (orbitingSkillsInitialized) return;
    const container = document.getElementById('orbiting-skills');
    if (!container) return;
    orbitingSkillsInitialized = true;

    const centerX = 200; // половина ширины контейнера (400px / 2)
    const centerY = 200; // половина высоты контейнера (400px / 2)
    const radius = 140;
    const totalSkills = orbitingSkills.length;
    const elementSize = 70;

    orbitingSkills.forEach((skill, index) => {
        // Равномерное распределение по кругу: каждый элемент на одинаковом угловом расстоянии
        // Угол между элементами = 360° / количество элементов
        const angleStep = (360 / totalSkills) * (Math.PI / 180);
        const initialAngle = index * angleStep;
        
        const skillElement = document.createElement('div');
        skillElement.className = 'orbiting-skill';
        skillElement.dataset.angle = initialAngle;
        skillElement.dataset.radius = radius;
        skillElement.dataset.centerX = centerX;
        skillElement.dataset.centerY = centerY;
        skillElement.title = skill.name; // Добавляем tooltip с названием
        skillElement.setAttribute('data-skill-name', skill.name); // Для отладки
        
        // Создаем изображение вместо текста
        const skillImage = document.createElement('img');
        skillImage.src = skill.icon;
        skillImage.alt = skill.name;
        skillImage.className = 'orbiting-skill-icon';
        skillImage.loading = 'eager'; // Загружаем сразу для лучшей видимости
        skillImage.style.opacity = '1';
        skillImage.style.visibility = 'visible';
        
        // Обработка успешной загрузки изображения
        skillImage.onload = function() {
            this.style.opacity = '1';
            this.style.visibility = 'visible';
        };
        
        // Обработка ошибок загрузки изображения (только один раз)
        let errorHandled = false;
        skillImage.onerror = function() {
            if (errorHandled) return; // Предотвращаем множественные попытки
            errorHandled = true;
            console.warn(`Failed to load icon for ${skill.name}, using fallback`);
            this.style.display = 'none';
            const fallback = document.createElement('span');
            fallback.textContent = skill.name;
            fallback.style.fontSize = '0.65rem';
            fallback.style.color = 'var(--text-white)';
            fallback.style.fontWeight = '600';
            skillElement.appendChild(fallback);
        };
        skillElement.appendChild(skillImage);
        
        // Устанавливаем начальную позицию
        updateOrbitPosition(skillElement, initialAngle);
        
        container.appendChild(skillElement);
    });

    // Анимация орбитального вращения - все элементы вращаются с одинаковой скоростью
    if (typeof gsap !== 'undefined') {
        const skillElements = container.querySelectorAll('.orbiting-skill');
        let angleData = {};
        const rotationSpeed = 30; // одинаковая скорость для всех элементов
        
        skillElements.forEach((el, index) => {
            const initialAngle = parseFloat(el.dataset.angle);
            angleData[index] = { angle: 0, initial: initialAngle };
            
            // Анимируем угол от 0 до 2π с одинаковой скоростью для всех
            // Используем более эффективный способ через transform вместо left/top
            gsap.to(angleData[index], {
                angle: Math.PI * 2,
                duration: rotationSpeed,
                repeat: -1,
                ease: 'none',
                onUpdate: function() {
                    const currentAngle = initialAngle + angleData[index].angle;
                    updateOrbitPosition(el, currentAngle);
                }
            });
        });
    }

    // Анимация появления при скролле - но элементы должны быть видимы сразу
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const skillElements = container.querySelectorAll('.orbiting-skill');
        // Устанавливаем начальную видимость
        skillElements.forEach((el) => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
        });
        
        skillElements.forEach((el, index) => {
            // Анимация появления с эффектом
            gsap.from(el, {
                opacity: 0,
                scale: 0.5,
                duration: 0.6,
                delay: index * 0.08,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    } else {
        // Если GSAP не загружен, просто показываем элементы
        const skillElements = container.querySelectorAll('.orbiting-skill');
        skillElements.forEach((el) => {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
        });
    }
}

function updateOrbitPosition(element, angle) {
    const centerX = parseFloat(element.dataset.centerX);
    const centerY = parseFloat(element.dataset.centerY);
    const radius = parseFloat(element.dataset.radius);
    const elementSize = 70;
    
    // Вычисляем позицию с учетом центра элемента
    const x = centerX + Math.cos(angle) * radius - elementSize / 2;
    const y = centerY + Math.sin(angle) * radius - elementSize / 2;
    
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.transform = 'translate(0, 0)'; // Сбрасываем любые другие трансформации
}

// Инициализация orbiting skills (только один раз)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrbitingSkills, { once: true });
} else {
    initOrbitingSkills();
}

// Smooth scroll is handled natively by CSS scroll-behavior: smooth


// Portfolio Modal Functionality
const portfolioProjects = [
    {
        title: "Project One",
        description: "A modern web application with stunning UI/UX design. Built with React and featuring responsive layout, smooth animations, and intuitive user interactions.",
        tags: ["React", "CSS", "JavaScript", "API"],
        demo: "#",
        source: "#"
    },
    {
        title: "Project Two",
        description: "Brand identity and digital presence for innovative startup. Complete website redesign with modern aesthetics and user-focused design.",
        tags: ["HTML", "CSS", "JavaScript", "Figma"],
        demo: "#",
        source: "#"
    },
    {
        title: "Project Three",
        description: "E-commerce platform with seamless user experience. Features include shopping cart, payment integration, and admin dashboard.",
        tags: ["React", "Node.js", "MongoDB", "Stripe"],
        demo: "#",
        source: "#"
    },
    {
        title: "Project Four",
        description: "Mobile app design with intuitive navigation. Focus on user experience and accessibility across all devices.",
        tags: ["React Native", "Figma", "UX/UI"],
        demo: "#",
        source: "#"
    },
    {
        title: "Project Five",
        description: "Creative agency website with interactive elements. Dynamic animations and modern visual effects.",
        tags: ["HTML", "CSS", "GSAP", "JavaScript"],
        demo: "#",
        source: "#"
    },
    {
        title: "Project Six",
        description: "Dashboard design with data visualization. Interactive charts and real-time data updates.",
        tags: ["React", "D3.js", "Chart.js", "API"],
        demo: "#",
        source: "#"
    }
];

// Initialize modal functionality
function initPortfolioModal() {
    const modal = document.getElementById('portfolioModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalDesc = modal.querySelector('.modal-description');
    const modalTags = modal.querySelector('.modal-tags');
    const modalDemo = modal.querySelector('.modal-link.primary');
    const modalSource = modal.querySelector('.modal-link.secondary');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Add click handlers to portfolio cards
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    
    portfolioCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Prevent opening modal when clicking on the link
            if (e.target.classList.contains('card-link')) {
                return;
            }
            
            const project = portfolioProjects[index];
            if (project) {
                // Update modal content
                modalTitle.textContent = project.title;
                modalDesc.textContent = project.description;
                
                // Update tags
                modalTags.innerHTML = project.tags
                    .map(tag => `<span class="modal-tag">${tag}</span>`)
                    .join('');
                
                // Update links
                modalDemo.href = project.demo;
                modalSource.href = project.source;
                
                // Show modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close modal on button click
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Contact Form Functionality
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Create mailto link
        const mailtoLink = `mailto:krutiyaly@mail.ru?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message
        alert('Thank you for your message! Your email client will open to send the message.');
        
        // Reset form
        form.reset();
    });
}

// Download Resume functionality
function initResumeDownload() {
    const downloadBtn = document.getElementById('downloadResume');
    
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Show message that resume will be available soon
        // In a real scenario, this would link to an actual PDF file
        alert('Resume download feature will be available soon! Please contact me via email for the full resume.');
    });
}

// Initialize new features
document.addEventListener('DOMContentLoaded', () => {
    initPortfolioModal();
    initContactForm();
    initResumeDownload();
});


// loader
