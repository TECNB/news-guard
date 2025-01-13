const chatExample = {
	"prompt": "以下是根据新闻内容分析平台输出的结果。",
	"year": 2023,
	"description": "2023年新闻内容伪造检测分析",
	"total_value": 12500,
	"unit": "篇",
	"year_on_year_comparison": {
		"previous_year": 2022,
		"value_previous_year": 11500,
		"year_on_year_change": 8.7
	},
	"insights": {
		"keywords": [
			"预测2024年的伪造新闻数量",
			"生成2023年伪造新闻检测报告",
			"分析伪造新闻增长原因",
			"比较过去五年的伪造新闻趋势",
			"提高伪造新闻检测模型的精度",
			"设计应对伪造新闻传播的策略",
			"伪造新闻传播影响的风险评估",
			"评估新闻真实性检测平台的表现"
		],
		"suggestions": "伪造新闻数量比去年增长了8.7%。建议生成趋势图表可视化数据变化，优化检测算法，或提供对伪造新闻传播影响的详细分析。"
	},
	"details": {
		"granularity": "monthly",
		"data_values": {
			"January": 1000,
			"February": 900,
			"March": 1100,
			"April": 1200,
			"May": 1300,
			"June": 1250,
			"July": 1400,
			"August": 1350,
			"September": 1200,
			"October": 1450,
			"November": 1300,
			"December": 1350
		}
	},
	"code": {
		"language": "Python",
		"logic": "伪造新闻检测与分析",
		"example": `def analyze_fake_news(year):
	  previous_year = year - 1
	  current_year_data = fetch_fake_news_data(year)
	  previous_year_data = fetch_fake_news_data(previous_year)
	  year_on_year_change = ((current_year_data - previous_year_data) / previous_year_data) * 100
	  return {
		  'year': year,
		  'total_value': current_year_data,
		  'previous_year': previous_year,
		  'value_previous_year': previous_year_data,
		  'year_on_year_change': round(year_on_year_change, 2)
	  }
  
  data = analyze_fake_news(2023)`
	}
};

export default chatExample;