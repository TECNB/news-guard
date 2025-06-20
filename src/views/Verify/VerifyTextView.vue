<template>
    <div class="VerifyTextView h-full flex justify-center items-center gap-8 p-8">
        <!-- 输入部分 -->
        <div class="w-[55%] h-full shadow-xl border rounded-xl p-5">
            <div class="flex justify-between items-center border-b pb-5">
                <!-- 分析能力等级选择 -->
                <div class="w-52">
                    <el-select v-model="abilityLevel" placeholder="请选择分析能力等级" size="large" clearable :teleported="false">
                        <el-option v-for="item in abilityLevels" :key="item.value" :label="item.label" :value="item.value" />
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
            <div class="mt-5 relative">
                <!-- 高亮显示模式 - 确保高亮内容已生成且不为空才显示 -->
                <div v-if="hasSentenceAnalysisResults && activeTab === 1 && highlightedContent" 
                     class="highlighted-content text-area-mimic" 
                     @mousemove="updateTooltipPosition">
                    <div v-html="highlightedContent" class="whitespace-pre-wrap"></div>
                </div>
                <!-- 普通输入框 - 其他情况下显示 -->
                <div v-else>
                    <el-input v-model="articleContent" placeholder="请输入需要判断的正文内容" :rows="17" type="textarea" />
                </div>
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
                <!-- 使用新的合并组件，传递abilityLevel -->
                <CombinedAnalysisView :sourceData="sourceData" :abilityLevel="abilityLevel" />
            </div>
            <div v-else-if="activeTab === 1" class="h-[90%] mt-10">
                <SentenceAnalysis 
                    :sentencesData="sourceData.value?.sentences"
                    :loadingStates="{ sentences: sourceData.loadingStates.sentences }" 
                    @sentence-hover="highlightSentence"
                />
            </div>
            <div v-else-if="activeTab === 2" class="h-[90%] mt-10">
                <SourceAnalysis :sourceSentences="sourceSentences" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Link, Download, Delete } from '@element-plus/icons-vue';
import CombinedAnalysisView from '@/components/Analysis/CombinedAnalysisView.vue';
import SentenceAnalysis from '@/components/Analysis/SentenceAnalysis.vue';
import SourceAnalysis from '@/components/Analysis/SourceAnalysis.vue';
import type { Sentence } from '@/utils/types';
import { ApiService } from '@/utils/apiService';
import { ElMessage } from 'element-plus';
import JSON5 from 'json5';
import { removeNewlinesRecursively, removeAllNewlines, cleanLlmContent } from '@/utils/stringCleaner';
import { getColorForCategory } from '@/utils/colorUtils';
import { mapLlmDataToAnalysis } from '@/utils/llmDataMapper';

// 分析能力等级选项
const abilityLevels = ref([
    { label: "L1 (基础分析)", value: 1 },
    { label: "L2 (标准分析)", value: 2 },
    { label: "L3 (高级分析)", value: 3 },
]);

const sourceSentences = ref<Sentence[]>([
    { text: '马斯克完成控特收胸，引领社交媒体新时代', importance: 1 },
    { text: '马斯克表示:"擁特是一座数字时代的城布广场,它承壁看无數关于未来的可能性.我期转通过创新.撞动推特成为更开放.更包赛的公共讨论平台."', importance: 2 },
    { text: '马斯克曾公开强调，他的收购目标是推动行业进步', importance: 3 },
]);

// 文本输入、选中分析能力等级、分析类型
const abilityLevel = ref(2); // 默认为L2标准分析
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

// 删除编辑模式状态
// const editMode = ref(true);
const highlightedContent = ref('');
const hoveredSentence = ref('');

// 判断是否有分析结果 (用于其他组件)
const hasAnalysisResults = computed(() => {
    return sourceData.value.steps.sentences;
});

// 专门判断句子分析结果是否已加载完成
const hasSentenceAnalysisResults = computed(() => {
    // 检查步骤是否完成且数据是否存在
    return sourceData.value.steps.sentences && 
           sourceData.value.value?.sentences && 
           !sourceData.value.loadingStates.sentences;
});

// 定义类别类型，用于类型安全
type CategoryKey = 'logical_consistency' | 'factual_accuracy' | 'subjectivity_and_inflammatory_language' | 
                  'causal_relevance' | 'source_credibility' | 'debunking_result' | 'external_corroboration';

// 修改类别名称映射类型
const categoryNameMap: Record<CategoryKey, string> = {
    'logical_consistency': '逻辑一致性问题',
    'factual_accuracy': '事实准确性问题',
    'subjectivity_and_inflammatory_language': '主观和煽动性语言',
    'causal_relevance': '因果相关性问题',
    'source_credibility': '来源可信度问题',
    'debunking_result': '辟谣结果',
    'external_corroboration': '外部佐证信息'
};

// 生成高亮内容
const generateHighlightedContent = () => {
    let content = articleContent.value;
    const sentences = sourceData.value.value?.sentences;
    
    // 确保有文本内容和句子数据
    if (!content || !sentences) {
        highlightedContent.value = ''; // 清空高亮内容
        return;
    }
    
    // 创建一个包含所有句子及其类别的数组
    const allSentencesWithCategories: {text: string, category: CategoryKey}[] = [];
    
    // 收集所有句子和它们的类别
    const categories: CategoryKey[] = [
        'logical_consistency', 
        'factual_accuracy', 
        'subjectivity_and_inflammatory_language',
        'causal_relevance',
        'source_credibility',
        'debunking_result',
        'external_corroboration'
    ];
    
    // 检查是否至少有一个类别有句子
    let hasSentences = false;
    
    categories.forEach(category => {
        if (sentences[category] && Array.isArray(sentences[category]) && sentences[category].length > 0) {
            hasSentences = true;
            sentences[category].forEach(sentence => {
                if (sentence && typeof sentence === 'string' && sentence.trim()) {
                    allSentencesWithCategories.push({
                        text: sentence,
                        category
                    });
                }
            });
        }
    });
    
    // 如果没有有效句子，清空高亮内容并返回
    if (!hasSentences || allSentencesWithCategories.length === 0) {
        highlightedContent.value = '';
        return;
    }
    
    // 按句子长度降序排列，防止短句子被长句子包含时出现嵌套高亮问题
    allSentencesWithCategories.sort((a, b) => b.text.length - a.text.length);
    
    // 为每个句子添加高亮
    try {
        allSentencesWithCategories.forEach(({ text, category }) => {
            if (!text || typeof text !== 'string' || !text.trim()) return;
            
            const color = getColorForCategory(category);
            const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义特殊字符
            const regex = new RegExp(escapedText, 'g');
            
            // 获取中文类别名称
            const categoryName = categoryNameMap[category] || category;
            
            // 添加title属性来显示悬浮提示，并添加data-tooltip-content属性用于自定义提示
            content = content.replace(regex, `<span class="highlighted-sentence" 
                data-category="${category}" 
                data-tooltip="${categoryName}"
                style="background-color: ${color}; opacity: 0.3; border-radius: 3px; padding: 2px; position: relative;"
                >${text}</span>`);
        });
        
        // 只有当内容变化时才更新高亮内容
        if (content !== articleContent.value) {
            highlightedContent.value = content;
        } else {
            // 如果没有变化，可能是没有匹配到句子，清空高亮内容
            highlightedContent.value = '';
        }
    } catch (error) {
        console.error('生成高亮内容时出错:', error);
        highlightedContent.value = ''; // 出错时清空高亮内容
    }
};

// 高亮特定句子（鼠标悬停时）
const highlightSentence = (sentence: string, category: string) => {
    hoveredSentence.value = sentence;
    
    // 重新生成高亮内容
    generateHighlightedContent();
    
    // 增强悬停句子的显示效果
    if (sentence) {
        const escapedSentence = sentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`<span class="highlighted-sentence" [^>]*>${escapedSentence}</span>`, 'g');
        
        // 使用类型断言确保category是有效的键
        const safeCategory = category as CategoryKey;
        const categoryName = categoryNameMap[safeCategory] || category;
        
        highlightedContent.value = highlightedContent.value.replace(regex, 
            `<span class="highlighted-sentence" 
                data-category="${category}" 
                data-tooltip="${categoryName}"
                style="background-color: ${getColorForCategory(category)}; opacity: 0.6; border-radius: 3px; padding: 2px; box-shadow: 0 0 5px rgba(0,0,0,0.3); position: relative;"
                >${sentence}</span>`
        );
    }
};

// 观察activeTab变化
watch(activeTab, (newVal) => {
    // 当切换到句子分析标签(1)且已有句子分析结果时，自动生成高亮内容
    if (newVal === 1 && hasSentenceAnalysisResults.value) {
        generateHighlightedContent();
    }
});

// 观察sourceData.steps.sentences变化
watch(() => sourceData.value.steps.sentences, (newVal) => {
    // 当句子分析完成且当前是句子分析标签时，自动生成高亮内容
    if (newVal && activeTab.value === 1 && !sourceData.value.loadingStates.sentences) {
        generateHighlightedContent();
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
        
        // 在 API 请求开始时设置所有需要的加载状态
        sourceData.value.loadingStates.searchInput = true;
        sourceData.value.loadingStates.sentences = true; // 立即设置句子分析的加载状态

        // 构建提示词
        const prompt = `标题：${articleTitle.value}\n\n内容：${articleContent.value}`;

        // 使用API服务发送请求，传递abilityLevel
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
                }  else if (tag === 'calculate') {
                    sourceData.value.loadingStates.sentences = false;
                    sourceData.value.steps.sentences = true;
                    sourceData.value.loadingStates.calculate = true;
                } else if (tag === 'sentences') {
                    sourceData.value.loadingStates.analysis = false;
                    sourceData.value.steps.analysis = true;
                    // 注意：这里不需要再次设置 sentences=true，因为我们在请求开始时就已经设置了
                }
            },
            undefined,
            abilityLevel.value
        );
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
        
        // 在 API 请求开始时设置所有需要的加载状态
        sourceData.value.loadingStates.searchInput = true;
        sourceData.value.loadingStates.sentences = true; // 立即设置句子分析的加载状态

        // 处理从API返回的数据 - 使用新的API结构，传递abilityLevel
        await ApiService.analyzeWebContent(
            webUrl.value,
            abilityLevel.value,
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
                    // 注意：这里不需要再次设置 sentences=true，因为我们在请求开始时就已经设置了
                } else if (tag === 'calculate') {
                    sourceData.value.steps.sentences = true;
                    sourceData.value.loadingStates.calculate = true;
                }
            }
        );
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
                    // 使用工具函数处理LLM数据
                    mapLlmDataToAnalysis(jsonData, {
                        analysis: sourceData.value.analysis,
                        summary: sourceData.value.summary
                    });
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
                // 注意：此处不再将 loadingStates.sentences 设为 false
                // 而是等到 calculate 标签处理后才关闭句子加载状态
                
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
                // 注意：此处不关闭 sentences 的加载状态，因为 sentences 是最后一个输出的数据
                // sentences 的加载状态将在 done 标签处理或 API 请求完全完成时关闭
            } catch (error) {
                console.error('解析总体评分数据出错:', error);
                sourceData.value.loadingStates.calculate = false;
                // 即使出错也不关闭 sentences 加载状态
            }
            break;
        case 'done':
            console.log('分析完成');
            // 确保所有加载状态都关闭，包括 sentences
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
    sourceSentences.value = [];
};

const updateSourceAnalysisFromSearch = (searchResults: any[]) => {
    sourceSentences.value = searchResults.map((result, index) => ({
        text: `${result.title} - ${result.snippet}`,
        importance: Math.floor(Math.random() * 3) + 1
    })).slice(0, 5);
};

// 处理tooltip位置
const updateTooltipPosition = (event: MouseEvent) => {
    // 获取所有当前悬停的高亮句子
    const hoveredElements = document.querySelectorAll('.highlighted-sentence:hover');
    
    if (hoveredElements.length > 0) {
        // 更新伪元素位置 (通过CSS变量实现)
        document.documentElement.style.setProperty('--tooltip-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--tooltip-y', `${event.clientY - 15}px`);
    }
};

// 添加额外的检查
watch(() => sourceData.value.loadingStates.sentences, (isLoading) => {
    // 当句子分析完成加载且当前是句子分析选项卡时
    if (!isLoading && activeTab.value === 1 && sourceData.value.steps.sentences) {
        // 延迟一点执行，确保数据已完全更新
        setTimeout(() => {
            generateHighlightedContent();
        }, 100);
    }
});
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

// 添加根元素CSS变量
:root {
    --tooltip-x: 0px;
    --tooltip-y: 0px;
}

// 模拟el-textarea样式的div
.text-area-mimic {
  height: 370px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 5px 11px; // 匹配Element Plus textarea的内边距
  font-size: 16px;
  font-weight: normal;
  background: #fff;
  font-family: inherit;
  line-height: 1.5;
  color: #606266; // Element Plus默认文本颜色
  
  // 匹配Element Plus textarea的滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.highlighted-content {
  line-height: 1.5; // 与textarea一致的行高
  
  &:deep(.highlighted-sentence) {
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      opacity: 0.8 !important;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    }
    
    // 修改自定义tooltip，使用CSS变量定位
    &:hover::after {
      content: attr(data-tooltip);
      position: fixed;
      left: var(--tooltip-x);
      top: var(--tooltip-y);
      transform: translateX(-50%) translateY(-100%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 100;
      pointer-events: none;
    }
    
    // 修改小三角形位置
    &:hover::before {
      content: '';
      position: fixed;
      left: var(--tooltip-x);
      top: var(--tooltip-y);
      transform: translateX(-50%);
      border-width: 5px;
      border-style: solid;
      border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
      pointer-events: none;
    }
  }
}
</style>
