<template>
    <div class="KnowledgeView w-full px-8 py-5">
        <div class="w-full flex justify-between items-start">
            <div class="flex flex-col justify-center items-start">
                <p class="text-2xl font-bold">欢迎回来,TEC</p>
                <p>今天我们要使用哪个知识库</p>
            </div>
            <div class="flex justify-center items-center gap-3">
                <div class="">
                    <!-- 下面为知识库名称搜索框 -->
                    <el-input v-model="knowledgeName" placeholder="搜索" class="">
                        <template #prefix>
                            <el-icon color="var(--text-100)" class="el-input__icon">
                                <search />
                            </el-icon>
                        </template>
                    </el-input>
                </div>
                <div class="bg-green-500 rounded-md cursor-pointer px-3 py-1" @click="createKnowledge">
                    <p class="text-white font-bold">+ 创建知识库</p>
                </div>
            </div>
        </div>
        <div class="w-full flex flex-wrap gap-5 mt-10">
            <div v-for="(knowledge, index) in knowledgeList" :key="index" class="w-[280px] h-[280px] flex flex-col justify-between items-center border border-gray-400 rounded-xl cursor-pointer p-5">
            <div class="w-full flex justify-between items-center">
                <img class="w-8 h-8 rounded-full object-cover aspect-square" src="../assets/images/avatar.png" alt="">
                <i class="fa-xl fa-solid fa-ellipsis"></i>
            </div>
            <div class="w-full">
                <p class="text-left text-2xl font-bold">{{ knowledge.title }}</p>
            </div>
            <div class="w-full">
                <div class="flex justify-start items-center gap-3">
                <i class="fa-regular fa-file-lines"></i>
                <p class="text-sm font-bold">{{ knowledge.documents }} 文档</p>
                </div>
                <div class="flex justify-start items-center gap-3">
                <i class="fa-regular fa-calendar"></i>
                <p class="text-sm font-bold">{{ knowledge.date }}</p>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
let knowledgeName = ref()
let knowledgeList = ref([
    {
        title: "虚假新闻 11月份",
        avatar: "https://cdn.jsdelivr.net/gh/tecmz/tecmz-images/images/2021/09/15/1631690131.png",
        documents: 10,
        date: "2024-11-15"
    },
    {
        title: "虚假新闻 12月份",
        avatar: "../assets/images/avatar.png",
        documents: 20,
        date: "2024-12-15"
    },
    {
        title: "虚假新闻 1月份",
        avatar: "../assets/images/avatar.png",
        documents: 30,
        date: "2025-01-12"
    },
    {
        title: "虚假新闻 2月份",
        avatar: "../assets/images/avatar.png",
        documents: 40,
        date: "2021-02-15"
    },
    {
        title: "热点新闻 11月份",
        avatar: "../assets/images/avatar.png",
        documents: 50,
        date: "2024-11-15"
    },
    {
        title: "热点新闻 12月份",
        avatar: "../assets/images/avatar.png",
        documents: 60,
        date: "2024-12-15"
    },
    {
        title: "热点新闻 1月份",
        avatar: "../assets/images/avatar.png",
        documents: 70,
        date: "2025-01-15"
    },
    {
        title: "热点新闻 2月份",
        avatar: "../assets/images/avatar.png",
        documents: 80,
        date: "2025-02-15"
    }
])

const createKnowledge = () => {
    console.log("创建知识库")
}
</script>

<style lang="scss" scoped>
.el-input {
    border-radius: 12px;
    border: 0.5px solid var(--text-200);
    border: 0;
    background-color: var(--bg-200);

    font-size: 16px;
    font-weight: bold;

    :deep(.el-input__wrapper) {
        border-radius: 6px;
        background-color: #fff;
    }


    :deep(.is-focus) {
        box-shadow: 0 0 0 1px #4ade80
    }
}
</style>
