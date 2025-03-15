<template>
    <div class="SentenceAnalysis">
        <el-scrollbar>
            <!-- AI句子分析 标题 -->
            <div class="border-b pb-5">
                <p class="text-[#49CFAD] text-xl font-bold text-left">可能由AI书写的句子</p>
                <div class="flex justify-start items-center gap-2 mt-2">
                    <div class="w-4 h-4 bg-yellow-200 rounded-lg" />
                    <div class="w-4 h-4 bg-yellow-500 rounded-lg" />
                    <div class="w-4 h-4 bg-yellow-700 rounded-lg" />
                    <p class="text-gray-300 font-bold">AI 影响大</p>
                </div>
            </div>


            <!-- AI句子列表 -->
            <div class="border-b pb-5">
                <div v-for="(sentence, index) in aiSentences" :key="index"
                    class="flex justify-start items-center gap-2 mt-5">
                    <div v-for="i in 3" :key="i" :class="{
                        'w-4 h-4 border rounded-lg': true,
                        'bg-yellow-200': sentence.importance === 1 && i === 1,
                        'bg-yellow-500': sentence.importance === 2 && i === 2,
                        'bg-yellow-700': sentence.importance === 3 && i === 3
                    }" />
                    <p class="text-gray-500 font-bold">{{ sentence.text }}</p>
                </div>
            </div>

            <!-- 人类句子分析 标题 -->
            <div class="border-b py-5">
                <p class="text-[#49CFAD] text-xl font-bold text-left">可能由人类书写的句子</p>
                <div class="flex justify-start items-center gap-2 mt-2">
                    <div class="w-4 h-4 bg-green-200 rounded-lg" />
                    <div class="w-4 h-4 bg-green-500 rounded-lg" />
                    <div class="w-4 h-4 bg-green-700 rounded-lg" />
                    <p class="text-gray-300 font-bold">人类 影响大</p>
                </div>
            </div>

            <!-- 人类句子列表 -->
            <div class="border-b pb-5">
                <div v-for="(sentence, index) in humanSentences" :key="index"
                    class="flex justify-start items-center gap-2 mt-5">
                    <div v-for="i in 3" :key="i" :class="{
                        'w-4 h-4 border rounded-lg': true,
                        'bg-green-200': sentence.importance === 1 && i === 1,
                        'bg-green-500': sentence.importance === 2 && i === 2,
                        'bg-green-700': sentence.importance === 3 && i === 3
                    }" />
                    <p class="text-gray-500 font-bold">{{ sentence.text }}</p>
                </div>
            </div>
        </el-scrollbar>

    </div>
</template>

<script setup lang="ts">
import type { Sentence } from '@/utils/types';

defineProps<{
    aiSentences: Sentence[];
    humanSentences: Sentence[];
}>();
</script>
