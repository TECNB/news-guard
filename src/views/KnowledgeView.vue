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
            <div v-for="(knowledge, index) in knowledgeList" :key="index" class="w-[280px] h-[280px] flex flex-col justify-between items-center border border-gray-400 rounded-xl cursor-pointer p-5" @click="toDetail(knowledge.id)">
            <div class="w-full flex justify-between items-center">
                <img class="w-8 h-8 rounded-full object-cover aspect-square" src="../assets/images/avatar.png" alt="">
                <i class="fa-xl fa-solid fa-ellipsis"></i>
            </div>
            <div class="w-full">
                <p class="text-left text-2xl font-bold">{{ knowledge.name }}</p>
            </div>
            <div class="w-full">
                <div class="flex justify-start items-center gap-3">
                <i class="fa-regular fa-file-lines"></i>
                <p class="text-sm font-bold">{{ knowledge.document_count }} 文档</p>
                </div>
                <div class="flex justify-start items-center gap-3">
                <i class="fa-regular fa-calendar"></i>
                <p class="text-sm font-bold">{{ formatDate(knowledge.create_date) }}</p>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref,onMounted } from "vue"
import router from "../router";

import { getKnowledge } from "../api/knowledge";
let knowledgeName = ref()
let knowledgeList = ref()

onMounted(async () => {
    const res = await getKnowledge()
    knowledgeList.value = res.data.data
})

const createKnowledge = () => {
    console.log("创建知识库")
    router.push("/create-knowledge/new")
}

const formatDate = (date: string) => {
    // 返回日期以及时间
    return new Date(date).toLocaleString()
}

const toDetail = (id: number) => {
    console.log("查看知识库详情", id)
    router.push(`/create-knowledge/${id}`)
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
