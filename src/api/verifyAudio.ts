import axios from 'axios';

// 文字转语音
export const toText = (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);  // 将文件添加到 FormData 中

    return axios.post('api/audio_to_text/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',  // 确保请求头为 multipart/form-data
        }
    });
};

// 鉴别音频 - 传入音频文件进行鉴别
export const verifyAudio = (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);  // 将文件添加到 FormData 中

    return axios.post('http://10.248.68.50:8000/audio_score/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',  // 确保请求头为 multipart/form-data
        }
    });
};

