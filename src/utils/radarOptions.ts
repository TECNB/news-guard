import { ECBasicOption } from 'echarts/types/dist/shared';
import * as echarts from 'echarts';

const radarOptions = (indicatorData: { name: string; max: number }[], seriesData: number[]): ECBasicOption => {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}分'
        },
        radar: {
            // 指标配置
            indicator: indicatorData,
            shape: 'circle',  // 圆形雷达图
            radius: '70%',   // 雷达图尺寸
            center: ['50%', '50%'],  // 确保雷达图居中
            splitNumber: 4,  // 网格分成的层数
            axisName: {
                color: '#666',  // 轴线名称颜色
                fontSize: 12,
                formatter: '{value}',
                padding: [3, 5],  // 调整文字与轴线的距离
                rich: {
                    value: {
                        fontSize: 12,
                        fontWeight: 'normal'
                    }
                }
            },
            splitLine: {
                lineStyle: {
                    color: ['#eee'],  // 网格线颜色
                    width: 1
                }
            },
            splitArea: {
                show: true,  // 显示雷达图的背景填充
                areaStyle: {
                    color: ['rgba(250,250,250,0.3)', 'rgba(240,240,240,0.3)']  // 交替背景色
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#ddd'  // 轴线颜色
                }
            }
        },
        series: [
            {
                name: '音频特征评分',
                type: 'radar',
                data: [
                    {
                        value: seriesData,
                        name: '特征分数',
                        symbolSize: 6,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(79, 209, 197, 0.8)' },
                                { offset: 1, color: 'rgba(84, 236, 158, 0.3)' }
                            ])
                        },
                        lineStyle: {
                            width: 2,
                            color: '#4ade80'
                        },
                        itemStyle: {
                            color: '#4ade80'
                        }
                    }
                ]
            }
        ]
    };
};

export default radarOptions;