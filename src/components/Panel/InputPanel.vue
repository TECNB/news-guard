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
    <div class="pt-4">
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
import { defineEmits, reactive, computed, onMounted, watch } from 'vue';
import { useWorkflowStore } from '../../stores/workflowStore';

const workflowStore = useWorkflowStore();
const emit = defineEmits(['startRun']);

// 直接从workflowStore获取输入变量
const inputVariables = computed(() => {
  // 从开始节点获取输入变量
  const startNode = workflowStore.nodes.find(node => node.type === 'start');
  const variables: Record<string, any> = {};
  
  if (startNode && startNode.inputs && startNode.inputs.length > 0) {
    startNode.inputs.forEach(variable => {
      if (variable.trim() !== '') {
        variables[variable] = '';
      }
    });
  }
  
  return variables;
});

// 创建本地响应式对象，用于双向绑定
const localInputValues = reactive<Record<string, any>>({});

// 当inputVariables变化时更新本地值
watch(inputVariables, (newVars) => {
  Object.keys(newVars).forEach(key => {
    if (localInputValues[key] === undefined) {
      localInputValues[key] = '';
    }
  });
}, { immediate: true });

// 组件挂载时初始化本地输入值
onMounted(() => {
  Object.keys(inputVariables.value).forEach(key => {
    localInputValues[key] = '';
  });
});

// 检查是否有空输入
const hasEmptyInputs = computed(() => {
  return Object.values(localInputValues).some(value => !value || value.trim() === '');
});

// 开始运行
const onStartRun = () => {
  // 触发开始运行事件，将所有输入值传递给父组件
  emit('startRun', {...localInputValues});
};
</script> 