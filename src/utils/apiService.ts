/**
 * API服务类，用于处理与后端的通信
 */

import type { ChunkCallback, StartCallback, StreamTag, Tag, TagType } from '../types/api';

const API_BASE_URL = "http://llm.flyfishxu.com/";
// const API_BASE_URL = "http://127.0.0.1:8000/";

class StreamProcessor {
    private activeTags: StreamTag[] = [];
    private buffer = '';
    private decoder = new TextDecoder('utf-8');

    constructor(
        private onChunk: ChunkCallback,
        private onStart: StartCallback
    ) { }

    private isChildTag(childIndex: number, parentIndex: number): boolean {
        let currentParent = this.activeTags[childIndex].parent;
        while (currentParent !== -1) {
            if (currentParent === parentIndex) return true;
            currentParent = this.activeTags[currentParent].parent;
        }
        return false;
    }

    private findLeafTags(): number[] {
        const hasChildren = new Array(this.activeTags.length).fill(false);

        this.activeTags.forEach((tag, i) => {
            if (tag.parent !== -1) hasChildren[tag.parent] = true;
        });

        return hasChildren
            .map((hasChild, index) => hasChild ? -1 : index)
            .filter(index => index !== -1);
    }

    private parseTag(content: string): Tag | null {
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

    private handleStartTag(tag: string, content: string) {
        const parentIndex = this.activeTags.length > 0 ? this.activeTags.length - 1 : -1;

        this.activeTags.push({
            tag,
            content: content.slice(content.indexOf('>') + 1),
            parent: parentIndex
        });

        this.onStart?.(tag);
    }

    private handleEndTag(endTag: string, content: string) {
        if (endTag === "done" && content === "</done>") {
            this.onChunk?.("done", ""); // 传递空字符串
            return; // 直接返回，不执行后续操作
        }
        const tagIndex = this.activeTags.findIndex(t => t.tag === endTag);
        if (tagIndex === -1) return;

        const tag = this.activeTags[tagIndex];
        if (content.indexOf('</') > 0) {
            tag.content += content.slice(0, content.indexOf('</'));
        }

        this.onChunk?.(tag.tag, tag.content);

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

    private handleContent(content: string) {
        if (this.activeTags.length === 0) return;

        const processedContent = content.replaceAll("\\n", "\n");
        const leafTags = this.findLeafTags();
        leafTags.forEach(index => {
            this.activeTags[index].content += processedContent;
        });
    }

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

// 新增：支持实时流式传输的处理器
class RealTimeStreamProcessor {
    private activeTags: StreamTag[] = [];
    private buffer = '';
    private decoder = new TextDecoder('utf-8');
    // 为了跟踪LLM标签当前内容
    private llmContent = '';

    constructor(
        private onChunk: ChunkCallback,
        private onStart: StartCallback
    ) { }

    private isChildTag(childIndex: number, parentIndex: number): boolean {
        let currentParent = this.activeTags[childIndex].parent;
        while (currentParent !== -1) {
            if (currentParent === parentIndex) return true;
            currentParent = this.activeTags[currentParent].parent;
        }
        return false;
    }

    private findLeafTags(): number[] {
        const hasChildren = new Array(this.activeTags.length).fill(false);

        this.activeTags.forEach((tag, i) => {
            if (tag.parent !== -1) hasChildren[tag.parent] = true;
        });

        return hasChildren
            .map((hasChild, index) => hasChild ? -1 : index)
            .filter(index => index !== -1);
    }

    private parseTag(content: string): Tag | null {
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

    private handleStartTag(tag: string, content: string) {
        const parentIndex = this.activeTags.length > 0 ? this.activeTags.length - 1 : -1;

        // 提取标签后的内容
        const tagContent = content.slice(content.indexOf('>') + 1);
        
        this.activeTags.push({
            tag,
            content: tagContent,
            parent: parentIndex
        });

        // 如果是LLM标签，立即发送初始内容（如果有）
        if (tag === 'llm' && tagContent.length > 0) {
            this.llmContent = tagContent;
            this.onChunk?.(tag, tagContent);
        }

        this.onStart?.(tag);
    }

    private handleEndTag(endTag: string, content: string) {
        if (endTag === "done" && content === "</done>") {
            this.onChunk?.("done", "");
            return;
        }
        
        const tagIndex = this.activeTags.findIndex(t => t.tag === endTag);
        if (tagIndex === -1) return;

        const tag = this.activeTags[tagIndex];
        if (content.indexOf('</') > 0) {
            const newContent = content.slice(0, content.indexOf('</'));
            tag.content += newContent;
            
            // 如果是LLM标签，发送最终部分
            if (endTag === 'llm' && newContent.length > 0) {
                this.llmContent += newContent;
                this.onChunk?.(endTag, this.llmContent);
            }
        }

        // 最终的完整内容回调（对于非LLM标签）
        if (endTag !== 'llm') {
            this.onChunk?.(tag.tag, tag.content);
        }

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

    private handleContent(content: string) {
        if (this.activeTags.length === 0) return;

        const processedContent = content.replaceAll("\\n", "\n");
        const leafTags = this.findLeafTags();
        
        leafTags.forEach(index => {
            const tag = this.activeTags[index];
            tag.content += processedContent;
            
            // 关键改动：如果是llm标签，每次有新内容就立即发送更新
            if (tag.tag === 'llm') {
                this.llmContent += processedContent;
                console.log(`流式LLM内容更新 [+${processedContent.length}字符]`);
                this.onChunk?.('llm', this.llmContent);
            }
        });
    }

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

    /**
     * 向检验任务发送问题并获取回答（实时流式响应版本）
     * @param sessionId 任务ID
     * @param prompt 用户输入的问题
     * @param onChunk 回调函数，处理每个标签的内容
     * @param onStart 回调函数，标签开始时触发
     * @param abilityLevel 能力级别
     */
    static async sendVerifyQuestion(
        sessionId: string,
        prompt: string,
        onChunk?: ChunkCallback,
        onStart?: StartCallback,
        abilityLevel: number = 2
    ): Promise<void> {
        const requestData: Record<string, unknown> = {
            session_id: sessionId,
            prompt,
            ability_level: abilityLevel
        };

        return this.postRealTimeStream('chat/resultQuestion', requestData, onChunk, onStart);
    }
}