<template>
  <el-scrollbar class="h-full">
    <!-- 有追踪信息时显示追踪列表 -->
    <div v-if="traces.length" class="space-y-2">
      <div 
        v-for="(trace, index) in traces" 
        :key="index" 
        class="border border-gray-200 rounded-md overflow-hidden mb-2"
      >
        <!-- 追踪项标题栏 -->
        <div 
          class="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer"
          @click="toggleExpand(index)"
        >
          <div class="flex items-center">
            <!-- 展开/折叠箭头 -->
            <i 
              :class="['fas mr-2 transition-transform duration-200', expandedItems.includes(index) ? 'fa-chevron-down' : 'fa-chevron-right']"
            ></i>
            <!-- 节点名称 -->
            <span class="font-medium">{{ trace.node }}</span>
          </div>
          
          <div class="flex items-center">
            <!-- 运行时间 -->
            <span class="text-xs text-gray-500 mr-3">{{ trace.timestamp }}</span>
            
            <!-- 运行状态图标 -->
            <span v-if="trace.status === 'running'" class="text-blue-500">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            <span v-else-if="trace.status === 'completed' || trace.message.includes('完成') || trace.message === '节点执行'" class="text-green-500">
              <i class="fas fa-check-circle"></i>
            </span>
            <span v-else-if="trace.status === 'error' || trace.message.includes('失败') || trace.message.includes('错误')" class="text-red-500">
              <i class="fas fa-times-circle"></i>
            </span>
            <span v-else-if="trace.message.includes('开始')" class="text-blue-500">
              <i class="fas fa-play-circle"></i>
            </span>
            <span v-else class="text-gray-500">
              <i class="fas fa-info-circle"></i>
            </span>
          </div>
        </div>
        
        <!-- 展开的详情内容 -->
        <div 
          v-if="expandedItems.includes(index)" 
          class="px-4 py-2 border-t border-gray-200 bg-white"
        >
          <!-- 节点执行错误信息 -->
          <div v-if="trace.data?.error" class="mb-3">
            <div class="text-red-500 font-medium mb-1">错误信息:</div>
            <div class="text-sm bg-red-50 p-2 rounded">{{ trace.data.error }}</div>
          </div>
          
          <!-- 节点输入数据 -->
          <div v-if="trace.data?.inputs && !isEmpty(trace.data.inputs)" class="mb-3">
            <div class="font-medium mb-1">输入数据:</div>
            <el-scrollbar :max-height="'10rem'" class="bg-gray-50 p-3 rounded-md text-xs font-mono text-left">
              <pre v-html="highlightJson(trace.data.inputs)" class="text-left whitespace-pre-wrap break-words"></pre>
            </el-scrollbar>
          </div>
          
          <!-- 节点输出数据 -->
          <div v-if="trace.data?.outputs && !isEmpty(trace.data.outputs)" class="mb-1">
            <div class="font-medium mb-1">输出数据:</div>
            <el-scrollbar :max-height="'15rem'" class="bg-blue-50 p-3 rounded-md text-xs font-mono text-left">
              <pre v-html="highlightJson(trace.data.outputs)" class="text-left whitespace-pre-wrap break-words"></pre>
            </el-scrollbar>
          </div>
          
          <!-- 如果没有数据或兼容老版本的追踪信息 -->
          <div v-if="!trace.data && trace.message" class="text-sm">{{ trace.message }}</div>
        </div>
      </div>
    </div>
    
    <!-- 无追踪信息时显示提示 -->
    <div v-else class="h-full flex justify-center items-center text-gray-500">
      暂无追踪信息
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWorkflowStore } from '../../stores/workflowStore';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 导入高亮样式

// 使用store获取状态
const workflowStore = useWorkflowStore();

// 从store中获取数据
const traces = computed(() => workflowStore.traces);

// 管理展开/折叠状态
const expandedItems = ref<number[]>([]);

// 切换展开/折叠状态
const toggleExpand = (index: number) => {
  const currentIndex = expandedItems.value.indexOf(index);
  if (currentIndex === -1) {
    expandedItems.value.push(index);
  } else {
    expandedItems.value.splice(currentIndex, 1);
  }
};

// 高亮 JSON 数据
const highlightJson = (data: Record<string, any>) => {
  try {
    const formattedJson = JSON.stringify(data, null, 2);
    return hljs.highlight(formattedJson, { language: 'json' }).value;
  } catch (e) {
    return String(data);
  }
};

// 检查对象是否为空
const isEmpty = (obj: Record<string, any>) => {
  return Object.keys(obj).length === 0;
};
</script>

<style scoped>
/* 确保 Font Awesome 图标正确显示 */
.fas {
  width: 16px;
  text-align: center;
}

/* 预格式化文本样式 */
pre {
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}
</style> 