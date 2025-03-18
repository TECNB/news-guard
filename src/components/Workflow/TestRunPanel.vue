<template>
  <div class="test-run-panel fixed top-0 right-0 w-96 h-full bg-white border-l border-gray-200 shadow-lg z-20 flex flex-col">
    <div class="flex justify-between items-center p-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold">Test Run</h2>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>

    <div class="tabs border-b border-gray-200">
      <div class="flex">
        <button 
          @click="activeTab = 'input'" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === 'input' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          输入
        </button>
        <button 
          @click="activeTab = 'result'" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === 'result' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          结果
        </button>
        <button 
          @click="activeTab = 'detail'" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === 'detail' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          详情
        </button>
        <button 
          @click="activeTab = 'trace'" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === 'trace' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          追踪
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-4">
      <!-- 输入选项卡 -->
      <div v-if="activeTab === 'input'" class="h-full flex flex-col">
        <div v-for="(value, key) in inputVariables" :key="key" class="mb-4">
          <div class="font-medium text-gray-700 mb-1">{{ key }}</div>
          <textarea 
            v-model="inputValues[key]" 
            class="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-400"
            placeholder="请输入"
            rows="4"
          ></textarea>
        </div>
        
        <div class="mt-auto pt-4">
          <button 
            @click="startRun" 
            class="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            开始运行
          </button>
        </div>
      </div>

      <!-- 结果选项卡 -->
      <div v-else-if="activeTab === 'result'" class="h-full">
        <div v-if="isRunning" class="flex justify-center items-center h-full">
          <div class="text-center">
            <div class="spinner mb-4"></div>
            <p class="text-gray-600">正在运行...</p>
          </div>
        </div>
        <div v-else-if="result" class="whitespace-pre-wrap">
          {{ result }}
        </div>
        <div v-else class="text-gray-500 flex justify-center items-center h-full">
          暂无运行结果
        </div>
      </div>

      <!-- 详情选项卡 -->
      <div v-else-if="activeTab === 'detail'" class="h-full">
        <div v-if="details.length" class="space-y-4">
          <div v-for="(detail, index) in details" :key="index" class="border rounded-md p-3">
            <div class="font-medium">{{ detail.name }}</div>
            <div class="text-sm text-gray-600">{{ detail.description }}</div>
            <div class="mt-2 text-xs bg-gray-50 p-2 rounded">{{ detail.value }}</div>
          </div>
        </div>
        <div v-else class="text-gray-500 flex justify-center items-center h-full">
          暂无详细信息
        </div>
      </div>

      <!-- 追踪选项卡 -->
      <div v-else-if="activeTab === 'trace'" class="h-full">
        <div v-if="traces.length" class="space-y-3">
          <div v-for="(trace, index) in traces" :key="index" class="border-l-2 border-blue-500 pl-3 py-1">
            <div class="font-medium">{{ trace.node }}</div>
            <div class="text-xs text-gray-500">{{ trace.timestamp }}</div>
            <div class="text-sm mt-1">{{ trace.message }}</div>
          </div>
        </div>
        <div v-else class="text-gray-500 flex justify-center items-center h-full">
          暂无追踪信息
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineEmits, defineProps } from 'vue';

const props = defineProps<{
  inputVariables: Record<string, any>;
  isRunning?: boolean;
  result?: string;
  details?: Array<{name: string, description: string, value: any}>;
  traces?: Array<{node: string, timestamp: string, message: string}>;
}>();

const emit = defineEmits(['close', 'run']);

// 默认激活输入选项卡
const activeTab = ref('input');

// 提供默认值，修复linter错误
const details = props.details || [];
const traces = props.traces || [];

// 用户输入的值
const inputValues = reactive<Record<string, any>>({...props.inputVariables});

// 开始运行工作流
const startRun = () => {
  console.log('测试运行面板：开始运行工作流，变量值:', inputValues);
  
  // 打印变量值到控制台，方便检查
  Object.entries(inputValues).forEach(([key, value]) => {
    console.log(`变量 ${key}: ${value}`);
  });
  
  // 触发run事件，并将所有输入变量的值传递给父组件
  emit('run', inputValues);
};
</script>

<style scoped>
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3498db;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 