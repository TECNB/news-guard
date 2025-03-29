<template>
    <div class="VerifyTextView h-full flex justify-center items-center gap-8 p-8">
        <!-- 输入部分 -->
        <div class="flex-[1.5] h-full shadow-xl border rounded-xl p-5">
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
                            <el-icon><Link /></el-icon>
                        </template>
                    </el-input>
                </div>
                <div class="bg-[#49CFAD] rounded-lg px-4 py-3 cursor-pointer flex items-center" @click="detectWebContent">
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
        <div class="flex-1 h-full shadow-xl border rounded-xl p-5">
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
            <div v-if="activeTab === 0" class="h-[89%]">
                <div class="flex justify-end items-center gap-1 cursor-pointer my-3" v-if="!showSourceView" @click="showSourceView = true">
                    <p class="text-green-500 ">结果来源查看</p>
                    <i class="fa-solid fa-magnifying-glass text-green-500"></i>
                </div>
                
                <div class="flex justify-end my-3" v-else>
                    <el-button 
                        type="primary" 
                        text 
                        :icon="ArrowLeft" 
                        @click="showSourceView = false"
                        class="!text-[#49CFAD] hover:!text-[#3DB89A]"
                    >
                        返回分析结果
                    </el-button>
                </div>
                
                <template v-if="!showSourceView">
                    <el-scrollbar height="100%">
                        <AnalysisOverview :analysis="analysis" />
                        <MainPointsSection :summary="summary" />
                        <DetailedAnalysis :analysis="analysis" />
                    </el-scrollbar>
                </template>

                <!-- 使用新的结果来源组件 -->
                <SourceDataView v-else :sourceData="sourceData" />
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
import AnalysisOverview from '@/components/Analysis/AnalysisOverview.vue';
import MainPointsSection from '@/components/Analysis/MainPointsSection.vue';
import DetailedAnalysis from '@/components/Analysis/DetailedAnalysis.vue';
import SentenceAnalysis from '@/components/Analysis/SentenceAnalysis.vue';
import SourceAnalysis from '@/components/Analysis/SourceAnalysis.vue';
import SourceDataView from '@/components/Analysis/SourceDataView.vue';
import type { Analysis, Summary, Sentence } from '@/utils/types';
import { ApiService } from '@/utils/apiService';
import { ElMessage } from 'element-plus';
import { parsePartialJson, pythonStringToJson } from '@/utils/pythonJsonConverter';

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

const analysis = ref<Analysis>({
    // 标题相关性
    title_relevance: { score: 0, deductions: ["标题缺乏新闻价值", "信息量不足"] },
    // 逻辑一致性
    logical_consistency: { score: 0, deductions: ["论述前后矛盾", "缺乏必要的过渡"] },
    // 事实准确性
    factual_accuracy: { score: 0, deductions: ["引用数据过时", "关键信息未核实"] },
    // 主观和煽动性语言
    subjectivity_and_inflammatory_language: { score: 0, deductions: ["使用带有偏见的词汇", "情绪化表达明显"] },
    // 因果关联
    causal_relevance: { score: 0, deductions: ["因果推导不合理", "缺乏必要的论证"] },
    // 来源可信度
    source_credibility: { score: 0, deductions: ["来源不明确", "平台存在发布不实信息的历史"] },
    // 驳斥结果
    debunking_result: { score: null, deductions: [] },
    // 外部证实
    external_corroboration: { score: null, deductions: [] }
});

const summary = ref<Summary>({
    // 原本是：["观点1", "观点2"]
    main_points: ["文章缺乏明确的论述重点", "论据支撑不足"],
    // 原本是：["虚假内容1", "虚假内容2"]
    check_facts: ["引用的统计数据未注明来源", "关键事实缺乏官方证实"]
});

// 结果来源查看控制
const showSourceView = ref(false);
const sourceData = ref({
    searchInput: '',
    searchOutput: [] as any[],
    llm: '',
    sentences: [] as Sentence[]
});

// 检测文本内容
const detectText = async () => {
    if (!articleTitle.value || !articleTitle.value) {
        ElMessage.warning('请输入标题和正文内容！');
        return;
    }

    isLoading.value = true;
    
    try {
        // 更新分析数据，匹配新的Analysis结构
        analysis.value = {
            title_relevance: { score: 7, deductions: ["标题使用'颠覆性'等夸张词汇", "正文第三段完全偏离标题主题"] },
            logical_consistency: { score: 8, deductions: ["第二段与第三段之间缺乏必要的逻辑连接"] },
            factual_accuracy: { score: 6, deductions: ["市场份额数据未引用权威机构统计", "产品性能描述缺乏第三方测试支持"] },
            subjectivity_and_inflammatory_language: { score: 7, deductions: ["使用'革命性'等主观评价词", "对竞品描述带有明显贬义"] },
            causal_relevance: { score: 8, deductions: ["技术创新与市场份额增长的因果关系缺乏数据支持"] },
            source_credibility: { score: 6, deductions: ["文章来源不明确"] },
            debunking_result: { score: null, deductions: [] },
            external_corroboration: { score: null, deductions: [] }
        };

        // 更新摘要数据
        summary.value = {
            main_points: [
                "详细分析了该公司最新的人工智能芯片架构及其技术优势",
                "探讨了该技术在自动驾驶和智能制造领域的具体应用场景"
            ],
            check_facts: [
                "芯片性能提升200%的数据缺乏第三方基准测试验证",
                "行业市场预测数据未注明具体研究机构来源"
            ]
        };
        
        // 添加模拟的来源数据
        sourceData.value = {
            searchInput: articleTitle.value,
            searchOutput: [
                { title: '人工智能芯片发展最新报告', snippet: '市场研究表明，下一代AI芯片性能提升可能达到150%-180%，低于部分厂商宣称的200%提升。', source: 'AI研究中心' },
                { title: '智能制造趋势分析', snippet: '智能制造领域正在快速整合AI技术，预计到2025年，有超过60%的制造企业将采用AI辅助系统。', source: '工业4.0协会' }
            ],
            llm: JSON.stringify({
                "main_point": ["详细分析了该公司最新的人工智能芯片架构及其技术优势", "探讨了该技术在自动驾驶和智能制造领域的具体应用场景"],
                "details": {
                    "analysis": {
                        "title_relevance": { "score": 7, "deductions": ["标题使用'颠覆性'等夸张词汇", "正文第三段完全偏离标题主题"] }
                    }
                }
            }, null, 2),
            sentences: [
                { text: '该公司最新的人工智能芯片采用了全新架构设计', importance: 3 },
                { text: '芯片性能提升200%，远超行业平均水平', importance: 2 },
                { text: '这将在自动驾驶领域带来突破性进展', importance: 1 }
            ]
        };
        
        // 切换到概述标签显示结果，并显示来源视图
        activeTab.value = 0;
        showSourceView.value = true;
    } finally {
        isLoading.value = false;
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
        
        // 处理从API返回的数据
        await ApiService.analyzeWebContent(webUrl.value, 2, (tag, content) => {
            console.log(`[${tag}] =>`, content);
            
            // 根据返回的标签处理不同类型的数据
            if (tag === 'article_title') {
                // 获取到网页文章标题
                articleTitle.value = content;
                // 这里可能需要处理文章正文，暂时不设置
            } else if (tag === 'article_content') {
                // 获取到网页文章内容
                articleContent.value = content;
            } else if (tag === 'search_input') {
                // 保存搜索输入到来源数据
                sourceData.value.searchInput = content;
            } else if (tag === 'search_output') {
                // 处理搜索结果，可以用于来源分析
                try {
                    // 将Python风格的列表转换为标准JSON
                    const jsonString = pythonStringToJson(content);
                    const searchResults = JSON.parse(jsonString);
                    updateSourceAnalysisFromSearch(searchResults);
                    // 更新来源数据
                    sourceData.value.searchOutput = searchResults;
                    console.log('searchResults',searchResults)
                } catch (error) {
                    console.error('解析搜索结果出错:', error);
                }
            } else if (tag === 'llm') {
                // 处理LLM分析结果
                try {
                    // 保存原始LLM输出
                    sourceData.value.llm = content;
                    
                    // 解析JSON数据
                    const jsonData = parsePartialJson(content);

                    console.log('llm:',jsonData)
                    
                    // 更新分析结果
                    if (jsonData.main_point) {
                        summary.value.main_points = jsonData.main_point;
                    }
                    
                    if (jsonData.details && jsonData.details.analysis) {
                        // 更新分析数据
                        updateAnalysisFromApi(jsonData.details.analysis);
                    }
                } catch (error) {
                    console.error('解析LLM数据出错:', error);
                }
            } else if (tag === 'sentences') {
                // 处理句子分析结果
                try {
                    const sentencesData = JSON.parse(content);
                    sourceData.value.sentences = sentencesData.map((sentence: any) => ({
                        text: sentence.text,
                        importance: sentence.importance || Math.floor(Math.random() * 3) + 1
                    }));
                } catch (error) {
                    console.error('解析句子数据出错:', error);
                }
            }
        });
        
        // 切换到概述标签显示结果，并显示来源视图
        activeTab.value = 0;
        showSourceView.value = true;
        
    } catch (error) {
        console.error('网页分析出错:', error);
        ElMessage.error('网页分析失败，请检查URL是否正确');
    } finally {
        isWebLoading.value = false;
    }
};

const resetAnalysisResults = () => {
    analysis.value = {
        title_relevance: { score: 0, deductions: [] },
        logical_consistency: { score: 0, deductions: [] },
        factual_accuracy: { score: 0, deductions: [] },
        subjectivity_and_inflammatory_language: { score: 0, deductions: [] },
        causal_relevance: { score: 0, deductions: [] },
        source_credibility: { score: 0, deductions: [] },
        debunking_result: { score: null, deductions: [] },
        external_corroboration: { score: null, deductions: [] }
    };
    
    summary.value = {
        main_points: [],
        check_facts: []
    };
    
    aiSentences.value = [];
    humanSentences.value = [];
    sourceSentences.value = [];
    
    // 重置来源数据
    sourceData.value = {
        searchInput: '',
        searchOutput: [],
        llm: '',
        sentences: []
    };
};

const updateAnalysisFromApi = (apiAnalysis: any) => {
    // 更新所有分析结果，以LLM输出为准
    if (apiAnalysis.title_relevance) {
        analysis.value.title_relevance = apiAnalysis.title_relevance;
    }
    if (apiAnalysis.logical_consistency) {
        analysis.value.logical_consistency = apiAnalysis.logical_consistency;
    }
    if (apiAnalysis.factual_accuracy) {
        analysis.value.factual_accuracy = apiAnalysis.factual_accuracy;
    }
    if (apiAnalysis.subjectivity_and_inflammatory_language) {
        analysis.value.subjectivity_and_inflammatory_language = apiAnalysis.subjectivity_and_inflammatory_language;
    }
    if (apiAnalysis.causal_relevance) {
        analysis.value.causal_relevance = apiAnalysis.causal_relevance;
    }
    if (apiAnalysis.source_credibility) {
        analysis.value.source_credibility = apiAnalysis.source_credibility;
    }
    if (apiAnalysis.debunking_result) {
        analysis.value.debunking_result = apiAnalysis.debunking_result;
    }
    if (apiAnalysis.external_corroboration) {
        analysis.value.external_corroboration = apiAnalysis.external_corroboration;
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
