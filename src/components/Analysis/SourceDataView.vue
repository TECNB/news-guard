<template>
    <div class="result-source-view h-full">
        <!-- <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">结果来源详情</h2>
        </div> -->
        
        <el-scrollbar height="95%">
            <!-- 搜索输入 -->
            <div v-if="sourceData.searchInput" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div class="flex items-center mb-2">
                    <el-tag type="info" class="mr-2">搜索输入</el-tag>
                    <h3 class="text-gray-700 font-medium">用于验证的搜索条件</h3>
                </div>
                <p class="text-gray-600 bg-gray-50 p-3 rounded-md">{{ sourceData.searchInput }}</p>
            </div>
            
            <!-- 搜索结果 -->
            <div v-if="sourceData.searchOutput.length > 0" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div class="flex items-center mb-2">
                    <el-tag type="success" class="mr-2">搜索结果</el-tag>
                    <h3 class="text-gray-700 font-medium">网络搜索发现的相关信息</h3>
                </div>
                <div class="space-y-3">
                    <div v-for="(result, idx) in sourceData.searchOutput" :key="idx" class="p-3 bg-gray-50 rounded-md border-l-4 border-green-400">
                        <h4 class="font-medium text-gray-800 mb-1">{{ result.title }}</h4>
                        <p class="text-gray-600">{{ result.snippet }}</p>
                        <div class="text-xs text-gray-500 mt-1">来源: {{ result.source || '未知来源' }}</div>
                    </div>
                </div>
            </div>
            
            <!-- LLM分析 -->
            <div v-if="sourceData.llm" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div class="flex items-center mb-2">
                    <el-tag type="warning" class="mr-2">AI分析</el-tag>
                    <h3 class="text-gray-700 font-medium">AI模型分析结果</h3>
                </div>
                <pre class="text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{{ sourceData.llm }}</pre>
            </div>
            
            <!-- 句子分析 -->
            <div v-if="sourceData.sentences.length > 0" class="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div class="flex items-center mb-2">
                    <el-tag type="danger" class="mr-2">句子分析</el-tag>
                    <h3 class="text-gray-700 font-medium">文章句子拆解分析</h3>
                </div>
                <div class="space-y-2">
                    <div v-for="(sentence, idx) in sourceData.sentences" :key="idx" 
                        class="p-3 bg-gray-50 rounded-md flex items-center gap-2"
                        :class="{
                            'border-l-4 border-red-400': sentence.importance === 3,
                            'border-l-4 border-yellow-400': sentence.importance === 2,
                            'border-l-4 border-blue-400': sentence.importance === 1
                        }">
                        <el-tag size="small" :type="sentence.importance === 3 ? 'danger' : sentence.importance === 2 ? 'warning' : 'info'">
                            {{ sentence.importance === 3 ? '高' : sentence.importance === 2 ? '中' : '低' }}
                        </el-tag>
                        <p class="text-gray-700">{{ sentence.text }}</p>
                    </div>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import type { Sentence } from '@/utils/types';

// 定义组件的props
interface SourceDataType {
    searchInput: string;
    searchOutput: any[];
    llm: string;
    sentences: Sentence[];
}

defineProps<{
    sourceData: SourceDataType;
}>();
</script>

<style scoped>
.result-source-view {
    transition: all 0.3s ease;
}
</style> 