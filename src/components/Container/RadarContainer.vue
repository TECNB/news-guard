<template>
    <div class="radarContainer w-full">
        <div ref="radarContainer"
            :style="{ width: typeof width === 'string' ? width : `${width}px`, height: `${height}px` }"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref, watch, onUnmounted } from "vue";
import * as echarts from 'echarts';
import { ECBasicOption } from 'echarts/types/dist/shared';

// 接收 radarOptions 函数和数据作为 prop
const props = defineProps<{
    width: number | string;
    height: number;
    data: {
        indicatorData: { name: string, max: number }[];
        seriesData: number[];
    };
    chartOption: (indicatorData: { name: string; max: number }[], seriesData: number[]) => ECBasicOption;
}>();

const radarContainer = ref<HTMLElement | null>(null);
let radar: echarts.ECharts | null = null;

onMounted(async () => {
    await nextTick();
    initRadarChart();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    radar?.dispose();
    radar = null;
});

// 处理窗口大小变化
const handleResize = () => {
    if (radar) {
        radar.resize();
    }
};

// 监听数据变化
watch(
    () => props.data.seriesData,
    () => {
        nextTick(() => {
            renderRadarChart();
        });
    },
    { deep: true }
);

// 初始化雷达图方法
const initRadarChart = () => {
    if (radarContainer.value) {
        // 确保容器中没有已存在的图表
        if (radar) {
            radar.dispose();
        }
        radar = echarts.init(radarContainer.value);
        renderRadarChart();
    }
};

// 渲染雷达图
const renderRadarChart = () => {
    if (!radar) return;
    
    // 使用从父组件传入的 radarOptions 函数生成图表选项
    const options = props.chartOption(props.data.indicatorData, props.data.seriesData);

    // 使用 ECharts 实例的 setOption 方法渲染图表
    radar.setOption(options);
};
</script>

<style lang="scss" scoped></style>