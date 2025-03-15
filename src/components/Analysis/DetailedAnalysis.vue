<template>
    <div class="DetailedAnalysis">
        <h3 class="text-lg font-bold text-[#49CFAD] px-10">详细分析</h3>
        <div class="px-10">
            <div class="space-y-6">
                <div v-for="(category, key) in analysis" :key="key" class="p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-700">{{ getCategoryTitle(key) }}</h4>
                        <span class="text-[#49CFAD] font-bold">{{ category.score }}分</span>
                    </div>
                    <ul v-if="category.deductions.length" class="list-disc pl-5 text-red-500 text-sm">
                        <li v-for="(deduction, index) in category.deductions" :key="index">
                            {{ deduction }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Analysis } from '@/utils/types';

const categoryTitles: Record<string, string> = {
    title_relevance: '标题相关性',
    logical_consistency: '逻辑一致性',
    factual_accuracy: '事实准确性',
    historical_accuracy: '历史准确性',
    subjectivity_and_inflammatory_language: '主观性与煽动性语言',
    causality_check: '因果关系检查'
};

const getCategoryTitle = (key: string): string => {
    return categoryTitles[key] || key;
};

defineProps<{
    analysis: Analysis;
}>();
</script>
