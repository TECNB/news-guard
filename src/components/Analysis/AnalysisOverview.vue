<template>
    <div class="AnalysisOverview">
        <div class="grid grid-cols-3 gap-8 px-10">
            <!-- Title Relevance -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="analysis.title_relevance.score"
                    :status="analysis.title_relevance.score >= 60 ? 'success' : 'exception'" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">标题相关性</p>
            </div>
            <!-- Logical Consistency -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="analysis.logical_consistency.score"
                    :status="analysis.logical_consistency.score >= 60 ? 'success' : 'exception'" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">逻辑一致性</p>
            </div>
            <!-- Factual Accuracy -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="analysis.factual_accuracy.score"
                    :status="analysis.factual_accuracy.score >= 60 ? 'success' : 'exception'" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">事实准确性</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Analysis } from '@/utils/types';

defineProps<{
    analysis: Analysis;
}>();
</script>
