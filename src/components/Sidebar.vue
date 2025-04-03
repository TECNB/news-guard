<template>
    <div class="Sidebar rounded-none md:rounded-3xl z-[10000]">
        <div class="sidebar-logo-container">
            <img class="w-9 h-9 rounded-full object-cover aspect-square" src="../assets/images/logo.png">
            <p>NEWS-GUARD</p>
        </div>
        <el-scrollbar height="90%" v-if="!ifReviewClick">
            <ul>
                <!-- 遍历菜单项 -->
                <li v-for="(menu, index) in menus" :key="index">
                    <div class="menu-item relative" @click="selectMenu(index, menu.children, menu.path)"
                        :class="{ 'active-menu': selectedMenu === index }">
                        <el-icon color="#000000" v-if="selectedMenu === index">
                            <component :is="menu.icon"></component>
                        </el-icon>
                        <el-icon v-else>
                            <component :is="menu.icon"></component>
                        </el-icon>
                        <p>{{ menu.label }}</p>

                        <!-- 在这里插入图标和点击事件 -->
                        <span v-if="menu.label === '虚假新闻助手'" 
                            class="absolute right-4 top-[29px] transform -translate-y-1/2 cursor-pointer"
                            @click="handleReviewClick">
                            <el-icon>
                                <ArrowRightBold />
                            </el-icon>
                        </span>

                        <!-- 如果有子菜单，显示箭头 -->
                        <el-icon v-if="menu.children" class="ml-7">
                            <ArrowDownBold v-if="!ifShowSubMenu" />
                            <ArrowUpBold v-else />
                        </el-icon>

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
                <el-icon class="">
                    <ArrowLeftBold />
                </el-icon>
                <p class="font-bold">返回</p>
            </div>
            <ul>
                <!-- 遍历菜单项 -->
                <li v-for="(menu, index) in chat" :key="index">
                    <div class="menu-item w-52 relative" @click="getSessionId(index, menu.sessionId)"
                        :class="{ 'active-menu': selectedMenu === index }">
                        <el-icon color="#000000" v-if="selectedMenu === index">
                            <component :is="menu.icon"></component>
                        </el-icon>
                        <el-icon v-else>
                            <component :is="menu.icon"></component>
                        </el-icon>
                        <p class="text-nowrap text-ellipsis overflow-hidden">{{ menu.label }}</p>
                    </div>
                </li>
            </ul>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getSession, getSessionById } from '../api/fakeNewsReview';

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

const menus = [
    {
        label: '统计数据',
        icon: 'Histogram',
        path: '/',

    },
    {
        label: '新闻检验',
        icon: 'Search',
        path: '/verify-text',
        children: [
            { label: '文字', path: '/verify-text' },
            { label: '图片', path: '/verify-image' },
            { label: '音频', path: '/verify-audio' }

        ],
    },
    {
        label: '个人知识库',
        icon: 'PieChart',
        path: '/knowledge'
    },
    {
        label: '虚假新闻助手',
        icon: 'Compass',
        path: '/review'
    },
    {
        label: '虚假新闻预测',
        icon: 'Position',
        path: '/prediction'
    },
    {
        label: '虚假新闻还原',
        icon: 'MagicStick',
        path: '/restore'
    },
    {
        label: '虚假新闻智能体',
        icon: 'Odometer',
        path: '/agent'
    },
    {
        label: '区块链取证',
        icon: 'Stamp',
        path: '/blockchain-forensics'
    },
];


let chat = ref<any[]>([]);
const displayedMessages = ref<{ type: string; content: string }[]>([]); // 展示的消息列表
let Session = ref<any[]>([]);


onMounted(async () => {
    // 初始化选中的菜单
    const index = menus.findIndex((menu: any) => menu.path === route.path);
    if (index !== -1) {
        selectedMenu.value = index;
    }
    console.log("selectedMenu:" + selectedMenu.value)
});

const getSessionId = async (index: number, sessionId: string) => {
    selectedMenu.value = index;
    selectedSubMenu.value = null; // 清除子菜单的选中状态

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
            const existingConversation = chatStore.conversations.find(conv => conv.id === Number(sessionId));
            if (!existingConversation) {
                // 如果没有找到会话，创建一个新会话
                chatStore.startNewConversation();
            } else {
                // 如果找到了会话，设置为当前会话
                chatStore.switchConversation(Number(sessionId));
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
                // 调用获取所有对话的API
                const response = await getSession();
                const sessions = response.data;

                if (sessions && Array.isArray(sessions)) {
                    // 构建chat数组，从API返回的会话列表中提取信息
                    chat.value = sessions.map((item: any, i: number) => ({
                        label: item.summary || `对话 ${i + 1}`, // 使用summary作为标签，i是数字索引
                        icon: 'ChatDotRound',
                        sessionId: item.session_id, // 使用session_id作为会话ID
                    }));

                    console.log("获取到的会话列表:", chat.value);
                    chatStore.startNewConversation();
                }
            } catch (error) {
                console.error("获取会话列表失败:", error);
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
