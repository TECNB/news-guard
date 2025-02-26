import { defineStore } from 'pinia';
import { ref } from 'vue';

// 定义会话对象的类型
interface Conversation {
    id: number;
    messages: any[];  // messages 为 any 类型的数组
}

export const useChatStore = defineStore('chatStore', () => {
    // 存储多个对话，显式定义为 Conversation 类型的数组
    const conversations = ref<Conversation[]>([]);
    const currentConversationId = ref<number | null>(null);

    // 创建一个新对话并设置为当前对话
    const startNewConversation = () => {
        const newConversation: Conversation = {
            id: conversations.value.length,  // 简单的唯一ID
            messages: [] as any[],  // 设置 messages 为 any 类型的数组
        };
        conversations.value.push(newConversation);
        currentConversationId.value = newConversation.id;
    };

    // 切换到指定的对话
    const switchConversation = (conversationId: number) => {
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

    return {
        conversations,
        currentConversationId,
        startNewConversation,
        switchConversation,
        saveMessages,
        getCurrentMessages,
    };
});
