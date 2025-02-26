import axios from 'axios';

// 发送用户内容
export const chat = (userContent: string): Promise<any> => {
    const data = {
        user_content: userContent
    };

    return axios.post('api/ask_fake_news', data);
};

// 生成图表
export const generateChart = (userContent: string, chartType: string): Promise<any> => {
    const data = {
        user_content: userContent,
        chart_type: chartType  // 图表类型，比如 'line', 'bar', 'pie'
    };

    return axios.post('api/generate_chart', data);
};

// 获取聊天记录
export const getSession = (): Promise<any> => {
    return axios.get('api/get_session');
};