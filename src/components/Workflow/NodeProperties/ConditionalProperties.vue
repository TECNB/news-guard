<template>
  <div class="space-y-4">
    <h4 class="text-md font-medium text-gray-700">条件配置</h4>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">条件类型</label>
      <select 
        v-model="config.conditionType" 
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="content">内容匹配</option>
        <option value="sentiment">情感分析</option>
        <option value="category">分类结果</option>
      </select>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">条件表达式</label>
      <textarea 
        v-model="config.expression" 
        rows="3"
        placeholder="请输入条件表达式"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      ></textarea>
      <p class="mt-1 text-sm text-gray-500">
        {{ getExpressionHelp }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ConditionalConfig } from '@/types/workflow';

const props = defineProps<{
  modelValue: ConditionalConfig;
}>();

const emit = defineEmits(['update:modelValue']);

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const getExpressionHelp = computed(() => {
  switch (config.value.conditionType) {
    case 'content':
      return '使用正则表达式或关键词匹配内容，例如：/购买|售卖/';
    case 'sentiment':
      return '使用大于小于号比较情感值，例如：> 0.5';
    case 'category':
      return '使用分类名称匹配，例如：news 或 spam';
    default:
      return '';
  }
});
</script>
