import axios from 'axios';

// 发送用户内容
export const chat = (userContent: string, sessionId?: string): Promise<any> => {
    const data: any = {
        user_content: userContent
    };
    
    // 如果提供了sessionId，则添加到请求数据中
    if (sessionId) {
        data.session_id = sessionId;
    }

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
    return axios.get('/chat');
};

// 根据ID获取对话
export const getSessionById = (sessionId: string): Promise<any> => {
    return axios.get(`/chat/${sessionId}`);
};

// 获取任务列表
export const getTasks = (): Promise<any> => {
    return axios.get('/tasks');
};