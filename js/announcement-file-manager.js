/**
 * 公告文件管理系统
 * 用于管理独立的公告Markdown文件
 */

class AnnouncementFileManager {
    constructor(config = {}) {
        this.config = {
            basePath: 'source/announcements/',
            currentFile: 'current.md',
            archivePath: 'archived/',
            templatePath: 'templates/',
            maxFileSize: 1024 * 1024, // 1MB
            allowedExtensions: ['.md', '.markdown'],
            cacheTimeout: 300000, // 5分钟
            ...config
        };
        
        this.cache = new Map();
        this.parseCache = new Map();
        this.watchList = new Set();
    }
    
    /**
     * 加载当前公告文件
     */
    async loadCurrentAnnouncement() {
        const filePath = `${this.config.basePath}${this.config.currentFile}`;
        return await this.loadAnnouncementFile(filePath);
    }
    
    /**
     * 加载指定公告文件
     */
    async loadAnnouncementFile(filePath) {
        try {
            // 检查缓存
            const cached = this.getCachedFile(filePath);
            if (cached) {
                return cached;
            }
            
            // 验证文件路径
            this.validateFilePath(filePath);
            
            // 获取文件内容
            const content = await this.fetchFileContent(filePath);
            
            // 解析文件
            const parsed = this.parseAnnouncementFile(content, filePath);
            
            // 验证文件格式
            const validated = this.validateAnnouncementData(parsed);
            
            // 缓存结果
            this.cacheFile(filePath, validated);
            
            return validated;
            
        } catch (error) {
            console.error(`加载公告文件失败 (${filePath}):`, error);
            throw new AnnouncementFileError(`文件加载失败: ${error.message}`, filePath, error);
        }
    }
    
    /**
     * 获取文件内容
     */
    async fetchFileContent(filePath) {
        try {
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // 检查文件大小
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > this.config.maxFileSize) {
                throw new Error(`文件过大: ${contentLength} bytes`);
            }
            
            const content = await response.text();
            
            // 检查实际内容大小
            if (content.length > this.config.maxFileSize) {
                throw new Error(`文件内容过大: ${content.length} characters`);
            }
            
            return content;
            
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('网络连接失败或文件不存在');
            }
            throw error;
        }
    }
    
    /**
     * 解析公告文件
     */
    parseAnnouncementFile(content, filePath) {
        try {
            // 检查解析缓存
            const cacheKey = this.generateContentHash(content);
            const cached = this.parseCache.get(cacheKey);
            if (cached) {
                return { ...cached, filePath };
            }
            
            // 分离Front Matter和内容
            const parsed = this.parseFrontMatter(content);
            
            // 处理元数据
            const metadata = this.processMetadata(parsed.frontMatter, filePath);
            
            // 处理内容
            const processedContent = this.processContent(parsed.content);
            
            const result = {
                ...metadata,
                content: processedContent,
                raw_content: parsed.content,
                filePath,
                parseTime: new Date().toISOString(),
                contentHash: cacheKey
            };
            
            // 缓存解析结果
            this.parseCache.set(cacheKey, result);
            
            return result;
            
        } catch (error) {
            throw new AnnouncementFileError(`文件解析失败: ${error.message}`, filePath, error);
        }
    }
    
    /**
     * 解析Front Matter
     */
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (!match) {
            // 没有Front Matter，将整个内容作为正文
            return {
                frontMatter: {},
                content: content.trim()
            };
        }
        
        const [, frontMatterString, bodyContent] = match;
        
        try {
            // 解析YAML Front Matter
            const frontMatter = this.parseYAML(frontMatterString);
            return {
                frontMatter,
                content: bodyContent.trim()
            };
        } catch (error) {
            throw new Error(`Front Matter解析失败: ${error.message}`);
        }
    }
    
    /**
     * 简单的YAML解析器
     */
    parseYAML(yamlString) {
        const result = {};
        const lines = yamlString.split('\n');
        let currentKey = null;
        let currentValue = '';
        let inMultiLine = false;
        let arrayItems = [];
        let inArray = false;
        let objectLevel = 0;
        let currentObject = result;
        const objectStack = [];
        
        for (let line of lines) {
            line = line.trim();
            
            // 跳过空行和注释
            if (!line || line.startsWith('#')) continue;
            
            // 处理数组项
            if (line.startsWith('- ')) {
                if (!inArray) {
                    inArray = true;
                    arrayItems = [];
                }
                arrayItems.push(this.parseYAMLValue(line.substring(2).trim()));
                continue;
            }
            
            // 结束数组处理
            if (inArray && !line.startsWith('- ')) {
                if (currentKey) {
                    currentObject[currentKey] = arrayItems;
                }
                inArray = false;
                arrayItems = [];
            }
            
            // 处理键值对
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                
                // 处理嵌套对象
                if (key.includes('.')) {
                    this.setNestedValue(result, key, this.parseYAMLValue(value));
                } else if (value === '') {
                    // 可能是对象或数组的开始
                    currentKey = key;
                    inMultiLine = true;
                } else {
                    currentObject[key] = this.parseYAMLValue(value);
                }
            }
        }
        
        // 处理最后的数组
        if (inArray && currentKey) {
            currentObject[currentKey] = arrayItems;
        }
        
        return result;
    }
    
    /**
     * 解析YAML值
     */
    parseYAMLValue(value) {
        if (!value || value === '') return '';
        
        // 布尔值
        if (value === 'true') return true;
        if (value === 'false') return false;
        
        // null值
        if (value === 'null' || value === '~') return null;
        
        // 数字
        if (/^-?\d+$/.test(value)) return parseInt(value);
        if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
        
        // 引号包围的字符串
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        
        // 多行字符串标记
        if (value === '|' || value === '>') {
            return value; // 简化处理，实际应该处理后续行
        }
        
        // 普通字符串
        return value;
    }
    
    /**
     * 处理元数据
     */
    processMetadata(frontMatter, filePath) {
        const metadata = {
            // 基础信息
            title: frontMatter.title || '未命名公告',
            type: frontMatter.type || 'notice',
            priority: parseInt(frontMatter.priority) || 5,
            status: frontMatter.status || 'active',
            
            // 时间信息
            start_date: this.parseDate(frontMatter.start_date),
            end_date: this.parseDate(frontMatter.end_date),
            created_at: this.parseDate(frontMatter.created_at) || new Date(),
            updated_at: this.parseDate(frontMatter.updated_at) || new Date(),
            
            // 作者信息
            author: frontMatter.author || '未知',
            
            // 标签
            tags: Array.isArray(frontMatter.tags) ? frontMatter.tags : 
                  (frontMatter.tags ? frontMatter.tags.split(',').map(t => t.trim()) : []),
            
            // 显示配置
            display_config: {
                theme: 'glassmorphism',
                position: 'sidebar',
                animation: 'fadeInUp',
                closable: true,
                expandable: true,
                ...frontMatter.display_config
            },
            
            // 目标受众
            target_audience: Array.isArray(frontMatter.target_audience) ? 
                           frontMatter.target_audience : ['all'],
            
            // 文件信息
            file_path: filePath,
            file_name: filePath.split('/').pop(),
            
            // 其他属性
            ...frontMatter
        };
        
        // 验证并清理数据
        return this.cleanMetadata(metadata);
    }
    
    /**
     * 解析日期
     */
    parseDate(dateString) {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }
    
    /**
     * 清理元数据
     */
    cleanMetadata(metadata) {
        // 确保优先级在有效范围内
        metadata.priority = Math.max(1, Math.min(10, metadata.priority));
        
        // 验证状态
        const validStatuses = ['active', 'inactive', 'archived', 'draft'];
        if (!validStatuses.includes(metadata.status)) {
            metadata.status = 'active';
        }
        
        // 验证类型
        const validTypes = ['notice', 'event', 'maintenance', 'promotion', 'welcome'];
        if (!validTypes.includes(metadata.type)) {
            metadata.type = 'notice';
        }
        
        // 确保标签是数组
        if (!Array.isArray(metadata.tags)) {
            metadata.tags = [];
        }
        
        // 确保目标受众是数组
        if (!Array.isArray(metadata.target_audience)) {
            metadata.target_audience = ['all'];
        }
        
        return metadata;
    }
    
    /**
     * 处理内容
     */
    processContent(content) {
        if (!content) return '';
        
        // 基础清理
        let processed = content.trim();
        
        // 处理换行
        processed = processed.replace(/\r\n/g, '\n');
        
        // 移除过多的空行
        processed = processed.replace(/\n{3,}/g, '\n\n');
        
        // 处理相对链接
        processed = this.processRelativeLinks(processed);
        
        return processed;
    }
    
    /**
     * 处理相对链接
     */
    processRelativeLinks(content) {
        // 将相对链接转换为绝对链接或添加基础路径
        return content.replace(/\]\((?!https?:\/\/|\/\/)([^)]+)\)/g, (match, url) => {
            if (url.startsWith('/')) {
                return match; // 已经是根路径
            }
            // 相对路径，添加基础路径
            return match.replace(url, `/${url}`);
        });
    }
    
    /**
     * 验证公告数据
     */
    validateAnnouncementData(data) {
        const errors = [];
        const warnings = [];
        
        // 必需字段检查
        if (!data.title || data.title.trim() === '') {
            errors.push('标题不能为空');
        }
        
        if (!data.content || data.content.trim() === '') {
            warnings.push('内容为空');
        }
        
        // 时间逻辑检查
        if (data.start_date && data.end_date && data.start_date > data.end_date) {
            errors.push('开始时间不能晚于结束时间');
        }
        
        // 内容长度检查
        if (data.content && data.content.length > 50000) {
            warnings.push('内容过长，可能影响显示性能');
        }
        
        // 标题长度检查
        if (data.title && data.title.length > 200) {
            warnings.push('标题过长，建议控制在200字符以内');
        }
        
        // 有效性检查
        if (data.status === 'active') {
            const now = new Date();
            if (data.start_date && data.start_date > now) {
                warnings.push('公告尚未生效');
            }
            if (data.end_date && data.end_date < now) {
                warnings.push('公告已过期');
            }
        }
        
        // 记录验证结果
        data.validation = {
            errors,
            warnings,
            isValid: errors.length === 0,
            validatedAt: new Date().toISOString()
        };
        
        if (errors.length > 0) {
            console.error('公告数据验证失败:', errors);
        }
        
        if (warnings.length > 0) {
            console.warn('公告数据验证警告:', warnings);
        }
        
        return data;
    }
    
    /**
     * 验证文件路径
     */
    validateFilePath(filePath) {
        // 检查文件扩展名
        const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
        if (!this.config.allowedExtensions.includes(ext)) {
            throw new Error(`不支持的文件格式: ${ext}`);
        }
        
        // 检查路径安全性
        if (filePath.includes('..') || filePath.includes('//')) {
            throw new Error('不安全的文件路径');
        }
        
        // 检查是否在允许的目录内
        if (!filePath.startsWith(this.config.basePath)) {
            throw new Error('文件路径超出允许范围');
        }
    }
    
    /**
     * 获取模板文件列表
     */
    async getTemplates() {
        const templates = [];
        const templateTypes = ['notice', 'event', 'maintenance'];
        
        for (const type of templateTypes) {
            try {
                const filePath = `${this.config.basePath}${this.config.templatePath}${type}.md`;
                const template = await this.loadAnnouncementFile(filePath);
                templates.push({
                    type,
                    name: this.getTemplateName(type),
                    description: this.getTemplateDescription(type),
                    filePath,
                    template
                });
            } catch (error) {
                console.warn(`模板加载失败 (${type}):`, error.message);
            }
        }
        
        return templates;
    }
    
    /**
     * 获取模板名称
     */
    getTemplateName(type) {
        const names = {
            notice: '通知公告',
            event: '活动宣传',
            maintenance: '维护通知'
        };
        return names[type] || type;
    }
    
    /**
     * 获取模板描述
     */
    getTemplateDescription(type) {
        const descriptions = {
            notice: '用于发布重要通知和公告',
            event: '用于宣传活动和征集参与',
            maintenance: '用于通知系统维护和停机'
        };
        return descriptions[type] || '通用模板';
    }
    
    /**
     * 获取归档文件列表
     */
    async getArchivedAnnouncements() {
        // 在实际应用中，这里应该调用API或读取目录
        // 现在返回示例数据
        return [];
    }
    
    /**
     * 生成内容哈希
     */
    generateContentHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    /**
     * 缓存文件
     */
    cacheFile(filePath, data) {
        this.cache.set(filePath, {
            data,
            timestamp: Date.now(),
            hash: this.generateContentHash(JSON.stringify(data))
        });
        
        // 清理过期缓存
        this.cleanExpiredCache();
    }
    
    /**
     * 获取缓存文件
     */
    getCachedFile(filePath) {
        const cached = this.cache.get(filePath);
        
        if (cached && (Date.now() - cached.timestamp) < this.config.cacheTimeout) {
            return cached.data;
        }
        
        return null;
    }
    
    /**
     * 清理过期缓存
     */
    cleanExpiredCache() {
        const now = Date.now();
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.config.cacheTimeout) {
                this.cache.delete(key);
            }
        }
        
        // 清理解析缓存
        if (this.parseCache.size > 100) {
            const entries = Array.from(this.parseCache.entries());
            const toDelete = entries.slice(0, entries.length - 50);
            toDelete.forEach(([key]) => this.parseCache.delete(key));
        }
    }
    
    /**
     * 清除所有缓存
     */
    clearAllCache() {
        this.cache.clear();
        this.parseCache.clear();
    }
    
    /**
     * 设置嵌套值
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
     * 监听文件变化
     */
    watchFile(filePath, callback) {
        this.watchList.add({ filePath, callback });
        
        // 在实际应用中，这里应该设置文件系统监听
        // 或定期检查文件修改时间
    }
    
    /**
     * 停止监听文件
     */
    unwatchFile(filePath) {
        this.watchList = new Set(
            Array.from(this.watchList).filter(item => item.filePath !== filePath)
        );
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            parseCacheSize: this.parseCache.size,
            watchListSize: this.watchList.size,
            cacheHitRate: this.calculateCacheHitRate(),
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    
    /**
     * 计算缓存命中率
     */
    calculateCacheHitRate() {
        // 简化实现，实际应该记录命中统计
        return 0.85;
    }
    
    /**
     * 估算内存使用量
     */
    estimateMemoryUsage() {
        let size = 0;
        
        for (const cached of this.cache.values()) {
            size += JSON.stringify(cached).length;
        }
        
        for (const parsed of this.parseCache.values()) {
            size += JSON.stringify(parsed).length;
        }
        
        return `${Math.round(size / 1024)}KB`;
    }
}

/**
 * 公告文件错误类
 */
class AnnouncementFileError extends Error {
    constructor(message, filePath, originalError = null) {
        super(message);
        this.name = 'AnnouncementFileError';
        this.filePath = filePath;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            filePath: this.filePath,
            timestamp: this.timestamp,
            originalError: this.originalError ? {
                name: this.originalError.name,
                message: this.originalError.message
            } : null
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnnouncementFileManager,
        AnnouncementFileError
    };
}

// 全局变量
window.AnnouncementFileManager = AnnouncementFileManager;
window.AnnouncementFileError = AnnouncementFileError;

console.log('公告文件管理系统加载完成');