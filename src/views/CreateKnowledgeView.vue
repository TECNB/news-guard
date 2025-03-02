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
            <el-table :data="tableData" style="width: 100%"
                :header-cell-style="{ background: '#fafafa', 'height': '60px', 'color': '#000', 'font-weight': '600' }"
                :row-style="{ 'height': '60px', 'color': '#000' }">
                <!-- 名称 -->
                <el-table-column prop="name" label="名称" fixed :cell-style="{ color: '#60a5fa' }">
                    <template #default="scope">
                        <div class="flex justify-start items-center gap-3 cursor-pointer">
                            <i class="fa-regular fa-xl fa-file-word text-green-500"></i>
                            <p class="text-green-500 font-bold text-nowrap">{{ scope.row.name }}</p>
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
                        <el-switch v-model="scope.row.enableParsing" style="--el-switch-on-color: #13ce66;" />
                    </template>
                </el-table-column>

                <!-- 解析状态，使用 el-tag -->
                <el-table-column label="解析状态" width="180">
                    <template #default="scope">
                        <div class="flex justify-between items-center relative">
                            <el-tag :type="scope.row.id === parsingDocId ? 'warning' : scope.row.parseStatus === '成功' ? 'success' : 'danger'">
                                {{ scope.row.id === parsingDocId ? `解析中 ${Math.round(parsingProgress * 100)}%` : scope.row.parseStatus }}
                            </el-tag>
                            <i class="fa-regular fa-circle-play cursor-pointer" style="color: #4ade80;"
                                @click="handleParse(scope.row)"
                                v-if="!parsingDocId || scope.row.id === parsingDocId"></i>
                        </div>
                    </template>
                </el-table-column>

                <!-- 动作 -->
                <el-table-column label="动作" width="150">
                    <template #default="scope">
                        <div class="flex justify-start items-center gap-5">
                            <i class="fa-regular fa-wrench cursor-pointer" @click="handleAction(scope.row, 'wrench')"></i>
                            <i class="fa-regular fa-trash cursor-pointer" @click="handleAction(scope.row, 'delete')"></i>
                            <i class="fa-regular fa-pen-line cursor-pointer" @click="handleAction(scope.row, 'edit')"></i>
                            <i class="fa-regular fa-arrow-down-to-line cursor-pointer"
                                @click="handleAction(scope.row, 'download')"></i>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRoute } from "vue-router";
import router from "../router";
import { getDocuments, updateDocuments, parseDocuments,deleteDocuments } from "../api/knowledge";

interface Document {
    id: string;
    name: string;
    chunkCount: number;
    uploadDate: string;
    parseMethod: string;
    enableParsing: boolean;
    parseStatus: string;
}

const route = useRoute()

const fileName = ref("")
const tableData = ref<Document[]>([])
const parsingDocId = ref<string | null>(null)
const parsingProgress = ref<number>(0)
const pollingInterval = ref<number | null>(null)

// 从路由获取到的知识库id
const knowledgeId = route.params.id
console.log("知识库id", knowledgeId)

const handleParse = async (row: Document) => {
    if (parsingDocId.value) return; // Prevent multiple parsing

    try {
        const response = await parseDocuments(knowledgeId, row.id)
        if (response.data.code === 0) {
            parsingDocId.value = row.id
            parsingProgress.value = 0

            // Start polling for progress
            pollingInterval.value = window.setInterval(async () => {
                try {
                    const result = await getDocuments(knowledgeId)
                    const doc = result.data.data.docs.find((d: any) => d.id === row.id)
                    if (doc) {
                        parsingProgress.value = doc.progress || 0

                        if (doc.progress >= 1) {
                            // Update status and stop polling
                            row.parseStatus = '成功'
                            clearInterval(pollingInterval.value!)
                            pollingInterval.value = null
                            parsingDocId.value = null
                            parsingProgress.value = 0
                        }
                    }
                } catch (error) {
                    console.error('Error polling progress:', error)
                }
            }, 2000)
        }
    } catch (error) {
        console.error('Error starting parse:', error)
    }
}

onMounted(async () => {
    const result = await getDocuments(knowledgeId).then(res => res.data.data)
    console.log("获取文件列表", result)
    tableData.value = result.docs.map((doc: any): Document => ({
        id: doc.id,
        name: doc.name,
        chunkCount: doc.chunk_count,
        uploadDate: doc.create_date.split(' ')[1] + ' ' + doc.create_date.split(' ')[2] + ', ' + doc.create_date.split(' ')[3],
        parseMethod: doc.chunk_method,
        enableParsing: doc.status === "1",
        parseStatus: doc.run === "DONE" ? '成功' : '未解析'
    }));
})

onBeforeUnmount(() => {
    if (pollingInterval.value) {
        clearInterval(pollingInterval.value)
    }
})

const toKnowledge = () => {
    router.push("/knowledge")
}

const updateFlie = () => {
    // Create an input element for file selection
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.doc,.docx,.pdf,.txt,.csv,.xls,.xlsx,.json'

    input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (file) {
            try {
                const result = await updateDocuments(file, knowledgeId as string)
                const newDoc = result.data.data[0]

                // Add new document to the beginning of tableData
                tableData.value.unshift({
                    id: newDoc.id,
                    name: newDoc.name,
                    chunkCount: 0, // Initial chunk count
                    uploadDate: new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    parseMethod: newDoc.chunk_method,
                    enableParsing: true,
                    parseStatus: newDoc.run === "DONE" ? '成功' : '未解析'
                })
            } catch (error) {
                console.error('上传文件失败:', error)
            }
        }
    }

    input.click()
}

const handleAction = async (row: Document, action: string) => {
    if (action === 'delete') {
        try {
            const response = await deleteDocuments(knowledgeId, row.id);
            if (response.data.code === 0) {
                tableData.value = tableData.value.filter(doc => doc.id !== row.id);
            }
        } catch (error) {
            console.error('删除文件失败:', error);
        }
    }
}
</script>

<style lang="scss" scoped></style>
