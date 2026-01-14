window.addEventListener('load', () => {
    setTimeout(() => document.body.classList.add('loaded'), 1500);
});

const particleCanvas = document.getElementById('particles');
const pCtx = particleCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = Math.random() * particleCanvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > particleCanvas.width || this.y < 0 || this.y > particleCanvas.height) this.reset();
    }
    draw() {
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`;
        pCtx.fill();
    }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function animateParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const trailCanvas = document.getElementById('cursorTrail');
const tCtx = trailCanvas.getContext('2d');
let trail = [];
let mouseX = 0, mouseY = 0;

function resizeTrailCanvas() {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
}
resizeTrailCanvas();
window.addEventListener('resize', resizeTrailCanvas);

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    trail.push({ x: mouseX, y: mouseY, age: 0 });
    if (trail.length > 30) trail.shift();
});

let ringX = 0, ringY = 0;
function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

function animateTrail() {
    tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    trail.forEach((p, i) => {
        p.age++;
        const opacity = 1 - p.age / 30;
        const size = (1 - p.age / 30) * 4;
        if (opacity > 0) {
            tCtx.beginPath();
            tCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
            tCtx.fillStyle = `rgba(139, 92, 246, ${opacity * 0.5})`;
            tCtx.fill();
        }
    });
    trail = trail.filter(p => p.age < 30);
    requestAnimationFrame(animateTrail);
}
animateTrail();

document.querySelectorAll('a, button, .tilt-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover');
        cursorRing.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover');
        cursorRing.classList.remove('hover');
    });
});

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) html.setAttribute('data-theme', savedTheme);

document.querySelectorAll('[data-tilt]').forEach(card => {
    const maxTilt = parseInt(card.dataset.tiltMax) || 10;

    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
});

const parallaxSections = document.querySelectorAll('[data-parallax]');
let ticking = false;

function updateParallax() {
    const scrollY = window.scrollY;
    parallaxSections.forEach(section => {
        const speed = parseFloat(section.dataset.parallax);
        const rect = section.getBoundingClientRect();
        const offset = (rect.top + scrollY - scrollY) * speed;
        section.style.transform = `translateY(${offset * 0.1}px)`;
    });
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const texts = ["Web Developer", "JavaScript Enthusiast", "Football Player", "Creative Coder", "Problem Solver"];
let ti = 0, ci = 0, del = false;
const typed = document.getElementById('typed');

function typewrite() {
    const t = texts[ti];
    typed.textContent = del ? t.slice(0, --ci) : t.slice(0, ++ci);
    let sp = del ? 40 : 100;
    if (!del && ci === t.length) { sp = 2500; del = true; }
    else if (del && ci === 0) { del = false; ti = (ti + 1) % texts.length; sp = 500; }
    setTimeout(typewrite, sp);
}
setTimeout(typewrite, 2000);

const ham = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

ham.addEventListener('click', () => {
    ham.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('active');
    navMenu.classList.remove('active');
}));

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (scrollY >= s.offsetTop - 300) current = s.id; });
    navLinks.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === '#' + current) a.classList.add('active');
    });
});

const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const fills = e.target.querySelectorAll('.fill');
            fills.forEach(f => f.style.width = f.dataset.level + '%');
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill, .skills-grid').forEach(el => skillObserver.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

const gameModal = document.getElementById('gameModal');
const gameClose = document.getElementById('gameClose');
const snakeCanvas = document.getElementById('snakeGame');
const ctx = snakeCanvas.getContext('2d');
const scoreEl = document.getElementById('score');

let snake = [{ x: 150, y: 150 }];
let food = { x: 0, y: 0 };
let dx = 10, dy = 0;
let score = 0;
let gameLoop = null;

function placeFood() {
    food.x = Math.floor(Math.random() * 30) * 10;
    food.y = Math.floor(Math.random() * 30) * 10;
}

function drawGame() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 300, 300);

    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(food.x + 5, food.y + 5, 5, 0, Math.PI * 2);
    ctx.fill();

    snake.forEach((segment, i) => {
        const gradient = ctx.createRadialGradient(segment.x + 5, segment.y + 5, 0, segment.x + 5, segment.y + 5, 5);
        gradient.addColorStop(0, '#a78bfa');
        gradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = i === 0 ? '#06b6d4' : gradient;
        ctx.fillRect(segment.x, segment.y, 10, 10);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (head.x >= 300) head.x = 0;
    if (head.x < 0) head.x = 290;
    if (head.y >= 300) head.y = 0;
    if (head.y < 0) head.y = 290;

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        resetGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        placeFood();
    } else {
        snake.pop();
    }

    drawGame();
}

function resetGame() {
    snake = [{ x: 150, y: 150 }];
    dx = 10; dy = 0;
    score = 0;
    scoreEl.textContent = score;
    placeFood();
}

function startGame() {
    resetGame();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(moveSnake, 100);
}

document.addEventListener('keydown', e => {
    if (!gameModal.classList.contains('active')) return;

    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
            if (dy !== 10) { dx = 0; dy = -10; } break;
        case 'ArrowDown': case 's': case 'S':
            if (dy !== -10) { dx = 0; dy = 10; } break;
        case 'ArrowLeft': case 'a': case 'A':
            if (dx !== 10) { dx = -10; dy = 0; } break;
        case 'ArrowRight': case 'd': case 'D':
            if (dx !== -10) { dx = 10; dy = 0; } break;
    }
});

let typedKeys = '';
document.addEventListener('keydown', e => {
    if (gameModal.classList.contains('active')) return;
    typedKeys += e.key.toLowerCase();
    if (typedKeys.includes('game')) {
        typedKeys = '';
        gameModal.classList.add('active');
        startGame();
    }
    if (typedKeys.length > 10) typedKeys = typedKeys.slice(-10);
});

gameClose.addEventListener('click', () => {
    gameModal.classList.remove('active');
    if (gameLoop) clearInterval(gameLoop);
});

console.log('%c⚡ Hey there, curious dev!', 'font-size: 24px; color: #8b5cf6; font-weight: bold;');
console.log('%c💜 Made with passion by Nimit Mishra', 'font-size: 14px; color: #a78bfa;');
console.log('%c🎮 Try typing "game" on the page for a surprise!', 'font-size: 12px; color: #06b6d4;');
