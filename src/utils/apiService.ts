/**
 * API服务类，用于处理与后端的通信
 */
export class ApiService {
    // 要处理的标签列表
    private static readonly targetTags = ['id', 'article_title', 'article_content', 'llm', 'search_output', 'search_input', 'calculate','sentences'];

    /**
     * 从文本中提取标签内容
     * @param tag 标签名
     * @param text 包含标签的文本
     * @returns 提取的内容，如果未找到则返回null
     */
    private static extractTagContent(tag: string, text: string): string | null {
        const startTag = `<${tag}>`;
        const endTag = `</${tag}>`;
        const regex = new RegExp(`${startTag}([\\s\\S]*?)${endTag}`);
        const match = text.match(regex);
        
        return match ? match[1].trim() : null;
    }

    /**
     * 处理 llm 标签内的嵌套标签
     * @param llmContent llm标签内容
     * @param onChunk 回调函数
     * @returns 处理后的llm内容（已移除嵌套标签）
     */
    private static processNestedTags(llmContent: string, onChunk: (tag: string, content: string) => void): string {
        let processedContent = llmContent;
        
        // 处理嵌套的search_input标签
        this.processNestedTag('search_input', processedContent, onChunk);
        
        // 处理嵌套的search_output标签
        this.processNestedTag('search_output', processedContent, onChunk);
        
        // 删除解析过的嵌套标签，以免重复处理
        return processedContent
            .replace(/<search_input>[\s\S]*?<\/search_input>/g, '')
            .replace(/<search_output>[\s\S]*?<\/search_output>/g, '')
            .trim();
    }

    /**
     * 处理特定类型的嵌套标签
     * @param nestedTag 嵌套标签名称
     * @param content 包含嵌套标签的内容
     * @param onChunk 回调函数
     */
    private static processNestedTag(nestedTag: string, content: string, onChunk: (tag: string, content: string) => void): void {
        const regex = new RegExp(`<${nestedTag}>([\\s\\S]*?)</${nestedTag}>`, 'g');
        let match;
        
        while ((match = regex.exec(content)) !== null) {
            const tagContent = match[1].trim();
            if (tagContent) {
                onChunk(nestedTag, tagContent);
            }
        }
    }

    /**
     * 检查文本中是否包含完整的标签（开始和结束标记都在同一行）
     * @param content 要检查的文本
     * @param onChunk 回调函数
     * @returns 是否找到并处理了完整标签
     */
    private static processCompleteTag(content: string, onChunk: (tag: string, content: string) => void): boolean {
        for (const tag of this.targetTags) {
            const startTag = `<${tag}>`;
            const endTag = `</${tag}>`;
            
            if (content.includes(startTag) && content.includes(endTag)) {
                const extracted = this.extractTagContent(tag, content);
                if (extracted) {
                    onChunk(tag, extracted);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 查找文本中的新起始标签
     * @param content 要检查的文本
     * @returns 找到的标签名，如果没有找到则返回null
     */
    private static findNewStartTag(content: string): string | null {
        for (const tag of this.targetTags) {
            const startTag = `<${tag}>`;
            const endTag = `</${tag}>`;
            
            if (content.includes(startTag) && !content.includes(endTag)) {
                return tag;
            }
        }
        return null;
    }

    /**
     * 处理流式API请求
     * @param url API地址
     * @param data 请求数据
     * @param onChunk 回调函数，处理每个标签的内容
     */
    static async postStream(url: string, data: any, onChunk: (tag: string, content: string) => void) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error("请求失败，状态码:", response.status);
            return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        // 当前正在收集的标签和内容
        let collectingTag: string | null = null;
        let collectedContent = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留未完整的一行

            for (let line of lines) {
                line = line.trim();
                if (!line.startsWith('data:')) continue;

                const content = line.replace(/^data:\s*/, '');

                // 如果正在收集某个标签的内容
                if (collectingTag) {
                    collectedContent += content;
                    const endTag = `</${collectingTag}>`;
                    
                    // 检查是否包含结束标记
                    if (collectedContent.includes(endTag)) {
                        // 提取标签内容
                        const extracted = this.extractTagContent(collectingTag, collectedContent);
                        
                        if (extracted) {
                            let processedContent = extracted;
                            
                            // 如果是llm标签，处理嵌套标签
                            if (collectingTag === 'llm') {
                                processedContent = this.processNestedTags(extracted, onChunk);
                            }
                            
                            // 如果处理后还有内容，调用回调函数
                            if (processedContent) {
                                onChunk(collectingTag, processedContent);
                            }
                        } else {
                            console.warn(`未能正确匹配 ${collectingTag}`);
                        }
                        
                        // 重置状态
                        collectingTag = null;
                        collectedContent = '';
                        
                        // 检查是否有新的起始标签
                        const newTag = this.findNewStartTag(content);
                        if (newTag) {
                            collectingTag = newTag;
                            collectedContent = content;
                        }
                    }
                } else {
                    // 首先尝试处理完整标签
                    const foundCompleteTag = this.processCompleteTag(content, onChunk);
                    
                    // 如果没有找到完整标签，检查是否有新的起始标签
                    if (!foundCompleteTag) {
                        const newTag = this.findNewStartTag(content);
                        if (newTag) {
                            collectingTag = newTag;
                            collectedContent = content;
                        }
                    }
                }
            }
        }

        console.log("流式请求完成");
    }

    /**
     * 分析网页内容
     * @param url 网页地址
     * @param abilityLevel 能力级别
     * @param onChunk 回调函数
     */
    static async analyzeWebContent(url: string, abilityLevel: number = 2, onChunk: (tag: string, content: string) => void) {
        return this.postStream('http://llm.flyfishxu.com/analyzeWeb', {
            url,
            ability_level: abilityLevel
        }, onChunk);
    }
} 