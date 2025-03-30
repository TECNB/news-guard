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
    </div>
</template>

<script setup lang="ts">
import type { Summary } from '@/utils/types';

defineProps<{
    summary: Summary;
}>();
</script>