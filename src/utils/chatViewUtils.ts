import { generateChart } from '../api/fakeNewsReview';
import { ElMessage } from 'element-plus';
import { useChatStore } from '../stores/ChatStore';
import { Ref } from 'vue';

export interface DisplayMessage {
    type: string;
    content: string;
}

// 处理图表生成的通用函数
export async function handleChartGeneration(
    chartType: 'line' | 'bar' | 'pie',
    userContent: string,
    displayedMessages: Ref<DisplayMessage[]>,
    chatStore: ReturnType<typeof useChatStore>
) {
    displayedMessages.value.push({ type: 'user', content: userContent });
    chatStore.saveMessages(displayedMessages.value);

    displayedMessages.value.push({ type: 'loading', content: '' });

    try {
        const data = await generateChart(userContent, chartType).then((res: any) => res.data);
        const jsonResult = data.replace(/^```json\s*|\s*```$/g, '').trim();

        if (chatStore.currentConversationId === null) {
            chatStore.startNewConversation();
        }

        displayedMessages.value.pop(); // Remove loading
        displayedMessages.value.push({ type: 'ai', content: '' });
        chatStore.saveMessages(displayedMessages.value);

        await typeEffect(displayedMessages, "以下是根据新闻内容分析平台输出的结果。", 50);

        const containerType = `${chartType.charAt(0).toUpperCase() + chartType.slice(1)}Container`;
        displayedMessages.value.push({ type: containerType, content: jsonResult });
        chatStore.saveMessages(displayedMessages.value);

        return true;
    } catch (error) {
        console.error('Chart generation failed:', error);
        displayedMessages.value.pop();
        displayedMessages.value.push({ type: 'ai', content: '发生错误，请稍后再试。' });
        return false;
    }
}

// 文件上传处理
export function handleFileUpload(
    file: File,
    imageUrl: Ref<string>,
    pdfUrl: Ref<string>,
    defaultImageUrl: string,
    defaultPdfUrl: string
) {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
        pdfUrl.value = defaultPdfUrl;
        ElMessage.success('PDF 上传成功！');
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.png') || fileName.endsWith('.jpeg')) {
        imageUrl.value = defaultImageUrl;
        ElMessage.success('图片上传成功！');
    } else {
        ElMessage.error('上传失败！不支持的文件类型');
    }
}

// 打字机效果
export function typeEffect(
    displayedMessages: Ref<DisplayMessage[]>,
    text: string,
    speed: number
): Promise<void> {
    return new Promise<void>((resolve) => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                displayedMessages.value[displayedMessages.value.length - 1].content += text[index++];
            } else {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

// 自动调整textarea高度
export function autoResizeTextarea(textarea: HTMLTextAreaElement) {
    textarea.style.height = `${textarea.scrollHeight}px`;
    if (textarea.value.trim() === '') {
        textarea.style.height = 'auto';
    }
}
