<template>
    <div class="MainPointsSection">
        <!-- Main Points Section -->
        <div class="mt-10 px-10">
            <h3 class="text-lg font-bold text-[#49CFAD] mb-4">主要观点</h3>
            <ul class="list-disc pl-5 space-y-2">
                <li v-for="(point, index) in summary.main_points" :key="index" class="text-gray-700">
                    {{ point }}
                </li>
            </ul>
        </div>

        <!-- Fact Check Section -->
        <div class="mt-8 px-10">
            <h3 class="text-lg font-bold text-[#49CFAD] mb-4">事实核查</h3>
            <ul class="list-disc pl-5 space-y-2 text-red-500">
                <li v-for="(fact, index) in summary.check_facts" :key="index">
                    {{ fact }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Summary } from '@/utils/types';

defineProps<{
    summary: Summary;
}>();
</script>
