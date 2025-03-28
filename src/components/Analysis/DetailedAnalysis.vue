<template>
    <div class="DetailedAnalysis">
        <h3 class="text-lg font-bold text-[#49CFAD] px-10">详细分析</h3>
        <div class="px-10">
            <div class="space-y-6">
                <div v-for="(category, key) in analysis" :key="key" class="p-4 bg-gray-50 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-700">{{ getCategoryTitle(key) }}</h4>
                        <span class="text-[#49CFAD] font-bold">{{ formatScore(category.score) }}</span>
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
    subjectivity_and_inflammatory_language: '主观性与煽动性语言',
    causal_relevance: '因果关系检查',
    source_credibility: '来源可信度',
    debunking_result: '驳斥结果',
    external_corroboration: '外部证实'
};

const getCategoryTitle = (key: string): string => {
    return categoryTitles[key] || key;
};

// 格式化分数，处理null情况
const formatScore = (score: number | null): string => {
    if (score === null) return '无数据';
    return `${score}分`;
};

defineProps<{
    analysis: Analysis;
}>();
</script>
