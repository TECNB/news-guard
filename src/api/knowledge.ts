import axios from 'axios';

// 获取知识库
export const getKnowledge = (): Promise<any> => {
    return axios.get('api/get_knowledge');
};

// 获取知识库内的文档
export const getDocuments = (id:any): Promise<any> => {
    return axios.get('api/get_documents',id);
};