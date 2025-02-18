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
