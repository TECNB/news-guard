import { ECBasicOption } from 'echarts/types/dist/shared';

const hotBarOption = (xAxisData: string[], seriesData: number[]): ECBasicOption => {
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
            name: '热门虚假新闻标题',  // Y轴标签修改为碳排放量
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
                name: '热度',
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

export default hotBarOption;