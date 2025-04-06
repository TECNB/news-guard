<template>
    <div class="SentenceAnalysis h-full w-full overflow-hidden transition-all duration-300">
        <el-scrollbar height="95%" class="w-full">
            <!-- 深度分析加载状态 -->
            <div v-if="loadingStatesData.sentences" class="border-b pb-5">
                <h2 class="text-[#49CFAD] text-xl font-bold text-left mb-4 flex items-center">
                    <span class="inline-block w-1 h-6 bg-[#49CFAD] mr-2 rounded-md"></span>
                    内容逐句分析
                    <div class="ml-3 loading-spinner"></div>
                </h2>
                <div class="space-y-5">
                    <div class="mt-3">
                        <h4 class="text-sm font-medium text-gray-700 mb-2 ml-1 flex items-center">
                            <span class="loading-dot bg-blue-400"></span>
                            <span class="loading-dot bg-red-400"></span>
                            <span class="loading-dot bg-yellow-400"></span>
                            分析细节
                        </h4>
                        <div class="skeleton-container">
                            <div class="skeleton-card">
                                <div class="skeleton-header"></div>
                                <div class="skeleton-content">
                                    <div class="skeleton-line"></div>
                                    <div class="skeleton-line"></div>
                                </div>
                            </div>
                            <div class="skeleton-card">
                                <div class="skeleton-header"></div>
                                <div class="skeleton-content">
                                    <div class="skeleton-line"></div>
                                    <div class="skeleton-line"></div>
                                </div>
                            </div>
                            <div class="skeleton-card">
                                <div class="skeleton-header"></div>
                                <div class="skeleton-content">
                                    <div class="skeleton-line"></div>
                                    <div class="skeleton-line"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 深度分析结果 -->
            <div v-if="!loadingStatesData.sentences && hasSentenceData" class="border-b pb-6">
                <h2 class="text-[#49CFAD] text-xl font-bold text-left mb-4 flex items-center">
                    <span class="inline-block w-1 h-6 bg-[#49CFAD] mr-2 rounded-md"></span>
                    内容逐句分析
                </h2>
                <div class="space-y-6">
                    <div v-if="analysisData.logical_consistency && analysisData.logical_consistency.length > 0"
                        class="mt-5 analysis-section">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 ml-1 flex items-center">
                            <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                            逻辑一致性问题
                        </h4>
                        <div v-for="(item, idx) in analysisData.logical_consistency" :key="`logic-${idx}`"
                            class="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-2 border-l-3 border-purple-500">
                            <p class="text-gray-600 font-medium">{{ item }}</p>
                        </div>
                    </div>

                    <div v-if="analysisData.factual_accuracy && analysisData.factual_accuracy.length > 0"
                        class="mt-5 analysis-section">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 ml-1 flex items-center">
                            <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                            事实准确性问题
                        </h4>
                        <div v-for="(item, idx) in analysisData.factual_accuracy" :key="`fact-${idx}`"
                            class="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-2 border-l-3 border-blue-500">
                            <p class="text-gray-600 font-medium">{{ item }}</p>
                        </div>
                    </div>

                    <div v-if="analysisData.subjectivity_and_inflammatory_language && analysisData.subjectivity_and_inflammatory_language.length > 0"
                        class="mt-5 analysis-section">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 ml-1 flex items-center">
                            <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                            主观和煽动性语言
                        </h4>
                        <div v-for="(item, idx) in analysisData.subjectivity_and_inflammatory_language"
                            :key="`subj-${idx}`"
                            class="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-2 border-l-3 border-red-500">
                            <p class="text-gray-600 font-medium">{{ item }}</p>
                        </div>
                    </div>

                    <div v-if="analysisData.causal_relevance && analysisData.causal_relevance.length > 0"
                        class="mt-5 analysis-section">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 ml-1 flex items-center">
                            <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                            因果相关性问题
                        </h4>
                        <div v-for="(item, idx) in analysisData.causal_relevance" :key="`causal-${idx}`"
                            class="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-2 border-l-3 border-yellow-500">
                            <p class="text-gray-600 font-medium">{{ item }}</p>
                        </div>
                    </div>

                    <div v-if="analysisData.source_credibility && analysisData.source_credibility.length > 0"
                        class="mt-5 analysis-section">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 ml-1 flex items-center">
                            <span class="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                            来源可信度问题
                        </h4>
                        <div v-for="(item, idx) in analysisData.source_credibility" :key="`source-${idx}`"
                            class="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-2 border-l-3 border-orange-500">
                            <p class="text-gray-600 font-medium">{{ item }}</p>
                        </div>
                    </div>

                    <div v-if="analysisData.debunking_result && analysisData.debunking_result.length > 0"
                        class="mt-5 analysis-section">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 ml-1 flex items-center">
                            <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                            辟谣结果
                        </h4>
                        <div v-for="(item, idx) in analysisData.debunking_result" :key="`debunk-${idx}`"
                            class="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-2 border-l-3 border-green-500">
                            <p class="text-gray-600 font-medium">{{ item }}</p>
                        </div>
                    </div>

                    <div v-if="analysisData.external_corroboration && analysisData.external_corroboration.length > 0"
                        class="mt-5 analysis-section">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 ml-1 flex items-center">
                            <span class="w-3 h-3 bg-teal-500 rounded-full mr-2"></span>
                            外部佐证信息
                        </h4>
                        <div v-for="(item, idx) in analysisData.external_corroboration" :key="`extern-${idx}`"
                            class="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 mb-2 border-l-3 border-teal-500">
                            <p class="text-gray-600 font-medium">{{ item }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 无深度分析结果时 -->
            <div v-if="!loadingStatesData.sentences && !hasSentenceData" class="border-b pb-6">
                <h2 class="text-[#49CFAD] text-xl font-bold text-left mb-4 flex items-center">
                    <span class="inline-block w-1 h-6 bg-[#49CFAD] mr-2 rounded-md"></span>
                    内容可信度细分分析
                </h2>
                <div
                    class="p-5 bg-white rounded-lg shadow-sm text-gray-500 text-center flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>未发现需要特别注意的问题</p>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import type { Sentence } from '@/utils/types';
import { computed } from 'vue';

interface SentencesData {
    logical_consistency: string[];
    factual_accuracy: string[];
    subjectivity_and_inflammatory_language: string[];
    causal_relevance: string[];
    source_credibility: string[];
    debunking_result: string[];
    external_corroboration: string[];
}

interface LoadingStates {
    sentences: boolean;
}

const props = defineProps<{
    sentencesData?: SentencesData;
    loadingStates?: LoadingStates;
}>();

// 创建默认值处理的计算属性
const analysisData = computed(() => {
    return props.sentencesData || {
        logical_consistency: [],
        factual_accuracy: [],
        subjectivity_and_inflammatory_language: [],
        causal_relevance: [],
        source_credibility: [],
        debunking_result: [],
        external_corroboration: []
    };
});

const loadingStatesData = computed(() => {
    return props.loadingStates || { sentences: false };
});

// 判断是否有句子数据
const hasSentenceData = computed(() => {
    if (!props.sentencesData) return false;

    return (
        props.sentencesData.logical_consistency?.length > 0 ||
        props.sentencesData.factual_accuracy?.length > 0 ||
        props.sentencesData.subjectivity_and_inflammatory_language?.length > 0 ||
        props.sentencesData.causal_relevance?.length > 0 ||
        props.sentencesData.source_credibility?.length > 0 ||
        props.sentencesData.debunking_result?.length > 0 ||
        props.sentencesData.external_corroboration?.length > 0
    );
});
</script>

<style scoped>
/* 加载中动画 */
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 0.7;
    }

    50% {
        opacity: 0.4;
    }
}

/* 新增旋转加载动画 */
.loading-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(73, 207, 173, 0.3);
    border-radius: 50%;
    border-top-color: #49CFAD;
    animation: spin 0.8s linear infinite;
    display: inline-block;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 加载点动画 */
.loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    display: inline-block;
    animation: loadingDots 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(1) {
    animation-delay: 0s;
}

.loading-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes loadingDots {
    0%,
    100% {
        transform: scale(0.6);
        opacity: 0.6;
    }

    50% {
        transform: scale(1);
        opacity: 1;
    }
}

/* 骨架屏样式 */
.skeleton-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.skeleton-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 16px;
    position: relative;
}

.skeleton-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
}

.skeleton-card:nth-child(1)::before {
    background-color: #3B82F6; /* blue */
}

.skeleton-card:nth-child(2)::before {
    background-color: #EF4444; /* red */
}

.skeleton-card:nth-child(3)::before {
    background-color: #F59E0B; /* yellow */
}

.skeleton-header {
    height: 16px;
    width: 40%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 4px;
    margin-bottom: 12px;
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skeleton-line {
    height: 12px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 4px;
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line:last-child {
    width: 80%;
}

@keyframes shimmer {
    to {
        background-position: -200% 0;
    }
}

/* 新增样式 */
.analysis-section {
    transition: transform 0.2s ease;
}

.analysis-section:hover {
    transform: translateY(-2px);
}

.border-l-3 {
    border-left-width: 3px;
}

/* 为每个类别的卡片添加微妙的渐变背景 */
.border-purple-500 {
    background: linear-gradient(to right, rgba(168, 85, 247, 0.05), transparent);
}

.border-blue-500 {
    background: linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent);
}

.border-red-500 {
    background: linear-gradient(to right, rgba(239, 68, 68, 0.05), transparent);
}

.border-yellow-500 {
    background: linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent);
}

.border-orange-500 {
    background: linear-gradient(to right, rgba(249, 115, 22, 0.05), transparent);
}

.border-green-500 {
    background: linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent);
}

.border-teal-500 {
    background: linear-gradient(to right, rgba(20, 184, 166, 0.05), transparent);
}
</style>
