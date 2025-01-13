import { ECBasicOption } from 'echarts/types/dist/shared';


const typePieOption = (seriesData: { value: number; name: string }[]):ECBasicOption => {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}% ({d}%)',  // 提示框显示名称、数值和百分比
        },
        legend: {
            data: seriesData.map(item => item.name),  // 动态生成图例数据
            orient: 'vertical',
            left: '70%',
            y: 'center',
            itemGap: 30,
            itemHeight: 15,
        },
        series: [
            {
                name: '虚假新闻占比',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['30%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                label: {
                    show: false,
                    position: 'center',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold',
                    },
                },
                labelLine: {
                    show: false,
                },
                data: seriesData,
            },
        ],
    };
};

export default typePieOption;