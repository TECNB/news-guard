<template>
    <div class="h-full w-full overflow-hidden transition-all duration-300">
        <el-scrollbar height="95%" class="w-full">
            <!-- 默认欢迎界面 -->
            <div v-if="showWelcomeScreen" class="flex flex-col justify-center items-center h-[80vh]">
                <div class="w-24 h-24 rounded-full bg-gray-100 flex justify-center items-center mb-6">
                    <el-icon class="text-[#49CFAD] text-4xl"><Search /></el-icon>
                </div>
                <h2 class="text-xl font-bold text-gray-700 mb-3">欢迎使用内容分析工具</h2>
                <p class="text-gray-500 text-center max-w-md">
                    请在左侧输入文本内容或网址，<br/>点击"检测文字"或"检测网页"按钮开始分析。
                </p>
                <p class="text-gray-400 text-sm mt-2">分析结果将在此处实时显示</p>
            </div>

            <!-- 当有数据时展示的内容 - 顺序从新到旧 -->
            <div v-if="!showWelcomeScreen" class="space-y-6">
                <!-- 百分制分数加载状态 - 最上面显示 -->
                <div v-if="sourceData.loadingStates.calculate" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                    <div class="flex items-center mb-2">
                        <el-tag type="danger" class="mr-2">总体评分</el-tag>
                        <h3 class="text-gray-700 font-medium">计算中...</h3>
                        <div class="ml-2 flex items-center">
                            <span class="loading-spinner"></span>
                        </div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-md h-12 animate-pulse"></div>
                </div>
                
                <!-- 百分制分数内容 - 只要步骤已完成就一直显示 -->
                <div v-if="sourceData.steps.calculate && sourceData.calculate" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                    <div class="flex items-center mb-2">
                        <el-tag type="danger" class="mr-2">总体评分</el-tag>
                        <h3 class="text-gray-700 font-medium">内容可信度综合评分</h3>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center">
                                <span class="text-2xl font-bold" :class="{
                                    'text-red-500': sourceData.calculate.score < 60,
                                    'text-yellow-500': sourceData.calculate.score >= 60 && sourceData.calculate.score < 75,
                                    'text-green-500': sourceData.calculate.score >= 75
                                }">{{ (sourceData.calculate.score).toFixed(2) }}/100</span>
                                <span class="ml-3 px-2 py-1 text-xs rounded-full" :class="{
                                    'bg-red-100 text-red-800': sourceData.calculate.level === '低',
                                    'bg-yellow-100 text-yellow-800': sourceData.calculate.level === '中',
                                    'bg-green-100 text-green-800': sourceData.calculate.level === '高'
                                }">{{ sourceData.calculate.level }}可信度</span>
                            </div>
                        </div>
                        <p class="text-gray-600">{{ sourceData.calculate.description || '基于多项指标的综合评估结果' }}</p>
                    </div>
                </div>
                
                <!-- 已移除深度分析部分，该部分已转移到SentenceAnalysis.vue中实现 -->
                
                <!-- 详细分析加载状态 -->
                <div v-if="sourceData.loadingStates.analysis" class="DetailedAnalysis mb-6">
                    <div class="flex items-center mb-2">
                        <h3 class="text-lg font-bold text-[#49CFAD] px-4">详细分析</h3>
                        <div class="ml-2 flex items-center">
                            <span class="loading-spinner"></span>
                        </div>
                    </div>
                    <div class="px-4">
                        <div class="space-y-6">
                            <div class="p-4 bg-gray-50 rounded-lg h-20 animate-pulse"></div>
                            <div class="p-4 bg-gray-50 rounded-lg h-20 animate-pulse"></div>
                            <div class="p-4 bg-gray-50 rounded-lg h-20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
                
                <!-- 详细分析内容 - 只要步骤已完成就一直显示 -->
                <div v-if="sourceData.steps.analysis" class="DetailedAnalysis mb-6">
                    <h3 class="text-lg font-bold text-[#49CFAD] px-4 mb-2">详细分析</h3>
                    <div class="px-4">
                        <div class="space-y-6">
                            <div v-for="(category, key) in sourceData.analysis" :key="key" class="p-4 bg-gray-50 rounded-lg">
                                <div class="flex items-center justify-between mb-2">
                                    <h4 class="font-medium text-gray-700">{{ getCategoryTitle(key) }}</h4>
                                    <span class="text-[#49CFAD] font-bold">{{ formatScore(category.score) }}</span>
                                </div>
                                <ul v-if="category.deductions.length" class="list-disc pl-5 text-red-500 text-sm">
                                    <li v-for="(deduction, index) in category.deductions" :key="index">
                                        {{ deduction }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 搜索结果加载状态 - 仅在非L1级别显示 -->
                <div v-if="abilityLevel !== 1 && sourceData.loadingStates.searchOutput" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                    <div class="flex items-center mb-2">
                        <el-tag type="success" class="mr-2">搜索结果</el-tag>
                        <h3 class="text-gray-700 font-medium">加载中...</h3>
                        <div class="ml-2 flex items-center">
                            <span class="loading-spinner"></span>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="p-3 bg-gray-50 rounded-md border-l-4 border-green-400 h-24 animate-pulse"></div>
                        <div class="p-3 bg-gray-50 rounded-md border-l-4 border-green-400 h-24 animate-pulse"></div>
                    </div>
                </div>
                
                <!-- 搜索结果内容 - 仅在非L1级别显示 -->
                <div v-if="abilityLevel !== 1 && sourceData.steps.searchOutput && sourceData.searchOutput && sourceData.searchOutput.length > 0" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
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
                
                <!-- 搜索输入加载状态 - 仅在非L1级别显示 -->
                <div v-if="abilityLevel !== 1 && sourceData.loadingStates.searchInput" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                    <div class="flex items-center mb-2">
                        <el-tag type="info" class="mr-2">搜索输入</el-tag>
                        <h3 class="text-gray-700 font-medium">加载中...</h3>
                        <div class="ml-2 flex items-center">
                            <span class="loading-spinner"></span>
                        </div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-md h-8 animate-pulse"></div>
                </div>
                
                <!-- 搜索输入内容 - 仅在非L1级别显示 -->
                <div v-if="abilityLevel !== 1 && sourceData.steps.searchInput" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100 w-full">
                    <div class="flex items-center mb-2">
                        <el-tag type="info" class="mr-2">搜索输入</el-tag>
                        <h3 class="text-gray-700 font-medium">用于验证的搜索条件</h3>
                    </div>
                    <p class="text-gray-600 bg-gray-50 p-3 rounded-md">{{ sourceData.searchInput }}</p>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import type { Sentence, Analysis } from '@/utils/types';
import { ref, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';

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
    sentences: Sentence[];
    llm: string;
    analysis: Analysis;
    summary?: {
        main_points: string[];
    };
    value?: {
        sentences: AnalysisData;
    };
    calculate?: {
        score: number;
        level: string;
        description: string;
    };
    loadingStates: {
        searchInput: boolean;
        searchOutput: boolean;
        analysis: boolean;
        sentences: boolean;
        calculate?: boolean;
    };
    steps: {
        searchInput: boolean;
        searchOutput: boolean;
        analysis: boolean;
        sentences: boolean;
        calculate?: boolean;
    };
}

const props = defineProps<{
    sourceData: SourceDataType;
    abilityLevel: number;
}>();

// 判断是否显示欢迎屏幕
const showWelcomeScreen = computed(() => {
    // 只有在没有开始任何加载或完成任何步骤时显示欢迎界面
    return !props.sourceData.loadingStates.searchInput && 
           !props.sourceData.loadingStates.searchOutput && 
           !props.sourceData.loadingStates.analysis && 
           !props.sourceData.loadingStates.sentences && 
           !props.sourceData.loadingStates.calculate && 
           !props.sourceData.steps.searchInput && 
           !props.sourceData.steps.searchOutput && 
           !props.sourceData.steps.analysis && 
           !props.sourceData.steps.sentences &&
           !props.sourceData.steps.calculate;
});

const categoryTitles: Record<string, string> = {
    title_relevance: '标题相关性',
    logical_consistency: '逻辑一致性',
    factual_accuracy: '事实准确性',
    subjectivity_and_inflammatory_language: '主观性与煽动性语言',
    causal_relevance: '因果关系检查',
    source_credibility: '来源可信度',
    debunking_result: '驳斥结果',
    external_corroboration: '外部证实'
};

const getCategoryTitle = (key: string): string => {
    return categoryTitles[key] || key;
};

// 格式化分数，处理null情况
const formatScore = (score: number | null): string => {
    if (score === null) return '无数据';
    return `${score}分`;
};
</script>

<style scoped>
.break-all {
  word-wrap: break-word;
  word-break: break-all;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}

/* 加载中动画 */
.loading-spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid rgba(73, 207, 173, 0.2);
  border-radius: 50%;
  border-top-color: #49CFAD;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.4;
  }
}
</style> 