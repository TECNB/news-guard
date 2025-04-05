import { defineStore } from 'pinia';
import { ref } from 'vue';

// 定义会话对象的类型
interface Conversation {
    id: number | string;  // 修改为可以接受字符串ID，以支持sessionId
    messages: any[];  // messages 为 any 类型的数组
}

export const useChatStore = defineStore('chatStore', () => {
    // 存储多个对话，显式定义为 Conversation 类型的数组
    const conversations = ref<Conversation[]>([]);
    const currentConversationId = ref<number | string | null>(null);
    
    // 检验模式相关状态
    const selectedTaskId = ref<string | null>(null);
    const selectedTaskTitle = ref<string | null>(null);
    const selectedTaskScore = ref<number | null>(null);
    const isVerifyMode = ref<boolean>(false);

    // 创建一个新对话并设置为当前对话
    const startNewConversation = (id?: number | string) => {
        const newConversation: Conversation = {
            id: id !== undefined ? id : Date.now(),  // 如果提供ID则使用，否则使用时间戳
            messages: [] as any[],  // 设置 messages 为 any 类型的数组
        };
        conversations.value.push(newConversation);
        currentConversationId.value = newConversation.id;
    };

    // 切换到指定的对话
    const switchConversation = (conversationId: number | string) => {
        const conversation = conversations.value.find(conv => conv.id === conversationId);
        if (conversation) {
            currentConversationId.value = conversation.id;
        }
    };

    // 保存消息到当前活跃的对话
    const saveMessages = (messages: any[]) => {
        const conversation = conversations.value.find(conv => conv.id === currentConversationId.value);
        console.log('conversation', conversation);
        if (conversation) {
            conversation.messages = messages;
        }
    };

    // 获取当前对话的消息
    const getCurrentMessages = (): any[] => {
        const conversation = conversations.value.find(conv => conv.id === currentConversationId.value);
        return conversation ? conversation.messages : [];
    };

    // 设置检验模式
    const setVerifyMode = (mode: boolean) => {
        isVerifyMode.value = mode;
    };

    // 设置当前选中的任务
    const setSelectedTask = (taskId: string, title: string, score: number) => {
        selectedTaskId.value = taskId;
        selectedTaskTitle.value = title;
        selectedTaskScore.value = score;
    };

    return {
        conversations,
        currentConversationId,
        selectedTaskId,
        selectedTaskTitle,
        selectedTaskScore,
        isVerifyMode,
        startNewConversation,
        switchConversation,
        saveMessages,
        getCurrentMessages,
        setVerifyMode,
        setSelectedTask
    };
});
