class CodeCopyEnhanced {
    constructor() {
        this.init();
    }

    init() {
        this.addStyles();
        this.enhanceCodeBlocks();
        this.observeNewCodeBlocks();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .code-block-wrapper {
                position: relative;
                margin: 1rem 0;
                border-radius: 8px;
                overflow: hidden;
                background: rgba(0, 0, 0, 0.05);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
            }

            .code-block-wrapper:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .code-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 1rem;
                background: rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(20px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .code-language {
                font-size: 0.75rem;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background: rgba(100, 116, 139, 0.1);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                backdrop-filter: blur(10px);
            }

            .code-copy-btn {
                position: relative;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 0.5rem 0.75rem;
                font-size: 0.75rem;
                font-weight: 500;
                color: #64748b;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .code-copy-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.3);
                color: #475569;
                transform: scale(1.05);
            }

            .code-copy-btn.copied {
                background: rgba(34, 197, 94, 0.2);
                border-color: rgba(34, 197, 94, 0.4);
                color: #22c55e;
            }

            .code-copy-icon {
                width: 14px;
                height: 14px;
                transition: all 0.2s ease;
            }

            .code-copy-btn.copied .code-copy-icon {
                transform: scale(1.2);
            }

            .code-block-content {
                position: relative;
                overflow-x: auto;
            }

            .code-block-content pre {
                margin: 0;
                padding: 1rem;
                background: transparent !important;
            }

            .code-block-content code {
                background: transparent !important;
            }

            @media (max-width: 768px) {
                .code-header {
                    padding: 0.4rem 0.75rem;
                }
                
                .code-copy-btn {
                    padding: 0.4rem 0.6rem;
                    font-size: 0.7rem;
                }
                
                .code-language {
                    font-size: 0.7rem;
                    padding: 0.2rem 0.4rem;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .code-block-wrapper,
                .code-copy-btn,
                .code-copy-icon {
                    transition: none;
                }
                
                .code-block-wrapper:hover {
                    transform: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    enhanceCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre code, .highlight, .code-block');
        
        codeBlocks.forEach(block => {
            if (!block.closest('.code-block-wrapper')) {
                this.wrapCodeBlock(block);
            }
        });
    }

    wrapCodeBlock(codeElement) {
        const pre = codeElement.tagName === 'PRE' ? codeElement : codeElement.closest('pre');
        const actualCodeElement = pre ? pre.querySelector('code') || codeElement : codeElement;
        
        if (!pre && codeElement.tagName !== 'CODE') return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        const header = document.createElement('div');
        header.className = 'code-header';
        
        const language = this.detectLanguage(actualCodeElement);
        const languageLabel = document.createElement('span');
        languageLabel.className = 'code-language';
        languageLabel.textContent = language || 'Code';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = `
            <svg class="code-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="m5 15-4-4 4-4"></path>
            </svg>
            Copy
        `;
        
        copyBtn.addEventListener('click', () => this.copyCode(actualCodeElement, copyBtn));
        
        header.appendChild(languageLabel);
        header.appendChild(copyBtn);
        
        const content = document.createElement('div');
        content.className = 'code-block-content';
        
        const targetElement = pre || actualCodeElement;
        targetElement.parentNode.insertBefore(wrapper, targetElement);
        
        wrapper.appendChild(header);
        wrapper.appendChild(content);
        content.appendChild(targetElement);
    }

    detectLanguage(codeElement) {
        const classList = Array.from(codeElement.classList);
        
        for (const className of classList) {
            if (className.startsWith('language-')) {
                return className.replace('language-', '').toUpperCase();
            }
            if (className.startsWith('hljs-')) {
                continue;
            }
            if (['javascript', 'js', 'python', 'py', 'html', 'css', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'typescript', 'ts', 'json', 'xml', 'yaml', 'sql', 'bash', 'shell'].includes(className.toLowerCase())) {
                return className.toUpperCase();
            }
        }
        
        const pre = codeElement.closest('pre');
        if (pre && pre.classList.length > 0) {
            for (const className of pre.classList) {
                if (className.startsWith('language-')) {
                    return className.replace('language-', '').toUpperCase();
                }
            }
        }
        
        const content = codeElement.textContent.trim();
        if (content.includes('function') && content.includes('{')) return 'JavaScript';
        if (content.includes('def ') && content.includes(':')) return 'Python';
        if (content.includes('<html') || content.includes('<!DOCTYPE')) return 'HTML';
        if (content.includes('SELECT') || content.includes('FROM')) return 'SQL';
        if (content.includes('#include') || content.includes('int main')) return 'C++';
        
        return null;
    }

    async copyCode(codeElement, button) {
        const code = codeElement.textContent;
        const originalContent = button.innerHTML;
        
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(code);
            } else {
                this.fallbackCopy(code);
            }
            
            button.classList.add('copied');
            button.innerHTML = `
                <svg class="code-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                Copied!
            `;
            
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalContent;
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy code:', err);
            button.innerHTML = `
                <svg class="code-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Error
            `;
            
            setTimeout(() => {
                button.innerHTML = originalContent;
            }, 2000);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    observeNewCodeBlocks() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const codeBlocks = node.querySelectorAll('pre code, .highlight, .code-block');
                        codeBlocks.forEach(block => {
                            if (!block.closest('.code-block-wrapper')) {
                                this.wrapCodeBlock(block);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.codeCopyEnhanced = new CodeCopyEnhanced();
    });
}