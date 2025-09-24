/**
 * 公告栏配置管理器
 * 用于处理和验证公告栏配置
 */

class AnnouncementConfigManager {
    constructor() {
        this.defaultConfig = this.getDefaultConfig();
        this.validationRules = this.getValidationRules();
        this.configCache = new Map();
    }
    
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            enable: true,
            basic: {
                title: "网站公告",
                show_icon: true,
                icon: "fas fa-bullhorn",
                id: "main_announcement"
            },
            content_source: {
                type: "config",
                content: "欢迎访问我的博客！",
                file_path: "source/announcements/current.md",
                api_endpoint: ""
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
                delay: 1000,
                hover_effect: true
            },
            responsive: {
                mobile_position: "top",
                tablet_position: "sidebar",
                desktop_position: "sidebar",
                mobile_theme: "minimal",
                tablet_theme: "glassmorphism",
                desktop_theme: "glassmorphism"
            },
            style: {
                background_opacity: 0.15,
                blur_intensity: 25,
                border_radius: 16,
                padding: 20,
                margin: 15,
                box_shadow: "0 8px 32px rgba(31, 38, 135, 0.12)",
                custom_colors: {
                    primary: "#667eea",
                    secondary: "#764ba2",
                    success: "#10b981",
                    warning: "#f59e0b",
                    error: "#ef4444",
                    info: "#3b82f6"
                }
            },
            content_enhancement: {
                markdown_support: true,
                html_support: true,
                link_target_blank: true,
                image_lazy_load: true,
                code_highlight: true,
                emoji_support: true
            },
            security: {
                content_filter: true,
                allowed_tags: ["p", "br", "strong", "em", "a", "img", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code"],
                allowed_attributes: {
                    a: ["href", "title", "target", "rel"],
                    img: ["src", "alt", "title", "width", "height"]
                },
                max_content_length: 5000
            },
            analytics: {
                track_views: true,
                track_interactions: true,
                track_close_events: true
            },
            i18n: {
                close_button_title: "关闭公告",
                refresh_button_title: "刷新内容",
                expand_button_title: "展开/收起",
                loading_text: "加载中...",
                error_text: "内容加载失败，请稍后重试",
                retry_text: "重试",
                last_updated_text: "最后更新"
            }
        };
    }
    
    /**
     * 获取验证规则
     */
    getValidationRules() {
        return {
            enable: { type: 'boolean', required: true },
            'basic.title': { type: 'string', required: true, maxLength: 100 },
            'basic.show_icon': { type: 'boolean', required: false },
            'basic.icon': { type: 'string', required: false, pattern: /^fa[srb]?\s+fa-[\w-]+$/ },
            'basic.id': { type: 'string', required: true, pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/ },
            
            'content_source.type': { type: 'string', required: true, enum: ['config', 'file', 'api'] },
            'content_source.content': { type: 'string', required: false, maxLength: 10000 },
            'content_source.file_path': { type: 'string', required: false },
            'content_source.api_endpoint': { type: 'string', required: false, pattern: /^https?:\/\/.+$/ },
            
            'display.theme': { type: 'string', required: true, enum: ['glassmorphism', 'gradient', 'minimal', 'vibrant'] },
            'display.position': { type: 'string', required: true, enum: ['sidebar', 'top', 'floating', 'footer'] },
            'display.max_height': { type: 'string', required: false, pattern: /^\d+(px|em|rem|%)$/ },
            'display.show_date': { type: 'boolean', required: false },
            'display.show_author': { type: 'boolean', required: false },
            'display.priority': { type: 'number', required: false, min: 1, max: 10 },
            
            'interaction.closable': { type: 'boolean', required: false },
            'interaction.remember_close': { type: 'boolean', required: false },
            'interaction.close_expires_hours': { type: 'number', required: false, min: 1, max: 8760 },
            'interaction.auto_refresh': { type: 'boolean', required: false },
            'interaction.refresh_interval': { type: 'number', required: false, min: 10000 },
            'interaction.expandable': { type: 'boolean', required: false },
            
            'animation.entrance': { type: 'string', required: false, enum: ['fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight', 'fadeIn'] },
            'animation.exit': { type: 'string', required: false, enum: ['fadeOutDown', 'fadeOutUp', 'fadeOutLeft', 'fadeOutRight', 'fadeOut'] },
            'animation.duration': { type: 'number', required: false, min: 100, max: 3000 },
            'animation.delay': { type: 'number', required: false, min: 0, max: 10000 },
            'animation.hover_effect': { type: 'boolean', required: false },
            
            'style.background_opacity': { type: 'number', required: false, min: 0, max: 1 },
            'style.blur_intensity': { type: 'number', required: false, min: 0, max: 50 },
            'style.border_radius': { type: 'number', required: false, min: 0, max: 50 },
            'style.padding': { type: 'number', required: false, min: 0, max: 100 },
            'style.margin': { type: 'number', required: false, min: 0, max: 100 },
            
            'security.content_filter': { type: 'boolean', required: false },
            'security.max_content_length': { type: 'number', required: false, min: 100, max: 50000 }
        };
    }
    
    /**
     * 从全局配置中加载公告配置
     */
    loadFromGlobalConfig() {
        try {
            // 尝试从不同的全局配置源加载
            let config = null;
            
            // 从Butterfly主题配置加载
            if (typeof window !== 'undefined' && window.butterfly_config) {
                config = window.butterfly_config.card_announcement_enhanced;
            }
            
            // 从Hexo配置加载 (如果在Node.js环境中)
            if (!config && typeof hexo !== 'undefined') {
                config = hexo.theme.config?.card_announcement_enhanced;
            }
            
            // 从本地存储加载 (浏览器环境)
            if (!config && typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('announcement_config');
                if (stored) {
                    config = JSON.parse(stored);
                }
            }
            
            if (config) {
                return this.validateAndMergeConfig(config);
            }
            
            return this.defaultConfig;
        } catch (error) {
            console.error('加载公告配置失败:', error);
            return this.defaultConfig;
        }
    }
    
    /**
     * 验证并合并配置
     */
    validateAndMergeConfig(userConfig) {
        const validation = this.validateConfig(userConfig);
        
        if (!validation.isValid) {
            console.warn('公告配置验证失败:', validation.errors);
            
            // 仅使用通过验证的配置项
            const validConfig = this.extractValidConfig(userConfig);
            return this.deepMerge(this.defaultConfig, validConfig);
        }
        
        return this.deepMerge(this.defaultConfig, userConfig);
    }
    
    /**
     * 验证配置
     */
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        
        // 递归验证配置项
        this.validateObject(config, '', this.validationRules, errors, warnings);
        
        // 自定义验证逻辑
        this.performCustomValidation(config, errors, warnings);
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * 递归验证对象
     */
    validateObject(obj, prefix, rules, errors, warnings) {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            const rule = rules[fullKey];
            
            if (rule) {
                this.validateValue(fullKey, value, rule, errors, warnings);
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                this.validateObject(value, fullKey, rules, errors, warnings);
            }
        }
    }
    
    /**
     * 验证单个值
     */
    validateValue(key, value, rule, errors, warnings) {
        // 必需性检查
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push(`配置项 ${key} 是必需的`);
            return;
        }
        
        // 如果值为空且不是必需的，跳过后续验证
        if (value === undefined || value === null || value === '') {
            return;
        }
        
        // 类型检查
        if (rule.type && typeof value !== rule.type) {
            errors.push(`配置项 ${key} 的类型应为 ${rule.type}，当前为 ${typeof value}`);
            return;
        }
        
        // 枚举值检查
        if (rule.enum && !rule.enum.includes(value)) {
            errors.push(`配置项 ${key} 的值应为 ${rule.enum.join(', ')} 中的一个`);
        }
        
        // 数值范围检查
        if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                errors.push(`配置项 ${key} 的值不能小于 ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
                errors.push(`配置项 ${key} 的值不能大于 ${rule.max}`);
            }
        }
        
        // 字符串长度检查
        if (rule.type === 'string') {
            if (rule.minLength !== undefined && value.length < rule.minLength) {
                errors.push(`配置项 ${key} 的长度不能少于 ${rule.minLength} 个字符`);
            }
            if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                errors.push(`配置项 ${key} 的长度不能超过 ${rule.maxLength} 个字符`);
            }
        }
        
        // 正则表达式检查
        if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`配置项 ${key} 的格式不正确`);
        }
    }
    
    /**
     * 执行自定义验证
     */
    performCustomValidation(config, errors, warnings) {
        // 内容源一致性检查
        if (config.content_source) {
            const type = config.content_source.type;
            
            if (type === 'file' && !config.content_source.file_path) {
                errors.push('当内容源类型为 file 时，必须提供 file_path');
            }
            
            if (type === 'api' && !config.content_source.api_endpoint) {
                errors.push('当内容源类型为 api 时，必须提供 api_endpoint');
            }
            
            if (type === 'config' && !config.content_source.content) {
                warnings.push('当内容源类型为 config 时，建议提供 content');
            }
        }
        
        // 动画配置检查
        if (config.animation) {
            if (config.animation.delay > config.animation.duration * 5) {
                warnings.push('动画延迟时间过长，可能影响用户体验');
            }
        }
        
        // 响应式配置一致性检查
        if (config.responsive) {
            const positions = ['mobile_position', 'tablet_position', 'desktop_position'];
            const themes = ['mobile_theme', 'tablet_theme', 'desktop_theme'];
            
            positions.forEach(pos => {
                if (config.responsive[pos] && !['sidebar', 'top', 'floating', 'footer'].includes(config.responsive[pos])) {
                    errors.push(`响应式配置 ${pos} 的值无效`);
                }
            });
            
            themes.forEach(theme => {
                if (config.responsive[theme] && !['glassmorphism', 'gradient', 'minimal', 'vibrant'].includes(config.responsive[theme])) {
                    errors.push(`响应式配置 ${theme} 的值无效`);
                }
            });
        }
        
        // 安全配置检查
        if (config.security && config.security.content_filter) {
            if (!config.security.allowed_tags || !Array.isArray(config.security.allowed_tags)) {
                warnings.push('启用内容过滤时，建议设置 allowed_tags 数组');
            }
        }
    }
    
    /**
     * 提取有效配置
     */
    extractValidConfig(config) {
        const validConfig = {};
        
        // 递归提取通过验证的配置项
        this.extractValidFromObject(config, validConfig, '', this.validationRules);
        
        return validConfig;
    }
    
    /**
     * 从对象中递归提取有效配置
     */
    extractValidFromObject(source, target, prefix, rules) {
        for (const [key, value] of Object.entries(source)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            const rule = rules[fullKey];
            
            if (rule) {
                // 验证单个值
                const errors = [];
                const warnings = [];
                this.validateValue(fullKey, value, rule, errors, warnings);
                
                if (errors.length === 0) {
                    this.setNestedValue(target, fullKey, value);
                }
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                this.extractValidFromObject(value, target, fullKey, rules);
            }
        }
    }
    
    /**
     * 设置嵌套对象值
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    }
    
    /**
     * 深度合并对象
     */
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
    
    /**
     * 保存配置到本地存储
     */
    saveToLocalStorage(config, key = 'announcement_config') {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(config));
                return true;
            }
        } catch (error) {
            console.error('保存配置到本地存储失败:', error);
        }
        return false;
    }
    
    /**
     * 从本地存储加载配置
     */
    loadFromLocalStorage(key = 'announcement_config') {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem(key);
                if (stored) {
                    return JSON.parse(stored);
                }
            }
        } catch (error) {
            console.error('从本地存储加载配置失败:', error);
        }
        return null;
    }
    
    /**
     * 生成配置的哈希值
     */
    generateConfigHash(config) {
        const str = JSON.stringify(config, Object.keys(config).sort());
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        return hash.toString(36);
    }
    
    /**
     * 缓存配置
     */
    cacheConfig(key, config) {
        const hash = this.generateConfigHash(config);
        this.configCache.set(key, { config, hash, timestamp: Date.now() });
    }
    
    /**
     * 获取缓存的配置
     */
    getCachedConfig(key, maxAge = 300000) { // 默认5分钟缓存
        const cached = this.configCache.get(key);
        
        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            return cached.config;
        }
        
        return null;
    }
    
    /**
     * 清除配置缓存
     */
    clearConfigCache(key = null) {
        if (key) {
            this.configCache.delete(key);
        } else {
            this.configCache.clear();
        }
    }
    
    /**
     * 导出配置为JSON
     */
    exportConfig(config) {
        return JSON.stringify(config, null, 2);
    }
    
    /**
     * 从JSON导入配置
     */
    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            return this.validateAndMergeConfig(config);
        } catch (error) {
            throw new Error('配置JSON格式无效: ' + error.message);
        }
    }
    
    /**
     * 生成配置模板
     */
    generateConfigTemplate(type = 'full') {
        switch (type) {
            case 'minimal':
                return {
                    enable: true,
                    basic: {
                        title: "网站公告",
                        icon: "fas fa-bullhorn"
                    },
                    content_source: {
                        type: "config",
                        content: "欢迎访问我的博客！"
                    },
                    display: {
                        theme: "glassmorphism",
                        position: "sidebar"
                    }
                };
                
            case 'advanced':
                return this.defaultConfig;
                
            default:
                return this.defaultConfig;
        }
    }
    
    /**
     * 获取配置帮助信息
     */
    getConfigHelp() {
        return {
            sections: {
                basic: "基础配置：标题、图标、ID等基本信息",
                content_source: "内容源配置：支持配置文件、独立文件、API三种内容来源",
                display: "显示配置：主题、位置、高度等显示相关设置",
                interaction: "交互配置：是否可关闭、自动刷新等交互功能",
                animation: "动画配置：入场/退场动画、持续时间等",
                responsive: "响应式配置：不同设备下的显示设置",
                style: "样式配置：透明度、模糊、圆角等视觉效果",
                content_enhancement: "内容增强：Markdown支持、HTML支持等",
                security: "安全配置：内容过滤、标签白名单等",
                analytics: "统计配置：访问统计、交互统计等",
                i18n: "国际化配置：多语言文本配置"
            },
            examples: {
                basic: `{
  "title": "🎉 网站公告",
  "show_icon": true,
  "icon": "fas fa-bullhorn",
  "id": "main_announcement"
}`,
                content_source: `{
  "type": "config",
  "content": "欢迎来到我的博客！\\n\\n这里分享编程和思考。"
}`,
                display: `{
  "theme": "glassmorphism",
  "position": "sidebar",
  "max_height": "400px",
  "show_date": true
}`
            },
            tips: [
                "使用 markdown_support 启用Markdown渲染",
                "设置 remember_close 让用户关闭后记住状态",
                "通过 responsive 配置适配不同设备",
                "使用 security.content_filter 过滤不安全内容",
                "设置合适的 animation.delay 避免页面加载时冲突"
            ]
        };
    }
}

// 导出配置管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnnouncementConfigManager;
}

// 全局实例
window.AnnouncementConfigManager = AnnouncementConfigManager;

console.log('公告栏配置管理器加载完成');