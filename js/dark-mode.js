// ===============================
// 🌙 Dark Mode 完整实现系统 v2.0
// ===============================

class DarkModeManager {
    constructor() {
        this.isDark = false;
        this.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        this.isInitialized = false;
        this.init();
    }

    init() {
        try {
            // 防止重复初始化
            if (this.isInitialized) return;
            
            // 等待DOM准备就绪
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeTheme());
            } else {
                this.initializeTheme();
            }
            
            this.isInitialized = true;
            console.log('🌙 Dark Mode 系统初始化完成');
        } catch (error) {
            console.error('❌ Dark Mode 初始化失败:', error);
        }
    }

    initializeTheme() {
        // 加载保存的主题
        this.loadTheme();
        
        // 初始化切换按钮
        this.initToggleButton();
        
        // 添加过渡动画
        this.addTransitions();
        
        // 监听系统主题变化
        this.watchSystemTheme();
        
        // 添加键盘快捷键支持
        this.addKeyboardShortcut();
    }

    loadTheme() {
        try {
            // 获取保存的主题偏好
            const savedTheme = localStorage.getItem('theme-preference');
            
            if (savedTheme) {
                this.setTheme(savedTheme, false);
            } else {
                // 检测系统主题偏好
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.setTheme(prefersDark ? 'dark' : 'light', false);
            }
        } catch (error) {
            console.warn('主题加载失败，使用默认主题:', error);
            this.setTheme('light', false);
        }
    }

    setTheme(theme, animate = true) {
        const body = document.body;
        const html = document.documentElement;
        
        if (!body || !html) {
            console.warn('DOM元素未准备就绪，延迟设置主题');
            setTimeout(() => this.setTheme(theme, animate), 100);
            return;
        }
        
        // 添加切换动画类
        if (animate) {
            body.classList.add('theme-switching');
        }
        
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            html.setAttribute('data-theme', 'dark');
            this.isDark = true;
        } else {
            body.classList.remove('dark-mode');
            html.setAttribute('data-theme', 'light');
            this.isDark = false;
        }
        
        // 更新切换按钮
        this.updateToggleButton(theme);
        
        // 保存主题偏好
        try {
            localStorage.setItem('theme-preference', theme);
        } catch (error) {
            console.warn('无法保存主题偏好:', error);
        }
        
        // 触发主题变化事件
        this.dispatchThemeChangeEvent(theme);
        
        // 移除动画类
        if (animate) {
            setTimeout(() => {
                body.classList.remove('theme-switching');
            }, 300);
        }
    }

    toggleTheme() {
        const newTheme = this.isDark ? 'light' : 'dark';
        this.setTheme(newTheme, true);
        
        // 添加触觉反馈（如果支持）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    updateToggleButton(theme) {
        try {
            const darkIcons = document.querySelectorAll('.dark-icon');
            const lightIcons = document.querySelectorAll('.light-icon');
            
            console.log(`🔄 更新主题图标: ${theme}, 找到 ${darkIcons.length} 个月亮图标, ${lightIcons.length} 个太阳图标`);
            
            if (theme === 'dark') {
                // 暗色模式：隐藏月亮，显示太阳
                darkIcons.forEach((icon, index) => {
                    if (icon) {
                        icon.style.display = 'none';
                        icon.style.opacity = '0';
                        icon.style.visibility = 'hidden';
                        console.log(`☀️ 隐藏月亮图标 ${index + 1}`);
                    }
                });
                lightIcons.forEach((icon, index) => {
                    if (icon) {
                        icon.style.display = 'inline-block';
                        icon.style.opacity = '1';
                        icon.style.visibility = 'visible';
                        console.log(`🌞 显示太阳图标 ${index + 1}`);
                    }
                });
            } else {
                // 浅色模式：显示月亮，隐藏太阳
                darkIcons.forEach((icon, index) => {
                    if (icon) {
                        icon.style.display = 'inline-block';
                        icon.style.opacity = '1';
                        icon.style.visibility = 'visible';
                        console.log(`🌙 显示月亮图标 ${index + 1}`);
                    }
                });
                lightIcons.forEach((icon, index) => {
                    if (icon) {
                        icon.style.display = 'none';
                        icon.style.opacity = '0';
                        icon.style.visibility = 'hidden';
                        console.log(`☀️ 隐藏太阳图标 ${index + 1}`);
                    }
                });
            }
        } catch (error) {
            console.warn('更新切换按钮失败:', error);
        }
    }

    initToggleButton() {
        // 延迟初始化按钮，确保DOM已加载
        setTimeout(() => {
            try {
                const toggleButtons = document.querySelectorAll('#theme-toggle, [onclick*="toggleDarkMode"]');
                
                toggleButtons.forEach(button => {
                    if (!button) return;
                    
                    // 移除内联onclick属性，使用事件监听器
                    button.removeAttribute('onclick');
                    
                    // 添加切换动画样式
                    button.style.transition = this.transition;
                    
                    // 添加点击事件监听器
                    const handleClick = (e) => {
                        e.preventDefault();
                        this.toggleTheme();
                    };
                    
                    // 移除旧的监听器（如果存在）
                    button.removeEventListener('click', handleClick);
                    button.addEventListener('click', handleClick);
                    
                    // 悬浮效果
                    button.addEventListener('mouseenter', () => {
                        button.style.transform = 'scale(1.05)';
                    });
                    
                    button.addEventListener('mouseleave', () => {
                        button.style.transform = 'scale(1)';
                    });
                });
                
                console.log(`✅ 已初始化 ${toggleButtons.length} 个主题切换按钮`);
            } catch (error) {
                console.error('按钮初始化失败:', error);
            }
        }, 500);
    }

    addTransitions() {
        // 创建样式表，避免重复添加
        if (document.getElementById('dark-mode-transitions')) return;
        
        const style = document.createElement('style');
        style.id = 'dark-mode-transitions';
        style.textContent = `
            /* Dark Mode 过渡动画 */
            body:not(.theme-switching) *,
            body:not(.theme-switching)::before,
            body:not(.theme-switching)::after {
                transition: ${this.transition} !important;
            }

            /* 主题切换动画 */
            .theme-switching {
                animation: themeSwitch 0.3s ease;
            }

            @keyframes themeSwitch {
                0% { opacity: 1; }
                50% { opacity: 0.95; transform: scale(0.999); }
                100% { opacity: 1; transform: scale(1); }
            }

            /* 主题图标动画 */
            .theme-icon {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                transform-origin: center;
            }

            #theme-toggle:hover .theme-icon {
                transform: rotate(180deg) scale(1.1);
            }

            /* 切换按钮样式 */
            #theme-toggle {
                position: relative;
                overflow: hidden;
            }

            #theme-toggle::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                transition: left 0.5s ease;
            }

            #theme-toggle:hover::after {
                left: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                if (!localStorage.getItem('theme-preference')) {
                    this.setTheme(e.matches ? 'dark' : 'light', true);
                }
            };
            
            // 移除旧的监听器
            mediaQuery.removeEventListener('change', handleChange);
            mediaQuery.addEventListener('change', handleChange);
        }
    }

    addKeyboardShortcut() {
        const handleKeyPress = (e) => {
            // Ctrl+Shift+D 或 Cmd+Shift+D 切换主题
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        };
        
        document.removeEventListener('keydown', handleKeyPress);
        document.addEventListener('keydown', handleKeyPress);
    }

    dispatchThemeChangeEvent(theme) {
        try {
            const event = new CustomEvent('themeChange', {
                detail: { theme, isDark: theme === 'dark' },
                bubbles: true
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.warn('事件分发失败:', error);
        }
    }

    // 公共API方法
    getCurrentTheme() {
        return this.isDark ? 'dark' : 'light';
    }

    forceTheme(theme) {
        this.setTheme(theme, false);
    }

    // 销毁方法
    destroy() {
        try {
            const style = document.getElementById('dark-mode-transitions');
            if (style) style.remove();
            
            this.isInitialized = false;
            console.log('🗑️ Dark Mode 系统已销毁');
        } catch (error) {
            console.error('销毁失败:', error);
        }
    }
}

// 全局实例
let darkModeManager;

// 全局切换函数
function toggleDarkMode() {
    if (darkModeManager) {
        darkModeManager.toggleTheme();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    darkModeManager = new DarkModeManager();
    
    // 监听主题变化事件
    window.addEventListener('themeChange', (e) => {
        console.log(`🎨 主题已切换到: ${e.detail.theme}`);
        
        // 可以在这里添加主题切换后的回调
        if (typeof window.onThemeChange === 'function') {
            window.onThemeChange(e.detail);
        }
    });
});

// 导出给其他脚本使用
window.DarkModeManager = DarkModeManager;
window.toggleDarkMode = toggleDarkMode;

// ===============================
// 🎨 Dark Mode 样式增强
// ===============================

// 动态添加暗色模式样式
function addDarkModeStyles() {
    const style = document.createElement('style');
    style.id = 'dark-mode-styles';
    style.textContent = `
        /* ===== 基础暗色模式样式 ===== */
        .dark-mode {
            color-scheme: dark;
        }

        .dark-mode body {
            background: #0a0e1a !important;
            color: #e2e8f0 !important;
        }

        /* 菜单栏暗色样式 */
        .dark-mode #menu {
            background: rgba(15, 23, 42, 0.8) !important;
            backdrop-filter: blur(20px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .dark-mode #menu a {
            color: #e2e8f0 !important;
        }

        .dark-mode #menu a:hover {
            color: #60a5fa !important;
            background: rgba(59, 130, 246, 0.1) !important;
        }

        /* 主题切换按钮特殊样式 */
        .dark-mode #theme-toggle {
            color: #fbbf24 !important;
        }

        .dark-mode #theme-toggle:hover {
            color: #f59e0b !important;
            background: rgba(251, 191, 36, 0.1) !important;
        }

        /* 主内容区域 */
        .dark-mode #main {
            background: transparent !important;
        }

        /* 页脚暗色样式 */
        .dark-mode #footer {
            background: rgba(15, 23, 42, 0.6) !important;
            color: #94a3b8 !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .dark-mode #footer a {
            color: #60a5fa !important;
        }

        /* 滚动条暗色样式 */
        .dark-mode ::-webkit-scrollbar {
            background: rgba(15, 23, 42, 0.8) !important;
        }

        .dark-mode ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #374151, #4b5563) !important;
        }

        .dark-mode ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #4b5563, #6b7280) !important;
        }

        /* 文本选择暗色样式 */
        .dark-mode ::selection {
            background: rgba(59, 130, 246, 0.3) !important;
            color: #e2e8f0 !important;
        }

        /* Loading 动画暗色样式 */
        .dark-mode #loading {
            background: rgba(10, 14, 26, 0.95) !important;
        }

        .dark-mode #loading-circle {
            background: rgba(30, 41, 59, 0.9) !important;
            border: 2px solid rgba(59, 130, 246, 0.3) !important;
            color: #e2e8f0 !important;
        }

        .dark-mode #loading-circle h2 {
            color: #60a5fa !important;
        }

        /* 移动端菜单暗色样式 */
        .dark-mode #mobile-menu .items {
            background: rgba(15, 23, 42, 0.95) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .dark-mode #mobile-menu .item:hover {
            background: rgba(59, 130, 246, 0.1) !important;
        }

        .dark-mode #menu-curtain {
            background: rgba(0, 0, 0, 0.7) !important;
        }

        /* 图片预览暗色样式 */
        .dark-mode #preview {
            background: rgba(0, 0, 0, 0.9) !important;
        }

        /* 链接暗色样式 */
        .dark-mode a {
            color: #60a5fa !important;
        }

        .dark-mode a:hover {
            color: #93c5fd !important;
        }

        /* 代码块暗色样式增强 */
        .dark-mode pre {
            background: rgba(15, 23, 42, 0.9) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .dark-mode code {
            background: rgba(59, 130, 246, 0.2) !important;
            color: #93c5fd !important;
        }

        /* 引用块暗色样式 */
        .dark-mode blockquote {
            background: rgba(30, 41, 59, 0.6) !important;
            border-left: 4px solid #60a5fa !important;
            color: #cbd5e1 !important;
        }

        /* 表格暗色样式 */
        .dark-mode table {
            background: rgba(30, 41, 59, 0.6) !important;
        }

        .dark-mode th {
            background: rgba(51, 65, 85, 0.8) !important;
            color: #e2e8f0 !important;
            border-bottom: 2px solid rgba(59, 130, 246, 0.3) !important;
        }

        .dark-mode td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: #cbd5e1 !important;
        }

        .dark-mode tr:hover {
            background: rgba(59, 130, 246, 0.1) !important;
        }
    `;
    
    document.head.appendChild(style);
}

// 页面加载时添加样式
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDarkModeStyles);
} else {
    addDarkModeStyles();
}