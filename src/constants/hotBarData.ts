// 原始数据
const originalData = [
  { title: '雄安集团大规模招聘数万人', value: 5 },
  { title: '广东医保基金出现赤字', value: 4 },
  { title: 'AI可以预测彩票中奖号码、提高中奖率', value: 3 },
  { title: '四川宜宾筠连山体滑坡被行车记录仪拍下', value: 2 },
  { title: '新疆库车市5.0级地震导致多处房屋倒塌', value: 2 },
  { title: '河南漯河免费公租房', value: 1 },
];

// 对数据按照热度从大到小排序
const sortedData = [...originalData].sort((a, b) => b.value - a.value);

export const hotBarData = {
    xAxisData: sortedData.map(item => item.title),
    seriesData: sortedData.map(item => item.value), // 从大到小排序后的虚假新闻热度数据
};