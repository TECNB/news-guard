/**
 * DeepSeek API工具函数
 * 处理与DeepSeek API的交互，包括流式响应处理
 */

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
if (!DEEPSEEK_API_KEY) {
  throw new Error('VITE_DEEPSEEK_API_KEY environment variable is not set');
}

// 定义DeepSeek API请求参数接口
export interface DeepSeekRequestParams {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  stream?: boolean;
  max_tokens?: number;
}

/**
 * 向DeepSeek API发送流式请求
 * @param apiKey DeepSeek API密钥
 * @param params 请求参数
 * @param onChunk 接收每个块的回调函数(支持异步)
 * @param onFinish 完成时的回调函数
 * @param onError 错误时的回调函数
 */
export async function streamDeepSeekResponse(
  params: DeepSeekRequestParams,
  onChunk: (text: string) => Promise<void> | void,
  onFinish?: (fullText: string) => void,
  onError?: (error: any) => void
): Promise<void> {
  try {
    // 确保stream参数设置为true
    const requestParams = {
      ...params,
      stream: true
    };

    // 发送请求到DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestParams)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API请求失败: ${errorData.error?.message || response.statusText}`);
    }

    // 确保响应是可读流
    if (!response.body) {
      throw new Error('响应中没有数据流');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    // 处理数据流
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('流读取完成');
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true }); // 使用流模式解码
      // DeepSeek API返回的是以"data: "开头的SSE（Server-Sent Events）格式
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          
          // 检查是否是流的结束标记
          if (data === '[DONE]') {
            console.log('收到结束标记 [DONE]');
            continue;
          }
          
          try {
            const parsed = JSON.parse(data);
            // console.log('解析的数据块:', parsed);
            if (parsed.choices && parsed.choices[0]) {
              // 获取内容 - 支持不同的API响应格式
              let content = '';
              if (parsed.choices[0].delta && parsed.choices[0].delta.content) {
                // OpenAI格式
                content = parsed.choices[0].delta.content;
              } else if (parsed.choices[0].message && parsed.choices[0].message.content) {
                // 某些API可能使用message格式
                content = parsed.choices[0].message.content;
              } else if (parsed.choices[0].content) {
                // 简化格式
                content = parsed.choices[0].content;
              }
              
              if (content) {
                fullText += content;
                // 立即调用回调，不要等待整个循环完成
                await onChunk(content);
              }
            }
          } catch (e) {
            console.error('解析数据块失败:', e, 'raw data:', data);
          }
        }
      }
    }

    // 完成处理
    if (onFinish) {
      onFinish(fullText);
    }

  } catch (error) {
    console.error('DeepSeek API流式请求错误:', error);
    if (onError) {
      onError(error);
    }
  }
}

/**
 * 向DeepSeek API发送非流式请求
 * @param apiKey DeepSeek API密钥
 * @param params 请求参数
 * @returns 请求结果Promise
 */
export async function callDeepSeekApi(
  params: DeepSeekRequestParams
): Promise<any> {
  try {
    // 确保stream参数设置为false
    const requestParams = {
      ...params,
      stream: false
    };

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestParams)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API请求失败: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('DeepSeek API请求错误:', error);
    throw error;
  }
}
