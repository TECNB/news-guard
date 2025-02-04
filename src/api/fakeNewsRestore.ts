import axios from 'axios';

// 发送用户内容
export const restore = (userContent: string): Promise<any> => {
    const data = {
        user_content: userContent
    };

    return axios.post('api/restore_fake_news', data);
};