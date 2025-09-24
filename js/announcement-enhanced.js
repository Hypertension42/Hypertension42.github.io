/**
 * 博客公告栏增强组件 - 核心组件模板
 * 基于Butterfly主题的公告栏扩展系统
 */

// 公告栏增强组件类
class AnnouncementEnhanced {
    constructor(config = {}) {
        this.config = this.mergeConfig(config);
        this.container = null;
        this.isVisible = true;
        this.animationRunning = false;
        this.refreshTimer = null;
        
        this.init();
    }
    
    // 默认配置
    getDefaultConfig() {
        return {
            // 基础设置
            enable: true,
            title: "网站公告",
            icon: "fas fa-bullhorn",
            
            // 内容设置
            content_source: "config", // config|file|api
            content: "欢迎访问我的博客！",
            file_path: "",
            api_endpoint: "",
            
            // 显示设置
            theme: "glassmorphism", // glassmorphism|gradient|minimal|vibrant
            position: "sidebar", // sidebar|top|floating|footer
            max_height: "300px",
            show_date: true,
            show_author: false,
            
            // 交互设置
            closable: true,
            remember_close: true,
            auto_refresh: false,
            refresh_interval: 300000,
            
            // 动画设置
            animation: {
                entrance: "fadeInUp",
                exit: "fadeOutDown",
                duration: 500,
                delay: 0
            },
            
            // 响应式设置
            responsive: {
                mobile_position: "top",
                tablet_position: "sidebar",
                desktop_position: "sidebar"
            },
            
            // 样式设置
            style: {
                background_opacity: 0.15,
                blur_intensity: 25,
                border_radius: 16,
                box_shadow: "0 8px 32px rgba(31, 38, 135, 0.12)"
            }
        };
    }
    
    // 合并配置
    mergeConfig(userConfig) {
        const defaultConfig = this.getDefaultConfig();
        return this.deepMerge(defaultConfig, userConfig);
    }
    
    // 深度合并对象
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }
    
    // 初始化组件
    async init() {
        if (!this.config?.enable) {
            console.log('公告栏组件已禁用');
            return;
        }
        
        try {
            // 检查DOM是否加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                });
            }
            
            // 检查是否记住关闭状态
            if (this.config.remember_close && this.isRememberedClosed()) {
                console.log('公告栏已被用户关闭，跳过显示');
                return;
            }
            
            // 创建容器
            await this.createContainer();
            
            // 检查容器是否创建成功
            if (!this.container) {
                throw new Error('容器创建失败');
            }
            
            // 加载内容
            await this.loadContent();
            
            // 应用样式
            this.applyStyles();
            
            // 绑定事件
            this.bindEvents();
            
            // 启动自动刷新
            if (this.config.auto_refresh) {
                this.startAutoRefresh();
            }
            
            // 显示动画
            this.showWithAnimation();
            
            console.log('公告栏增强组件初始化成功');
        } catch (error) {
            console.error('公告栏组件初始化失败:', error);
            // 显示错误状态
            this.showError('组件初始化失败');
        }
    }
    
    // 创建容器元素
    async createContainer() {
        try {
            // 创建主容器
            this.container = document.createElement('div');
            this.container.className = this.getContainerClasses();
            this.container.id = 'announcement-enhanced';
            
            // 创建内部结构
            const structure = await this.createStructure();
            this.container.innerHTML = structure;
            
            // 插入到合适位置
            this.insertToTarget();
            
            // 验证容器是否成功插入DOM
            if (!document.contains(this.container)) {
                throw new Error('容器未成功插入到DOM中');
            }
        } catch (error) {
            console.error('创建容器失败:', error);
            throw error;
        }
    }
    
    // 获取容器CSS类
    getContainerClasses() {
        const classes = [
            'card-widget',
            'card-announcement-enhanced',
            `theme-${this.config.theme}`,
            `position-${this.getCurrentPosition()}`,
            'announcement-enhanced-container'
        ];
        
        if (this.config.closable) {
            classes.push('closable');
        }
        
        return classes.join(' ');
    }
    
    // 获取当前设备对应的位置
    getCurrentPosition() {
        const width = window.innerWidth;
        
        if (width < 768) {
            return this.config.responsive?.mobile_position || this.config.position;
        } else if (width < 1200) {
            return this.config.responsive?.tablet_position || this.config.position;
        } else {
            return this.config.responsive?.desktop_position || this.config.position;
        }
    }
    
    // 创建组件结构
    async createStructure() {
        const content = await this.getProcessedContent();
        
        return `
            <div class="card-content">
                ${this.createHeader()}
                ${this.createBody(content)}
                ${this.createFooter()}
                ${this.config.closable ? this.createCloseButton() : ''}
            </div>
            <div class="announcement-loading" style="display: none;">
                <i class="fas fa-spinner fa-spin"></i>
                <span>加载中...</span>
            </div>
        `;
    }
    
    // 创建头部
    createHeader() {
        return `
            <div class="announcement-header">
                <div class="announcement-title">
                    <i class="${this.config.icon}"></i>
                    <span>${this.config.title}</span>
                </div>
                ${this.createHeaderMeta()}
            </div>
        `;
    }
    
    // 创建头部元信息
    createHeaderMeta() {
        const meta = [];
        
        if (this.config.show_date) {
            const date = new Date().toLocaleDateString('zh-CN');
            meta.push(`<span class="announcement-date"><i class="fas fa-calendar-alt"></i> ${date}</span>`);
        }
        
        if (this.config.show_author) {
            meta.push(`<span class="announcement-author"><i class="fas fa-user"></i> 管理员</span>`);
        }
        
        return meta.length > 0 ? `<div class="announcement-meta">${meta.join('')}</div>` : '';
    }
    
    // 创建主体内容
    createBody(content) {
        return `
            <div class="announcement-body" style="max-height: ${this.config.max_height}">
                <div class="announcement-content">
                    ${content}
                </div>
            </div>
        `;
    }
    
    // 创建底部
    createFooter() {
        return `
            <div class="announcement-footer">
                <div class="announcement-actions">
                    ${this.createActionButtons()}
                </div>
                <div class="announcement-status">
                    <span class="last-updated">最后更新: <time>${new Date().toLocaleString('zh-CN')}</time></span>
                </div>
            </div>
        `;
    }
    
    // 创建操作按钮
    createActionButtons() {
        const buttons = [];
        
        if (this.config.auto_refresh) {
            buttons.push(`
                <button class="announcement-btn refresh-btn" title="刷新内容">
                    <i class="fas fa-sync-alt"></i>
                </button>
            `);
        }
        
        buttons.push(`
            <button class="announcement-btn expand-btn" title="展开/收起">
                <i class="fas fa-expand-alt"></i>
            </button>
        `);
        
        return buttons.join('');
    }
    
    // 创建关闭按钮
    createCloseButton() {
        return `
            <button class="announcement-close" title="关闭公告">
                <i class="fas fa-times"></i>
            </button>
        `;
    }
    
    // 加载内容
    async loadContent() {
        try {
            this.showLoading(true);
            
            let content;
            switch (this.config.content_source) {
                case 'file':
                    content = await this.loadFromFile();
                    break;
                case 'api':
                    content = await this.loadFromAPI();
                    break;
                default:
                    content = this.config.content;
            }
            
            // 处理内容
            const processedContent = await this.processContent(content);
            this.updateContent(processedContent);
            
        } catch (error) {
            console.error('加载公告内容失败:', error);
            this.showError('内容加载失败，请稍后重试');
        } finally {
            this.showLoading(false);
        }
    }
    
    // 从文件加载内容
    async loadFromFile() {
        if (!this.config.file_path) {
            throw new Error('文件路径未配置');
        }
        
        try {
            const response = await fetch(this.config.file_path, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`文件加载失败: ${response.status} ${response.statusText}`);
            }
            
            return await response.text();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('网络连接失败，请检查文件路径是否正确');
            }
            throw error;
        }
    }
    
    // 从API加载内容
    async loadFromAPI() {
        if (!this.config.api_endpoint) {
            throw new Error('API端点未配置');
        }
        
        try {
            const response = await fetch(this.config.api_endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                timeout: 10000 // 10秒超时
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.content || data.message || data.data || JSON.stringify(data);
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('网络连接失败，请检查API端点是否正确');
            }
            if (error.name === 'SyntaxError') {
                throw new Error('API返回数据格式错误，无法解析JSON');
            }
            throw error;
        }
    }
    
    // 处理内容
    async processContent(content) {
        // 安全过滤
        const sanitized = this.sanitizeContent(content);
        
        // Markdown渲染（如果需要）
        const rendered = await this.renderMarkdown(sanitized);
        
        // 链接处理
        const processed = this.processLinks(rendered);
        
        return processed;
    }
    
    // 获取处理后的内容
    async getProcessedContent() {
        return await this.processContent(this.config.content);
    }
    
    // 内容安全过滤
    sanitizeContent(content) {
        // 基础HTML标签白名单
        const allowedTags = ['p', 'br', 'strong', 'em', 'a', 'img', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const allowedAttributes = {
            'a': ['href', 'title', 'target'],
            'img': ['src', 'alt', 'title', 'width', 'height']
        };
        
        // 简单的HTML过滤（生产环境建议使用专业的sanitizer库）
        let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        
        return sanitized;
    }
    
    // Markdown渲染
    async renderMarkdown(content) {
        // 简单的Markdown处理
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
    }
    
    // 链接处理
    processLinks(content) {
        return content.replace(/<a\s+href="([^"]*)"([^>]*)>/g, (match, href, attrs) => {
            // 为外部链接添加安全属性
            if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                return `<a href="${href}" rel="noopener noreferrer" target="_blank"${attrs}>`;
            }
            return match;
        });
    }
    
    // 更新内容
    updateContent(content) {
        const contentElement = this.container?.querySelector('.announcement-content');
        if (contentElement) {
            contentElement.innerHTML = content;
            
            // 更新时间戳
            const timeElement = this.container.querySelector('time');
            if (timeElement) {
                timeElement.textContent = new Date().toLocaleString('zh-CN');
            }
        }
    }
    
    // 应用样式
    applyStyles() {
        if (!this.container) return;
        
        const style = this.config.style;
        
        // 应用自定义样式
        this.container.style.setProperty('--announcement-bg-opacity', style.background_opacity);
        this.container.style.setProperty('--announcement-blur', `${style.blur_intensity}px`);
        this.container.style.setProperty('--announcement-radius', `${style.border_radius}px`);
        this.container.style.setProperty('--announcement-shadow', style.box_shadow);
        
        // 应用主题样式
        this.applyThemeStyles();
        
        // 应用位置样式
        this.applyPositionStyles();
    }
    
    // 应用主题样式
    applyThemeStyles() {
        const themes = {
            glassmorphism: {
                background: `rgba(255, 255, 255, ${this.config.style.background_opacity})`,
                backdropFilter: `blur(${this.config.style.blur_intensity}px)`,
                border: '1px solid rgba(255, 255, 255, 0.15)'
            },
            gradient: {
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8))',
                color: 'white'
            },
            minimal: {
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e0e0e0'
            },
            vibrant: {
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white'
            }
        };
        
        const themeStyle = themes[this.config.theme] || themes.glassmorphism;
        Object.assign(this.container.style, themeStyle);
    }
    
    // 应用位置样式
    applyPositionStyles() {
        const positions = {
            sidebar: {
                position: 'relative',
                margin: '0 0 15px 0',
                width: '100%'
            },
            top: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                zIndex: '1000'
            },
            floating: {
                position: 'fixed',
                top: '20px',
                right: '20px',
                width: '300px',
                zIndex: '1000'
            },
            footer: {
                position: 'relative',
                margin: '15px 0 0 0',
                width: '100%'
            }
        };
        
        const currentPosition = this.getCurrentPosition();
        const positionStyle = positions[currentPosition] || positions.sidebar;
        Object.assign(this.container.style, positionStyle);
    }
    
    // 插入到目标位置
    insertToTarget() {
        const position = this.getCurrentPosition();
        const target = this.getTargetParent(position);
        
        if (target) {
            target.appendChild(this.container);
        } else {
            console.warn(`找不到适合的插入位置，位置: ${position}`);
            // 默认插入到body
            document.body.appendChild(this.container);
        }
    }
    
    // 获取目标父元素
    getTargetParent(position) {
        switch (position) {
            case 'sidebar':
                return document.querySelector('#aside-content .sticky_layout') || 
                       document.querySelector('#aside-content') ||
                       document.querySelector('.sidebar');
                
            case 'top':
                return document.body;
                
            case 'floating':
                return document.body;
                
            case 'footer':
                return document.querySelector('#footer') || 
                       document.querySelector('footer') ||
                       document.body;
                
            default:
                // 默认插入到现有公告栏位置
                const existingAnnouncement = document.querySelector('.card-announcement');
                if (existingAnnouncement && existingAnnouncement.parentNode) {
                    return existingAnnouncement.parentNode;
                }
                return document.querySelector('#aside-content') || document.body;
        }
    }
    
    // 绑定事件
    bindEvents() {
        if (!this.container) return;
        
        // 保存绑定的事件处理器引用，以便后续解绑
        this.boundHandleResize = this.handleResize.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleClose = () => this.close();
        this.boundHandleRefresh = () => this.refresh();
        this.boundHandleToggle = () => this.toggleExpand();
        
        // 关闭按钮事件
        const closeBtn = this.container.querySelector('.announcement-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.boundHandleClose);
        }
        
        // 刷新按钮事件
        const refreshBtn = this.container.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.boundHandleRefresh);
        }
        
        // 展开按钮事件
        const expandBtn = this.container.querySelector('.expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', this.boundHandleToggle);
        }
        
        // 响应式事件
        window.addEventListener('resize', this.boundHandleResize);
        
        // 键盘事件
        document.addEventListener('keydown', this.boundHandleKeydown);
    }
    
    // 显示加载状态
    showLoading(show) {
        const loadingElement = this.container?.querySelector('.announcement-loading');
        const contentElement = this.container?.querySelector('.card-content');
        
        if (loadingElement && contentElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
            contentElement.style.opacity = show ? '0.5' : '1';
        }
    }
    
    // 显示错误
    showError(message) {
        const contentElement = this.container?.querySelector('.announcement-content');
        if (contentElement) {
            const instanceId = this.config.id || 'main';
            contentElement.innerHTML = `
                <div class="announcement-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${message}</span>
                    <button class="retry-btn" data-instance="${instanceId}">重试</button>
                </div>
            `;
            
            // 为重试按钮绑定事件
            const retryBtn = contentElement.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    const instance = window.AnnouncementManager?.getAnnouncement(instanceId);
                    if (instance) {
                        instance.refresh();
                    }
                });
            }
        }
    }
    
    // 显示动画
    showWithAnimation() {
        if (!this.container || this.animationRunning) return;
        
        // 检查动画配置
        const animation = this.config.animation;
        if (!animation || !animation.entrance) {
            // 没有动画配置时直接显示
            this.container.style.opacity = '1';
            return;
        }
        
        this.animationRunning = true;
        
        // 设置初始状态
        this.container.style.opacity = '0';
        this.container.style.transform = this.getAnimationTransform(animation.entrance, 'start');
        
        // 延迟执行动画
        const delay = animation.delay || 0;
        const duration = animation.duration || 500;
        
        setTimeout(() => {
            if (!this.container) {
                this.animationRunning = false;
                return;
            }
            
            this.container.style.transition = `all ${duration}ms ease-out`;
            this.container.style.opacity = '1';
            this.container.style.transform = this.getAnimationTransform(animation.entrance, 'end');
            
            setTimeout(() => {
                this.animationRunning = false;
                if (this.container) {
                    this.container.style.transition = '';
                }
            }, duration);
        }, delay);
    }
    
    // 获取动画变换
    getAnimationTransform(animationType, phase) {
        const animations = {
            fadeInUp: {
                start: 'translateY(30px)',
                end: 'translateY(0)'
            },
            fadeInDown: {
                start: 'translateY(-30px)',
                end: 'translateY(0)'
            },
            fadeInLeft: {
                start: 'translateX(-30px)',
                end: 'translateX(0)'
            },
            fadeInRight: {
                start: 'translateX(30px)',
                end: 'translateX(0)'
            },
            fadeIn: {
                start: 'scale(0.9)',
                end: 'scale(1)'
            }
        };
        
        return animations[animationType]?.[phase] || 'none';
    }
    
    // 关闭公告
    close() {
        if (!this.container || this.animationRunning) return;
        
        this.animationRunning = true;
        const animation = this.config.animation;
        
        // 记住关闭状态
        if (this.config.remember_close) {
            this.rememberClosed();
        }
        
        // 清理资源先于动画
        this.stopAutoRefresh();
        
        // 执行关闭动画
        if (animation && animation.exit) {
            this.container.style.transition = `all ${animation.duration}ms ease-in`;
            this.container.style.opacity = '0';
            this.container.style.transform = this.getAnimationTransform(animation.exit, 'start');
            
            setTimeout(() => {
                if (this.container && this.container.parentNode) {
                    this.container.remove();
                }
                this.cleanup();
            }, animation.duration);
        } else {
            // 没有动画配置时直接移除
            if (this.container && this.container.parentNode) {
                this.container.remove();
            }
            this.cleanup();
        }
    }
    
    // 刷新内容
    async refresh() {
        const refreshBtn = this.container?.querySelector('.refresh-btn i');
        if (refreshBtn) {
            refreshBtn.classList.add('fa-spin');
        }
        
        try {
            await this.loadContent();
        } finally {
            if (refreshBtn) {
                refreshBtn.classList.remove('fa-spin');
            }
        }
    }
    
    // 切换展开状态
    toggleExpand() {
        const body = this.container?.querySelector('.announcement-body');
        const expandBtn = this.container?.querySelector('.expand-btn i');
        
        if (body && expandBtn) {
            const isExpanded = body.style.maxHeight === 'none';
            
            if (isExpanded) {
                body.style.maxHeight = this.config.max_height;
                expandBtn.className = 'fas fa-expand-alt';
            } else {
                body.style.maxHeight = 'none';
                expandBtn.className = 'fas fa-compress-alt';
            }
        }
    }
    
    // 处理窗口大小变化
    handleResize() {
        if (!this.container) return;
        
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        
        this.resizeTimer = setTimeout(() => {
            try {
                // 重新应用位置样式
                this.applyPositionStyles();
                
                // 更新容器类名
                const currentPosition = this.getCurrentPosition();
                this.container.className = this.container.className
                    .replace(/position-\w+/, `position-${currentPosition}`);
                    
                // 检查是否需要重新插入到不同位置
                const expectedParent = this.getTargetParent(currentPosition);
                if (expectedParent && this.container.parentNode !== expectedParent) {
                    expectedParent.appendChild(this.container);
                }
            } catch (error) {
                console.error('处理窗口大小变化时出错:', error);
            }
        }, 100);
    }
    
    // 处理键盘事件
    handleKeydown(e) {
        if (e.key === 'Escape' && this.config.closable) {
            this.close();
        }
    }
    
    // 启动自动刷新
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            this.refresh();
        }, this.config.refresh_interval);
    }
    
    // 停止自动刷新
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    // 记住关闭状态
    rememberClosed() {
        try {
            const key = `announcement_closed_${this.config.id || 'default'}`;
            const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24小时后过期
            localStorage.setItem(key, JSON.stringify({ closed: true, expiry }));
        } catch (error) {
            console.warn('无法保存公告关闭状态:', error);
        }
    }
    
    // 检查是否记住关闭状态
    isRememberedClosed() {
        try {
            const key = `announcement_closed_${this.config.id || 'default'}`;
            const stored = localStorage.getItem(key);
            
            if (stored) {
                const data = JSON.parse(stored);
                if (data.expiry > Date.now()) {
                    return data.closed;
                } else {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.warn('无法读取公告关闭状态:', error);
        }
        
        return false;
    }
    
    // 清理资源
    cleanup() {
        this.stopAutoRefresh();
        
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = null;
        }
        
        // 移除所有事件监听器
        if (this.container) {
            const closeBtn = this.container.querySelector('.announcement-close');
            if (closeBtn && this.boundHandleClose) {
                closeBtn.removeEventListener('click', this.boundHandleClose);
            }
            
            const refreshBtn = this.container.querySelector('.refresh-btn');
            if (refreshBtn && this.boundHandleRefresh) {
                refreshBtn.removeEventListener('click', this.boundHandleRefresh);
            }
            
            const expandBtn = this.container.querySelector('.expand-btn');
            if (expandBtn && this.boundHandleToggle) {
                expandBtn.removeEventListener('click', this.boundHandleToggle);
            }
        }
        
        if (this.boundHandleResize) {
            window.removeEventListener('resize', this.boundHandleResize);
        }
        if (this.boundHandleKeydown) {
            document.removeEventListener('keydown', this.boundHandleKeydown);
        }
        
        // 清理引用
        this.boundHandleResize = null;
        this.boundHandleKeydown = null;
        this.boundHandleClose = null;
        this.boundHandleRefresh = null;
        this.boundHandleToggle = null;
        
        this.container = null;
        this.isVisible = false;
    }
    
    // 销毁组件
    destroy() {
        if (this.container) {
            this.container.remove();
        }
        this.cleanup();
    }
}

// 工具函数
class AnnouncementUtils {
    // 设备检测
    static getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1200) return 'tablet';
        return 'desktop';
    }
    
    // 主题检测
    static getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
    
    // 安全的JSON解析
    static safeJSONParse(str, defaultValue = {}) {
        try {
            return JSON.parse(str);
        } catch {
            return defaultValue;
        }
    }
    
    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 全局公告管理器
class AnnouncementManager {
    constructor() {
        this.instances = new Map();
        this.config = null;
    }
    
    // 初始化管理器
    init(globalConfig = {}) {
        this.config = globalConfig;
        
        // 从配置文件加载公告设置
        this.loadFromConfig();
        
        // 监听配置变化
        this.watchConfigChanges();
    }
    
    // 从配置加载
    loadFromConfig() {
        // 从window.butterfly_config或其他全局配置中读取
        const config = window.butterfly_config?.card_announcement_enhanced;
        if (config && config.enable) {
            this.createAnnouncement('main', config);
        }
    }
    
    // 创建公告实例
    createAnnouncement(id, config) {
        try {
            if (this.instances.has(id)) {
                this.instances.get(id).destroy();
            }
            
            const announcement = new AnnouncementEnhanced({ ...config, id });
            this.instances.set(id, announcement);
            return announcement;
        } catch (error) {
            console.error(`创建公告实例 '${id}' 失败:`, error);
            return null;
        }
    }
    
    // 移除公告实例
    removeAnnouncement(id) {
        const instance = this.instances.get(id);
        if (instance) {
            instance.destroy();
            this.instances.delete(id);
        }
    }
    
    // 获取公告实例
    getAnnouncement(id) {
        return this.instances.get(id);
    }
    
    // 刷新所有公告
    refreshAll() {
        this.instances.forEach((instance, id) => {
            try {
                instance.refresh();
            } catch (error) {
                console.error(`刷新公告实例 '${id}' 失败:`, error);
            }
        });
    }
    
    // 监听配置变化
    watchConfigChanges() {
        // 在实际应用中，这里可以监听配置文件变化
        // 或者提供API接口来动态更新配置
    }
    
    // 清理所有实例
    cleanup() {
        this.instances.forEach((instance, id) => {
            try {
                instance.destroy();
            } catch (error) {
                console.error(`销毁公告实例 '${id}' 失败:`, error);
            }
        });
        this.instances.clear();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnnouncementEnhanced,
        AnnouncementUtils,
        AnnouncementManager
    };
}

// 全局实例
window.AnnouncementEnhanced = AnnouncementEnhanced;
window.AnnouncementUtils = AnnouncementUtils;
window.AnnouncementManager = new AnnouncementManager();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待Butterfly主题加载完成后初始化
    setTimeout(() => {
        try {
            if (window.AnnouncementManager) {
                window.AnnouncementManager.init();
            } else {
                console.warn('公告管理器未初始化');
            }
        } catch (error) {
            console.error('公告管理器初始化失败:', error);
        }
    }, 1000);
});

console.log('博客公告栏增强组件加载完成');