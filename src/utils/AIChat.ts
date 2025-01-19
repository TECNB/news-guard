export async function AIChat(userContent: string): Promise<Response> {
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
