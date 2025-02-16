<template>
    <div class="PipelineMainData">
        <div class="flex justify-between bg-white p-5 border-4 border-transparent cursor-pointer rounded-xl shadow-lg hover:border-gray-300 mb-5"
            v-for="data in props.tasks" :key="data.title">
            <div class="text-left">
                <p class="font-bold">{{ data.title }}</p>
            </div>
        </div>


        <div
            class="flex flex-col bg-gray-500/30  px-5 py-3 cursor-pointer rounded-xl shadow-lg mt-8 hover:bg-gray-500/50">
            <div class="flex justify-center items-center gap-2" @click="show(1)">
                <i class="fa-regular fa-plus"></i>
                <p class="font-bold opacity-100">数据源</p>
            </div>
        </div>

        <!-- 过程连线 -->
        <div class="w-11 absolute -right-11 top-6 border border-gray-400 border-b-[3px]">
        </div>
        <!-- 右并行连线 -->
        <!-- <div
            class="h-[80px] w-4 absolute -right-4 bottom-28 border-gray-400 border-r-[3px] border-b-[3px] rounded-br-2xl -z-10">
        </div> -->
        <!-- 右并行连线右上角圆角 -->
        <!-- <div
            class="h-14 w-4 absolute -right-[29px] bottom-40 border-gray-400 border-l-[3px] border-t-[3px] rounded-tl-2xl -z-10">
        </div> -->
    </div>
</template>

<script setup lang="ts">
import { } from "vue"
const props = defineProps(['tasks']);
const emit = defineEmits(['show', 'addParallelTask']); // 确保你定义了正确的事件名

const show = (index: number) => {
    emit('show', index)
    console.log('show')
}

// 方法：处理并行任务添加按钮点击事件
const handleParallelTaskAdd = () => {
    console.log('添加串行任务');
    const newSerialTask = {
        title: '新串行任务',  // 这里可以根据需求动态设置标题
        type: 'serial'
    };

    // 触发事件并将新任务传递给父组件
    emit('addParallelTask', newSerialTask);
};
</script>

<style lang="scss" scoped></style>
