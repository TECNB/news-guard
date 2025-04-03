/**
 * API服务类，用于处理与后端的通信
 */

import type { ChunkCallback, StartCallback, StreamTag, Tag, TagType } from '../types/api';

const API_BASE_URL = "http://llm.flyfishxu.com/";

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
} 