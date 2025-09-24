// 自定义JavaScript增强效果

// 公告栏增强系统初始化
let announcementSystem = null;

document.addEventListener('DOMContentLoaded', function() {
    
    // 初始化公告栏增强系统
    initAnnouncementSystem();
    
    // 1. 🌈 鼠标彩虹轨迹特效 (增强版)
    function createRainbowTrail(x, y) {
        const trail = document.createElement('div');
        const colors = [
            '#ff0080', '#ff8000', '#ffff00', '#80ff00',
            '#00ff00', '#00ff80', '#00ffff', '#0080ff',
            '#0000ff', '#8000ff', '#ff00ff', '#ff0040'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        
        trail.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x - size/2}px;
            top: ${y - size/2}px;
            box-shadow: 0 0 ${size*2}px ${color};
            animation: rainbowTrailFade 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        `;
        
        document.body.appendChild(trail);
        
        setTimeout(() => {
            if (trail && trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 1200);
    }
    
    // 鼠标点击爆炸效果
    function createClickExplosion(x, y) {
        const particleCount = 12;
        const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = Math.random() * 80 + 40;
            const size = Math.random() * 6 + 3;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 ${size*3}px ${color};
            `;
            
            document.body.appendChild(particle);
            
            const endX = x + Math.cos(angle) * velocity;
            const endY = y + Math.sin(angle) * velocity;
            
            particle.animate([
                {
                    transform: `translate(0, 0) scale(1)`,
                    opacity: 1
                },
                {
                    transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                if (particle && particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            };
        }
    }
    
    // 添加新的动画样式CSS
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
        
        @keyframes rainbowTrailFade {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            50% {
                opacity: 0.8;
                transform: scale(1.2);
            }
            100% {
                opacity: 0;
                transform: scale(0) translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px);
            }
        }
        
        @keyframes textGlow {
            0%, 100% { text-shadow: 0 0 5px rgba(102, 126, 234, 0.5); }
            50% { text-shadow: 0 0 20px rgba(102, 126, 234, 0.8), 0 0 30px rgba(118, 75, 162, 0.6); }
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        @keyframes trailFade {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0) translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px);
            }
        }
        
        .glow-text {
            animation: textGlow 3s ease-in-out infinite;
        }
        
        /* 📊 阅读进度条样式 */
        #reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(90deg, 
                #667eea 0%, 
                #764ba2 25%, 
                #f093fb 50%, 
                #f5576c 75%, 
                #667eea 100%);
            background-size: 200% 100%;
            box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
            z-index: 9998;
            width: 0%;
            transition: width 0.3s ease, opacity 0.3s ease;
            animation: gradientShift 3s ease-in-out infinite;
        }
        
        /* 📋 代码复制按钮样式 */
        .code-copy-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.1) !important;
            color: #fff !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 6px !important;
            padding: 8px 10px !important;
            cursor: pointer !important;
            font-size: 14px !important;
            transition: all 0.3s ease !important;
            backdrop-filter: blur(10px) !important;
            z-index: 10 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        
        .code-copy-btn:hover {
            background: rgba(102, 126, 234, 0.8) !important;
            transform: scale(1.05) !important;
        }
        
        .code-copy-btn.success {
            background: rgba(16, 185, 129, 0.8) !important;
        }
        
        .code-copy-btn.error {
            background: rgba(239, 68, 68, 0.8) !important;
        }
    `;
    document.head.appendChild(style);
    
    // 鼠标移动时创建彩虹轨迹（增强版）
    let trailTimer;
    document.addEventListener('mousemove', function(e) {
        if (trailTimer) return;
        trailTimer = setTimeout(() => {
            if (Math.random() < 0.4) { // 40%概率生成轨迹
                createRainbowTrail(e.clientX, e.clientY);
            }
            trailTimer = null;
        }, 30); // 更高频率
    });
    
    // 鼠标点击时创建爆炸效果
    document.addEventListener('click', function(e) {
        createClickExplosion(e.clientX, e.clientY);
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
    
    // 7. 📊 阅读进度条系统
    function initReadingProgress() {
        // 只在文章页面显示
        if (!document.querySelector('#article-container')) {
            return;
        }

        const progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        document.body.appendChild(progressBar);
        
        let ticking = false;
        
        const updateProgress = () => {
            const article = document.querySelector('#article-container');
            if (!article) return;
            
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            const progress = (scrollTop / documentHeight) * 100;
            const clampedProgress = Math.min(Math.max(progress, 0), 100);
            
            progressBar.style.width = `${clampedProgress}%`;
            
            // 进度条透明度随滚动调整
            if (clampedProgress < 1) {
                progressBar.style.opacity = '0';
            } else {
                progressBar.style.opacity = '1';
            }
            
            ticking = false;
        };
        
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', onScroll);
        updateProgress(); // 初始化进度
    }
    
    // 8. 📋 代码复制功能增强
    function enhanceCodeBlocks() {
        // 等待页面加载完成后初始化
        setTimeout(() => {
            const codeBlocks = document.querySelectorAll('pre code, .highlight pre, figure.highlight pre');
            
            codeBlocks.forEach((block, index) => {
                const pre = block.closest('pre') || block.closest('figure');
                if (!pre || pre.querySelector('.code-copy-btn')) {
                    return; // 避免重复添加
                }
                
                createCopyButton(pre, block, index);
            });
        }, 1000);
    }
    
    function createCopyButton(pre, codeBlock, index) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = '复制代码';
        
        // 复制功能
        copyBtn.addEventListener('click', async () => {
            try {
                const code = getCodeText(codeBlock);
                
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(code);
                } else {
                    // 降级方案
                    fallbackCopyTextToClipboard(code);
                }
                
                // 成功反馈
                showCopySuccess(copyBtn);
                
            } catch (err) {
                console.error('复制失败:', err);
                showCopyError(copyBtn);
            }
        });
        
        // 设置pre为相对定位
        pre.style.position = 'relative';
        pre.appendChild(copyBtn);
        
        // 添加语言标签（如果有）
        addLanguageLabel(pre, codeBlock);
    }
    
    function getCodeText(codeBlock) {
        // 处理不同类型的代码块
        if (codeBlock.tagName === 'PRE') {
            return codeBlock.textContent || codeBlock.innerText;
        } else if (codeBlock.tagName === 'CODE') {
            return codeBlock.textContent || codeBlock.innerText;
        } else {
            // 对于 figure.highlight 等复杂结构
            const codeElement = codeBlock.querySelector('code') || codeBlock;
            return codeElement.textContent || codeElement.innerText;
        }
    }
    
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    
    function showCopySuccess(button) {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('success');
        button.title = '复制成功！';
        
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.classList.remove('success');
            button.title = '复制代码';
        }, 2000);
    }
    
    function showCopyError(button) {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-times"></i>';
        button.classList.add('error');
        button.title = '复制失败';
        
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.classList.remove('error');
            button.title = '复制代码';
        }, 2000);
    }
    
    function addLanguageLabel(pre, codeBlock) {
        const code = codeBlock.querySelector ? codeBlock.querySelector('code') : codeBlock;
        if (code && code.className) {
            const langMatch = code.className.match(/language-(\w+)/);
            if (langMatch) {
                const lang = langMatch[1];
                const langLabel = document.createElement('div');
                langLabel.textContent = lang.toUpperCase();
                langLabel.style.cssText = `
                    position: absolute;
                    top: 10px;
                    left: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    color: #fff;
                    opacity: 0.7;
                    font-family: 'Consolas', 'Monaco', monospace;
                `;
                pre.appendChild(langLabel);
            }
        }
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
        initReadingProgress(); // 新增：阅读进度条
        enhanceCodeBlocks(); // 更新：代码块增强
        enhanceSearch();
        
        // 为标题添加发光效果
        const siteTitle = document.querySelector('#site-title');
        if (siteTitle) {
            siteTitle.classList.add('glow-text');
        }
        
        // 初始化公告栏增强系统（延迟初始化以确保主题加载完成）
        initEnhancedAnnouncement();
        
        console.log('🎉 所有增强功能初始化完成！');
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

// ===== 公告栏增强系统 ===== 

/**
 * 初始化公告栏增强系统
 */
function initAnnouncementSystem() {
    // 检查是否已加载必要的类
    if (typeof AnnouncementConfigManager === 'undefined' || 
        typeof AnnouncementFileManager === 'undefined' || 
        typeof AnnouncementEnhanced === 'undefined') {
        console.warn('公告栏增强系统依赖未加载，将使用默认公告栏');
        return;
    }
    
    console.log('初始化公告栏增强系统...');
    
    // 初始化配置管理器
    const configManager = new AnnouncementConfigManager();
    
    // 初始化文件管理器
    const fileManager = new AnnouncementFileManager();
    
    // 全局存储
    window.announcementConfigManager = configManager;
    window.announcementFileManager = fileManager;
}

/**
 * 初始化增强公告栏
 */
function initEnhancedAnnouncement() {
    try {
        // 从全局配置加载设置
        const globalConfig = loadAnnouncementConfig();
        
        if (!globalConfig || !globalConfig.enable) {
            console.log('增强公告栏未启用');
            return;
        }
        
        console.log('初始化增强公告栏，配置:', globalConfig);
        
        // 创建增强公告栏实例
        if (typeof AnnouncementEnhanced !== 'undefined') {
            announcementSystem = new AnnouncementEnhanced(globalConfig);
            
            // 全局存储
            window.announcementSystem = announcementSystem;
            
            console.log('增强公告栏初始化成功');
        } else {
            console.error('增强公告栏类未加载');
        }
        
    } catch (error) {
        console.error('增强公告栏初始化失败:', error);
        
        // 降级处理：显示基本公告栏
        showFallbackAnnouncement();
    }
}

/**
 * 加载公告栏配置
 */
function loadAnnouncementConfig() {
    try {
        // 从全局配置加载（模拟从_config.butterfly.yml加载）
        // 在实际应用中，这些配置会通过Hexo渲染到页面中
        const config = {
            enable: true,
            basic: {
                title: "🎉 网站公告",
                show_icon: true,
                icon: "fas fa-bullhorn",
                id: "main_announcement"
            },
            content_source: {
                type: "file",  // 从文件加载
                file_path: "/source/announcements/current.md"
            },
            display: {
                theme: "glassmorphism",
                position: "sidebar",
                max_height: "400px",
                show_date: true,
                show_author: false,
                priority: 1
            },
            interaction: {
                closable: true,
                remember_close: true,
                close_expires_hours: 24,
                auto_refresh: false,
                refresh_interval: 300000,
                expandable: true
            },
            animation: {
                entrance: "fadeInUp",
                exit: "fadeOutDown",
                duration: 500,
                delay: 1500,  // 延迟1.5秒显示以避免与页面加载冲突
                hover_effect: true
            },
            responsive: {
                mobile_position: "top",
                tablet_position: "sidebar",
                desktop_position: "sidebar"
            }
        };
        
        // 尝试从本地存储加载用户自定义配置
        const customConfig = loadCustomConfig();
        if (customConfig) {
            return mergeConfig(config, customConfig);
        }
        
        return config;
        
    } catch (error) {
        console.error('加载公告栏配置失败:', error);
        return null;
    }
}

/**
 * 加载用户自定义配置
 */
function loadCustomConfig() {
    try {
        const stored = localStorage.getItem('announcement_custom_config');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.warn('加载用户自定义配置失败:', error);
        return null;
    }
}

/**
 * 合并配置
 */
function mergeConfig(defaultConfig, customConfig) {
    return deepMerge(defaultConfig, customConfig);
}

/**
 * 深度合并对象
 */
function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    
    return result;
}

/**
 * 降级处理：显示基本公告栏
 */
function showFallbackAnnouncement() {
    console.log('使用降级公告栏');
    
    // 检查是否已有基本公告栏
    const existingAnnouncement = document.querySelector('.card-announcement');
    if (existingAnnouncement) {
        // 添加一些增强效果
        enhanceBasicAnnouncement(existingAnnouncement);
        return;
    }
    
    // 创建简单的公告栏
    createBasicAnnouncement();
}

/**
 * 增强基本公告栏
 */
function enhanceBasicAnnouncement(element) {
    // 添加动画效果
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'all 0.6s ease-out';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 1500);
    
    // 添加悬浮效果
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px) scale(1.01)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
}

/**
 * 创建基本公告栏
 */
function createBasicAnnouncement() {
    const container = document.createElement('div');
    container.className = 'card-widget card-announcement';
    container.innerHTML = `
        <div class="card-content">
            <div class="item-headline">
                <i class="fas fa-bullhorn"></i>
                <span>网站公告</span>
            </div>
            <div>
                欢迎来到 M1yak0 SEKAI! 🎉<br>
                这里是我的个人博客，分享编程技术和生活思考。<br>
                <a href="https://github.com/Hypertension42" target="_blank">⭐ 关注我的GitHub</a>
            </div>
        </div>
    `;
    
    // 插入到侧边栏
    const sidebar = document.querySelector('#aside-content .sticky_layout') || 
                   document.querySelector('#aside-content');
    
    if (sidebar) {
        sidebar.appendChild(container);
        enhanceBasicAnnouncement(container);
    }
}

// ===== 公告栏工具函数 ===== 

/**
 * 刷新公告栏
 */
function refreshAnnouncement() {
    if (announcementSystem && typeof announcementSystem.refresh === 'function') {
        announcementSystem.refresh();
    } else {
        console.log('增强公告栏未初始化，重新加载页面');
        location.reload();
    }
}

/**
 * 关闭公告栏
 */
function closeAnnouncement() {
    if (announcementSystem && typeof announcementSystem.close === 'function') {
        announcementSystem.close();
    } else {
        // 对基本公告栏的处理
        const announcement = document.querySelector('.card-announcement');
        if (announcement) {
            announcement.style.transition = 'all 0.3s ease-out';
            announcement.style.opacity = '0';
            announcement.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                announcement.remove();
            }, 300);
        }
    }
}

/**
 * 切换公告栏展开状态
 */
function toggleAnnouncementExpand() {
    if (announcementSystem && typeof announcementSystem.toggleExpand === 'function') {
        announcementSystem.toggleExpand();
    }
}

/**
 * 获取公告栏统计信息
 */
function getAnnouncementStats() {
    if (window.announcementFileManager) {
        return window.announcementFileManager.getStats();
    }
    return null;
}

// ===== 全局可用函数 ===== 

// 将函数添加到全局作用域
window.refreshAnnouncement = refreshAnnouncement;
window.closeAnnouncement = closeAnnouncement;
window.toggleAnnouncementExpand = toggleAnnouncementExpand;
window.getAnnouncementStats = getAnnouncementStats;

// ===== 调试模式 ===== 

// 在控制台中添加调试信息
if (typeof console !== 'undefined') {
    console.log('%c公告栏增强系统已加载! 🎉', 'color: #667eea; font-size: 16px; font-weight: bold;');
    console.log('%c使用 window.refreshAnnouncement() 刷新公告栏', 'color: #764ba2; font-size: 12px;');
    console.log('%c使用 window.getAnnouncementStats() 查看统计信息', 'color: #764ba2; font-size: 12px;');
}