class TagCloud3D {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            console.warn('TagCloud3D: Container not found');
            return;
        }

        this.options = {
            radius: 120,
            maxSpeed: 0.04,
            initSpeed: 0.016,
            direction: 135,
            keep: true,
            useCSS3: true,
            ...options
        };

        this.tags = [];
        this.active = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseX0 = 0;
        this.mouseY0 = 0;
        this.radius = this.options.radius;
        this.fallLength = this.options.radius;
        this.CX = 0;
        this.CY = 0;
        this.EX = 0;
        this.EY = 0;
        this.sa = Math.sin(this.options.direction * (Math.PI / 180));
        this.ca = Math.cos(this.options.direction * (Math.PI / 180));
        this.speedX = this.options.initSpeed;
        this.speedY = this.options.initSpeed;

        this.init();
    }

    init() {
        this.addStyles();
        this.setupContainer();
        this.createTags();
        this.bindEvents();
        this.animate();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tag-cloud-3d {
                position: relative;
                width: 100%;
                height: 300px;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .tag-cloud-3d-item {
                position: absolute;
                top: 0;
                left: 0;
                color: #333;
                font-weight: 500;
                text-decoration: none;
                padding: 6px 12px;
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
                cursor: pointer;
                white-space: nowrap;
                user-select: none;
                transform-style: preserve-3d;
            }

            .tag-cloud-3d-item:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.4);
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                z-index: 100;
            }

            .tag-cloud-3d-item.size-1 {
                font-size: 12px;
                padding: 4px 8px;
            }

            .tag-cloud-3d-item.size-2 {
                font-size: 14px;
                padding: 5px 10px;
            }

            .tag-cloud-3d-item.size-3 {
                font-size: 16px;
                padding: 6px 12px;
            }

            .tag-cloud-3d-item.size-4 {
                font-size: 18px;
                padding: 7px 14px;
            }

            .tag-cloud-3d-item.size-5 {
                font-size: 20px;
                padding: 8px 16px;
            }

            .tag-cloud-3d-item.color-1 {
                color: #ff6b6b;
                border-color: rgba(255, 107, 107, 0.3);
            }

            .tag-cloud-3d-item.color-2 {
                color: #4ecdc4;
                border-color: rgba(78, 205, 196, 0.3);
            }

            .tag-cloud-3d-item.color-3 {
                color: #45b7d1;
                border-color: rgba(69, 183, 209, 0.3);
            }

            .tag-cloud-3d-item.color-4 {
                color: #96ceb4;
                border-color: rgba(150, 206, 180, 0.3);
            }

            .tag-cloud-3d-item.color-5 {
                color: #feca57;
                border-color: rgba(254, 202, 87, 0.3);
            }

            .tag-cloud-3d-item.color-6 {
                color: #ff9ff3;
                border-color: rgba(255, 159, 243, 0.3);
            }

            .tag-cloud-3d-item.color-7 {
                color: #54a0ff;
                border-color: rgba(84, 160, 255, 0.3);
            }

            .tag-cloud-3d-item.color-8 {
                color: #5f27cd;
                border-color: rgba(95, 39, 205, 0.3);
            }

            @media (max-width: 768px) {
                .tag-cloud-3d {
                    height: 250px;
                }

                .tag-cloud-3d-item {
                    font-size: 12px !important;
                    padding: 4px 8px !important;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .tag-cloud-3d-item {
                    transition: none;
                }

                .tag-cloud-3d-item:hover {
                    transform: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupContainer() {
        this.container.classList.add('tag-cloud-3d');
        
        const rect = this.container.getBoundingClientRect();
        this.CX = rect.width / 2;
        this.CY = rect.height / 2;
        this.EX = this.CX;
        this.EY = this.CY;
    }

    createTags() {
        const tagData = this.getTagData();
        
        tagData.forEach((tag, index) => {
            const element = document.createElement('a');
            element.className = 'tag-cloud-3d-item';
            element.textContent = tag.text;
            element.href = tag.url || '#';
            element.title = tag.title || tag.text;
            
            const sizeClass = `size-${Math.min(5, Math.max(1, tag.size || Math.ceil(Math.random() * 5)))}`;
            const colorClass = `color-${Math.ceil(Math.random() * 8)}`;
            element.classList.add(sizeClass, colorClass);
            
            if (tag.url) {
                element.addEventListener('click', (e) => {
                    if (tag.url === '#') {
                        e.preventDefault();
                    }
                });
            }

            this.container.appendChild(element);

            const phi = Math.acos(-1 + (2 * index) / tagData.length);
            const theta = Math.sqrt(tagData.length * Math.PI) * phi;

            const tagObj = {
                element: element,
                cx: this.radius * Math.cos(theta) * Math.sin(phi),
                cy: this.radius * Math.sin(theta) * Math.sin(phi),
                cz: this.radius * Math.cos(phi),
                x: 0,
                y: 0,
                z: 0
            };

            this.tags.push(tagObj);
        });
    }

    getTagData() {
        const existingTags = Array.from(document.querySelectorAll('.tag, .category, [class*="tag-"], [class*="category-"]'))
            .map(el => ({
                text: el.textContent.trim(),
                url: el.href || '#',
                size: Math.ceil(Math.random() * 5)
            }))
            .filter(tag => tag.text.length > 0)
            .slice(0, 30);

        if (existingTags.length > 0) {
            return existingTags;
        }

        return [
            { text: 'JavaScript', url: '#', size: 5 },
            { text: 'CSS', url: '#', size: 4 },
            { text: 'HTML', url: '#', size: 4 },
            { text: 'React', url: '#', size: 5 },
            { text: 'Vue.js', url: '#', size: 4 },
            { text: 'Node.js', url: '#', size: 4 },
            { text: 'Python', url: '#', size: 5 },
            { text: 'TypeScript', url: '#', size: 3 },
            { text: 'Webpack', url: '#', size: 3 },
            { text: 'Sass', url: '#', size: 2 },
            { text: 'Git', url: '#', size: 3 },
            { text: 'MongoDB', url: '#', size: 3 },
            { text: 'Express', url: '#', size: 3 },
            { text: 'Docker', url: '#', size: 2 },
            { text: 'AWS', url: '#', size: 2 },
            { text: 'GraphQL', url: '#', size: 2 },
            { text: 'Redux', url: '#', size: 2 },
            { text: 'Jest', url: '#', size: 1 },
            { text: 'Cypress', url: '#', size: 1 },
            { text: 'Figma', url: '#', size: 1 }
        ];
    }

    bindEvents() {
        this.container.addEventListener('mouseover', () => {
            this.active = true;
        });

        this.container.addEventListener('mouseout', () => {
            this.active = false;
        });

        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        const rect = this.container.getBoundingClientRect();
        this.CX = rect.width / 2;
        this.CY = rect.height / 2;
        this.EX = this.CX;
        this.EY = this.CY;
    }

    animate() {
        this.update();
        requestAnimationFrame(() => this.animate());
    }

    update() {
        if (this.active) {
            this.mouseX0 = this.mouseX - this.EX;
            this.mouseY0 = this.mouseY - this.EY;
            this.speedX = Math.min(Math.max(-this.options.maxSpeed, this.mouseX0 * 0.0001), this.options.maxSpeed);
            this.speedY = Math.min(Math.max(-this.options.maxSpeed, this.mouseY0 * 0.0001), this.options.maxSpeed);
        } else {
            this.speedX *= 0.98;
            this.speedY *= 0.98;
        }

        const sinSpeedX = Math.sin(this.speedX);
        const cosSpeedX = Math.cos(this.speedX);
        const sinSpeedY = Math.sin(this.speedY);
        const cosSpeedY = Math.cos(this.speedY);

        this.tags.forEach(tag => {
            const rx1 = tag.cx;
            const ry1 = tag.cy * this.ca + tag.cz * (-this.sa);
            const rz1 = tag.cy * this.sa + tag.cz * this.ca;

            const rx2 = rx1 * cosSpeedY + rz1 * sinSpeedY;
            const ry2 = ry1;
            const rz2 = rx1 * (-sinSpeedY) + rz1 * cosSpeedY;

            const rx3 = rx2;
            const ry3 = ry2 * cosSpeedX + rz2 * sinSpeedX;
            const rz3 = ry2 * (-sinSpeedX) + rz2 * cosSpeedX;

            tag.cx = rx3;
            tag.cy = ry3;
            tag.cz = rz3;

            const per = this.options.radius / (this.options.radius + rz3);
            tag.x = rx3 * per;
            tag.y = ry3 * per;
            tag.z = rz3;

            const alpha = (rz3 + this.radius) / (2 * this.radius);
            const scale = alpha * per;
            const zIndex = Math.floor(alpha * 100);

            if (this.options.useCSS3) {
                const transform = `translate3d(${this.CX + tag.x - tag.element.offsetWidth / 2}px, ${this.CY + tag.y - tag.element.offsetHeight / 2}px, 0) scale(${scale})`;
                tag.element.style.transform = transform;
                tag.element.style.opacity = alpha;
                tag.element.style.zIndex = zIndex;
            } else {
                tag.element.style.left = this.CX + tag.x - tag.element.offsetWidth / 2 + 'px';
                tag.element.style.top = this.CY + tag.y - tag.element.offsetHeight / 2 + 'px';
                tag.element.style.opacity = alpha;
                tag.element.style.zIndex = zIndex;
                tag.element.style.transform = `scale(${scale})`;
            }
        });
    }

    pause() {
        this.active = false;
    }

    resume() {
        this.active = true;
    }

    destroy() {
        this.tags.forEach(tag => {
            if (tag.element && tag.element.parentNode) {
                tag.element.parentNode.removeChild(tag.element);
            }
        });
        this.tags = [];
    }
}

if (typeof window !== 'undefined') {
    window.TagCloud3D = TagCloud3D;
    
    document.addEventListener('DOMContentLoaded', () => {
        const tagCloudContainer = document.querySelector('.tag-cloud-container, .tags-container, #tag-cloud');
        
        if (!tagCloudContainer) {
            const container = document.createElement('div');
            container.id = 'tag-cloud';
            container.style.cssText = `
                margin: 2rem 0;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            const title = document.createElement('h3');
            title.textContent = '🏷️ Tags Cloud';
            title.style.cssText = `
                text-align: center;
                margin-bottom: 1rem;
                color: #333;
                font-size: 1.2rem;
            `;
            
            container.appendChild(title);
            
            const sidebar = document.querySelector('.sidebar, .aside, aside');
            const main = document.querySelector('.main, main, .content');
            const target = sidebar || main || document.body;
            
            if (target) {
                target.appendChild(container);
                window.tagCloud3D = new TagCloud3D(container);
            }
        } else {
            window.tagCloud3D = new TagCloud3D(tagCloudContainer);
        }
    });
}