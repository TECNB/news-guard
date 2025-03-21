<template>
  <div class="h-full overflow-auto">
    <!-- 有详情时显示详情列表 -->
    <div v-if="details.length" class="space-y-4">
      <div v-for="(detail, index) in details" :key="index" class="border rounded-md p-3">
        <div class="font-medium">{{ detail.name }}</div>
        <div class="text-sm text-gray-600">{{ detail.description }}</div>
        <div class="mt-2 text-xs bg-gray-50 p-2 rounded">{{ detail.value }}</div>
      </div>
    </div>
    
    <!-- 无详情时显示提示 -->
    <div v-else class="h-full flex justify-center items-center text-gray-500">
      暂无详细信息
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWorkflowStore } from '../../stores/workflowStore';

// 使用store获取状态
const workflowStore = useWorkflowStore();

// 从store中获取数据
const details = computed(() => workflowStore.details);
</script> 