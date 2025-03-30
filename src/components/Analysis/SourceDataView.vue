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
                        <div class="text-xs text-gray-500 mt-1">来源: {{ result.link || '未知来源' }}</div>
                    </div>
                </div>
            </div>

            <!-- 深度分析 -->
            <div v-if="parsedAnalysisData" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                <div class="flex items-center mb-2">
                    <el-tag type="primary" class="mr-2">深度分析</el-tag>
                    <h3 class="text-gray-700 font-medium">内容可信度细分分析</h3>
                </div>
                <div class="space-y-4">
                    <!-- 逻辑一致性 -->
                    <div v-if="parsedAnalysisData.logical_consistency && parsedAnalysisData.logical_consistency.length > 0" class="mt-2">
                        <h4 class="text-sm font-medium text-gray-700 mb-1 px-3">逻辑一致性问题</h4>
                        <div v-for="(item, idx) in parsedAnalysisData.logical_consistency" :key="`logic-${idx}`" 
                             class="p-3 bg-gray-50 rounded-md border-l-4 border-purple-400 mb-2">
                            <p class="text-gray-700">{{ item }}</p>
                        </div>
                    </div>
                    
                    <!-- 事实准确性 -->
                    <div v-if="parsedAnalysisData.factual_accuracy && parsedAnalysisData.factual_accuracy.length > 0" class="mt-2">
                        <h4 class="text-sm font-medium text-gray-700 mb-1 px-3">事实准确性问题</h4>
                        <div v-for="(item, idx) in parsedAnalysisData.factual_accuracy" :key="`fact-${idx}`" 
                             class="p-3 bg-gray-50 rounded-md border-l-4 border-blue-400 mb-2">
                            <p class="text-gray-700">{{ item }}</p>
                        </div>
                    </div>
                    
                    <!-- 主观和煽动性语言 -->
                    <div v-if="parsedAnalysisData.subjectivity_and_inflammatory_language && parsedAnalysisData.subjectivity_and_inflammatory_language.length > 0" class="mt-2">
                        <h4 class="text-sm font-medium text-gray-700 mb-1 px-3">主观和煽动性语言</h4>
                        <div v-for="(item, idx) in parsedAnalysisData.subjectivity_and_inflammatory_language" :key="`subj-${idx}`" 
                             class="p-3 bg-gray-50 rounded-md border-l-4 border-red-400 mb-2">
                            <p class="text-gray-700">{{ item }}</p>
                        </div>
                    </div>
                    
                    <!-- 因果相关性 -->
                    <div v-if="parsedAnalysisData.causal_relevance && parsedAnalysisData.causal_relevance.length > 0" class="mt-2">
                        <h4 class="text-sm font-medium text-gray-700 mb-1 px-3">因果相关性问题</h4>
                        <div v-for="(item, idx) in parsedAnalysisData.causal_relevance" :key="`causal-${idx}`" 
                             class="p-3 bg-gray-50 rounded-md border-l-4 border-yellow-400 mb-2">
                            <p class="text-gray-700">{{ item }}</p>
                        </div>
                    </div>
                    
                    <!-- 来源可信度 -->
                    <div v-if="parsedAnalysisData.source_credibility && parsedAnalysisData.source_credibility.length > 0" class="mt-2">
                        <h4 class="text-sm font-medium text-gray-700 mb-1 px-3">来源可信度问题</h4>
                        <div v-for="(item, idx) in parsedAnalysisData.source_credibility" :key="`source-${idx}`" 
                             class="p-3 bg-gray-50 rounded-md border-l-4 border-orange-400 mb-2">
                            <p class="text-gray-700">{{ item }}</p>
                        </div>
                    </div>
                    
                    <!-- 辟谣结果 -->
                    <div v-if="parsedAnalysisData.debunking_result && parsedAnalysisData.debunking_result.length > 0" class="mt-2">
                        <h4 class="text-sm font-medium text-gray-700 mb-1 px-3">辟谣结果</h4>
                        <div v-for="(item, idx) in parsedAnalysisData.debunking_result" :key="`debunk-${idx}`" 
                             class="p-3 bg-gray-50 rounded-md border-l-4 border-green-400 mb-2">
                            <p class="text-gray-700">{{ item }}</p>
                        </div>
                    </div>
                    
                    <!-- 外部佐证 -->
                    <div v-if="parsedAnalysisData.external_corroboration && parsedAnalysisData.external_corroboration.length > 0" class="mt-2">
                        <h4 class="text-sm font-medium text-gray-700 mb-1 px-3">外部佐证信息</h4>
                        <div v-for="(item, idx) in parsedAnalysisData.external_corroboration" :key="`extern-${idx}`" 
                             class="p-3 bg-gray-50 rounded-md border-l-4 border-teal-400 mb-2">
                            <p class="text-gray-700">{{ item }}</p>
                        </div>
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
        
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import type { Sentence } from '@/utils/types';
import { ref, watch, computed } from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 定义接口
interface AnalysisData {
    logical_consistency: string[];
    factual_accuracy: string[];
    subjectivity_and_inflammatory_language: string[];
    causal_relevance: string[];
    source_credibility: string[];
    debunking_result: string[];
    external_corroboration: string[];
}

// 定义组件的props
interface SourceDataType {
    searchInput: string;
    searchOutput: any[];
    llm: string;
    sentences: Sentence[];
    value?: {
        sentences: AnalysisData;
    };
}

const props = defineProps<{
    sourceData: SourceDataType;
}>();

// 流处理相关状态
const isStreaming = ref(false);
const llmContentRef = ref<HTMLElement | null>(null);
const copied = ref(false);

// 解析分析数据
const parsedAnalysisData = computed(() => {
    if (props.sourceData.value?.sentences) {
        return props.sourceData.value.sentences;
    }
    // 作为示例，返回一个固定的数据结构
    return {
        logical_consistency: [],
        factual_accuracy: [
            "苹果iOS18beta5终于来了，带来了大量优化吗？这个版本也被广大果粉简称为iOS18.5，很多用户都在问这个版本到底值不值得升级，相比iOS18.4带来了哪些优化呢？",
            "从iOS18.4升级到iOS18.5能明显感受到电池掉电的速度有所变慢，电池不会跳电了，而且电池健康没有下降，可能每个人的电池状态不同，可能有人会下降，这也正常，经过3小时的重度续航测试，iOS18.4剩余电量为44%，而iOS18.5剩余电量为53%，续航表现前所未有。",
            "信号方面，在iOS18.4的时候总感觉网速很慢，实测玩网游也很卡，延迟大多在60毫秒以上，下载速度不到5兆，全天大部分时间信号都处在1-3格之间，升级到iOS18.5网速变快了，玩网游都在40毫秒以下，下载速度提升到每秒25-35兆，全天大部分时间信号都在3-4格之间。",
            "目前这个版本修复了抖音直播的bug，相册bug也进行了修复，目前暂未遇到其他影响日常使用的bug。"
        ],
        subjectivity_and_inflammatory_language: [
            "前所未有的更新"
        ],
        causal_relevance: [],
        source_credibility: [],
        debunking_result: [],
        external_corroboration: []
    } as AnalysisData;
});

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