<template>
    <div class="KnowledgeView w-full h-screen">
        <el-scrollbar height="100%" class="px-8 py-5">
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
                    <div class="bg-green-500 rounded-md cursor-pointer px-3 py-1" @click="toCreateKnowledge">
                        <p class="text-white font-bold">+ 创建知识库</p>
                    </div>
                </div>
            </div>
            <div class="w-full flex flex-wrap gap-5 mt-10">
                <div v-for="(knowledge, index) in knowledgeList" :key="index"
                    class="w-[280px] h-[280px] flex flex-col justify-between items-center border border-gray-400 rounded-xl cursor-pointer p-5"
                    @click="toDetail(knowledge.id)">
                    <div class="w-full flex justify-between items-center">
                        <img class="w-8 h-8 rounded-full object-cover aspect-square" src="../assets/images/avatar.png"
                            alt="">
                        <el-popover trigger="hover" :hide-after="0" popper-class="custom-popover">
                            <template #reference>
                                <i class="fa-xl fa-solid fa-ellipsis"></i>
                            </template>
                            <div class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-gray-100"
                                @click.stop="handleDelete(knowledge.id)">
                                <el-icon>
                                    <delete />
                                </el-icon>
                                <span>删除</span>
                            </div>
                        </el-popover>
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

            <el-dialog v-model="dialogVisible" width="30%" :show-close="false" :close-on-click-modal="false"
                :close-on-press-escape="false">
                <template #header>
                    <div class="w-full flex justify-between items-center">
                        <span class="text-lg font-bold">创建知识库</span>
                        <el-icon class="cursor-pointer" @click="dialogVisible = false">
                            <close />
                        </el-icon>
                    </div>
                </template>
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-1">
                        <span class="text-red-500">*</span>
                        <p>名称：</p>
                    </div>
                    <el-input v-model="newKnowledgeName" placeholder="请输入知识库名称" class="w-full" />
                </div>
                <template #footer>
                    <div class="dialog-footer flex justify-end gap-3">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="success" class="!bg-green-500" @click="handleConfirm">
                            确认
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import router from "../router";
import { getKnowledge, createKnowledge, deleteKnowledge } from "../api/knowledge";

interface KnowledgeItem {
    id: string
    name: string
    document_count: number
    create_date: string
    // Add other properties as needed based on the API response
}

let knowledgeName = ref("")
let knowledgeList = ref<KnowledgeItem[]>([])
let dialogVisible = ref(false)
let newKnowledgeName = ref("")

onMounted(async () => {
    const res = await getKnowledge()
    knowledgeList.value = res.data.data
})

const toCreateKnowledge = () => {
    dialogVisible.value = true
}

const handleConfirm = async () => {
    if (!newKnowledgeName.value) return
    const res = await createKnowledge({ datasetsName: newKnowledgeName.value })
    if (res.data) {
        dialogVisible.value = false
        newKnowledgeName.value = ""
        router.push(`/create-knowledge/${res.data.data.id}`)
    }
}

const handleDelete = async (id: string) => {
    try {
        await deleteKnowledge(id)
        // Refresh knowledge list after successful deletion
        const res = await getKnowledge()
        knowledgeList.value = res.data.data
    } catch (error) {
        console.error("Failed to delete knowledge", error)
    }
}

const formatDate = (date: string) => {
    // 返回日期以及时间
    return new Date(date).toLocaleString()
}

const toDetail = (id: string) => {
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

:deep(.el-button.el-button--success) {
    --el-button-bg-color: #22c55e !important;
    --el-button-border-color: #22c55e !important;
    --el-button-hover-bg-color: #16a34a !important;
    --el-button-hover-border-color: #16a34a !important;
}

:deep(.custom-popover) {
    min-width: auto !important;
    padding: 0 !important;
}
</style>
