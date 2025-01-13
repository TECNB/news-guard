// AIChat.ts
export async function AIChat(systemContent: string, userContent: string, relatedData: string): Promise<Response> {
    const data = JSON.stringify({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: `你是一个非常有帮助的助手，擅长回答关于报表的问题。以下是关于${systemContent}的详细数据。请完全根据我的数据来回答，不要增加不相关的部分:${relatedData}`
            },
            {
                role: "user",
                content: userContent
            }
        ],
        stream: true
    });
    
    const response = await fetch('https://api.gptapi.us/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'sk-BhcZcQ4KbJW8wmgX96F33d91B14c41CaAf23C4F15d1483Ec',
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
            'Content-Type': 'application/json'
        },
        body: data
    });

    return response;
}
