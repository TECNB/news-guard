<template>
    <div class="SourceAnalysis">
        <el-scrollbar>
            <div class="px-10">
                <p class="text-[#49CFAD] text-xl font-bold text-left">发现下面三句可能来源</p>
                <p class="text-green-300 text-left mt-2">点击句子发现来源</p>

                <div class="w-full flex justify-center items-center mt-4">
                    <div class="flex-1 h-3 bg-blue-100" />
                    <div class="flex-1 h-3 bg-blue-200" />
                    <div class="flex-1 h-3 bg-purple-200" />
                    <div class="flex-1 h-3 bg-red-100" />
                    <div class="flex-1 h-3 bg-red-200" />
                </div>
                <div class="w-full flex justify-between items-center mt-2">
                    <p class="text-xs font-bold text-gray-400">发现一些模糊来源</p>
                    <p class="text-xs font-bold text-gray-600">发现一些精确来源</p>
                    <p class="text-xs font-bold text-red-300">发现大量精确来源</p>
                </div>
            </div>


            <div v-for="(sentence, index) in sourceSentences" :key="index"
                class="shadow-md border flex flex-col justify-center items-start gap-1 px-3 py-2 rounded-md mt-3">
                <p class="text-sm text-gray-500 font-bold">句子{{ index + 1 }}</p>
                <p class="text-left font-bold">{{ sentence.text }}</p>
                <div :class="{
                    'bg-blue-100': sentence.importance === 1,
                    'bg-purple-200': sentence.importance === 2,
                    'bg-red-200': sentence.importance === 3
                }" class="rounded-md p-1">
                    <p :class="{
                        'text-gray-400': sentence.importance === 1,
                        'text-gray-600': sentence.importance === 2,
                        'text-red-500': sentence.importance === 3
                    }" class="text-xs font-bold cursor-pointer">
                        {{ sentence.importance === 1 ? '发现一些模糊来源' : sentence.importance === 2 ? '发现一些精确来源' :
                            '发现大量精确来源' }}
                    </p>
                </div>
            </div>
        </el-scrollbar>

    </div>
</template>

<script setup lang="ts">
import type { Sentence } from '@/utils/types';

defineProps<{
    sourceSentences: Sentence[];
}>();
</script>
