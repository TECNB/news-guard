<template>
    <div class="FakeNewsRestoreView w-full px-5 py-3">
        <div class="w-full flex justify-between items-center border-b px-7 pb-2 ">
            <p class="text-2xl font-bold">虚假新闻还原工作流</p>

            <div class="flex justify-center items-center gap-5">
                <div class="w-60">
                    <el-slider v-model="sliderValue" :max="maxScroll" @input="inputSlider" :show-tooltip="false"
                        class="el-slider-style"></el-slider>
                </div>
                <div class="h-6 border-l-2 border-gray-300">

                </div>
                <div class="bg-gray-200 rounded-md cursor-pointer px-5 py-2">
                    <p class="text-black">取消</p>
                </div>
                <div class="bg-gray-200 rounded-md cursor-pointer px-5 py-2">
                    <p class="text-black">保存</p>
                </div>
                <div class="bg-gray-700 rounded-md cursor-pointer px-5 py-2" @click="handlePipeline">
                    <p class="text-white">保存并执行</p>
                </div>
            </div>
        </div>

        <el-scrollbar height="100%" class="w-[1300px]" ref="scrollbarRef" @scroll="handleScroll">
            <!-- 头部 -->
            <div class="flex justify-start items-start gap-10 px-5 pt-5 w-[1780px]">
                <div class="" v-for="(info, index) in stages">
                    <PipelineHeader :info="info" :timer="timers[index]" />
                </div>
            </div>

            <div class="flex justify-start items-start gap-10 px-5 w-[1780px]" ref="innerRef">
                <!-- 数据源 -->
                <div class="flex flex-col justify-start items-center gap-2">

                    <!-- 主要部分 -->
                    <div class="w-72 h-[800px] border-r-2 border-gray-500 border-dashed translate-x-7 p-5">
                        <div class="-translate-x-5">
                            <PipelineMainData :tasks="tasks[0].subTasks" @show="showSetting" />
                        </div>
                    </div>
                </div>

                <!-- 数据预处理 -->
                <div class="flex flex-col justify-start items-center gap-2">

                    <!-- 主要部分 -->
                    <div class="w-72 h-[800px] border-r-2 border-gray-500 border-dashed translate-x-7 p-5">
                        <!-- 准入设置按钮 -->
                        <PipelineAccessSettings />

                        <!-- 任务列 -->
                        <PipelineMainTask :tasks="tasks[1]" @show="showSetting" />
                    </div>
                </div>

                <!-- 图表生成 -->
                <div class="flex flex-col justify-start items-center gap-2">

                    <!-- 主要部分 -->
                    <div class="w-72 h-[800px] relative border-r-2 border-gray-500 border-dashed translate-x-7 p-5">
                        <!-- 准入设置按钮 -->
                        <PipelineAccessSettings />

                        <!-- 任务列 -->
                        <PipelineMainTask :tasks="tasks[2]" @show="showSetting" />
                    </div>
                </div>

                <!-- 图表生成 -->
                <div class="flex flex-col justify-start items-center gap-2">

                    <!-- 主要部分 -->
                    <div class="w-72 h-[800px] border-r-2 border-gray-500 border-dashed translate-x-7 p-5">
                        <!-- 准入设置按钮 -->
                        <PipelineAccessSettings />

                        <!-- 任务列 -->
                        <PipelineMainTask :tasks="tasks[3]" @show="showSetting" />
                    </div>
                </div>

                <!-- 新阶段 -->
                <div class="flex flex-col justify-start items-center gap-2">


                    <!-- 主要部分 -->
                    <div class="w-72 h-[800px] translate-x-7 p-5">
                        <!-- 准入设置按钮 -->
                        <PipelineAccessSettings />

                        <div class="-translate-x-5">
                            <div
                                class="relative flex flex-col bg-white p-3 border-4 border-transparent cursor-pointer rounded-xl shadow-lg hover:border-gray-300">
                                <div class="flex justify-center items-center gap-2" @click="showSetting(4)">
                                    <i class="fa-regular fa-plus"></i>
                                    <p class="font-bold opacity-100">新建阶段</p>
                                </div>
                            </div>

                            <!-- 过程连线 -->
                            <div class="w-11 absolute -left-11 top-6 border border-gray-400 border-b-[3px]">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-scrollbar>


        <SettingDataSource :ifShow="settingVisible1" @updateIfShow="updateSettingVisible1" />
        <!-- 遮罩层 -->
        <MaskLayer :ifShow="settingVisible1" backgroundColor="rgba(0, 0, 0, 0.4)" />

        <SettingPreprocess :ifShow="settingVisible2" @updateIfShow="updateSettingVisible2" />
        <!-- 遮罩层 -->
        <MaskLayer :ifShow="settingVisible2" backgroundColor="rgba(0, 0, 0, 0.4)" />

        <SettingChart :ifShow="settingVisible3" @updateIfShow="updateSettingVisible3" />
        <!-- 遮罩层 -->
        <MaskLayer :ifShow="settingVisible3" backgroundColor="rgba(0, 0, 0, 0.4)" />

        <SettingStatement :ifShow="settingVisible4" @updateIfShow="updateSettingVisible4" />
        <!-- 遮罩层 -->
        <MaskLayer :ifShow="settingVisible4" backgroundColor="rgba(0, 0, 0, 0.4)" />

        <MaskLayer :ifShow="statementVisible" />
        <!-- TODO:下面是最终要出现的界面，后续记得替换 -->
        <Statement2 :ifShow="statementVisible" @updateIfShow="updateStatementVisible" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElScrollbar } from 'element-plus';
import PipelineHeader from '../components/Pipeline/PipelineHeader.vue';
import PipelineMainData from '../components/Pipeline/PipelineMainData.vue';
import PipelineMainTask from '../components/Pipeline/PipelineMainTask.vue';
import PipelineAccessSettings from '../components/Pipeline/PipelineAccessSettings.vue';

import MaskLayer from '../components/MaskLayer.vue';
import SettingDataSource from '../components/Pipeline/SettingDataSource.vue';
import SettingPreprocess from '../components/Pipeline/SettingPreprocess.vue';
import SettingChart from '../components/Pipeline/SettingChart.vue';
import SettingStatement from '../components/Pipeline/SettingStatement.vue';

const statementVisible = ref(false);


const sliderValue = ref(0)
const maxScroll = ref(0)
const innerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()


const settingVisible1 = ref(false);
const settingVisible2 = ref(false);
const settingVisible3 = ref(false);
const settingVisible4 = ref(false);

// 用来记录每个阶段的时间
const timers = ref<number[]>([0, 0, 0, 0]); // 用于存储每个阶段的时间

let intervals: any[] = []; // 用于存储定时器



interface PipelineStage {
    title: string;   // 环节标题
    num: number;     // 任务数
    status: 'completed' | 'inProgress' | 'notStarted';  // 环节状态
    completedTasks?: number;  // 已完成的任务数，仅在inProgress时有意义
}

// stage为ref类型
const stages = ref<PipelineStage[]>([
    {
        title: '数据收集',
        num: 2,
        status: 'notStarted',
        completedTasks: 0
    },
    {
        title: '新闻预处理',
        num: 1,
        status: 'notStarted',
        completedTasks: 0
    },
    {
        title: '虚假新闻检测',
        num: 3,
        status: 'notStarted',
        completedTasks: 0
    },
    {
        title: '报告生成',
        num: 1,
        status: 'notStarted',
        completedTasks: 0
    },
    {
        title: '新阶段',
        num: 0,
        status: 'notStarted',
        completedTasks: 0
    }
])

const tasks = [
    {
        title: '数据收集',
        subTasks: [
            {
                title: '爬取新闻数据',
                type: 'parallel'
            },
            {
                title: '获取第三方验证数据',
                type: 'parallel'
            },
        ]
    },
    {
        title: '新闻预处理',
        subTasks: [
            {
                title: '缺失值和异常值清洗',
                type: 'serial',
            },
            {
                title: '标准化数据',
                type: 'serial',
            },
            {
                title: '获取第三方验证数据',
                type: 'parallel'
            },
        ]
    },
    {
        title: '虚假新闻检测',
        subTasks: [
            {
                title: '获取时间轴',
                type: 'parallel'
            },
            {
                title: '取数',
                type: 'parallel'
            },
            {
                title: '图表选择',
                type: 'parallel'
            }
        ]
    },
    {
        title: '报告生成',
        subTasks: [
            {
                title: '输出文件类型选择',
                type: 'parallel'
            }
        ]
    }
]


onMounted(() => {
    const innerWidth = innerRef.value?.scrollWidth || 0
    const containerWidth = scrollbarRef.value?.$el.clientWidth || 0
    maxScroll.value = innerWidth - containerWidth
})

const updateStatementVisible = (value: boolean) => {
    statementVisible.value = value;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const startTimer = (index: number) => {
    const start = performance.now();
    intervals[index] = setInterval(() => {
        timers.value[index] = parseFloat(((performance.now() - start) / 1000).toFixed(2));
    }, 100); // 每 100 毫秒更新一次
};

const stopTimer = (index: number) => {
    clearInterval(intervals[index]); // 清除定时器
};

const handlePipeline = async () => {
    console.log('handlePipeline');


    // Stage 1
    stages.value[0].status = 'inProgress';
    startTimer(0); // 开始计时
    await delay(2000);
    stopTimer(0); // 停止计时
    stages.value[0].status = 'completed';
    console.log(`Stage 1 completed in ${timers.value[0]} s`);

    // Stage 2
    stages.value[1].status = 'inProgress';
    startTimer(1); // 开始计时
    await delay(3000);
    stages.value[1].completedTasks = 1;
    await delay(2000);
    stopTimer(1); // 停止计时
    stages.value[1].status = 'completed';
    console.log(`Stage 2 completed in ${timers.value[1]} s`);

    // Stage 3
    stages.value[2].status = 'inProgress';
    startTimer(2); // 开始计时
    await delay(3000);
    stages.value[2].completedTasks = 1;
    await delay(4000);
    stages.value[2].completedTasks = 2;
    await delay(2000);
    stopTimer(2); // 停止计时
    stages.value[2].status = 'completed';
    console.log(`Stage 3 completed in ${timers.value[2]} s`);

    // Stage 4
    stages.value[3].status = 'inProgress';
    startTimer(3); // 开始计时
    await delay(2000);
    stopTimer(3); // 停止计时
    stages.value[3].status = 'completed';
    console.log(`Stage 4 completed in ${timers.value[3]} s`);

    console.log('All stages completed.');

    statementVisible.value = true;
};

const inputSlider = (value: number) => {
    scrollbarRef.value?.setScrollLeft(value)
}

const handleScroll = ({ scrollLeft }: { scrollLeft: number }) => {
    sliderValue.value = scrollLeft
}


const showSetting = (index: number) => {
    console.log('showSetting' + index);

    switch (index) {
        case 1:
            settingVisible1.value = true;
            break;
        case 2:
            settingVisible2.value = true;
            break;
        case 3:
            settingVisible3.value = true;
            break;
        case 4:
            settingVisible4.value = true;
            break;
        default:
            break;
    }
}




const updateSettingVisible1 = (newValue: boolean) => {
    settingVisible1.value = newValue;
};
const updateSettingVisible2 = (newValue: boolean) => {
    settingVisible2.value = newValue;
};
const updateSettingVisible3 = (newValue: boolean) => {
    settingVisible3.value = newValue;
};
const updateSettingVisible4 = (newValue: boolean) => {
    settingVisible4.value = newValue;
};



</script>

<style lang="scss" scoped>
.FakeNewsRestoreView {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    background-color: #F6F6F8;
    background-image: radial-gradient(circle at 10px 10px, #D3D3D3 1.5px, transparent 1px);
    background-size: 30px 30px;
}

.el-slider-style {
    --el-slider-main-bg-color: #333;
}
</style>
