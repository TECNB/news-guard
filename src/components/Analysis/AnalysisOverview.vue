<template>
    <div class="AnalysisOverview">
        <div class="grid grid-cols-3 gap-8 px-10">
            <!-- Title Relevance -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="getScorePercentage(analysis.title_relevance.score)"
                    :status="getScoreStatus(analysis.title_relevance.score)" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">标题相关性</p>
            </div>
            <!-- Logical Consistency -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="getScorePercentage(analysis.logical_consistency.score)"
                    :status="getScoreStatus(analysis.logical_consistency.score)" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">逻辑一致性</p>
            </div>
            <!-- Factual Accuracy -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="getScorePercentage(analysis.factual_accuracy.score)"
                    :status="getScoreStatus(analysis.factual_accuracy.score)" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">事实准确性</p>
            </div>
        </div>
        <div class="grid grid-cols-3 gap-8 px-10 mt-8">
            <!-- Subjectivity -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="getScorePercentage(analysis.subjectivity_and_inflammatory_language.score)"
                    :status="getScoreStatus(analysis.subjectivity_and_inflammatory_language.score)" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">主观性与煽动性</p>
            </div>
            <!-- Causal Relevance -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="getScorePercentage(analysis.causal_relevance.score)"
                    :status="getScoreStatus(analysis.causal_relevance.score)" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">因果关系检查</p>
            </div>
            <!-- Source Credibility -->
            <div class="flex flex-col items-center">
                <el-progress :stroke-width="10" :width="120" :percentage="getScorePercentage(analysis.source_credibility.score)"
                    :status="getScoreStatus(analysis.source_credibility.score)" type="circle" />
                <p class="mt-2 text-gray-600 font-medium">来源可信度</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Analysis } from '@/utils/types';

defineProps<{
    analysis: Analysis;
}>();

// 处理分数可能为null的情况
const getScorePercentage = (score: number | null): number => {
    if (score === null) return 0;
    // 将0-10的分数转换为0-100的百分比
    return score * 10;
};

// 根据分数确定状态颜色
const getScoreStatus = (score: number | null): string => {
    if (score === null) return 'info';
    return score >= 6 ? 'success' : 'exception';
};
</script>
