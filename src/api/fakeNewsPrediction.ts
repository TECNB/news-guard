import axios from 'axios';

// 发送用户内容
export const showFakeNews = (param:any): Promise<any> => {
    return axios.get('api/show_fake_news',{params:param});
};

export const showHotNews = (param:any): Promise<any> => {
    return axios.get('api/show_hot_news',{params:param});
};