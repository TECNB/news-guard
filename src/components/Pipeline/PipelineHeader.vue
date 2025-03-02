<template>
    <div class="PipelineHeader">
        <!-- 头部 -->
        <div v-if="props.info.title !== '新阶段'" class="flex justify-center items-center relative cursor-pointer">
            <!-- Arrow tail -->
            <div :class="backgroundClass" class="absolute top-0 -left-3 w-3 h-16 opacity-80"></div>

            <!-- Main body -->
            <div :class="backgroundClass"
                class="w-72 h-16 relative flex justify-between items-center  opacity-80 overflow-hidden p-3">
                <div class="flex flex-col justify-center items-start" v-if="props.info.status !== 'inProgress'">
                    <p class="font-bold">{{ props.info.title }}</p>
                    <p v-if="props.info.title==='数据源'">{{ props.info.num }}个数据源</p>
                    <p v-else>{{ props.info.num }}个任务</p>
                </div>

                <div class="flex flex-col justify-center items-start" v-else>
                    <p class="font-bold text-white">{{ props.info.title }}</p>
                    <p class="text-white">{{ props.info.completedTasks }}/{{ props.info.num }}个任务完成 | {{ props.timer }}s</p>
                </div>

                <!-- 未进行时三个图标 -->
                <div class="flex justify-center items-center gap-4" v-if="props.info.status === 'notStarted'">
                    <i class="fa-light fa-pen"></i>
                    <i class="fa-light fa-copy"></i>
                    <i class="fa-light fa-trash"></i>
                </div>

                <!-- 完成后打勾图标 -->
                <div class="absolute -top-3 right-0" v-if="props.info.status === 'completed'">
                    <i class="fa-solid fa-circle-check text-7xl text-emerald-300"></i>
                </div>

                <!-- loading图标 -->
                <div class="" v-if="props.info.status === 'inProgress'">
                    <i class="fa-duotone fa-solid fa-loader rotating fa-xl text-white"></i>
                </div>
            </div>

            <!-- Arrow head -->
            <div :class="backgroundClass" class="absolute top-0 -right-5 w-5 h-16 opacity-80"
                style="clip-path: polygon(0 0%, 100% 50%, 0 100%);">
            </div>
            <!-- 添加符号 -->
            <div v-if="props.info.title !== '数据源'"
                class="w-4 h-4 absolute -left-7 bottom-6 flex justify-center items-center rounded-xl bg-white shadow-[0_2px_6px_0_rgba(37,43,58,0.4)]">
                <i class="fa-regular fa-plus fa-2xs"></i>
            </div>
        </div>
        <!-- 头部 -->
        <div v-else class="flex justify-center items-center relative cursor-pointer">
            <!-- Arrow tail -->
            <div class="absolute top-0 -left-3 w-3 h-16 bg-gray-200/60 opacity-80"></div>

            <!-- Main body -->
            <div class="w-72 h-16 flex justify-between items-center bg-gray-200/60 opacity-80 p-3">
                <div class="flex flex-col justify-center items-start">
                    <p class="font-bold text-black/60">{{ props.info.title }}</p>
                    <p class="text-black/60">{{ props.info.num }}个数据源</p>
                </div>
            </div>

            <!-- Arrow head -->
            <div class="absolute top-0 -right-5 w-5 h-16 bg-gray-200/60 opacity-80"
                style="clip-path: polygon(0 0%, 100% 50%, 0 100%);"></div>
            <!-- 添加符号 -->
            <div
                class="w-4 h-4 absolute -left-7 bottom-6 flex justify-center items-center rounded-xl bg-white shadow-[0_2px_6px_0_rgba(37,43,58,0.4)]">
                <i class="fa-regular fa-plus fa-2xs"></i>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
const props = defineProps(['info','timer'])
const emit = defineEmits()


const backgroundClass = computed(() => {
    if (props.info.status === 'inProgress') {
        return 'bg-gray-600';
    } else if (props.info.status === 'completed') {
        return 'bg-emerald-100';
    } else {
        return 'bg-gray-200';
    }
});
</script>

<style lang="scss" scoped>
.rotating {
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
