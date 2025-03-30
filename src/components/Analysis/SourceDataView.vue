<template>
    <div class="h-full w-full overflow-hidden transition-all duration-300">
        <!-- <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">结果来源详情</h2>
        </div> -->
        
        <el-scrollbar height="95%" class="w-full">
            <!-- 搜索输入 -->
            <div v-if="sourceData.searchInput" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                <div class="flex items-center mb-2">
                    <el-tag type="info" class="mr-2">搜索输入</el-tag>
                    <h3 class="text-gray-700 font-medium">用于验证的搜索条件</h3>
                </div>
                <p class="text-gray-600 bg-gray-50 p-3 rounded-md">{{ sourceData.searchInput }}</p>
            </div>
            
            <!-- 搜索结果 -->
            <div v-if="sourceData.searchOutput.length > 0" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                <div class="flex items-center mb-2">
                    <el-tag type="success" class="mr-2">搜索结果</el-tag>
                    <h3 class="text-gray-700 font-medium">网络搜索发现的相关信息</h3>
                </div>
                <div class="space-y-3">
                    <div v-for="(result, idx) in sourceData.searchOutput" :key="idx" class="p-3 bg-gray-50 rounded-md border-l-4 border-green-400">
                        <h4 class="font-medium text-gray-800 mb-1">{{ result.title }}</h4>
                        <p class="text-gray-600">{{ result.snippet }}</p>
                        <div class="text-xs text-gray-500 mt-1">来源: {{ result.source || '未知来源' }}</div>
                    </div>
                </div>
            </div>
            
            <!-- LLM分析 -->
            <div v-if="sourceData.llm" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                <div class="flex items-center mb-2">
                    <el-tag type="warning" class="mr-2">AI分析</el-tag>
                    <h3 class="text-gray-700 font-medium">AI模型分析结果</h3>
                    <div v-if="isStreaming" class="ml-2 flex items-center">
                        <span class="typing-indicator"></span>
                    </div>
                </div>
                <div class="text-left py-1 w-full">
                    <div v-if="isJsonMode" class="bg-gray-50 border border-gray-200 rounded-md m-0">
                        <div class="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                            <span class="text-gray-500 text-xs font-semibold">JSON</span>
                            <button @click="copyJson" class="bg-transparent border-none text-blue-600 text-xs cursor-pointer px-1.5 py-0.5 rounded transition-colors duration-200 hover:bg-blue-50">
                                <span v-if="copied">已复制</span>
                                <span v-else>复制</span>
                            </button>
                        </div>
                        <pre ref="llmContentRef" class="m-0 p-4 break-words break-all whitespace-pre-wrap"><code class="hljs language-json font-mono text-xs leading-relaxed" v-html="currentFormatted"></code></pre>
                    </div>
                    <pre v-else ref="llmContentRef" class="bg-gray-50 border border-gray-200 rounded-md m-0 p-4 font-mono text-xs leading-relaxed break-words break-all whitespace-pre-wrap" :class="{ 'typing': isStreaming, 'streaming-border': isStreaming }">{{ currentContent }}</pre>
                </div>
            </div>
            
            <!-- 句子分析 -->
            <div v-if="sourceData.sentences.length > 0" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                <div class="flex items-center mb-2">
                    <el-tag type="danger" class="mr-2">句子分析</el-tag>
                    <h3 class="text-gray-700 font-medium">文章句子拆解分析</h3>
                </div>
                <div class="space-y-2">
                    <div v-for="(sentence, idx) in sourceData.sentences" :key="idx" 
                        class="p-3 bg-gray-50 rounded-md flex items-center gap-2"
                        :class="{
                            'border-l-4 border-red-400': sentence.importance === 3,
                            'border-l-4 border-yellow-400': sentence.importance === 2,
                            'border-l-4 border-blue-400': sentence.importance === 1
                        }">
                        <el-tag size="small" :type="sentence.importance === 3 ? 'danger' : sentence.importance === 2 ? 'warning' : 'info'">
                            {{ sentence.importance === 3 ? '高' : sentence.importance === 2 ? '中' : '低' }}
                        </el-tag>
                        <p class="text-gray-700">{{ sentence.text }}</p>
                    </div>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import type { Sentence } from '@/utils/types';
import { ref, watch, computed } from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 定义组件的props
interface SourceDataType {
    searchInput: string;
    searchOutput: any[];
    llm: string;
    sentences: Sentence[];
}

const props = defineProps<{
    sourceData: SourceDataType;
}>();

// 流处理相关状态
const isStreaming = ref(false);
const llmContentRef = ref<HTMLElement | null>(null);
const copied = ref(false);

// 检查是否处于JSON模式
const isJsonMode = computed(() => {
    if (!props.sourceData.llm) return false;
    try {
        // 尝试解析内容是否为JSON格式
        JSON.parse(props.sourceData.llm);
        return true;
    } catch (e) {
        // 解析失败，不是JSON格式
        return false;
    }
});

// 提取当前内容
const currentContent = computed(() => {
    // 返回原始内容，无需提取
    return props.sourceData.llm || '';
});

// 格式化和高亮处理后的内容
const currentFormatted = computed(() => {
    if (!isJsonMode.value) return currentContent.value;
    try {
        // 尝试格式化和高亮JSON
        const jsonObj = JSON.parse(currentContent.value);
        const formatted = JSON.stringify(jsonObj, null, 2);
        return hljs.highlight(formatted, { language: 'json' }).value;
    } catch (e) {
        // 如果解析失败，返回原始内容
        return currentContent.value;
    }
});

// 复制JSON内容
const copyJson = async () => {
    try {
        const jsonContent = currentContent.value;
        await navigator.clipboard.writeText(jsonContent);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
};

// 监听llm内容变化，自动滚动到底部
watch(() => props.sourceData.llm, (newValue, oldValue) => {
    if (newValue && newValue !== oldValue) {
        isStreaming.value = true;
        // 自动滚动到底部
        setTimeout(() => {
            if (llmContentRef.value) {
                const scrollContainer = llmContentRef.value.closest('.el-scrollbar__wrap');
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                } else {
                    llmContentRef.value.scrollTop = llmContentRef.value.scrollHeight;
                }
            }
        }, 50);
        
        // 检查JSON是否已完成 - 如果最后字符是 } 并且是有效JSON，则认为流结束
        if (typeof newValue === 'string' && newValue.trim().endsWith('}')) {
            try {
                JSON.parse(newValue.trim());
                // 如果成功解析为JSON，表示流式传输已完成
                setTimeout(() => {
                    isStreaming.value = false;
                }, 500); // 稍微延迟关闭流状态，确保UI效果平滑
            } catch (e) {
                // 解析失败，说明JSON还不完整，继续保持streaming状态
            }
        }
    }
});

// 当llm内容为空时，重置流状态
watch(() => props.sourceData.llm, (newValue) => {
    if (!newValue) {
        isStreaming.value = false;
    }
}, { immediate: true });
</script>

<style scoped>
/* 流式输入指示器样式 */
.typing-indicator {
    @apply inline-block relative w-4 h-4;
}

.typing-indicator::after {
    content: '...';
    position: absolute;
    animation: typingDots 1.5s infinite;
    color: #E6A23C;
    font-weight: bold;
}

@keyframes typingDots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
}

/* 添加打字机光标效果 */
pre {
    @apply relative max-w-full break-words;
}

pre.typing::after {
    content: '';
    @apply absolute inline-block ml-0.5 w-0.5 h-[1.2em] bg-[#E6A23C] opacity-0;
    animation: cursor-blink 0.8s infinite;
}

@keyframes cursor-blink {
    0%, 49% { opacity: 0; }
    50%, 100% { opacity: 1; }
}

/* 流式输入边框高亮效果 */
.streaming-border {
    @apply border-2 border-transparent;
    animation: border-pulse 2s infinite;
}

@keyframes border-pulse {
    0% { border-color: rgba(230, 162, 60, 0.2); }
    50% { border-color: rgba(230, 162, 60, 0.8); }
    100% { border-color: rgba(230, 162, 60, 0.2); }
}

.break-all {
  word-wrap: break-word;
  word-break: break-all;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style> 