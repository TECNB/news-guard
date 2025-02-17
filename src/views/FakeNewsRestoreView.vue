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
                <div class="" v-for="(info, index) in stages" :key="index">
                    <PipelineHeader :info="info" :timer="timers[index]" />
                </div>
            </div>

            <div class="flex justify-start items-start gap-10 px-5 w-[1780px]" ref="innerRef">
                <!-- 数据源 -->
                <div class="flex flex-col justify-start items-center gap-2">

                    <!-- 主要部分 -->
                    <div class="w-72 h-[800px] border-r-2 border-gray-500 border-dashed translate-x-7 p-5">
                        <div class="-translate-x-5">
                            <PipelineMainData :tasks="tasks[0].subTasks" @show="showSetting" :key="key2"/>
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
                        <PipelineMainTask :tasks="tasks[1]" @show="showSetting" @taskType="handleTaskType"
                            :key="key1" />
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


        <SettingDataSource :ifShow="settingVisible1" @updateIfShow="updateSettingVisible1"
            @textDetected="handleTextDetected" @addTask="addDataTask"/>
        <!-- 遮罩层 -->
        <MaskLayer :ifShow="settingVisible1" backgroundColor="rgba(0, 0, 0, 0.4)"/>

        <SettingPreprocess :ifShow="settingVisible2" :taskType="taskType" @updateIfShow="updateSettingVisible2" @textDetected="handleTextDetected" @addTask="addPreprocessTask"/>
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
        <Statement :ifShow="statementVisible" :fakeNewsData="fakeNewsData" @updateIfShow="updateStatementVisible" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElScrollbar } from 'element-plus';

import { restore } from '../api/fakeNewsRestore';

import PipelineHeader from '../components/Pipeline/PipelineHeader.vue';
import PipelineMainData from '../components/Pipeline/PipelineMainData.vue';
import PipelineMainTask from '../components/Pipeline/PipelineMainTask.vue';
import PipelineAccessSettings from '../components/Pipeline/PipelineAccessSettings.vue';

import MaskLayer from '../components/MaskLayer.vue';
import SettingDataSource from '../components/Pipeline/SettingDataSource.vue';
import SettingPreprocess from '../components/Pipeline/SettingPreprocess.vue';
import SettingChart from '../components/Pipeline/SettingChart.vue';
import SettingStatement from '../components/Pipeline/SettingStatement.vue';

import Statement from '../components/Pipeline/Statement.vue';

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
        num: 1,
        status: 'notStarted',
        completedTasks: 0
    },
    {
        title: '新闻预处理',
        num: 3,
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
        num: 2,
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

let tasks = ref([
    {
        title: '数据收集',
        subTasks: [
            
        ]
    },
    {
        title: '新闻预处理',
        subTasks: [
            {
                title: '语言检测与转换',
                type: 'serial',
                description: '检测新闻语言并统一转换为中文'
            },
            {
                title: '新闻分类',
                type: 'parallel',
                description: '对新闻进行主题分类，帮助后续分析'
            },
        ]
    },
    {
        title: '虚假新闻检测',
        subTasks: [
            {
                title: '情绪检测',
                type: 'parallel',
                description: '检测新闻中的情绪倾向，识别偏向性言辞'
            },
            {
                title: '事实检测',
                type: 'parallel',
                description: '对新闻中的事实进行验证，查找是否有误导性信息'
            },
            {
                title: '时间一致性检查',
                type: 'parallel',
                description: '检查新闻时间与事件发生时间的合理性'
            }
        ]
    },
    {
        title: '报告生成',
        subTasks: [
            {
                title: '输出文件类型选择',
                type: 'parallel',
                description: '用户可以选择报告的输出格式（PDF、HTML等）'
            },
            {
                title: '结果分析与评分',
                type: 'parallel',
                description: '对新闻的可信度进行评分，输出检测结论'
            }
        ]
    }
])
const key1 = ref('');
const key2 = ref('');

let taskType = '';


onMounted(() => {
    const innerWidth = innerRef.value?.scrollWidth || 0
    const containerWidth = scrollbarRef.value?.$el.clientWidth || 0
    maxScroll.value = innerWidth - containerWidth
})

// 处理添加串行任务事件
const addPreprocessTask = (newTask: any) => {
    // 在适当的任务（例如，新闻预处理）中添加新的串行任务
    tasks.value[1].subTasks.push(newTask);
    console.log('添加任务成功', tasks.value[1].subTasks);
    key1.value = Math.random().toString();
};

const addDataTask = (newTask: any) => {
    // 在适当的任务（例如，新闻预处理）中添加新的串行任务
    tasks.value[0].subTasks.push(newTask);
    console.log('添加任务成功', tasks.value[0].subTasks);
    key2.value = Math.random().toString();
};

const handleTaskType = (type: string) => {
    console.log('handleTaskType', type);
    taskType = type;
};

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

let fakeNewsData = ref('');

let userContent = '';

// 处理 textDetected 事件
const handleTextDetected = (text: string) => {
    console.log('检测到的文字:', text);
    userContent = text;
};

const handlePipeline = async () => {
    console.log('handlePipeline');

    // 遍历task ，将tasks.value[1]、tasks.value[2]部分的description作为文本相加，然后放到userContent中
    userContent += '还原虚假新闻处理要求: ';
    tasks.value.slice(1, 3).forEach((task) => {
        task.subTasks.forEach((subTask) => {
            userContent += subTask.description;
        });
    });

    console.log('userContent:', userContent);
    // 在 Stage 1 开始之前启动 restore 请求
    const restorePromise = restore(userContent).then((res) => res.data);

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

    // 等待 restore 请求完成后，才更新 Stage 4 的状态
    const data = await restorePromise;
    console.log("data", data);

    // 去掉外层的```json```部分
    const jsonResult = data.replace(/^```json\s*|\s*```$/g, '').trim();
    fakeNewsData.value = JSON.parse(jsonResult); // 转换为对象
    console.log('fakeNewsData.value:', fakeNewsData.value);

    // 完成 Stage 4
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
