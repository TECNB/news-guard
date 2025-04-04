import { ECBasicOption } from 'echarts/types/dist/shared';

const lineOptions = (xAxisData: string[], seriesData: number[], yAxisLabel: string): ECBasicOption => {
    return {
        tooltip: {
            trigger: 'axis',  // 'axis' 触发类型，显示整个坐标轴上的数据
            axisPointer: {
                type: 'line',  // 可选 'line', 'shadow'
            },
            formatter: (params: any) => {
                const [param] = params;
                return `${param.name}<br/>${yAxisLabel}: ${param.value}`;
            },
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
        },
        yAxis: {
            type: 'value',
            position: 'left',
            name: yAxisLabel,  // 添加 y 轴标签
            nameTextStyle: {
                padding: [0, 0, 10, 0],  // 调整 AQI 标签位置
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        series: [
            {
                name: 'AQI',
                type: 'line',
                symbol: 'circle',
                symbolSize: 6,
                data: seriesData,
                color: ['#5DB1FF'],
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(93, 177, 255, 0.3)' },
                            { offset: 1, color: 'rgba(93, 177, 255, 0)' },
                        ],
                    },
                },
                smooth: 0.5,
            },
        ],
    };
};

export default lineOptions;