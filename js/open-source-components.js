/**
 * 开源组件集成框架
 * 用于集成第三方开源组件到公告栏系统
 */

class OpenSourceComponentFramework {
    constructor() {
        this.components = new Map();
        this.plugins = new Map();
        this.loadedComponents = new Set();
        this.config = {
            baseUrl: '',
            timeout: 10000,
            retryTimes: 3
        };
    }
    
    /**
     * 注册组件
     */
    registerComponent(name, componentConfig) {
        const config = {
            name,
            version: '1.0.0',
            description: '',
            author: '',
            dependencies: [],
            cdnUrls: [],
            initFunction: null,
            configSchema: {},
            ...componentConfig
        };
        
        this.components.set(name, config);
        console.log(`组件 ${name} 注册成功`);
    }
    
    /**
     * 加载组件
     */
    async loadComponent(name, userConfig = {}) {
        const component = this.components.get(name);
        if (!component) {
            throw new Error(`组件 ${name} 未注册`);
        }
        
        if (this.loadedComponents.has(name)) {
            console.log(`组件 ${name} 已加载`);
            return;
        }
        
        try {
            // 加载依赖
            await this.loadDependencies(component.dependencies);
            
            // 加载CDN资源
            await this.loadCDNResources(component.cdnUrls);
            
            // 初始化组件
            if (component.initFunction) {
                await component.initFunction(userConfig);
            }
            
            this.loadedComponents.add(name);
            console.log(`组件 ${name} 加载成功`);
            
        } catch (error) {
            console.error(`组件 ${name} 加载失败:`, error);
            throw error;
        }
    }
    
    /**
     * 加载CDN资源
     */
    async loadCDNResources(urls) {
        const promises = urls.map(url => this.loadResource(url));
        await Promise.all(promises);
    }
    
    /**
     * 加载单个资源
     */
    loadResource(url) {
        return new Promise((resolve, reject) => {
            const isCSS = url.endsWith('.css');
            const element = isCSS ? 
                document.createElement('link') : 
                document.createElement('script');
            
            element.onload = resolve;
            element.onerror = reject;
            
            if (isCSS) {
                element.rel = 'stylesheet';
                element.href = url;
            } else {
                element.src = url;
            }
            
            document.head.appendChild(element);
        });
    }
    
    /**
     * 创建组件实例
     */
    createComponentInstance(name, config, container) {
        const templates = {
            funds: this.createFundsComponent,
            weather: this.createWeatherComponent,
            hitokoto: this.createHitokotoComponent,
            github: this.createGitHubComponent
        };
        
        const createFunction = templates[name];
        if (createFunction) {
            return createFunction.call(this, config, container);
        }
        
        throw new Error(`未找到组件模板: ${name}`);
    }
    
    /**
     * 基金组件
     */
    createFundsComponent(config, container) {
        const fundsData = [
            { name: '沪深300', code: '000300', price: '4125.32', change: '+1.25%' },
            { name: '中证500', code: '000905', price: '6234.56', change: '-0.58%' }
        ];
        
        container.innerHTML = `
            <div class="component-funds">
                <h4>📈 基金持仓</h4>
                ${fundsData.map(fund => `
                    <div class="fund-item">
                        <span class="fund-name">${fund.name}</span>
                        <span class="fund-price ${fund.change.startsWith('+') ? 'positive' : 'negative'}">
                            ${fund.price} (${fund.change})
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * 天气组件
     */
    createWeatherComponent(config, container) {
        container.innerHTML = `
            <div class="component-weather">
                <h4>🌤️ 今日天气</h4>
                <div class="weather-info">
                    <div class="temperature">22°C</div>
                    <div class="description">晴转多云</div>
                    <div class="location">北京</div>
                </div>
            </div>
        `;
    }
    
    /**
     * 一言组件
     */
    createHitokotoComponent(config, container) {
        container.innerHTML = `
            <div class="component-hitokoto">
                <h4>💭 一言</h4>
                <blockquote class="hitokoto-text">
                    "代码是写给人看的，只是偶尔让计算机执行一下。"
                </blockquote>
                <cite class="hitokoto-from">—— Harold Abelson</cite>
            </div>
        `;
    }
    
    /**
     * GitHub组件
     */
    createGitHubComponent(config, container) {
        container.innerHTML = `
            <div class="component-github">
                <h4>🐙 GitHub</h4>
                <div class="github-stats">
                    <div class="stat-item">
                        <span class="stat-label">Repositories</span>
                        <span class="stat-value">42</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Followers</span>
                        <span class="stat-value">128</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// 预定义组件注册
const framework = new OpenSourceComponentFramework();

// 注册组件
framework.registerComponent('funds', {
    description: '显示基金数据',
    dependencies: [],
    cdnUrls: []
});

framework.registerComponent('weather', {
    description: '显示天气信息',
    dependencies: [],
    cdnUrls: []
});

framework.registerComponent('hitokoto', {
    description: '显示一言',
    dependencies: [],
    cdnUrls: []
});

framework.registerComponent('github', {
    description: '显示GitHub统计',
    dependencies: [],
    cdnUrls: []
});

// 导出
window.OpenSourceComponentFramework = OpenSourceComponentFramework;
window.componentFramework = framework;

console.log('开源组件集成框架加载完成');