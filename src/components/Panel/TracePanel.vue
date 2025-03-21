<template>
  <div class="h-full overflow-auto">
    <!-- 有追踪信息时显示追踪列表 -->
    <div v-if="traces.length" class="space-y-3">
      <div v-for="(trace, index) in traces" :key="index" class="border-l-2 border-blue-500 pl-3 py-1">
        <div class="font-medium">{{ trace.node }}</div>
        <div class="text-xs text-gray-500">{{ trace.timestamp }}</div>
        <div class="text-sm mt-1">{{ trace.message }}</div>
      </div>
    </div>
    
    <!-- 无追踪信息时显示提示 -->
    <div v-else class="h-full flex justify-center items-center text-gray-500">
      暂无追踪信息
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWorkflowStore } from '../../stores/workflowStore';

// 使用store获取状态
const workflowStore = useWorkflowStore();

// 从store中获取数据
const traces = computed(() => workflowStore.traces);
</script> 