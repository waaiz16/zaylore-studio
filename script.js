/* ============================================================
   ZaylaStudio — Particle Animation & Interactions (Optimized)
   ============================================================ */

(function () {
    'use strict';

    // ---- Particle System ----
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };
    let animationId;
    let isPageVisible = true;

    // Pause when tab is not visible
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible && !animationId) animate();
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            initParticles();
        }, 250);
    });
    resize();

    // Throttled mouse tracking (every 32ms ≈ 30fps)
    let mouseThrottled = false;
    window.addEventListener('mousemove', (e) => {
        if (mouseThrottled) return;
        mouseThrottled = true;
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        setTimeout(() => { mouseThrottled = false; }, 32);
    }, { passive: true });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    }, { passive: true });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;

            // Pre-compute color string once
            const rand = Math.random();
            if (rand < 0.6) {
                this.color = `rgba(212, 25, 32, ${this.opacity})`;
            } else if (rand < 0.85) {
                this.color = `rgba(255, 42, 42, ${this.opacity * 0.7})`;
            } else {
                this.color = `rgba(200, 200, 200, ${this.opacity * 0.5})`;
            }
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse repulsion (use squared distance to avoid sqrt)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distSq = dx * dx + dy * dy;
                const radiusSq = mouse.radius * mouse.radius;

                if (distSq < radiusSq) {
                    const dist = Math.sqrt(distSq); // only sqrt when needed
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 2;
                    this.y += Math.sin(angle) * force * 2;
                }
            }

            // Wrap around edges
            const w = canvas.width;
            const h = canvas.height;
            if (this.x < 0) this.x = w;
            else if (this.x > w) this.x = 0;
            if (this.y < 0) this.y = h;
            else if (this.y > h) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, 6.2832); // 2*PI pre-calculated
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Cap particle count: fewer particles = much faster
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 80);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        const len = particles.length;
        const connectionDistSq = 90 * 90; // Slightly shorter connection range

        ctx.lineWidth = 0.5;

        for (let i = 0; i < len; i++) {
            const pi = particles[i];
            for (let j = i + 1; j < len; j++) {
                const pj = particles[j];
                const dx = pi.x - pj.x;
                const dy = pi.y - pj.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < connectionDistSq) {
                    // Approximate opacity without sqrt
                    const opacity = (1 - distSq / connectionDistSq) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(212, 25, 32, ${opacity})`;
                    ctx.moveTo(pi.x, pi.y);
                    ctx.lineTo(pj.x, pj.y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        if (!isPageVisible) {
            animationId = null;
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const len = particles.length;
        for (let i = 0; i < len; i++) {
            particles[i].update();
            particles[i].draw();
        }

        connectParticles();
        animationId = requestAnimationFrame(animate);
    }

    initParticles();
    animate();


    // ---- Navigation Interactions ----
    const nav = document.getElementById('main-nav');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

})();
