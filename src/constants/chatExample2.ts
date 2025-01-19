const chatExample2 = {
    "prompt": "为您归因2023年温室气体排放的原因。",
    "year": 2023,
    "description": "温室气体排放归因",
    "total_value": 45000.5,
    "unit": "吨",
    "year_on_year_comparison": {
        "previous_year": 2022,
        "value_previous_year": 43000.2,
        "year_on_year_change": 2000.3, // 增加的排放量
        "percentage_change": 4.65 // 百分比增长
    },
    "causes": [
        {
            "cause": "交通运输",
            "contribution": 1200.5, // 单位：吨
            "sub_factors": {
                "yAxisData": ['汽车排放', '飞机排放', '货运排放'], // 不同子因素
                "seriesData": [100.0, 300.2, 800.3] // 对应的排放量
            }
        },
        {
            "cause": "工业生产",
            "contribution": 900.7, // 单位：吨
            "sub_factors": {
                "yAxisData": ['钢铁制造', '化工厂', '水泥生产'], // 不同子因素
                "seriesData": [500.5, 250.2, 150.0] // 对应的排放量
            }
        },
        {
            "cause": "能源消耗",
            "contribution": 800.3, // 单位：吨
            "sub_factors": {
                "yAxisData": ['煤炭发电', '天然气发电', '油气开采'], // 不同子因素
                "seriesData": [600.1, 150.2, 50.0] // 对应的排放量
            }
        }
    ]
};

export default chatExample2;