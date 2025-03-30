/**
 * API服务类，用于处理与后端的通信
 */
export class ApiService {
    // 要处理的标签列表
    private static readonly targetTags = ['session_id', 'article_title', 'article_content', 'llm', 'search_output', 'search_input', 'calculate','sentences'];

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
     * 在流式处理过程中处理可能包含的完整嵌套标签
     * @param nestedTag 嵌套标签名称
     * @param content 包含嵌套标签的当前累积内容
     * @param onChunk 回调函数
     */
    private static processNestedTagPartial(nestedTag: string, content: string, onChunk: (tag: string, content: string) => void): void {
        const startTag = `<${nestedTag}>`;
        const endTag = `</${nestedTag}>`;
        
        // 只处理完整的标签（有开始和结束）
        if (content.includes(startTag) && content.includes(endTag)) {
            const regex = new RegExp(`<${nestedTag}>([\\s\\S]*?)</${nestedTag}>`, 'g');
            let match;
            
            while ((match = regex.exec(content)) !== null) {
                const tagContent = match[1].trim();
                if (tagContent) {
                    onChunk(nestedTag, tagContent);
                }
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
        console.log('开始处理流式请求...');
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
                    
                    // 特殊处理LLM标签，实现流式显示
                    if (collectingTag === 'llm') {
                        // 保存当前累积的内容，用于处理嵌套标签
                        let currentContent = collectedContent;
                        
                        // 处理嵌套的标签
                        // 检查当前内容中是否有完整的search_input标签
                        this.processNestedTagPartial('search_input', currentContent, onChunk);
                        
                        // 检查当前内容中是否有完整的search_output标签
                        this.processNestedTagPartial('search_output', currentContent, onChunk);
                        
                        // 移除嵌套标签的内容，只保留真正的LLM内容用于流式显示
                        let processedContent = currentContent
                            .replace(/<search_input>[\s\S]*?<\/search_input>/g, '')
                            .replace(/<search_output>[\s\S]*?<\/search_output>/g, '')
                            .trim();
                        
                        // 确保移除可能存在的外层 llm 标签
                        processedContent = processedContent
                            .replace(/^<llm>|^<llm>\s+/s, '')
                            .replace(/<\/llm>$|\s+<\/llm>$/s, '')
                            .trim();
                        
                        // 将处理后的内容传递给回调
                        onChunk(collectingTag, processedContent);
                        console.log(`成功处理${collectingTag}标签，内容长度: ${processedContent.length}`);
                    }
                    
                    const endTag = `</${collectingTag}>`;
                    
                    // 检查是否包含结束标记
                    if (collectedContent.includes(endTag)) {
                        // 如果不是llm标签，才在这里处理（llm已经实时传递了）
                        if (collectingTag !== 'llm') {
                            // 提取标签内容
                            const extracted = this.extractTagContent(collectingTag, collectedContent);
                            
                            if (extracted) {
                                let processedContent = extracted;
                                
                                // 对于所有标签，都调用回调函数
                                onChunk(collectingTag, processedContent);
                                console.log(`成功处理${collectingTag}标签，内容长度: ${processedContent.length}`);
                            } else {
                                console.warn(`未能正确匹配 ${collectingTag}`);
                            }
                        } else {
                            // 对于 llm 标签，在结束时发送一次完整的、清理过的内容
                            // 这确保了最终的内容是完整且干净的
                            const extracted = this.extractTagContent(collectingTag, collectedContent);
                            if (extracted) {
                                let finalContent = extracted
                                    .replace(/<search_input>[\s\S]*?<\/search_input>/g, '')
                                    .replace(/<search_output>[\s\S]*?<\/search_output>/g, '')
                                    .trim();
                                
                                // 确保移除可能存在的外层 llm 标签
                                finalContent = finalContent
                                    .replace(/^<llm>|^<llm>\s+/s, '')
                                    .replace(/<\/llm>$|\s+<\/llm>$/s, '')
                                    .trim();
                                
                                // 最后一次传递完整内容
                                onChunk(collectingTag, finalContent);
                            }
                        }
                        
                        // 重置状态
                        collectingTag = null;
                        collectedContent = '';
                        
                        // 检查是否有新的起始标签
                        const newTag = this.findNewStartTag(content);
                        if (newTag) {
                            collectingTag = newTag;
                            collectedContent = content;
                            
                            // 如果是llm标签，立即开始流式显示
                            if (newTag === 'llm') {
                                onChunk(newTag, "");
                            }
                            
                            console.log(`开始收集 ${newTag} 标签内容`);
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
                            
                            // 如果是llm标签，立即开始流式显示
                            if (newTag === 'llm') {
                                onChunk(newTag, "");
                            }
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

    /**
     * 与 LLM 进行聊天
     * @param prompt 用户输入的提示
     * @param onChunk 回调函数，处理每个标签的内容
     * @param sessionId 会话ID，如果不提供则创建新会话
     * @param abilityLevel 能力级别
     */
    static async chatWithLLM(
        prompt: string,
        onChunk: (tag: string, content: string) => void,
        sessionId?: string,
        abilityLevel: number = 2
    ) {
        const requestData: any = {
            prompt,
            ability_level: abilityLevel
        };

        // 如果提供了 sessionId，则添加到请求中
        if (sessionId) {
            requestData.session_id = sessionId;
        }

        return this.postStream('http://llm.flyfishxu.com/chat', requestData, onChunk);
    }
} 