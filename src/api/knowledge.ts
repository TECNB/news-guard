import axios from 'axios';

// 获取知识库
export const getKnowledge = (): Promise<any> => {
    return axios.get('api/get_knowledge');
};

// 获取知识库内的文档
export const getDocuments = (id:any): Promise<any> => {
    return axios.get('api/get_documents',{ params: { id } });
};

// 上传知识库内的文档
export const updateDocuments = (file: File, knowledgeId: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);  // 将文件添加到 FormData 中
    formData.append("id", knowledgeId);  // 添加知识库ID

    return axios.post('api/update_documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',  // 确保请求头为 multipart/form-data
        }
    });
};

// 解析知识库内的文档
export const parseDocuments = (datasetsId: any, documentId: any): Promise<any> => {
    return axios.post('api/parse_documents', { 
        datasetsId,
        documentId
    });
};

// 删除知识库内的文档
export const deleteDocuments = (datasetsId: any, documentId: any): Promise<any> => {
    return axios.delete('api/delete_documents', { 
        data: {
            datasetsId,
            documentId
        }
    });
};
