<template>
    <div class="pieContainer w-full">
        <div ref="pieContainer" :style="{ width: typeof width === 'string' ? width : `${width}px`, height: `${height}px` }"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ECBasicOption } from 'echarts/types/dist/shared';

const props = defineProps<{
    width: number|string;
    height: number;
    data: {
        seriesData: { value: number; name: string }[]
    };
    chartOption: (seriesData: { value: number; name: string }[]) => ECBasicOption
}>();

const pieContainer = ref<HTMLElement | null>(null);
let pie: echarts.ECharts | null = null;

onMounted(async () => {
    await nextTick();
    initForestPieChart();
});

const initForestPieChart = () => {
    if (pieContainer.value) {
        pie = echarts.init(pieContainer.value);
        renderForestPie();
    }
};

const renderForestPie = () => {

    let options = props.chartOption(props.data.seriesData);

    // 使用 setOption 方法设置图表配置
    pie?.setOption(options);
}
</script>

<style lang="scss" scoped></style>