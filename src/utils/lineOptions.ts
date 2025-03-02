import { ECBasicOption } from 'echarts/types/dist/shared';

const lineOptions = (xAxisData: string[], seriesData: number[], yAxisLabel: string): ECBasicOption => {
    return {
        xAxis: {
            type: 'category',
            data: xAxisData,
        },
        yAxis: {
            type: 'value',
            position: 'left',
            name: yAxisLabel,  // 添加 y 轴标签
            nameTextStyle: {
                padding: [0, 0, 10, -30],  // 调整 AQI 标签位置
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
                markLine: {
                    symbol: ['none', 'none'],
                    label: { show: false },
                    data: [{ xAxis: 8 }, { xAxis: 11 }]
                },
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