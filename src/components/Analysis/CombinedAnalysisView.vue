<template>
    <div class="analysis-container h-[98%] w-full overflow-hidden bg-gradient-to-br ">
        <el-scrollbar height="100%" class="w-full">
            <!-- 默认欢迎界面 -->
            <div v-if="showWelcomeScreen" class="flex flex-col justify-center items-center h-[80vh]">
                <div class="w-24 h-24 rounded-full bg-gray-100 flex justify-center items-center mb-6">
                    <el-icon class="text-[#49CFAD] text-4xl">
                        <Search />
                    </el-icon>
                </div>
                <h2 class="text-xl font-bold text-gray-700 mb-3">欢迎使用内容分析工具</h2>
                <p class="text-gray-500 text-center max-w-md">
                    请在左侧输入文本内容或网址，<br />点击"检测文字"或"检测网页"按钮开始分析。
                </p>
                <p class="text-gray-400 text-sm mt-2">分析结果将在此处实时显示</p>
            </div>

            <!-- 分析结果容器 - 全新设计 -->
            <div v-if="!showWelcomeScreen" class="analysis-results space-y-8 p-6">
                <!-- 总体评分卡片 - 加载状态 -->
                <div v-if="sourceData.loadingStates.calculate"
                    class="overall-score-card relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                    <div
                        class="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-800/10 rounded-full opacity-70">
                    </div>
                    <div class="relative z-10">
                        <div class="flex items-center mb-4">
                            <span
                                class="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mr-3">总体评分</span>
                            <h3 class="text-lg font-semibold text-slate-700 dark:text-white flex items-center">
                                计算中
                                <span class="loading-dots ml-1">...</span>
                            </h3>
                        </div>
                        <div class="h-20 rounded-xl bg-slate-100 dark:bg-slate-700/30 animate-pulse"></div>
                    </div>
                </div>

                <!-- 总体评分卡片 - 内容 -->
                <div v-if="sourceData.steps.calculate && sourceData.calculate"
                    class="overall-score-card relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 transition-all duration-500 border border-slate-100 dark:border-slate-700 transform hover:scale-[1.01] hover:shadow-2xl">
                    <div
                        class="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-800/10 rounded-full opacity-70">
                    </div>
                    <div class="relative z-10">
                        <div class="flex items-center mb-4">
                            <span
                                class="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mr-3">总体评分</span>
                            <h3 class="text-lg font-semibold text-slate-700 dark:text-white">内容可信度综合评分</h3>
                        </div>

                        <div class="score-display flex items-center mb-6">
                            <div class="score-circle relative mr-6">
                                <svg class="w-28 h-28">
                                    <circle cx="56" cy="56" r="50" class="score-circle-bg" />
                                    <circle cx="56" cy="56" r="50" class="score-circle-progress" :class="{
                                        'stroke-red-500': sourceData.calculate.score < 60,
                                        'stroke-yellow-500': sourceData.calculate.score >= 60 && sourceData.calculate.score < 75,
                                        'stroke-green-500': sourceData.calculate.score >= 75
                                    }"
                                        :style="`stroke-dashoffset: ${314 - (314 * sourceData.calculate.score / 100)}`" />
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span class="text-3xl font-bold" :class="{
                                        'text-red-500': sourceData.calculate.score < 60,
                                        'text-yellow-500': sourceData.calculate.score >= 60 && sourceData.calculate.score < 75,
                                        'text-green-500': sourceData.calculate.score >= 75
                                    }">{{ Math.round(sourceData.calculate.score) }}</span>
                                    <span class="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
                                </div>
                            </div>

                            <div class="score-details flex-1">
                                <div class="flex items-center mb-2">
                                    <span class="px-3 py-1.5 text-sm rounded-lg font-medium" :class="{
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': sourceData.calculate.level === '低',
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': sourceData.calculate.level === '中',
                                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': sourceData.calculate.level === '高'
                                    }">
                                        {{ sourceData.calculate.level }}可信度
                                    </span>
                                </div>
                                <p class="text-slate-600 text-left dark:text-slate-300 mt-2">{{
                                    sourceData.calculate.description || '基于多项指标的综合评估结果' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 详细分析卡片 - 加载状态 -->
                <div v-if="sourceData.loadingStates.analysis"
                    class="detailed-analysis-card relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center mb-5">
                        <h3
                            class="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                            详细分析
                        </h3>
                        <div class="ml-3 flex items-center">
                            <span class="loading-spinner"></span>
                        </div>
                    </div>
                    <div class="space-y-5">
                        <div class="category-card h-24 rounded-xl bg-slate-100 dark:bg-slate-700/30 animate-pulse">
                        </div>
                        <div class="category-card h-24 rounded-xl bg-slate-100 dark:bg-slate-700/30 animate-pulse"
                            style="animation-delay: 0.1s"></div>
                        <div class="category-card h-24 rounded-xl bg-slate-100 dark:bg-slate-700/30 animate-pulse"
                            style="animation-delay: 0.2s"></div>
                    </div>
                </div>

                <!-- 详细分析卡片 - 内容 -->
                <div v-if="sourceData.steps.analysis"
                    class="detailed-analysis-card relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                    <div class="relative z-10">
                        <h3
                            class="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-5">
                            详细分析
                        </h3>
                        <div class="space-y-5">
                            <div v-for="(category, key) in sourceData.analysis" :key="key"
                                class="category-card p-5 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300 bg-slate-50 dark:bg-slate-800/90 hover:shadow-md">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-medium text-slate-700 dark:text-white flex items-center">
                                        <span class="w-2 h-2 rounded-full mr-2" :class="{
                                            'bg-red-500': category.score !== null && category.score < 6,
                                            'bg-yellow-500': category.score !== null && category.score >= 6 && category.score < 7.5,
                                            'bg-green-500': category.score !== null && category.score >= 7.5,
                                            'bg-slate-400': category.score === null
                                        }"></span>
                                        {{ getCategoryTitle(key) }}
                                    </h4>
                                    <span class="category-score text-sm font-semibold px-3 py-1 rounded-lg" :class="{
                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': category.score !== null && category.score < 6,
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': category.score !== null && category.score >= 6 && category.score < 7.5,
                                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': category.score !== null && category.score >= 7.5,
                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400': category.score === null
                                    }">
                                        {{ formatScore(category.score) }}
                                    </span>
                                </div>

                                <transition name="expand">
                                    <ul v-if="category.deductions.length" class="deduction-list mt-3 space-y-2">
                                        <li v-for="(deduction, index) in category.deductions" :key="index"
                                            class="flex items-start text-slate-600 dark:text-slate-300 text-sm pl-2 border-l-2 border-indigo-200 dark:border-indigo-700">
                                            <span class="block pl-3">{{ deduction }}</span>
                                        </li>
                                    </ul>
                                </transition>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 搜索结果卡片 - 加载状态 -->
                <div v-if="abilityLevel !== 1 && sourceData.loadingStates.searchOutput"
                    class="search-results-card relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center mb-4">
                        <span
                            class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 mr-3">搜索结果</span>
                        <h3 class="text-lg font-semibold text-slate-700 dark:text-white flex items-center">
                            加载中
                            <span class="loading-dots ml-1">...</span>
                        </h3>
                    </div>
                    <div class="space-y-4">
                        <div
                            class="search-result-placeholder h-28 rounded-xl bg-slate-100 dark:bg-slate-700/30 animate-pulse">
                        </div>
                        <div class="search-result-placeholder h-28 rounded-xl bg-slate-100 dark:bg-slate-700/30 animate-pulse"
                            style="animation-delay: 0.15s"></div>
                    </div>
                </div>

                <!-- 搜索结果卡片 - 内容 -->
                <div v-if="abilityLevel !== 1 && sourceData.steps.searchOutput && sourceData.searchOutput && sourceData.searchOutput.length > 0"
                    class="search-results-card relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center mb-4">
                        <span
                            class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 mr-3">搜索结果</span>
                        <h3 class="text-lg font-semibold text-slate-700 dark:text-white">网络搜索发现的相关信息</h3>
                    </div>
                    <div class="space-y-4">
                        <div v-for="(result, idx) in sourceData.searchOutput" :key="idx"
                            class="search-result p-4 rounded-xl border-l-4 border-emerald-400 dark:border-emerald-500 bg-slate-50 dark:bg-slate-800/90 hover:shadow-md transition-all duration-300"
                            :class="{ 'cursor-pointer hover:bg-white dark:hover:bg-slate-700/50': result.link }"
                            @click="openLink(result.link)">
                            <h4 class="font-medium text-slate-800 dark:text-white mb-2">{{ result.title }}</h4>
                            <p class="text-slate-600 dark:text-slate-300">{{ result.snippet }}</p>
                            <div v-if="result.link"
                                class="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                                <el-icon class="mr-1">
                                    <Link />
                                </el-icon> 点击访问原文
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 搜索输入卡片 - 加载状态 -->
                <div v-if="abilityLevel !== 1 && sourceData.loadingStates.searchInput"
                    class="search-input-card relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center mb-4">
                        <span
                            class="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mr-3">搜索输入</span>
                        <h3 class="text-lg font-semibold text-slate-700 dark:text-white flex items-center">
                            加载中
                            <span class="loading-dots ml-1">...</span>
                        </h3>
                    </div>
                    <div class="h-10 rounded-xl bg-slate-100 dark:bg-slate-700/30 animate-pulse"></div>
                </div>

                <!-- 搜索输入卡片 - 内容 -->
                <div v-if="abilityLevel !== 1 && sourceData.steps.searchInput"
                    class="search-input-card relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl shadow-indigo-100 dark:shadow-slate-900/30 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center mb-4">
                        <span
                            class="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mr-3">搜索输入</span>
                        <h3 class="text-lg font-semibold text-slate-700 dark:text-white">用于验证的搜索条件</h3>
                    </div>
                    <div
                        class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700">
                        <p class="text-slate-600 dark:text-slate-300">{{ sourceData.searchInput }}</p>
                    </div>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import type { Sentence, Analysis } from '@/utils/types';
import { computed } from 'vue';
import { Search, Link } from '@element-plus/icons-vue';

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

const openLink = (url: string) => {
    if (url) {
        window.open(url, '_blank');
    }
};
</script>

<style scoped>
/* 基础样式 */
.analysis-container {
    position: relative;
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 欢迎界面动画 */
@keyframes pulse-slow {

    0%,
    100% {
        opacity: 0.2;
        transform: scale(1.5);
    }

    50% {
        opacity: 0.3;
        transform: scale(1.8);
    }
}

.animate-pulse-slow {
    animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 加载中动画 */
.loading-spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(99, 102, 241, 0.2);
    border-radius: 50%;
    border-top-color: #6366f1;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-dots::after {
    display: inline-block;
    animation: loading 1.2s infinite;
    content: '';
}

@keyframes loading {
    0% {
        content: '';
    }

    25% {
        content: '.';
    }

    50% {
        content: '..';
    }

    75% {
        content: '...';
    }
}

/* 圆形进度条 */
.score-circle-bg {
    fill: none;
    stroke: rgba(226, 232, 240, 0.6);
    stroke-width: 6;
}

.score-circle-progress {
    fill: none;
    stroke-width: 6;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    stroke-dasharray: 314;
    transition: stroke-dashoffset 1s ease-in-out;
}

/* 展开收起动画 */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease-in-out;
    max-height: 500px;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

/* 分析结果卡片动画 */
.analysis-results>div {
    animation: slide-in 0.6s ease-out;
    animation-fill-mode: both;
}

.analysis-results>div:nth-child(1) {
    animation-delay: 0.1s;
}

.analysis-results>div:nth-child(2) {
    animation-delay: 0.2s;
}

.analysis-results>div:nth-child(3) {
    animation-delay: 0.3s;
}

.analysis-results>div:nth-child(4) {
    animation-delay: 0.4s;
}

@keyframes slide-in {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 动画脉冲 */
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

/* 搜索结果卡片悬停效果 */
.search-result {
    position: relative;
    overflow: hidden;
}

.search-result::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(99, 102, 241, 0.05), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease-in-out;
}

.search-result:hover::after {
    transform: translateX(100%);
}
</style>