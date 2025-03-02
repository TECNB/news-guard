<template>
    <div class="barContainer w-full">
        <div ref="barContainer" :style="{ width: typeof width === 'string' ? width : `${width}px`, height: `${height}px` }"></div>
    </div>

</template>

<script setup lang="ts">
import { onMounted, nextTick, ref } from "vue"
import * as echarts from 'echarts';
import { ECBasicOption } from 'echarts/types/dist/shared';

// 接收 airLineOptions 函数和数据作为 prop
const props = defineProps<{
    width: number|string;
    height: number;
    data: {
        xAxisData: string[];
        seriesData: number[];
    };
    chartOption: (xAxisData: string[], seriesData: number[],yAxisLabel: string) => ECBasicOption
    yAxisLabel: string
}>();

const barContainer = ref<HTMLElement | null>(null);
let bar: echarts.ECharts | null = null;

onMounted(async () => {
    await nextTick();
    initWaterBarChart();
});

// 初始化图表方法
const initWaterBarChart = () => {
    if (barContainer.value) {
        bar = echarts.init(barContainer.value);
        renderWaterBar();
    }
};

// 渲染图表
const renderWaterBar = () => {
    // 使用从父组件传入的 airLineOptions 函数生成图表选项
    const options = props.chartOption(props.data.xAxisData, props.data.seriesData,props.yAxisLabel);

    // 使用 ECharts 实例的 setOption 方法渲染图表
    bar?.setOption(options);
};
</script>

<style lang="scss" scoped></style>