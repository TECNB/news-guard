import { ECBasicOption } from 'echarts/types/dist/shared';

const barOption = (xAxisData: string[], seriesData: number[], yAxisLabel: string): ECBasicOption => {
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params: any) {
                // 获取悬停项的数据
                const dataIndex = params[0].dataIndex;
                const title = xAxisData[dataIndex];
                const value = seriesData[dataIndex];
                // 返回自定义格式的提示内容，完整显示标题
                return `<div style="padding: 8px;">
                    <div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                    <div>热度值: ${value}</div>
                </div>`;
            }
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            axisLabel: {
                rotate: 0,  // 旋转横轴标签，适应来源类别显示
                interval: 0, // 确保显示所有标签
                formatter: function(value: string): string {
                    // 如果文本超过14个字符，截断并添加省略号
                    if (value.length > 14) {
                        return value.substring(0, 14) + '...';
                    }
                    return value;
                },
                overflow: 'truncate', // 文本溢出时显示省略号
                width: 100, // 限制每个标签的最大宽度
            },
        },
        yAxis: {
            type: 'value',
            position: 'left',
            name: yAxisLabel,  // 使用传入的yAxisLabel参数
            nameTextStyle: {
                padding: [0, 0, 10, 10],  // 调整标签位置
            },
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '15%', // 增加底部空间以适应标签
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