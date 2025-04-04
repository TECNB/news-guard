/**
 * API服务类，用于处理与后端的通信
 */

import type { ChunkCallback, StartCallback, StreamTag, Tag, TagType } from '../types/api';

const API_BASE_URL = "http://llm.flyfishxu.com/";

/**
 * 流处理器基类，包含共同的流处理逻辑
 */
abstract class BaseStreamProcessor {
    protected activeTags: StreamTag[] = [];
    protected buffer = '';
    protected decoder = new TextDecoder('utf-8');

    constructor(
        protected onChunk: ChunkCallback,
        protected onStart: StartCallback
    ) { }

    protected isChildTag(childIndex: number, parentIndex: number): boolean {
        let currentParent = this.activeTags[childIndex].parent;
        while (currentParent !== -1) {
            if (currentParent === parentIndex) return true;
            currentParent = this.activeTags[currentParent].parent;
        }
        return false;
    }

    protected findLeafTags(): number[] {
        const hasChildren = new Array(this.activeTags.length).fill(false);

        this.activeTags.forEach((tag, i) => {
            if (tag.parent !== -1) hasChildren[tag.parent] = true;
        });

        return hasChildren
            .map((hasChild, index) => hasChild ? -1 : index)
            .filter(index => index !== -1);
    }

    protected parseTag(content: string): Tag | null {
        const startMatch = content.match(
            /<(article_title|article_content|llm|search_output|search_input|calculate|current_time|session_id|done|sentences)>/
        );
        if (startMatch) {
            return {
                name: startMatch[1],
                start: true,
                index: startMatch.index!
            };
        }

        const endMatch = content.match(
            /<\/(article_title|article_content|llm|search_output|search_input|calculate|current_time|session_id|done|sentences)>/
        );
        if (endMatch) {
            return {
                name: endMatch[1],
                start: false,
                index: endMatch.index!
            };
        }

        return null;
    }

    // 基础方法，子类可以选择性重写或调用
    protected handleStartTag(tag: string, content: string) {
        const parentIndex = this.activeTags.length > 0 ? this.activeTags.length - 1 : -1;
        const tagContent = content.slice(content.indexOf('>') + 1);
        
        this.activeTags.push({
            tag,
            content: tagContent,
            parent: parentIndex
        });

        this.onStart?.(tag);
        
        // 子类可以通过重写这个方法来添加额外行为
        this.onTagStart(tag, tagContent);
    }
    
    // 钩子方法，子类可以重写来添加额外行为
    protected onTagStart(tag: string, content: string): void {}
    protected onTagContent(tag: StreamTag, content: string): void {}
    protected onTagEnd(tag: StreamTag, finalContent: string): void {}

    // 基础的结束标签处理逻辑
    protected handleEndTag(endTag: string, content: string) {
        // 特殊情况：处理done标签
        if (endTag === "done" && content === "</done>") {
            this.onChunk?.("done", "");
            return;
        }
        
        const tagIndex = this.activeTags.findIndex(t => t.tag === endTag);
        if (tagIndex === -1) return;

        const tag = this.activeTags[tagIndex];
        
        // 提取标签结束前的最后内容
        if (content.indexOf('</') > 0) {
            const newContent = content.slice(0, content.indexOf('</'));
            tag.content += newContent;
            
            // 调用钩子方法，子类可以添加特定行为
            this.onTagEnd(tag, newContent);
        }

        // 清理子标签
        const childIndices: number[] = [];
        for (let i = tagIndex + 1; i < this.activeTags.length; i++) {
            if (this.isChildTag(i, tagIndex)) childIndices.push(i);
        }

        childIndices.reverse().forEach(index => {
            this.activeTags.splice(index, 1);
        });
        
        if (endTag !== "done") {
            this.activeTags.splice(tagIndex, 1);
        }
    }

    // 基础的内容处理逻辑
    protected handleContent(content: string) {
        if (this.activeTags.length === 0) return;

        const processedContent = content.replaceAll("\\n", "\n");
        const leafTags = this.findLeafTags();
        
        leafTags.forEach(index => {
            const tag = this.activeTags[index];
            tag.content += processedContent;
            
            // 调用钩子方法，子类可以添加特定行为
            this.onTagContent(tag, processedContent);
        });
    }

    // 公共流处理方法，两个子类都一样
    async processStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            this.buffer += this.decoder.decode(value, { stream: true });
            const lines = this.buffer.split('\n');
            this.buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.trim().startsWith('data:')) continue;
                const content = line.replace(/^data:(\s)?/, '');

                const tag = this.parseTag(content);
                if (tag?.start) {
                    this.handleStartTag(tag.name, content);
                } else if (tag?.start === false) {
                    this.handleEndTag(tag.name, content);
                } else {
                    this.handleContent(content);
                }
            }
        }
    }
}

/**
 * 标准流处理器 - 完成后发送内容
 */
class StreamProcessor extends BaseStreamProcessor {
    // 重写钩子方法，在标签结束时发送内容
    protected onTagEnd(tag: StreamTag, finalContent: string): void {
        // 发送标签完整内容
        this.onChunk?.(tag.tag, tag.content);
    }
}

/**
 * 实时流处理器 - 接收到内容块时立即发送
 */
class RealTimeStreamProcessor extends BaseStreamProcessor {
    // 为了跟踪LLM标签当前内容
    private llmContent = '';

    // 重写钩子方法，在LLM标签开始时处理
    protected onTagStart(tag: string, content: string): void {
        // 如果是LLM标签，立即发送初始内容（如果有）
        if (tag === 'llm' && content.length > 0) {
            this.llmContent = content;
            this.onChunk?.(tag, content);
        }
    }
    
    // 重写钩子方法，在标签有新内容时处理
    protected onTagContent(tag: StreamTag, content: string): void {
        // 关键改动：如果是llm标签，每次有新内容就立即发送更新
        if (tag.tag === 'llm') {
            this.llmContent += content;
            console.log(`流式LLM内容更新 [+${content.length}字符]`);
            this.onChunk?.('llm', this.llmContent);
        }
    }
    
    // 重写钩子方法，在标签结束时处理
    protected onTagEnd(tag: StreamTag, finalContent: string): void {
        // 如果是LLM标签且有新内容，发送最终更新
        if (tag.tag === 'llm' && finalContent.length > 0) {
            this.llmContent += finalContent;
            this.onChunk?.(tag.tag, this.llmContent);
        } 
        // 对于非LLM标签，发送最终内容
        else if (tag.tag !== 'llm') {
            this.onChunk?.(tag.tag, tag.content);
        }
    }
}

export class ApiService {
    /**
     * 处理流式API请求
     * @param path API路径
     * @param data 请求数据
     * @param onChunk 回调函数，处理每个标签的内容
     * @param onStart 回调函数，标签开始时触发
     */
    static async postStream(
        path: string,
        data: Record<string, unknown>,
        onChunk?: ChunkCallback,
        onStart?: StartCallback
    ): Promise<void> {
        console.log('开始处理流式请求...');

        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error("请求失败，状态码:", response.status);
            throw new Error(`请求失败，状态码: ${response.status}`);
        }

        const processor = new StreamProcessor(
            onChunk || (() => { }),
            onStart || (() => { })
        );

        await processor.processStream(response.body!.getReader());
        console.log("流式请求完成");
    }

    /**
     * 处理实时流式API请求（每个标签数据块接收时立即触发回调）
     * @param path API路径
     * @param data 请求数据
     * @param onChunk 回调函数，处理每个标签的内容
     * @param onStart 回调函数，标签开始时触发
     */
    static async postRealTimeStream(
        path: string,
        data: Record<string, unknown>,
        onChunk?: ChunkCallback,
        onStart?: StartCallback
    ): Promise<void> {
        console.log('开始处理实时流式请求...');

        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            console.error("请求失败，状态码:", response.status);
            throw new Error(`请求失败，状态码: ${response.status}`);
        }

        const processor = new RealTimeStreamProcessor(
            onChunk || (() => { }),
            onStart || (() => { })
        );

        await processor.processStream(response.body!.getReader());
        console.log("实时流式请求完成");
    }

    /**
     * 分析网页内容
     * @param url 网页地址
     * @param abilityLevel 能力级别
     * @param onChunk 回调函数，处理每个标签的内容
     * @param onStart 回调函数，标签开始时触发
     */
    static async analyzeWebContent(
        url: string,
        abilityLevel: number = 2,
        onChunk?: ChunkCallback,
        onStart?: StartCallback
    ): Promise<void> {
        return this.postStream('analyzeWeb', {
            url,
            ability_level: abilityLevel
        }, onChunk, onStart);
    }

    /**
     * 与 LLM 进行聊天
     * @param prompt 用户输入的提示
     * @param onChunk 回调函数，处理每个标签的内容
     * @param onStart 回调函数，标签开始时触发
     * @param sessionId 会话ID，如果不提供则创建新会话
     * @param abilityLevel 能力级别
     */
    static async chatWithLLM(
        prompt: string,
        onChunk?: ChunkCallback,
        onStart?: StartCallback,
        sessionId?: string,
        abilityLevel: number = 2
    ): Promise<void> {
        const requestData: Record<string, unknown> = {
            prompt,
            ability_level: abilityLevel
        };

        // 如果提供了 sessionId，则添加到请求中
        if (sessionId) {
            requestData.session_id = sessionId;
        }

        return this.postStream('chat', requestData, onChunk, onStart);
    }

    /**
     * 与 LLM 进行聊天（实时流式响应版本）
     * 此方法在接收到每个LLM内容块时就立即触发回调，而不是等到标签完成后
     * @param prompt 用户输入的提示
     * @param onChunk 回调函数，处理每个标签的内容
     * @param onStart 回调函数，标签开始时触发
     * @param sessionId 会话ID，如果不提供则创建新会话
     * @param abilityLevel 能力级别
     */
    static async chatWithLLMStream(
        prompt: string,
        onChunk?: ChunkCallback,
        onStart?: StartCallback,
        sessionId?: string, 
        abilityLevel: number = 2
    ): Promise<void> {
        const requestData: Record<string, unknown> = {
            prompt,
            ability_level: abilityLevel
        };

        // 如果提供了 sessionId，则添加到请求中
        if (sessionId) {
            requestData.session_id = sessionId;
        }

        return this.postRealTimeStream('chat', requestData, onChunk, onStart);
    }
}