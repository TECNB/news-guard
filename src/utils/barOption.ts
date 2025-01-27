import { ECBasicOption } from 'echarts/types/dist/shared';

const barOption = (xAxisData: string[], seriesData: number[], yAxisLabel: string): ECBasicOption => {
    return {
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLabel: {
                rotate: 0,  // 旋转横轴标签，适应来源类别显示
            },
        },
        yAxis: {
            type: 'value',
            position: 'left',
            name: yAxisLabel,  // 使用传入的yAxisLabel参数
            nameTextStyle: {
                padding: [0, 0, 10, 0],  // 调整标签位置
            },
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            containLabel: true,
        },
        series: [
            {
                type: 'bar',
                data: seriesData,
                color: ['#5DB1FF'],  // 颜色改为适合碳排放的颜色
                itemStyle: {
                    normal: {
                        barBorderRadius: [8, 8, 0, 0],  // 保持柱状图的圆角效果
                    },
                },
            },
        ],
    };
};

export default barOption;