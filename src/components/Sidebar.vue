<template>
    <div class="Sidebar rounded-none md:rounded-3xl z-[10000]">
        <div class="sidebar-logo-container">
            <img class="w-9 h-9 rounded-full object-cover aspect-square mr-2" src="../assets/images/logo.png">
            <p>DeepNews</p>
        </div>
        <el-scrollbar height="90%" v-if="!ifReviewClick">
            <ul>
                <!-- 遍历菜单项 -->
                <li v-for="(menu, index) in menus" :key="index">
                    <div class="menu-item relative" @click="selectMenu(index, menu.children, menu.path)"
                        :class="{ 'active-menu': selectedMenu === index }">
                        <!-- 使用FontAwesome图标替换element-plus图标 -->
                        <i v-if="selectedMenu === index" :class="menu.icon" style="color: #000000;"></i>
                        <i v-else :class="menu.icon"></i>
                        <p>{{ menu.label }}</p>

                        <!-- 在这里插入图标和点击事件 -->
                        <span v-if="menu.label === '对话式分析'" 
                            class="absolute right-4 top-[27px] transform -translate-y-1/2 cursor-pointer"
                            @click="handleReviewClick">
                            <i class="fa-solid fa-arrow-right"></i>
                        </span>

                        <!-- 如果有子菜单，显示箭头 -->
                        <span v-if="menu.children" class="ml-7">
                            <i v-if="!ifShowSubMenu" class="fa-solid fa-chevron-down"></i>
                            <i v-else class="fa-solid fa-chevron-up"></i>
                        </span>
                    </div>
                    <!-- 如果有子菜单，渲染子菜单 -->
                    <ul v-if="menu.children && ifShowSubMenu">
                        <li v-for="(child, childIndex) in menu.children" :key="childIndex">
                            <div class="menu-item child-menu"
                                @click="selectSubMenu(index, childIndex, menu.children[childIndex].path)"
                                :class="{ 'active-menu': selectedSubMenu === childIndex }">
                                <p class="ml-6">{{ child.label }}</p>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </el-scrollbar>


        <el-scrollbar height="90%" v-else>
            <div class="w-full flex justify-start items-center gap-1 cursor-pointer px-3" @click="handleReviewClick">
                <i class="fa-solid fa-arrow-left"></i>
                <p class="font-bold">返回</p>
            </div>
            
            <!-- 对话/检验切换选项 -->
            <div class="switch-container my-5 px-4">
                <div class="toggle-wrapper">
                    <div class="toggle-buttons" :class="viewMode">
                        <button class="toggle-button chat" 
                                :class="{ 'active': viewMode === 'chat' }" 
                                @click="viewMode = 'chat'; handleViewModeChange('chat')">
                            <i class="fa-solid fa-comment-dots mr-2"></i>
                            对话
                        </button>
                        <button class="toggle-button verify" 
                                :class="{ 'active': viewMode === 'verify' }" 
                                @click="viewMode = 'verify'; handleViewModeChange('verify')">
                            <i class="fa-solid fa-magnifying-glass mr-2"></i>
                            检验
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 添加加载中状态显示 -->
            <div v-if="isLoading" class="flex justify-center items-center py-10">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                <span>加载中...</span>
            </div>
            <ul v-else>
                <!-- 遍历聊天记录或检验任务 -->
                <li v-for="(item, index) in viewMode === 'chat' ? chat : tasks" :key="index">
                    <div class="menu-item w-52 relative" 
                         @click="viewMode === 'chat' ? getSessionId(index, item.sessionId) : getTaskDetail(index, item.session_id)"
                         :class="{ 'active-menu': selectedMenu === index }">
                        <i v-if="selectedMenu === index" :class="item.icon || 'fa-solid fa-comment-dots'" style="color: #000000;"></i>
                        <i v-else :class="item.icon || 'fa-solid fa-comment-dots'"></i>
                        <p class="text-nowrap text-ellipsis overflow-hidden">
                            {{ viewMode === 'chat' ? item.label : item.title }}
                            <span v-if="viewMode === 'verify' && item.score !== null && item.score !== undefined" class="text-xs ml-1">({{ item.score.toFixed(1) }})</span>
                            <span v-else-if="viewMode === 'verify'" class="text-xs ml-1">(暂无评分)</span>
                        </p>
                    </div>
                </li>
            </ul>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getSession, getSessionById, getTasks } from '../api/fakeNewsReview';
// 删除不再需要的element-plus图标导入
// import { Loading, ChatDotRound, Search } from '@element-plus/icons-vue';

import { useChatStore } from '../stores/ChatStore.ts';

//获取对话的stpre
const chatStore = useChatStore()

// 实例化router
const router = useRouter();
const route = useRoute();

const selectedMenu = ref<number | null>(0);
const selectedSubMenu = ref<number | null>(null);
// ifShowSubMenu
const ifShowSubMenu = ref<boolean>(false);
const ifReviewClick = ref<boolean>(false);
const isLoading = ref<boolean>(false); // 添加加载状态变量
const viewMode = ref<'chat' | 'verify'>('chat'); // 添加视图模式，默认为对话模式

const menus = [
    {
        label: '统计数据',
        icon: 'fa-solid fa-chart-column',
        path: '/',
    },
    {
        label: '新闻检验',
        icon: 'fa-solid fa-magnifying-glass',
        path: '/verify-text',
        children: [
            { label: '文字', path: '/verify-text' },
            { label: '图片', path: '/verify-image' },
            { label: '音频', path: '/verify-audio' }
        ],
    },
    {
        label: '个人知识库',
        icon: 'fa-solid fa-book',
        path: '/knowledge'
    },
    {
        label: '对话式分析',
        icon: 'fa-solid fa-comments',
        path: '/review'
    },
    {
        label: '热点风险预测',
        icon: 'fa-solid fa-fire',
        path: '/prediction'
    },
    {
        label: '智能体定制',
        icon: 'fa-solid fa-wand-magic-sparkles',
        path: '/agent'
    },
    {
        label: '区块链取证',
        icon: 'fa-solid fa-shield-halved',
        path: '/blockchain-forensics'
    },
];


let chat = ref<any[]>([]);
let tasks = ref<any[]>([]); // 添加任务列表
const displayedMessages = ref<{ type: string; content: string }[]>([]); // 展示的消息列表


onMounted(async () => {
    // 初始化选中的菜单
    const index = menus.findIndex((menu: any) => menu.path === route.path);
    if (index !== -1) {
        selectedMenu.value = index;
    }
    console.log("selectedMenu:" + selectedMenu.value)
});

// 处理视图模式变更
const handleViewModeChange = async (newMode: 'chat' | 'verify') => {
    isLoading.value = true;
    
    // 更新chatStore的模式
    chatStore.setVerifyMode(newMode === 'verify');
    
    try {
        if (newMode === 'chat' && chat.value.length === 0) {
            await loadChatSessions();
        } else if (newMode === 'verify' && tasks.value.length === 0) {
            await loadTasks();
        }
    } catch (error) {
        console.error(`加载${newMode === 'chat' ? '对话' : '检验'}列表失败:`, error);
    } finally {
        isLoading.value = false;
    }
};

// 加载任务列表
const loadTasks = async () => {
    try {
        const response = await getTasks();
        if (response && response.data) {
            tasks.value = response.data;
            console.log("获取到的任务列表:", tasks.value);
        } else {
            console.error("获取任务列表失败: 响应数据为空");
            tasks.value = [];
        }
    } catch (error) {
        console.error("获取任务列表失败:", error);
        tasks.value = [];
    }
};

// 加载对话列表
const loadChatSessions = async () => {
    try {
        const response = await getSession();
        if (response && response.data && Array.isArray(response.data)) {
            chat.value = response.data.map((item: any, i: number) => ({
                label: item.summary || `对话 ${i + 1}`,
                icon: 'fa-solid fa-comment-dots',
                sessionId: item.session_id,
            }));
            
            console.log("获取到的会话列表:", chat.value);
        } else {
            console.error("获取会话列表失败: 响应数据无效");
            chat.value = [];
        }
    } catch (error) {
        console.error("获取会话列表失败:", error);
        chat.value = [];
    }
};

// 获取任务详情
const getTaskDetail = async (index: number, sessionId: string) => {
    selectedMenu.value = index;
    selectedSubMenu.value = null;
    
    // 只设置当前选中的任务，不发送请求获取详情
    const selectedTask = tasks.value[index];
    if (selectedTask) {
        // 设置当前选中的任务
        chatStore.setSelectedTask(
            selectedTask.session_id,
            selectedTask.title,
            selectedTask.score
        );
        
        // 设置为检验模式
        chatStore.setVerifyMode(true);
        
        // 创建或切换到相应的会话
        const existingConversation = chatStore.conversations.find(conv => conv.id === selectedTask.session_id);
        if (!existingConversation) {
            chatStore.startNewConversation(selectedTask.session_id);
        } else {
            chatStore.switchConversation(selectedTask.session_id);
        }
        
        // 在这里不需要调用getSessionById获取消息
        console.log("已选择任务:", selectedTask.title);
    } else {
        console.error("无法找到选中的任务");
    }
};

const getSessionId = async (index: number, sessionId: string) => {
    selectedMenu.value = index;
    selectedSubMenu.value = null; // 清除子菜单的选中状态

    // 设置为非检验模式
    chatStore.setVerifyMode(false);

    try {
        // 调用根据ID获取对话的API
        const response = await getSessionById(sessionId);
        const messages = response.data;

        if (messages && Array.isArray(messages)) {
            // 构建displayedMessages，直接从API返回的消息数组中提取
            displayedMessages.value = messages.map((message: any) => ({
                type: message.role === 'ai' ? 'ai' : 'user',
                content: message.content
            }));

            // 确保currentConversationId设置为该会话的ID
            const existingConversation = chatStore.conversations.find(conv => conv.id === sessionId);
            if (!existingConversation) {
                // 如果没有找到会话，创建一个新会话
                chatStore.startNewConversation(sessionId);
            } else {
                // 如果找到了会话，设置为当前会话
                chatStore.switchConversation(sessionId);
            }

            // 保存消息到当前会话
            chatStore.saveMessages(displayedMessages.value);

            console.log("displayedMessages.value:", displayedMessages.value);
            console.log("chatStore:", chatStore.getCurrentMessages().length);
        }
    } catch (error) {
        console.error("获取会话消息失败:", error);
    }
};

const handleReviewClick = async () => {
    console.log("handleReviewClick");
    ifReviewClick.value = !ifReviewClick.value;
    
    // 当切换到虚假新闻助手界面时
    if (ifReviewClick.value) {
        isLoading.value = true;
        
        try {
            // 根据当前视图模式加载数据
            if (viewMode.value === 'chat' && chat.value.length === 0) {
                await loadChatSessions();
            } else if (viewMode.value === 'verify' && tasks.value.length === 0) {
                await loadTasks();
            }
        } catch (error) {
            console.error(`加载${viewMode.value === 'chat' ? '对话' : '检验'}列表失败:`, error);
        } finally {
            isLoading.value = false;
        }
    }
};


const toggleSubMenu = () => {
    // 翻转子菜单的显示状态
    ifShowSubMenu.value = !ifShowSubMenu.value;
    if (ifShowSubMenu.value) {
        selectedSubMenu.value = 0; // 清除子菜单的选中状态
    }
};


const selectMenu = async(index: number, ifChildren: any, path: string) => {
    if (!ifChildren) {
        selectedMenu.value = index;
        selectedSubMenu.value = null; // 清除子菜单的选中状态
        router.push(path)
        // 当 index 为 3 时，创建新的 chatStore 会话
        if (index === 3) {
            try {
                // 设置加载状态为true
                isLoading.value = true;
                // 根据当前视图模式加载数据
                if (viewMode.value === 'chat' && chat.value.length === 0) {
                    await loadChatSessions();
                } else if (viewMode.value === 'verify' && tasks.value.length === 0) {
                    await loadTasks();
                }
                
                // 创建新的会话
                chatStore.startNewConversation();
            } catch (error) {
                console.error(`加载${viewMode.value === 'chat' ? '对话' : '检验'}列表失败:`, error);
            } finally {
                // 无论成功还是失败，都设置加载状态为false
                isLoading.value = false;
            }
        }
    } else {
        selectedMenu.value = null;
        selectedSubMenu.value = 0; // 清除子菜单的选中状态
        router.push(menus[index].children![0].path!);
        toggleSubMenu();
    }
};

const selectSubMenu = (parentIndex: number, childIndex: number, path: string) => {
    console.log("parentIndex:" + parentIndex)
    router.push(path)

    selectedMenu.value = null;
    selectedSubMenu.value = childIndex;
};



</script>

<style lang="scss" scoped>
.Sidebar {
    height: 100%;


    .sidebar-logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;

        padding: 20px 0;

        p {
            font-weight: 800;
            color: var(--text-100);
            font-size: 18px;
        }
    }

    .switch-container {
        .toggle-wrapper {
            border-radius: 16px;
            background-color: #f4f4f6;
            padding: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .toggle-buttons {
            position: relative;
            display: flex;
            height: 40px;
            border-radius: 12px;
            overflow: hidden;
            
            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 50%;
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease-in-out;
                z-index: 0;
            }
            
            &.verify::before {
                transform: translateX(100%);
            }
            
            .toggle-button {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 500;
                position: relative;
                z-index: 1;
                background: transparent;
                border: none;
                cursor: pointer;
                transition: color 0.3s ease;
                color: #888;
                
                &.active {
                    color: var(--text-100);
                    font-weight: 600;
                }
                
                &:focus {
                    outline: none;
                }
            }
        }
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 12px;


        padding: 15px 20px;
        margin: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        /* 添加过渡效果 */

        &:hover {
            border-radius: 20px;
            background: #F4F4F6;
        }


        p {
            font-size: 16px;
            color: var(--text-100);
        }

        &.active-menu {
            border-radius: 20px;
            background: white;
        }

        &.child-menu {

            // 定义子菜单的样式
            &.active-menu {
                background: white;

            }
        }
    }
}
</style>
