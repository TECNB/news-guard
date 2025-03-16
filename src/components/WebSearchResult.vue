<template>
    <div class="web-search-result bg-gray-50 rounded-lg p-4 mb-4">
        <div class="flex items-center justify-between cursor-pointer  mb-3" @click="isExpanded = !isExpanded">
            <div class="flex items-center gap-2">
                <el-icon>
                    <Search />
                </el-icon>
                <span class="font-medium">网络搜索结果</span>
            </div>
            <el-icon 
                class="transform transition-transform duration-300"
                :class="{ 'rotate-180': !isExpanded }"
            >
                <ArrowDown />
            </el-icon>
        </div>
        <div class="space-y-2 overflow-hidden transition-all duration-300" :class="{ 'h-0': !isExpanded }">
            <div v-for="(result, index) in searchResults" :key="index"
                class="p-3 bg-white rounded border border-gray-200">
                <div class="flex items-center gap-2">
                    <el-icon color="#1a73e8">
                        <Link />
                    </el-icon>
                    <a :href="result.url" target="_blank" class="text-blue-600 hover:underline">
                        {{ result.title }}
                    </a>
                </div>
                <p class="mt-1 text-gray-600 text-sm text-left">{{ result.snippet }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

defineProps<{
    searchResults: SearchResult[]
}>();

const isExpanded = ref(true);
</script>
