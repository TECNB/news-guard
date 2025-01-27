export async function Chat(userContent: string): Promise<Response> {
    const data = JSON.stringify({
        user_content: userContent
    });

    const response = await fetch('ask_fake_news', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    });

    return response;
}

export async function generateChart(userContent: string,chartType: string): Promise<Response> {
    const data = JSON.stringify({
        user_content: userContent,
        chart_type: chartType,  // 图表类型，比如 'line', 'bar', 'pie'
    });

    const response = await fetch('generate_chart', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    });

    return response;
}
