<template>
    <div class="VerifyTextView h-full flex justify-center items-center gap-8 p-8">
        <!-- 输入部分 -->
        <div class="w-[55%] h-full shadow-xl border rounded-xl p-5">
            <div class="flex justify-between items-center border-b pb-5">
                <!-- 语言选择 -->
                <div class="w-52">
                    <el-select v-model="category" placeholder="请点击选择语言" size="large" clearable :teleported="false">
                        <el-option v-for="item in allType" :key="item.objectId" :label="item.name" :value="item.name" />
                    </el-select>
                </div>
                <!-- 功能按钮 -->
                <div class="flex justify-start items-center gap-3">
                    <div class="flex justify-start items-center gap-2 border p-2 rounded-xl cursor-pointer">
                        <el-icon size="22">
                            <Link />
                        </el-icon>
                        <p>上传文件</p>
                    </div>
                    <div class="flex justify-start items-center border p-2 rounded-xl cursor-pointer">
                        <el-icon size="20">
                            <Download />
                        </el-icon>
                    </div>
                    <div class="border p-2 rounded-xl cursor-pointer">
                        <el-icon size="20">
                            <Delete />
                        </el-icon>
                    </div>
                </div>
            </div>
            <!-- 网页地址输入 -->
            <div class="mt-5 flex justify-between gap-3">
                <div class="flex-1">
                    <el-input v-model="webUrl" placeholder="请输入网页地址（可选）" size="large">
                        <template #prefix>
                            <el-icon>
                                <Link />
                            </el-icon>
                        </template>
                    </el-input>
                </div>
                <div class="bg-[#49CFAD] rounded-lg px-4 py-3 cursor-pointer flex items-center"
                    @click="detectWebContent">
                    <p class="text-white font-bold">{{ isWebLoading ? '分析中...' : '检测网页' }}</p>
                </div>
            </div>
            <!-- 标题输入 -->
            <div class="mt-5">
                <el-input v-model="articleTitle" placeholder="请输入新闻标题" size="large" />
            </div>
            <!-- 正文输入 -->
            <div class="mt-5">
                <el-input v-model="articleContent" placeholder="请输入需要判断的正文内容" :rows="17" type="textarea" />
            </div>
            <!-- 检测按钮与字数 -->
            <div class="flex justify-between items-center mt-5">
                <div>
                    <p class="text-[#777777]">{{ articleContent.length }}/5000 字数</p>
                </div>
                <div class="bg-[#49CFAD] w-fit rounded-lg px-2 py-3 cursor-pointer" @click="detectText">
                    <p class="text-white font-bold">{{ isLoading ? '分析中...' : '检测文字' }}</p>
                </div>
            </div>
        </div>

        <!-- 分析结果部分 -->
        <div class="w-[45%] h-full shadow-xl border rounded-xl p-5">
            <!-- Tab导航 -->
            <div class="flex justify-center items-center border-b">
                <div v-for="(tab, index) in tabs" :key="index" class="flex-1 pb-3 cursor-pointer" :class="{
                    'border-b-4 border-b-[#49CFAD]': activeTab === index,
                    'border-b-4 border-b-white': activeTab !== index,
                }" @click="activeTab = index">
                    <p :class="{
                        'text-[#49CFAD]': activeTab === index,
                        'text-[#777777]': activeTab !== index,
                    }">
                        {{ tab }}
                    </p>
                </div>
            </div>

            <!-- Tab内容 -->
            <div v-if="activeTab === 0" class="w-full h-[98%]">
                <!-- 使用新的合并组件 -->
                <CombinedAnalysisView :sourceData="sourceData" />
            </div>
            <div v-else-if="activeTab === 1" class="h-[90%] mt-10">
                <SentenceAnalysis :aiSentences="aiSentences" :humanSentences="humanSentences" />
            </div>
            <div v-else-if="activeTab === 2" class="h-[90%] mt-10">
                <SourceAnalysis :sourceSentences="sourceSentences" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Link, Download, Delete, ArrowLeft } from '@element-plus/icons-vue';
import CombinedAnalysisView from '@/components/Analysis/CombinedAnalysisView.vue';
import SentenceAnalysis from '@/components/Analysis/SentenceAnalysis.vue';
import SourceAnalysis from '@/components/Analysis/SourceAnalysis.vue';
import type { Sentence } from '@/utils/types';
import { ApiService } from '@/utils/apiService';
import { ElMessage } from 'element-plus';
import JSON5 from 'json5';
import { removeNewlinesRecursively, removeAllNewlines, cleanLlmContent } from '@/utils/stringCleaner';

// 语言选项数据
const allType = ref([
    { name: "简体中文", objectId: "1" },
    { name: "英文", objectId: "2" },
    { name: "日文", objectId: "3" },
    { name: "韩文", objectId: "4" },
    { name: "法文", objectId: "5" },
    { name: "德文", objectId: "6" },
    { name: "俄文", objectId: "7" },
    { name: "西班牙文", objectId: "8" },
    { name: "葡萄牙文", objectId: "9" },
    { name: "意大利文", objectId: "10" },
    { name: "荷兰文", objectId: "11" },
    { name: "瑞典文", objectId: "12" },
    { name: "丹麦文", objectId: "13" },
    { name: "芬兰文", objectId: "14" },
]);

const aiSentences = ref<Sentence[]>([
    { text: '更多信息，请访问推特官网或联系新闻部门。', importance: 3 },
    { text: '埃隆•马斯克是特斯拉、SpaceX、Neuralinx...', importance: 3 },
    { text: '全球扩展与本地化：针对不同地区推出...', importance: 3 },
    { text: '此次收购引发了业界广泛讨论。支持者认为...', importance: 3 },
    { text: '愿景与目标', importance: 2 },
]);

const humanSentences = ref<Sentence[]>([
    { text: '马斯克完成推特收购，引领社交媒体新时代...', importance: 3 },
    { text: '马斯克曾公开强调，他的收购目标是推动...', importance: 3 },
    { text: '此次收购引发了业界广泛讨论...', importance: 2 },
    { text: '经过多轮谈判，最终尘埃落定', importance: 3 },
]);

const sourceSentences = ref<Sentence[]>([
    { text: '马斯克完成控特收胸，引领社交媒体新时代', importance: 1 },
    { text: '马斯克表示:"擁特是一座数字时代的城布广场,它承壁看无數关于未来的可能性.我期转通过创新.撞动推特成为更开放.更包赛的公共讨论平台."', importance: 2 },
    { text: '马斯克曾公开强调，他的收购目标是推动行业进步', importance: 3 },
]);

// 文本输入、选中语言、分析类型
const category = ref('简体中文');
const articleTitle = ref('');
const articleContent = ref('');
const webUrl = ref('');
const tabs = ['概述', '句子分析', '来源分析'];
const activeTab = ref(0);
const isLoading = ref(false);
const isWebLoading = ref(false);

// 结果来源查看控制
const sourceData = ref({
    searchInput: '',
    searchOutput: [] as any[],
    llm: '',
    sentences: [] as Sentence[],
    analysis: {
        // 标题相关性
        title_relevance: { score: 0, deductions: [] },
        // 逻辑一致性
        logical_consistency: { score: 0, deductions: [] },
        // 事实准确性
        factual_accuracy: { score: 0, deductions: [] },
        // 主观和煽动性语言
        subjectivity_and_inflammatory_language: { score: 0, deductions: [] },
        // 因果关联
        causal_relevance: { score: 0, deductions: [] },
        // 来源可信度
        source_credibility: { score: 0, deductions: [] },
        // 驳斥结果
        debunking_result: { score: null, deductions: [] },
        // 外部证实
        external_corroboration: { score: null, deductions: [] }
    },
    summary: {
        main_points: []
    },
    calculate: {
        score: 0,
        level: '中',
        description: ''
    },
    value: undefined as {
        sentences: {
            logical_consistency: string[];
            factual_accuracy: string[];
            subjectivity_and_inflammatory_language: string[];
            causal_relevance: string[];
            source_credibility: string[];
            debunking_result: string[];
            external_corroboration: string[];
        }
    } | undefined,
    loadingStates: {
        searchInput: false,
        searchOutput: false,
        analysis: false,
        sentences: false,
        calculate: false
    },
    steps: {
        searchInput: false,
        searchOutput: false,
        analysis: false,
        sentences: false,
        calculate: false
    }
});

// 检测文本内容
const detectText = async () => {
    if (!articleTitle.value || !articleContent.value) {
        ElMessage.warning('请输入标题和正文内容！');
        return;
    }

    isLoading.value = true;

    try {
        // 去除文本内容中的换行符
        articleContent.value = removeAllNewlines(articleContent.value);

        // 重置分析结果
        resetAnalysisResults();
        
        // 开始第一步加载 - 搜索输入
        sourceData.value.loadingStates.searchInput = true;

        // 构建提示词
        const prompt = `标题：${articleTitle.value}\n\n内容：${articleContent.value}`;

        // 使用API服务发送请求
        await ApiService.chatWithLLM(
            prompt,
            handleApiTags,
            (tag) => {
                // 处理标签开始的事件
                console.log(`开始接收 ${tag} 标签数据`);
                
                // 根据开始的标签设置相应的加载状态
                if (tag === 'search_input') {
                    sourceData.value.loadingStates.searchInput = true;
                } else if (tag === 'search_output') {
                    sourceData.value.loadingStates.searchInput = false;
                    sourceData.value.steps.searchInput = true;
                    sourceData.value.loadingStates.searchOutput = true;
                } else if (tag === 'llm') {
                    sourceData.value.loadingStates.searchOutput = false;
                    sourceData.value.steps.searchOutput = true;
                    sourceData.value.loadingStates.analysis = true;
                } else if (tag === 'sentences') {
                    sourceData.value.loadingStates.analysis = false;
                    sourceData.value.steps.analysis = true;
                    sourceData.value.loadingStates.sentences = true;
                } else if (tag === 'calculate') {
                    sourceData.value.loadingStates.sentences = false;
                    sourceData.value.steps.sentences = true;
                    sourceData.value.loadingStates.calculate = true;
                }
            }
        );

        // 切换到概述标签显示结果
        activeTab.value = 0;
    } catch (error) {
        console.error('文本分析出错:', error);
        ElMessage.error('文本分析失败，请稍后再试');
    } finally {
        isLoading.value = false;
        // 确保所有加载状态都关闭
        resetLoadingStates();
    }
};

// 检测网页内容
const detectWebContent = async () => {
    if (!webUrl.value) {
        ElMessage.warning('请输入要分析的网页地址！');
        return;
    }

    try {
        isWebLoading.value = true;

        // 重置分析结果
        resetAnalysisResults();
        
        // 开始第一步加载 - 搜索输入
        sourceData.value.loadingStates.searchInput = true;

        // 处理从API返回的数据 - 使用新的API结构
        await ApiService.analyzeWebContent(
            webUrl.value,
            2,
            handleApiTags,
            (tag) => {
                // 处理标签开始的事件
                console.log(`开始接收 ${tag} 标签数据`);
                
                // 根据开始的标签设置相应的加载状态
                if (tag === 'search_input') {
                    sourceData.value.loadingStates.searchInput = true;
                } else if (tag === 'search_output') {
                    sourceData.value.loadingStates.searchInput = false;
                    sourceData.value.steps.searchInput = true;
                    sourceData.value.loadingStates.searchOutput = true;
                } else if (tag === 'llm') {
                    sourceData.value.loadingStates.searchOutput = false;
                    sourceData.value.steps.searchOutput = true;
                    sourceData.value.loadingStates.analysis = true;
                } else if (tag === 'sentences') {
                    sourceData.value.loadingStates.analysis = false;
                    sourceData.value.steps.analysis = true;
                    sourceData.value.loadingStates.sentences = true;
                } else if (tag === 'calculate') {
                    sourceData.value.loadingStates.sentences = false;
                    sourceData.value.steps.sentences = true;
                    sourceData.value.loadingStates.calculate = true;
                }
            }
        );

        // 切换到概述标签显示结果
        activeTab.value = 0;
    } catch (error) {
        console.error('网页分析出错:', error);
        ElMessage.error('网页分析失败，请检查URL是否正确');
    } finally {
        isWebLoading.value = false;
        // 确保所有加载状态都关闭
        resetLoadingStates();
    }
};

/**
 * 处理API返回的标签和内容
 * @param tag 标签名称
 * @param content 标签内容
 */
const handleApiTags = (tag: string, content: string) => {
    console.log(`[${tag}] =>`, content);

    switch (tag) {
        case 'session_id':
            console.log('获取到会话ID:', content);
            break;
        case 'article_title':
            articleTitle.value = content;
            break;
        case 'article_content':
            articleContent.value = removeAllNewlines(content);
            break;
        case 'search_input':
            // 完成搜索输入
            sourceData.value.searchInput = content;
            sourceData.value.steps.searchInput = true;
            sourceData.value.loadingStates.searchInput = false;
            // 下一步加载搜索结果
            sourceData.value.loadingStates.searchOutput = true;
            break;
        case 'search_output':
            try {
                // 直接使用JSON5解析
                const searchResults = JSON5.parse(content);
                updateSourceAnalysisFromSearch(searchResults);
                sourceData.value.searchOutput = searchResults;
                // 完成搜索结果
                sourceData.value.steps.searchOutput = true;
                sourceData.value.loadingStates.searchOutput = false;
                // 下一步加载详细分析
                sourceData.value.loadingStates.analysis = true;
            } catch (error) {
                console.error('解析搜索结果出错:', error);
                sourceData.value.loadingStates.searchOutput = false;
            }
            break;
        case 'llm':
            try {
                // 完整的LLM输出
                let cleanContent = cleanLlmContent(content);
                sourceData.value.llm = cleanContent;

                // 使用JSON5解析
                if (cleanContent && cleanContent.trim()) {
                    const jsonData = JSON5.parse(cleanContent);
                    const cleanJsonData = removeNewlinesRecursively(jsonData);

                    // 新版JSON结构中，main_point可能为空数组
                    if (cleanJsonData.main_point) {
                        sourceData.value.summary.main_points = cleanJsonData.main_point;
                    } else {
                        sourceData.value.summary.main_points = [];
                    }

                    // 如果存在details.analysis结构，则使用它
                    if (cleanJsonData.details && cleanJsonData.details.analysis) {
                        updateAnalysisFromApi(cleanJsonData.details.analysis);
                    }
                }
                // 完成详细分析
                sourceData.value.steps.analysis = true;
                sourceData.value.loadingStates.analysis = false;
                // 下一步加载深度分析
                sourceData.value.loadingStates.sentences = true;
            } catch (error) {
                console.error('处理LLM数据出错:', error);
                sourceData.value.loadingStates.analysis = false;
            }
            break;
        case 'sentences':
            try {
                // 使用JSON5解析
                const sentencesData = JSON5.parse(content);

                // 将各分类下的所有句子合并到一个数组中
                const allSentences: Sentence[] = [];

                // 遍历对象的所有属性
                Object.entries(sentencesData).forEach(([category, sentences]) => {
                    if (Array.isArray(sentences)) {
                        sentences.forEach((text: string) => {
                            // 为每个句子分配一个重要性级别（1-3）
                            allSentences.push({
                                text: text,
                                importance: Math.floor(Math.random() * 3) + 1
                            });
                        });
                    }
                });

                sourceData.value.sentences = allSentences;
                
                // 设置深度分析数据
                if (!sourceData.value.value) {
                    sourceData.value.value = {
                        sentences: sentencesData
                    };
                } else {
                    sourceData.value.value.sentences = sentencesData;
                }
                
                // 完成深度分析
                sourceData.value.steps.sentences = true;
                sourceData.value.loadingStates.sentences = false;
                // 下一步加载总体评分
                sourceData.value.loadingStates.calculate = true;
            } catch (error) {
                console.error('解析句子数据出错:', error);
                sourceData.value.loadingStates.sentences = false;
            }
            break;
        case 'calculate':
            try {
                // 直接解析为数字
                const score = parseFloat(content);
                
                if (!isNaN(score)) {
                    // 根据分数确定可信度级别
                    let level = '中';
                    if (score < 60) {
                        level = '低';
                    } else if (score >= 75) {
                        level = '高';
                    }
                    
                    // 设置分数数据
                    sourceData.value.calculate = {
                        score: score,
                        level: level,
                        description: `内容可信度评分为${score.toFixed(1)}分，属于${level}可信度内容`
                    };
                }
                
                // 完成总体评分
                sourceData.value.steps.calculate = true;
                sourceData.value.loadingStates.calculate = false;
            } catch (error) {
                console.error('解析总体评分数据出错:', error);
                sourceData.value.loadingStates.calculate = false;
            }
            break;
        case 'done':
            console.log('分析完成');
            // 确保所有加载状态都关闭
            resetLoadingStates();
            break;
    }
};

// 重置所有加载状态
const resetLoadingStates = () => {
    sourceData.value.loadingStates = {
        searchInput: false,
        searchOutput: false,
        analysis: false,
        sentences: false,
        calculate: false
    };
    // 不重置步骤状态，保持已完成部分的显示
};

// 重置分析结果 - 只在开始新分析时调用
const resetAnalysisResults = () => {
    sourceData.value = {
        searchInput: '',
        searchOutput: [],
        llm: '',
        sentences: [],
        analysis: {
            title_relevance: { score: 0, deductions: [] },
            logical_consistency: { score: 0, deductions: [] },
            factual_accuracy: { score: 0, deductions: [] },
            subjectivity_and_inflammatory_language: { score: 0, deductions: [] },
            causal_relevance: { score: 0, deductions: [] },
            source_credibility: { score: 0, deductions: [] },
            debunking_result: { score: null, deductions: [] },
            external_corroboration: { score: null, deductions: [] }
        },
        summary: {
            main_points: []
        },
        calculate: {
            score: 0,
            level: '中',
            description: ''
        },
        value: undefined,
        loadingStates: {
            searchInput: false,
            searchOutput: false,
            analysis: false,
            sentences: false,
            calculate: false
        },
        steps: {
            searchInput: false,
            searchOutput: false,
            analysis: false,
            sentences: false,
            calculate: false
        }
    };

    aiSentences.value = [];
    humanSentences.value = [];
    sourceSentences.value = [];
};

const updateAnalysisFromApi = (apiAnalysis: any) => {
    // 清理apiAnalysis中的所有换行符
    const cleanApiAnalysis = removeNewlinesRecursively(apiAnalysis);

    // 更新所有分析结果，以LLM输出为准
    if (cleanApiAnalysis.title_relevance) {
        sourceData.value.analysis.title_relevance = cleanApiAnalysis.title_relevance;
    }
    if (cleanApiAnalysis.logical_consistency) {
        sourceData.value.analysis.logical_consistency = cleanApiAnalysis.logical_consistency;
    }
    if (cleanApiAnalysis.factual_accuracy) {
        sourceData.value.analysis.factual_accuracy = cleanApiAnalysis.factual_accuracy;
    }
    if (cleanApiAnalysis.subjectivity_and_inflammatory_language) {
        sourceData.value.analysis.subjectivity_and_inflammatory_language = cleanApiAnalysis.subjectivity_and_inflammatory_language;
    }
    if (cleanApiAnalysis.causal_relevance) {
        sourceData.value.analysis.causal_relevance = cleanApiAnalysis.causal_relevance;
    }
    if (cleanApiAnalysis.source_credibility) {
        sourceData.value.analysis.source_credibility = cleanApiAnalysis.source_credibility;
    }
    if (cleanApiAnalysis.debunking_result) {
        sourceData.value.analysis.debunking_result = cleanApiAnalysis.debunking_result;
    }
    if (cleanApiAnalysis.external_corroboration) {
        sourceData.value.analysis.external_corroboration = cleanApiAnalysis.external_corroboration;
    }
};

const updateSourceAnalysisFromSearch = (searchResults: any[]) => {
    sourceSentences.value = searchResults.map((result, index) => ({
        text: `${result.title} - ${result.snippet}`,
        importance: Math.floor(Math.random() * 3) + 1
    })).slice(0, 5);
};
</script>

<style lang="scss" scoped>
@mixin select_radius {
    border-radius: 12px;
}

:deep(.el-select__wrapper) {
    height: 50px;
    @include select_radius;
}

:deep(.el-select__placeholder) {
    font-size: 16px;
    font-weight: bold;
}

:deep(.el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 1px #49CFAD;
}

:deep(.el-select__popper.el-popper) {
    @include select_radius;
}

.el-select-dropdown__item.is-selected {
    color: #49CFAD;
}

.el-textarea,
:deep(.el-input__wrapper) {
    font-size: 16px;
    font-weight: bold;
    --el-input-focus-border-color: var(--accent-200);
}

:deep(.el-input__wrapper) {
    border-radius: 6px;
    height: 50px;
}

:deep(.el-input__wrapper.is-focused) {
    box-shadow: 0 0 0 1px #49CFAD;
}
</style>
