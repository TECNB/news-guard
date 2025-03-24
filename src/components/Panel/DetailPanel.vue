<template>
  <el-scrollbar class="h-full p-2">
    <!-- 工作流执行状态信息 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">工作流执行状态</h3>
      
      <!-- 工作流状态信息卡片 -->
      <div class="bg-white rounded-lg shadow p-4 mb-4">
        <!-- 运行状态 -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-gray-700 font-medium">状态:</span>
          <span :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            isRunning ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          ]">
            {{ isRunning ? '运行中' : '已完成' }}
          </span>
        </div>
        
        <!-- 运行时间和步数 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <span class="text-xs text-gray-500 mb-1">运行时间</span>
            <span class="text-sm font-medium">{{ executionTime || '尚未执行' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-gray-500 mb-1">运行步数</span>
            <span class="text-sm font-medium">{{ executionSteps || '0' }} 步</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 工作流输入输出变量 -->
    <div>
      <h3 class="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">工作流变量</h3>
      
      <!-- 输入变量卡片 -->
      <div class="bg-white rounded-lg shadow p-4 mb-4" v-if="inputVariables">
        <h4 class="text-sm font-semibold mb-2 text-gray-700">输入变量</h4>
        <div class="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto text-left">
          <pre v-html="highlightedInputVariables" class="text-left"></pre>
        </div>
      </div>
      
      <!-- 输出变量卡片 -->
      <div class="bg-white rounded-lg shadow p-4" v-if="outputVariables">
        <h4 class="text-sm font-semibold mb-2 text-gray-700">输出变量</h4>
        <div class="bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto text-left">
          <pre v-html="highlightedOutputVariables" class="text-left"></pre>
        </div>
      </div>
      
      <!-- 其他详情信息 -->
      <div v-if="otherDetails.length" class="mt-4 space-y-4">
        <h4 class="text-sm font-semibold mb-2 text-gray-700">其他详细信息</h4>
        <div v-for="(detail, index) in otherDetails" :key="index" class="border rounded-md p-3">
          <div class="font-medium">{{ detail.name }}</div>
          <div class="text-sm text-gray-600">{{ detail.description }}</div>
          <div class="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
            <pre>{{ detail.value }}</pre>
          </div>
        </div>
      </div>
      
      <!-- 无详情时显示提示 -->
      <div v-if="!details.length" class="flex justify-center items-center text-gray-500 py-8">
        暂无详细信息
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWorkflowStore } from '../../stores/workflowStore';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 导入样式，可以选择其他样式
import { ElScrollbar } from 'element-plus';

// 使用store获取状态
const workflowStore = useWorkflowStore();

// 从store中获取数据
const details = computed(() => workflowStore.details);
const isRunning = computed(() => workflowStore.isRunning);

// 处理详情数据，提取运行时间和步数
const executionTime = computed(() => {
  const timeDetail = details.value.find(d => d.name === '工作流执行' && d.description === '执行时间');
  return timeDetail ? timeDetail.value : '';
});

const executionSteps = computed(() => {
  const stepsDetail = details.value.find(d => d.name === '工作流执行' && d.description === '执行步数');
  return stepsDetail ? stepsDetail.value.split(' ')[0] : '0';
});

// 获取工作流输入变量
const inputVariables = computed(() => {
  const inputDetail = details.value.find(d => d.name === '工作流输入');
  return inputDetail ? inputDetail.value : '';
});

// 带语法高亮的输入变量
const highlightedInputVariables = computed(() => {
  if (!inputVariables.value) return '';
  try {
    // 如果是字符串，先尝试格式化
    const formattedJson = typeof inputVariables.value === 'string' 
      ? JSON.stringify(JSON.parse(inputVariables.value), null, 2) 
      : JSON.stringify(inputVariables.value, null, 2);
    return hljs.highlight(formattedJson, { language: 'json' }).value;
  } catch (e) {
    return inputVariables.value; // 如果不是有效的JSON，则返回原始内容
  }
});

// 获取工作流输出变量
const outputVariables = computed(() => {
  const outputDetail = details.value.find(d => d.name === '工作流输出');
  return outputDetail ? outputDetail.value : '';
});

// 带语法高亮的输出变量
const highlightedOutputVariables = computed(() => {
  if (!outputVariables.value) return '';
  try {
    // 如果是字符串，先尝试格式化
    const formattedJson = typeof outputVariables.value === 'string'
      ? JSON.stringify(JSON.parse(outputVariables.value), null, 2)
      : JSON.stringify(outputVariables.value, null, 2);
    return hljs.highlight(formattedJson, { language: 'json' }).value;
  } catch (e) {
    return outputVariables.value; // 如果不是有效的JSON，则返回原始内容
  }
});

// 其他详情信息（排除已经显示的输入输出和执行时间步数）
const otherDetails = computed(() => {
  return details.value.filter(d => 
    !(d.name === '工作流输入' || 
      d.name === '工作流输出' || 
      (d.name === '工作流执行' && (d.description === '执行时间' || d.description === '执行步数'))
    )
  );
});
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}
</style> 