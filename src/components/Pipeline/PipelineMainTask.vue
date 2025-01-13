<template>
    <div class="PipelineMainTask -translate-x-5 relative" v-if="props.tasks.title == '数据预处理'">
        <div class="container  rounded-lg">
            <div class="box relative flex flex-col bg-white p-3 border-4 border-transparent cursor-pointer rounded-xl shadow-lg hover:border-gray-300 mb-5"
                v-for="task in props.tasks.subTasks">
                <div class="text-left">
                    <p class="font-bold">{{ task.title }}</p>
                </div>


                <!-- 串行连线 -->
                <div class="h-5 absolute left-5 -bottom-6 border border-gray-400 border-l-[3px]">
                </div>
            </div>
            <div class="box relative flex flex-col bg-white p-3 border-4 border-transparent cursor-pointer rounded-xl shadow-lg mt-5 hover:border-gray-300"
                v-for="task in props.tasks.subTasks[0].subTasks">
                <div class="text-left">
                    <p class="font-bold">{{ task.title }}</p>
                </div>

                <!-- 添加符号 -->
                <div
                    class="w-4 h-4 absolute left-28 -bottom-3 flex justify-center items-center rounded-xl bg-white shadow-[0_2px_6px_0_rgba(37,43,58,0.4)]">
                    <i class="fa-regular fa-plus fa-2xs"></i>
                </div>
            </div>
        </div>


        <div
            class="flex flex-col bg-white p-2 border-4 border-transparent cursor-pointer rounded-xl shadow-md mt-5 hover:shadow-lg">
            <div class="flex justify-center items-center gap-2" @click="show(2)">
                <i class="fa-regular fa-plus"></i>
                <p class="font-bold opacity-100">并行任务</p>
            </div>
        </div>

        <!-- 过程连线 -->
        <div class="w-11 absolute -left-11 top-6 border border-gray-400 border-b-[3px]">
        </div>
        <div class="w-11 absolute -right-11 top-6 border border-gray-400 border-b-[3px]">
        </div>
        <!-- 左并行连线 -->
        <div
            class="h-[150px] w-6 absolute -left-5 bottom-5 border-gray-400 border-l-[3px] border-b-[3px] border-dashed rounded-bl-2xl -z-10">
        </div>
        <!-- 右并行连线 -->
        <div
            class="h-[150px] w-6 absolute -right-5 bottom-5 border-gray-400 border-r-[3px] border-b-[3px] border-dashed rounded-br-2xl -z-10">
        </div>
    </div>

    <div class="PipelineMainTask -translate-x-5" v-if="props.tasks.title == '图表生成'">
        <div class="relative flex flex-col bg-white p-3 border-4 border-transparent cursor-pointer rounded-xl shadow-lg hover:border-gray-300 mb-5"
            v-for="task in props.tasks.subTasks">
            <div class="text-left">
                <p class="font-bold">{{ task.title }}</p>
            </div>
            <div
                class="w-4 h-4 absolute left-28 -bottom-3 flex justify-center items-center rounded-xl bg-white shadow-[0_2px_6px_0_rgba(37,43,58,0.4)]">
                <i class="fa-regular fa-plus fa-2xs"></i>
            </div>

        </div>

        <div
            class="flex flex-col bg-white p-2 border-4 border-transparent cursor-pointer rounded-xl shadow-md mt-5 hover:shadow-lg">
            <div class="flex justify-center items-center gap-2" @click="show(3)">
                <i class="fa-regular fa-plus"></i>
                <p class="font-bold opacity-100">并行任务</p>
            </div>
        </div>

        <!-- 过程连线 -->
        <div class="w-11 absolute -left-11 top-6 border border-gray-400 border-b-[3px]">
        </div>
        <div class="w-11 absolute -right-11 top-6 border border-gray-400 border-b-[3px]">
        </div>

        <!-- 右并行连线右上角圆角 -->
        <div
            class="h-14 w-4 absolute -right-[29px] top-7 border-gray-400 border-l-[3px] border-t-[3px] rounded-tl-2xl -z-10">
        </div>
        <!-- 右并行连线 -->
        <div
            class="h-[68px] w-4 absolute -right-4 top-10 border-gray-400 border-r-[3px] border-b-[3px] rounded-br-2xl -z-10">
        </div>
        <!-- 右并行连线 -->
        <div
            class="h-[85px] w-4 absolute -right-4 bottom-24 border-gray-400 border-r-[3px] border-b-[3px] rounded-br-2xl -z-10">
        </div>
        <!-- 右并行连线 -->
        <div
            class="h-[85px] w-4 absolute -right-4 bottom-6 border-gray-400 border-r-[3px] border-b-[3px] rounded-br-2xl -z-10 border-dashed">
        </div>

        <!-- 左并行连线右上角圆角 -->
        <div
            class="h-14 w-4 absolute -left-[29px] top-7 border-gray-400 border-r-[3px] border-t-[3px] rounded-tr-2xl -z-10">
        </div>
        <!-- 左并行连线 -->
        <div
            class="h-[68px] w-4 absolute -left-4 top-10 border-gray-400 border-l-[3px] border-b-[3px] rounded-bl-2xl -z-10">
        </div>
        <!-- 左并行连线 -->
        <div
            class="h-[85px] w-4 absolute -left-4 bottom-24 border-gray-400 border-l-[3px] border-b-[3px] rounded-bl-2xl -z-10">
        </div>
        <!-- 左并行连线 -->
        <div
            class="h-[85px] w-4 absolute -left-4 bottom-6 border-gray-400 border-l-[3px] border-b-[3px] rounded-bl-2xl -z-10 border-dashed">
        </div>
    </div>


    <div class="PipelineMainTask -translate-x-5" v-if="props.tasks.title == '报表生成'">
        <div class="relative flex flex-col bg-white p-3 border-4 border-transparent cursor-pointer rounded-xl shadow-lg hover:border-gray-300"
            v-for="task in props.tasks.subTasks">
            <div class="text-left">
                <p class="font-bold">{{ task.title }}</p>
            </div>
            <div
                class="w-4 h-4 absolute left-28 -bottom-3 flex justify-center items-center rounded-xl bg-white shadow-[0_2px_6px_0_rgba(37,43,58,0.4)]">
                <i class="fa-regular fa-plus fa-2xs"></i>
            </div>
        </div>

        <div
            class="flex flex-col bg-white p-2 border-4 border-transparent cursor-pointer rounded-xl shadow-md mt-5 hover:shadow-lg">
            <div class="flex justify-center items-center gap-2" @click="show(4)">
                <i class="fa-regular fa-plus"></i>
                <p class="font-bold opacity-100">并行任务</p>
            </div>
        </div>

        <!-- 过程连线 -->
        <div class="w-11 absolute -left-11 top-6 border border-gray-400 border-b-[3px]">
        </div>
        <div class="w-11 absolute -right-11 top-6 border border-gray-400 border-b-[3px]">
        </div>

        <!-- 左并行连线 -->
        <div
            class="h-[75px] w-4 absolute -left-4 bottom-6 border-gray-400 border-l-[3px] border-b-[3px] rounded-bl-2xl -z-10 border-dashed">
        </div>
        <!-- 右并行连线 -->
        <div
            class="h-[75px] w-4 absolute -right-4 bottom-6 border-gray-400 border-r-[3px] border-b-[3px] rounded-br-2xl -z-10 border-dashed">
        </div>
    </div>
</template>

<script setup lang="ts">
import { } from "vue"

const props = defineProps(['tasks']);
const emit = defineEmits(['show']);
const show = (index: number) => {
    console.log(index)
    emit('show', index)
}

</script>

<style lang="scss" scoped>
.container {
    position: relative;
}

.container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    /* 保持与外层 div 一样的圆角 */
    background-color: gray;
    opacity: 0.15;
    /* 外层背景颜色 */
    z-index: -1;
    /* 确保不影响内部内容 */
    transform: translate(-10px, -10px);
    /* 移动伪元素的大小 */
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    border-radius: 12px;
}

.box {
    position: relative;
    z-index: 1;
    /* 确保内容在伪元素之上 */
}
</style>
