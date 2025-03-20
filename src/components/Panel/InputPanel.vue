<template>
  <div class="h-full flex flex-col">
    <!-- 输入字段 -->
    <div v-for="(value, key) in inputVariables" :key="key" class="mb-4">
      <div class="font-medium text-gray-700 mb-1">{{ key }}</div>
      <textarea 
        v-model="localInputValues[key]" 
        class="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-400"
        placeholder="请输入"
        rows="4"
      ></textarea>
    </div>
    
    <!-- 提交按钮 -->
    <div class="mt-auto pt-4">
      <button 
        @click="$emit('startRun')"
        class="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
        :disabled="hasEmptyInputs"
      >
        开始运行
      </button>
      <div v-if="hasEmptyInputs" class="text-red-500 text-sm mt-2">
        请填写所有必填输入变量
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, reactive, watch } from 'vue';

const props = defineProps<{
  inputVariables: Record<string, any>;
  inputValues: Record<string, any>;
  hasEmptyInputs: boolean;
}>();

defineEmits(['startRun']);

// 创建本地响应式对象，用于双向绑定
const localInputValues = reactive({...props.inputValues});

// 监听外部输入值变化，同步到本地值
watch(() => props.inputValues, (newValues) => {
  Object.assign(localInputValues, newValues);
}, { deep: true });

// 监听本地值变化，同步回父组件
watch(localInputValues, (newValues) => {
  Object.entries(newValues).forEach(([key, value]) => {
    props.inputValues[key] = value;
  });
}, { deep: true });
</script> 