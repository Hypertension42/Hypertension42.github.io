class ReadingProgress {
    constructor() {
        this.progressBar = null;
        this.isArticlePage = false;
        this.init();
    }

    init() {
        this.checkIfArticlePage();
        if (this.isArticlePage) {
            this.createProgressBar();
            this.bindScrollEvent();
        }
    }

    checkIfArticlePage() {
        const postContent = document.querySelector('.post-content, .post, article, .content');
        const isHomePage = document.querySelector('.home, .index');
        this.isArticlePage = postContent && !isHomePage;
    }

    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'reading-progress-bar';
        this.progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        
        const style = document.createElement('style');
        style.textContent = `
            .reading-progress-bar {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                z-index: 10000;
                transition: opacity 0.3s ease;
            }

            .reading-progress-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(
                    90deg,
                    #ff0000 0%,
                    #ff8000 8.33%,
                    #ffff00 16.66%,
                    #80ff00 25%,
                    #00ff00 33.33%,
                    #00ff80 41.66%,
                    #00ffff 50%,
                    #0080ff 58.33%,
                    #0000ff 66.66%,
                    #8000ff 75%,
                    #ff00ff 83.33%,
                    #ff0080 91.66%,
                    #ff0000 100%
                );
                background-size: 200% 100%;
                animation: rainbow-flow 3s linear infinite;
                transition: width 0.1s ease-out;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            }

            @keyframes rainbow-flow {
                0% { background-position: 0% 0%; }
                100% { background-position: 200% 0%; }
            }

            @media (prefers-reduced-motion: reduce) {
                .reading-progress-fill {
                    animation: none;
                    background: linear-gradient(90deg, #4a90e2, #7b68ee);
                }
            }

            @media (max-width: 768px) {
                .reading-progress-bar {
                    height: 3px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.progressBar);
    }

    bindScrollEvent() {
        let ticking = false;
        
        const updateProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
            
            const fill = this.progressBar.querySelector('.reading-progress-fill');
            fill.style.width = `${progress * 100}%`;
            
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', requestTick, { passive: true });
        
        updateProgress();
    }

    hide() {
        if (this.progressBar) {
            this.progressBar.style.opacity = '0';
        }
    }

    show() {
        if (this.progressBar) {
            this.progressBar.style.opacity = '1';
        }
    }

    destroy() {
        if (this.progressBar && this.progressBar.parentNode) {
            this.progressBar.parentNode.removeChild(this.progressBar);
        }
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.readingProgress = new ReadingProgress();
    });
}