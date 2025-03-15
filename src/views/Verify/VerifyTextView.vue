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
            <!-- 标题输入 -->
            <div class="mt-5">
                <el-input v-model="title" placeholder="请输入新闻标题" size="large" />
            </div>
            <!-- 正文输入 -->
            <div class="mt-5">
                <el-input v-model="content" placeholder="请输入需要判断的正文内容" :rows="20" type="textarea" />
            </div>
            <!-- 检测按钮与字数 -->
            <div class="flex justify-between items-center mt-5">
                <div>
                    <p class="text-[#777777]">{{ content.length }}/5000 字数</p>
                </div>
                <div class="bg-[#49CFAD] w-fit rounded-lg px-2 py-3 cursor-pointer" @click="detectText">
                    <p class="text-white font-bold">检测文字</p>
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
            <div v-if="activeTab === 0" class="mt-10 h-[90%]">
                <el-scrollbar height="100%">
                    <AnalysisOverview :analysis="analysis" />
                    <MainPointsSection :summary="summary" />
                    <DetailedAnalysis :analysis="analysis" />
                </el-scrollbar>

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
import { Link, Download, Delete } from '@element-plus/icons-vue';
import AnalysisOverview from '@/components/Analysis/AnalysisOverview.vue';
import MainPointsSection from '@/components/Analysis/MainPointsSection.vue';
import DetailedAnalysis from '@/components/Analysis/DetailedAnalysis.vue';
import SentenceAnalysis from '@/components/Analysis/SentenceAnalysis.vue';
import SourceAnalysis from '@/components/Analysis/SourceAnalysis.vue';
import type { Analysis, Summary, Sentence } from '@/utils/types';

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
const title = ref('');
const content = ref('');
const tabs = ['概述', '句子分析', '来源分析'];
const activeTab = ref(0);

const analysis = ref<Analysis>({
    // 初始状态，原本是：deductions: ["扣分原因1", "扣分原因2"]
    title_relevance: { score: 0, deductions: ["标题缺乏新闻价值", "信息量不足"] },
    // 原本是：deductions: ["扣分原因1", "扣分原因2"]
    logical_consistency: { score: 0, deductions: ["论述前后矛盾", "缺乏必要的过渡"] },
    // 原本是：deductions: ["扣分原因1", "扣分原因2"]
    factual_accuracy: { score: 0, deductions: ["引用数据过时", "关键信息未核实"] },
    // 原本是：deductions: ["扣分原因1", "扣分原因2"]
    historical_accuracy: { score: 0, deductions: ["历史事件描述不准确", "时间顺序混乱"] },
    // 原本是：deductions: ["扣分原因1", "扣分原因2"]
    subjectivity_and_inflammatory_language: { score: 0, deductions: ["使用带有偏见的词汇", "情绪化表达明显"] },
    // 原本是：deductions: ["扣分原因1", "扣分原因2"]
    causality_check: { score: 0, deductions: ["因果推导不合理", "缺乏必要的论证"] }
});

const summary = ref<Summary>({
    // 原本是：["观点1", "观点2"]
    main_points: ["文章缺乏明确的论述重点", "论据支撑不足"],
    // 原本是：["虚假内容1", "虚假内容2"]
    check_facts: ["引用的统计数据未注明来源", "关键事实缺乏官方证实"]
});

const detectText = () => {
    if (!title.value || !content.value) {
        alert('请输入标题和正文内容！');
        return;
    }

    // Update analysis data when text is submitted
    analysis.value = {
        title_relevance: { score: 75, deductions: ["标题使用'颠覆性'等夸张词汇", "正文第三段完全偏离标题主题"] },
        logical_consistency: { score: 85, deductions: ["第二段与第三段之间缺乏必要的逻辑连接"] },
        factual_accuracy: { score: 65, deductions: ["市场份额数据未引用权威机构统计", "产品性能描述缺乏第三方测试支持"] },
        historical_accuracy: { score: 90, deductions: ["产品发布时间与实际发布日期相差一个月"] },
        subjectivity_and_inflammatory_language: { score: 70, deductions: ["使用'革命性'等主观评价词", "对竞品描述带有明显贬义"] },
        causality_check: { score: 80, deductions: ["技术创新与市场份额增长的因果关系缺乏数据支持"] }
    };

    // Update summary data
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

    // Switch to overview tab to show results
    activeTab.value = 0;
};
</script>

<style lang="scss" scoped>
// 下面为el-select部分
@mixin select_radius {
    border-radius: 12px;
}

// 控制el-select的长度以及圆角
:deep(.el-select__wrapper) {
    height: 50px;
    @include select_radius;
}

// 控制el-select中文字的样式
:deep(.el-select__placeholder) {
    font-size: 16px;
    font-weight: bold;
}

// 控制点击后的边框颜色
:deep(.el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 1px #49CFAD;
}

// 下面为下拉框部分
// 下面用于控制整体的下拉框圆角
:deep(.el-select__popper.el-popper) {
    @include select_radius;
}

//下拉框的文本颜色选中之后的样式
.el-select-dropdown__item.is-selected {
    color: #49CFAD;
}

// 下面是input和textarea组件的自定义样式
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
