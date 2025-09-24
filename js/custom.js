// 自定义JavaScript增强效果

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 鼠标跟随彩色粒子效果
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: hsl(${Math.random() * 360}, 70%, 60%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x}px;
            top: ${y}px;
            animation: particleFloat 2s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            document.body.removeChild(particle);
        }, 2000);
    }
    
    // 添加粒子动画CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0% {
                opacity: 1;
                transform: translate(0, 0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
            }
        }
        
        @keyframes textGlow {
            0%, 100% { text-shadow: 0 0 5px rgba(102, 126, 234, 0.5); }
            50% { text-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(118, 75, 162, 0.6); }
        }
        
        .glow-text {
            animation: textGlow 3s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
    
    // 鼠标移动时创建粒子（减少频率）
    let particleTimer;
    document.addEventListener('mousemove', function(e) {
        if (particleTimer) return;
        particleTimer = setTimeout(() => {
            if (Math.random() < 0.3) { // 30%概率生成粒子
                createParticle(e.clientX, e.clientY);
            }
            particleTimer = null;
        }, 50);
    });
    
    // 2. 平滑滚动增强
    function smoothScrollTo(target, duration = 800) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;
        
        const targetPosition = targetElement.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function easeInOutCubic(t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t*t + b;
            t -= 2;
            return c/2*(t*t*t + 2) + b;
        }
        
        requestAnimationFrame(animation);
    }
    
    // 3. 卡片视差效果
    function addParallaxEffect() {
        const cards = document.querySelectorAll('.card-widget, .recent-post-item');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }
    
    // 4. 文字逐字显示动画
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function typing() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typing, speed);
            }
        }
        typing();
    }
    
    // 5. 滚动触发动画
    function handleScrollAnimations() {
        const animateElements = document.querySelectorAll('.card-widget, .recent-post-item, #post');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // 6. 动态背景星空效果
    function createStarfield() {
        const starfield = document.createElement('div');
        starfield.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 3 + 2}s infinite;
            `;
            starfield.appendChild(star);
        }
        
        // 添加闪烁动画
        const twinkleStyle = document.createElement('style');
        twinkleStyle.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(twinkleStyle);
        
        document.body.appendChild(starfield);
    }
    
    // 7. 代码块复制功能增强
    function enhanceCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre');
        
        codeBlocks.forEach(block => {
            // 添加语言标签
            const code = block.querySelector('code');
            if (code && code.className) {
                const lang = code.className.replace('language-', '');
                const langLabel = document.createElement('div');
                langLabel.textContent = lang.toUpperCase();
                langLabel.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #fff;
                `;
                block.style.position = 'relative';
                block.appendChild(langLabel);
            }
        });
    }
    
    // 8. 搜索功能增强
    function enhanceSearch() {
        const searchInput = document.querySelector('.search-dialog input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                // 添加搜索建议逻辑
                console.log('搜索:', e.target.value);
            });
        }
    }
    
    // 初始化所有功能
    setTimeout(() => {
        addParallaxEffect();
        handleScrollAnimations();
        createStarfield();
        enhanceCodeBlocks();
        enhanceSearch();
        
        // 为标题添加发光效果
        const siteTitle = document.querySelector('#site-title');
        if (siteTitle) {
            siteTitle.classList.add('glow-text');
        }
    }, 1000);
    
    // 9. 主题切换动画
    const darkModeBtn = document.querySelector('#darkmode');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', function() {
            document.body.style.transition = 'all 0.3s ease';
        });
    }
    
    // 10. 页面加载进度条
    function showLoadingProgress() {
        const progress = document.createElement('div');
        progress.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            z-index: 10000;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progress);
        
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 10;
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                setTimeout(() => {
                    progress.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(progress);
                    }, 300);
                }, 500);
            }
            progress.style.width = width + '%';
        }, 100);
    }
    
    // 显示加载进度
    showLoadingProgress();
});

// 控制台彩蛋
console.log('%c欢迎来到 M1yak0 SEKAI! 🎉', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%c如果你看到这个消息，说明你也是一个开发者! 👨‍💻', 'color: #764ba2; font-size: 16px;');
console.log('%c一起探索代码的魅力吧! ✨', 'color: #f093fb; font-size: 14px;');