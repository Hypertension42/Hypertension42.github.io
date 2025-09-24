class RainbowMouseTrail {
    constructor() {
        this.particles = [];
        this.colors = [
            '#ff0000', '#ff8000', '#ffff00', '#80ff00',
            '#00ff00', '#00ff80', '#00ffff', '#0080ff',
            '#0000ff', '#8000ff', '#ff00ff', '#ff0080'
        ];
        this.canvas = null;
        this.ctx = null;
        this.isEnabled = true;
        this.init();
    }

    init() {
        if (!this.respectsMotionPreference()) return;
        
        this.createCanvas();
        this.bindEvents();
        this.animate();
    }

    respectsMotionPreference() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        return !prefersReducedMotion.matches;
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.style.opacity = '0.8';
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        document.body.appendChild(this.canvas);
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            if (Math.random() < 0.4) {
                this.createTrailParticle(e.clientX, e.clientY);
            }
        });

        document.addEventListener('click', (e) => {
            this.createClickExplosion(e.clientX, e.clientY);
        });
    }

    createTrailParticle(x, y) {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.02,
            size: 2 + Math.random() * 3,
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        };
        
        this.particles.push(particle);
    }

    createClickExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const velocity = 3 + Math.random() * 5;
            
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.015,
                size: 3 + Math.random() * 4,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            };
            
            this.particles.push(particle);
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        this.canvas.style.display = this.isEnabled ? 'block' : 'none';
    }

    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.particles = [];
    }
}

if (typeof window !== 'undefined') {
    window.rainbowMouseTrail = new RainbowMouseTrail();
}