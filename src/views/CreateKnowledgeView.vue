<template>
    <div class="CreateKnowledgeView p-5">
        <div class="flex justify-start items-center gap-3">
            <p class="text-gray-300 font-bold rounded-md cursor-pointer p-1 hover:text-black hover:bg-gray-300"
                @click="toKnowledge">知识库</p>
            <p class="text-gray-300 font-bold">/</p>
            <p class="font-bold">数据集</p>
        </div>

        <div class="m-5">
            <div class="border-b mb-5 pb-5">
                <p class="text-left text-xl font-bold">数据集</p>
                <p class="text-left">😉解析成功后才能问答哦。</p>
            </div>
            <div class="flex justify-end items-center gap-3 mb-5">
                <div class="">
                    <!-- 下面为知识库名称搜索框 -->
                    <el-input v-model="fileName" placeholder="搜索文件" class="">
                        <template #prefix>
                            <el-icon color="var(--text-100)" class="el-input__icon">
                                <search />
                            </el-icon>
                        </template>
                    </el-input>
                </div>
                <div class="bg-green-500 rounded-md cursor-pointer px-3 py-1" @click="updateFlie">
                    <p class="text-white font-bold">+ 新增文件</p>
                </div>
            </div>
            <el-table :data="tableData" style="width: 100%" :header-cell-style="{ background: '#fafafa','height': '60px','color':'#000','font-weight':'600' }" :row-style="{ 'height': '60px','color':'#000' }">
                <!-- 名称 -->
                <el-table-column prop="name" label="名称" fixed :cell-style="{ color: '#60a5fa' }">
                    <template #default="scope">
                        <div class="flex justify-start items-center gap-3 cursor-pointer">
                            <i class="fa-regular fa-xl fa-file-word text-green-500"></i>
                            <p class="text-green-500 font-bold">{{ scope.row.name }}</p>
                        </div>
                    </template>
                </el-table-column>

                <!-- 分块数 -->
                <el-table-column prop="chunkCount" label="分块数">
                </el-table-column>

                <!-- 上传日期 -->
                <el-table-column prop="uploadDate" label="上传日期">
                </el-table-column>

                <!-- 解析方法 -->
                <el-table-column prop="parseMethod" label="解析方法">
                </el-table-column>

                <!-- 启用解析，使用滑块 -->
                <el-table-column label="启用" width="160">
                    <template #default="scope">
                        <el-switch v-model="scope.row.enableParsing" style="--el-switch-on-color: #13ce66;"/>
                    </template>
                </el-table-column>

                <!-- 解析状态，使用 el-tag -->
                <el-table-column label="解析状态" width="120">
                    <template #default="scope">
                        <div class="flex justify-between items-center">
                            <el-tag :type="scope.row.parseStatus === '成功' ? 'success' : 'danger'">
                                {{ scope.row.parseStatus }}
                            </el-tag>
                            <i class="fa-regular fa-circle-play cursor-pointer" style="color: #4ade80;"></i>
                        </div>
                    </template>
                </el-table-column>

                <!-- 动作 -->
                <el-table-column label="动作" width="150">
                    <template #default="scope">
                        <div class="flex justify-start items-center gap-5">
                            <i class="fa-regular fa-wrench cursor-pointer" @click="handleAction(scope.row)"></i>
                            <i class="fa-regular fa-trash cursor-pointer" @click="handleAction(scope.row)"></i>
                            <i class="fa-regular fa-pen-line cursor-pointer" @click="handleAction(scope.row)"></i>
                            <i class="fa-regular fa-arrow-down-to-line cursor-pointer" @click="handleAction(scope.row)"></i>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref,onMounted } from "vue"
import { useRoute } from "vue-router";
import router from "../router";
import { getDocuments } from "../api/knowledge";

const route = useRoute()

const fileName = ref("")
const tableData = ref([
    {
        name: '新闻文件 A',
        chunkCount: 10,
        uploadDate: '2025-02-25',
        parseMethod: '文本解析',
        enableParsing: true,  // 启用解析（滑块控制）
        parseStatus: '成功',  // 解析状态（成功/未解析）
    },
    {
        name: '新闻文件 B',
        chunkCount: 5,
        uploadDate: '2025-02-24',
        parseMethod: '音频解析',
        enableParsing: false,  // 启用解析（滑块控制）
        parseStatus: '未解析',  // 解析状态（成功/未解析）
    },
    {
        name: '新闻文件 C',
        chunkCount: 15,
        uploadDate: '2025-02-23',
        parseMethod: '图像解析',
        enableParsing: true,  // 启用解析（滑块控制）
        parseStatus: '成功',  // 解析状态（成功/未解析）
    },
    {
        name: '新闻文件 D',
        chunkCount: 8,
        uploadDate: '2025-02-22',
        parseMethod: '数据解析',
        enableParsing: false,  // 启用解析（滑块控制）
        parseStatus: '未解析',  // 解析状态（成功/未解析）
    }
])

// 从路由获取到的知识库id
const knowledgeId = route.params.id
console.log("知识库id", knowledgeId)

onMounted(async () => {
    const res = await getDocuments(knowledgeId)
    console.log("获取文件列表", res.data.data)
})
const toKnowledge = () => {
    router.push("/knowledge")
}
const updateFlie = () => {
    console.log("新增文件")
}
const handleAction = (row:any) => {
    console.log("操作", row)
}
</script>

<style lang="scss" scoped></style>
