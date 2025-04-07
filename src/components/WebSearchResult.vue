<template>
    <div class="web-search-result rounded-xl transition-all duration-300 overflow-hidden my-2 w-full" 
        :class="isExpanded ? 'border border-gray-200 bg-white shadow-sm' : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between px-4 py-3 cursor-pointer w-full" 
            @click="isExpanded = !isExpanded"
            :class="{'bg-white border-b border-gray-200': isExpanded, 'bg-gray-50 hover:bg-gray-100': !isExpanded}">
            <div class="flex items-center gap-2 flex-shrink-0">
                <el-icon class="text-blue-600">
                    <Search />
                </el-icon>
                <span class="font-medium text-gray-800">网络搜索结果</span>
                <el-tag size="small" type="info" effect="plain" class="ml-1" v-if="searchResults.length > 0">
                    {{ searchResults.length }}
                </el-tag>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <span v-if="!isExpanded" class="text-xs text-gray-500 border-l border-gray-300 pl-2">点击展开</span>
                <el-icon class="transform transition-transform duration-300 text-gray-400"
                    :class="{ 'rotate-180': isExpanded }">
                    <ArrowDown />
                </el-icon>
            </div>
        </div>
        
        <!-- 展开内容 -->
        <div v-if="isExpanded" 
            class="max-h-96 overflow-y-auto bg-gray-50 transition-all duration-300 px-4 py-3 space-y-3 w-full">
            <div v-for="(result, index) in searchResults" :key="index"
                class="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow duration-200 overflow-hidden w-full">
                <div class="flex items-center gap-2 mb-1.5 w-full">
                    <el-icon color="#1a73e8" class="flex-shrink-0">
                        <Link />
                    </el-icon>
                    <a :href="result.url" target="_blank" 
                        class="text-blue-600 hover:underline font-medium text-sm truncate w-full text-left">
                        {{ result.title }}
                    </a>
                </div>
                <p class="text-gray-600 text-xs leading-relaxed text-left pl-6 overflow-hidden break-words w-full">
                    {{ result.snippet }}
                </p>
            </div>
            
            <!-- 无结果时显示 -->
            <div v-if="searchResults.length === 0" class="text-center py-6 text-gray-500 w-full">
                <el-icon class="mr-1"><InfoFilled /></el-icon>
                暂无搜索结果
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, ArrowDown, Link, InfoFilled } from '@element-plus/icons-vue';

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

defineProps<{
    searchResults: SearchResult[]
}>();

// 默认不展开
const isExpanded = ref(false);
</script>

<style scoped>
.web-search-result {
    transition: all 0.3s ease;
    box-sizing: border-box;
    max-width: 100%;
    width: 100%;
    flex: 0 0 100%;
}

/* 确保所有子元素不会超出父容器宽度 */
.web-search-result * {
    max-width: 100%;
    box-sizing: border-box;
}

/* 文本溢出处理 */
p, a {
    word-break: break-word;
    overflow-wrap: break-word;
    text-overflow: ellipsis;
}

/* 定义滚动条样式 */
.max-h-96::-webkit-scrollbar {
    width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 8px;
}

.max-h-96::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 8px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
    background: #ccc;
}
</style>
