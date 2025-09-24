class ImageZoom {
    constructor() {
        this.overlay = null;
        this.currentImage = null;
        this.isZoomed = false;
        this.init();
    }

    init() {
        this.addStyles();
        this.bindEvents();
        this.observeNewImages();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .image-zoom-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: zoom-out;
            }

            .image-zoom-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .image-zoom-container {
                position: relative;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .image-zoom-img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                transform: scale(0.8);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .image-zoom-overlay.active .image-zoom-img {
                transform: scale(1);
            }

            .image-zoom-close {
                position: absolute;
                top: -50px;
                right: -50px;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: white;
                transition: all 0.2s ease;
                z-index: 10002;
            }

            .image-zoom-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            .image-zoom-info {
                position: absolute;
                bottom: -60px;
                left: 0;
                right: 0;
                text-align: center;
                color: white;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
            }

            .image-zoom-overlay.active .image-zoom-info {
                opacity: 1;
                transform: translateY(0);
            }

            .image-zoom-controls {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                gap: 20px;
            }

            .image-zoom-controls.left {
                left: -80px;
            }

            .image-zoom-controls.right {
                right: -80px;
            }

            .image-zoom-nav {
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: white;
                transition: all 0.2s ease;
                opacity: 0;
            }

            .image-zoom-nav:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.1);
            }

            .image-zoom-overlay.active .image-zoom-nav {
                opacity: 1;
            }

            .zoomable-image {
                cursor: zoom-in;
                transition: all 0.3s ease;
                border-radius: 8px;
            }

            .zoomable-image:hover {
                transform: scale(1.02);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .image-zoom-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 16px;
            }

            .image-zoom-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 10px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .image-zoom-container {
                    max-width: 95vw;
                    max-height: 95vh;
                }

                .image-zoom-close {
                    top: -40px;
                    right: -40px;
                    width: 35px;
                    height: 35px;
                }

                .image-zoom-info {
                    bottom: -50px;
                    font-size: 12px;
                    padding: 8px 12px;
                }

                .image-zoom-controls.left {
                    left: -60px;
                }

                .image-zoom-controls.right {
                    right: -60px;
                }

                .image-zoom-nav {
                    width: 40px;
                    height: 40px;
                }
            }

            @media (max-width: 480px) {
                .image-zoom-close {
                    top: 10px;
                    right: 10px;
                }

                .image-zoom-info {
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                }

                .image-zoom-controls {
                    display: none;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .image-zoom-overlay,
                .image-zoom-img,
                .image-zoom-close,
                .image-zoom-info,
                .image-zoom-nav,
                .zoomable-image {
                    transition: none;
                }

                .zoomable-image:hover {
                    transform: none;
                }

                .image-zoom-spinner {
                    animation: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const img = e.target.closest('img');
            if (img && this.isZoomableImage(img)) {
                e.preventDefault();
                this.openZoom(img);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.isZoomed) {
                switch (e.key) {
                    case 'Escape':
                        this.closeZoom();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });
    }

    isZoomableImage(img) {
        if (img.closest('.image-zoom-overlay')) return false;
        if (img.classList.contains('no-zoom')) return false;
        if (img.width < 100 || img.height < 100) return false;
        
        return true;
    }

    makeImageZoomable(img) {
        if (this.isZoomableImage(img)) {
            img.classList.add('zoomable-image');
            img.title = img.title || 'Click to zoom';
        }
    }

    openZoom(img) {
        if (this.isZoomed) return;
        
        this.isZoomed = true;
        this.currentImage = img;
        
        this.createOverlay();
        this.loadZoomedImage(img);
        
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            this.overlay.classList.add('active');
        }, 10);
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'image-zoom-overlay';
        
        this.overlay.innerHTML = `
            <div class="image-zoom-container">
                <div class="image-zoom-loading">
                    <div class="image-zoom-spinner"></div>
                    Loading...
                </div>
                <button class="image-zoom-close" title="Close (Esc)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="image-zoom-controls left">
                    <button class="image-zoom-nav prev" title="Previous (←)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                    </button>
                </div>
                <div class="image-zoom-controls right">
                    <button class="image-zoom-nav next" title="Next (→)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeZoom();
            }
        });
        
        this.overlay.querySelector('.image-zoom-close').addEventListener('click', () => {
            this.closeZoom();
        });
        
        this.overlay.querySelector('.prev').addEventListener('click', () => {
            this.previousImage();
        });
        
        this.overlay.querySelector('.next').addEventListener('click', () => {
            this.nextImage();
        });
    }

    loadZoomedImage(img) {
        const container = this.overlay.querySelector('.image-zoom-container');
        const loading = container.querySelector('.image-zoom-loading');
        
        const zoomedImg = document.createElement('img');
        zoomedImg.className = 'image-zoom-img';
        zoomedImg.alt = img.alt || '';
        
        zoomedImg.onload = () => {
            loading.style.display = 'none';
            container.appendChild(zoomedImg);
            
            if (img.alt || img.title) {
                const info = document.createElement('div');
                info.className = 'image-zoom-info';
                info.textContent = img.alt || img.title;
                container.appendChild(info);
            }
        };
        
        zoomedImg.onerror = () => {
            loading.innerHTML = `
                <div style="color: #ff6b6b;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <div>Failed to load image</div>
                </div>
            `;
        };
        
        zoomedImg.src = img.src;
    }

    closeZoom() {
        if (!this.isZoomed) return;
        
        this.overlay.classList.remove('active');
        
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.currentImage = null;
            this.isZoomed = false;
            document.body.style.overflow = '';
        }, 300);
    }

    getAllImages() {
        return Array.from(document.querySelectorAll('img')).filter(img => 
            this.isZoomableImage(img)
        );
    }

    previousImage() {
        const images = this.getAllImages();
        const currentIndex = images.indexOf(this.currentImage);
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        
        if (images[prevIndex]) {
            this.switchToImage(images[prevIndex]);
        }
    }

    nextImage() {
        const images = this.getAllImages();
        const currentIndex = images.indexOf(this.currentImage);
        const nextIndex = (currentIndex + 1) % images.length;
        
        if (images[nextIndex]) {
            this.switchToImage(images[nextIndex]);
        }
    }

    switchToImage(img) {
        this.currentImage = img;
        
        const container = this.overlay.querySelector('.image-zoom-container');
        const oldImg = container.querySelector('.image-zoom-img');
        const oldInfo = container.querySelector('.image-zoom-info');
        const loading = container.querySelector('.image-zoom-loading');
        
        if (oldImg) oldImg.remove();
        if (oldInfo) oldInfo.remove();
        
        loading.style.display = 'block';
        this.loadZoomedImage(img);
    }

    observeNewImages() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                        images.forEach(img => this.makeImageZoomable(img));
                        
                        if (node.tagName === 'IMG') {
                            this.makeImageZoomable(node);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        document.querySelectorAll('img').forEach(img => {
            this.makeImageZoomable(img);
        });
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.imageZoom = new ImageZoom();
    });
}