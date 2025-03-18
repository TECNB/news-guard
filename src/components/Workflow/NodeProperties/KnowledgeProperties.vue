<template>
  <div class="space-y-4">
    <h4 class="text-md font-medium text-gray-700">知识库配置</h4>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">知识库选择</label>
      <select 
        v-model="config.knowledgeBase" 
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="news">新闻数据库</option>
        <option value="facts">事实库</option>
        <option value="custom">自定义知识库</option>
      </select>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">检索结果数量</label>
      <input 
        type="number" 
        v-model.number="config.topK" 
        min="1" 
        max="10"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { KnowledgeConfig } from '@/types/workflow';

const props = defineProps<{
  modelValue: KnowledgeConfig;
}>();

const emit = defineEmits(['update:modelValue']);

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>
