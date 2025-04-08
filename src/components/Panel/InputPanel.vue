<template>
  <div class="input-panel h-full flex flex-col">
    <!-- 输入字段容器 -->
    <div class="flex-1 overflow-auto custom-scrollbar space-y-5 pb-4">
      <!-- 空状态提示 -->
      <div v-if="Object.keys(inputVariables).length === 0" 
           class="flex flex-col items-center justify-center h-full text-gray-500 animate-fadeIn">
        <i class="fa-regular fa-inbox text-gray-300 text-5xl mb-3"></i>
        <p>工作流没有定义输入参数</p>
      </div>
      
      <!-- 输入字段列表 -->
      <div v-for="(value, key) in inputVariables" :key="key" 
           class="input-field-container bg-white rounded-xl p-5 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg "
           :style="{ animationDelay: `${Object.keys(inputVariables).indexOf(key) * 0.1}s` }">
        <label :for="`input-${key}`" class="flex items-center mb-3">
          <span class="w-2 h-2 bg-teal-400 rounded-full mr-2" style="background-color: #49CFAD;"></span>
          <span class="font-medium text-gray-700 text-sm tracking-wide">{{ key }}</span>
        </label>
        <textarea 
          :id="`input-${key}`"
          v-model="localInputValues[key]" 
          class="clean-textarea w-full p-3.5 bg-white rounded-lg text-gray-700 placeholder-gray-400 shadow-inner transition-all"
          placeholder="请在此处输入内容..."
          rows="3"
        ></textarea>
      </div>
    </div>
    
    <!-- 提交按钮（现在是div） -->
    <div class="mt-5" style="animation-delay: 0.3s">
      <div 
        @click="!hasEmptyInputs && onStartRun()"
        class="w-full py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
        :class="[hasEmptyInputs 
          ? 'bg-gray-200 text-gray-500' 
          : 'bg-teal-400 text-white hover:shadow-lg hover:bg-teal-500 active:scale-[0.98] cursor-pointer']"
        :style="!hasEmptyInputs ? {backgroundColor: '#49CFAD'} : {}"
        role="button"
        :aria-disabled="hasEmptyInputs"
        tabindex="0"
        @keydown.enter="!hasEmptyInputs && onStartRun()"
        @keydown.space="!hasEmptyInputs && onStartRun()"
      >
        <i v-if="!hasEmptyInputs" class="fa-solid fa-bolt mr-2"></i>
        {{ hasEmptyInputs ? '请填写所有必填项' : '开始运行' }}
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

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(203, 213, 225, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(203, 213, 225, 0.5);
  border-radius: 20px;
}

/* 清理textarea的默认样式 */
.clean-textarea {
  appearance: none;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
  background-color: rgba(249, 250, 251, 0.5);
  transition: all 0.2s ease;
  caret-color: #49CFAD;
}

.clean-textarea:focus {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 2px rgba(73, 207, 173, 0.15);
  background-color: #fff;
}

.clean-textarea::placeholder {
  opacity: 0.5;
  color: #94a3b8;
}

.input-field-container:hover .clean-textarea {
  background-color: #fff;
}
</style> 