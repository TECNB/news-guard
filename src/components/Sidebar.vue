<template>
    <div class="Sidebar rounded-none md:rounded-3xl z-[10000]">
        <div class="sidebar-logo-container">
            <img class="w-9 h-9 rounded-full object-cover aspect-square" src="../assets/images/logo.png">
            <p>NEWS-GUARD</p>
        </div>
        <el-scrollbar height="90%">
            <ul>
                <!-- 遍历菜单项 -->
                <li v-for="(menu, index) in menus" :key="index">
                    <div class="menu-item" @click="selectMenu(index, menu.children, menu.path!)"
                        :class="{ 'active-menu': selectedMenu === index }">
                        <el-icon color="#000000" v-if="selectedMenu === index">
                            <component :is="menu.icon"></component>
                        </el-icon>
                        <el-icon v-else>
                            <component :is="menu.icon"></component>
                        </el-icon>
                        <p>{{ menu.label }}</p>
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
                                @click="selectSubMenu(index, childIndex, menu.children[childIndex].path!)"
                                :class="{ 'active-menu': selectedSubMenu === childIndex }">
                                <p class="ml-6">{{ child.label }}</p>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// 实例化router
const router = useRouter();
const route = useRoute();

const selectedMenu = ref<number | null>(0);
const selectedSubMenu = ref<number | null>(null);
// ifShowSubMenu
const ifShowSubMenu = ref<boolean>(false);

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
            { label: '音频', path: '/verify-audio' },
            { label: '视频', path: '/' },

        ],
    },

    {
        label: '历史项目',
        icon: 'ChatDotRound',
        path: '/',
    },
    {
        label: '模型定制',
        icon: 'PieChart',
        path: '/'
    },
    {
        label: '虚假新闻盘点',
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
        icon: 'Position',
        path: '/restore'
    },
];


onMounted(async () => {
    // 初始化选中的菜单
    const index = menus.findIndex((menu: any) => menu.path === route.path);
    if (index !== -1) {
        selectedMenu.value = index;
    }
    console.log("selectedMenu:" + selectedMenu.value)
});


const toggleSubMenu = () => {
    // 翻转子菜单的显示状态
    ifShowSubMenu.value = !ifShowSubMenu.value;
    if (ifShowSubMenu.value) {
        selectedSubMenu.value = 0; // 清除子菜单的选中状态
    }
};


const selectMenu = (index: number, ifChildren: any, path: string) => {
    if (!ifChildren) {
        selectedMenu.value = index;
        selectedSubMenu.value = null; // 清除子菜单的选中状态
        router.push(path)

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
