// Google 搜索API调用工具
import axios from 'axios';

// Google API配置
const GOOGLE_API_KEY = 'AIzaSyDYMPyjgAaN07fqaR0vKfMFJVF2RqfvmrM';
const GOOGLE_CSE_ID = 'd73b9c4404f9d49ca';

/**
 * 执行Google搜索
 * @param query 搜索查询
 * @param maxResults 最大结果数
 * @returns 搜索结果数组
 */
export async function googleSearch(query: string, maxResults: number = 5): Promise<any[]> {
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: query,
        num: maxResults > 10 ? 10 : maxResults, // Google API限制最多10条结果
      }
    });

    if (response.data && response.data.items) {
      return response.data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        source: 'Google'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Google搜索API错误:', error);
    throw new Error(`搜索API错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 执行搜索 - 支持多种搜索引擎
 * @param engine 搜索引擎
 * @param query 搜索查询
 * @param maxResults 最大结果数
 * @returns 搜索结果数组
 */
export async function performSearch(
  engine: string = 'google', 
  query: string, 
  maxResults: number = 5
): Promise<any[]> {
  // 目前只实现了Google搜索，其他搜索引擎将来可以扩展
  switch (engine) {
    case 'google':
      return googleSearch(query, maxResults);
    case 'bing':
    case 'baidu':
    case 'sogou':
    case 'default':
      // 目前其他搜索引擎也使用Google
      return googleSearch(query, maxResults);
    default:
      return googleSearch(query, maxResults);
  }
}