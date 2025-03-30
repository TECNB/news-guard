/**
 * 字符串清理工具类
 * 用于处理各种字符串清理任务，特别是移除换行符
 */

/**
 * 递归移除对象中所有字符串属性中的换行符
 * @param obj 任意对象、数组或字符串
 * @returns 清理后的对象、数组或字符串
 */
export const removeNewlinesRecursively = (obj: any): any => {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
        return obj.replace(/\\n|\\\\n|\n/g, '');
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => removeNewlinesRecursively(item));
    }
    
    if (typeof obj === 'object') {
        const newObj: Record<string, any> = {};
        for (const key in obj) {
            newObj[key] = removeNewlinesRecursively(obj[key]);
        }
        return newObj;
    }
    
    return obj;
};

/**
 * 移除字符串中的所有换行符
 * @param str 输入字符串
 * @returns 清理后的字符串
 */
export const removeAllNewlines = (str: string): string => {
    if (!str) return str;
    return str.replace(/\\n|\\\\n|\n/g, '');
};

/**
 * 清理LLM响应内容，移除标签和换行符
 * @param content LLM原始响应内容
 * @returns 清理后的内容
 */
export const cleanLlmContent = (content: string): string => {
    if (!content) return '';
    
    return content
        .replace(/^<llm>|^<llm>\s+/s, '')
        .replace(/<\/llm>$|\s+<\/llm>$/s, '')
        .replace(/\\n|\\\\n|\n/g, '')
        .trim();
}; 