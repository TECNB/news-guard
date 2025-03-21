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
        @input="updateInputValue(key, localInputValues[key])"
      ></textarea>
    </div>
    
    <!-- 提交按钮 -->
    <div class="mt-auto pt-4">
      <button 
        @click="onStartRun"
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
import { defineProps, defineEmits, reactive, computed } from 'vue';
import { useWorkflowStore } from '../../stores/workflowStore';

const workflowStore = useWorkflowStore();

const props = defineProps<{
  inputVariables: Record<string, any>;
  hasEmptyInputs?: boolean;
}>();

const emit = defineEmits(['updateValue', 'startRun']);

// 创建本地响应式对象，用于双向绑定
const localInputValues = reactive({...props.inputVariables});

// 检查是否有空输入
const checkEmptyInputs = computed(() => {
  return Object.values(localInputValues).some(value => !value || value.trim() === '');
});

// 更新输入值
const updateInputValue = (key: string, value: any) => {
  emit('updateValue', key, value);
};

// 开始运行
const onStartRun = () => {
  // 触发开始运行事件，将所有输入值传递给父组件
  emit('startRun', {...localInputValues});
};
</script> 