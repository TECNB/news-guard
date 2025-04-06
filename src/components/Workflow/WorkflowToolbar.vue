<template>
  <div class="workflow-toolbar w-full h-16 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 flex items-center px-6 z-10">
    <!-- 左侧区域：标题 -->
    <div class="flex items-center">
      <h1 class="text-lg font-semibold text-gray-800">工作流编排</h1>
    </div>
    
    <!-- 中间区域：缩放控制 -->
    <div class="flex items-center mx-auto space-x-4">
      <button 
        @click="zoomOut" 
        class="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
        title="缩小"
      >
        <i class="fa-solid fa-minus"></i>
      </button>
      
      <div class="text-sm font-medium text-gray-700 min-w-[40px] text-center">{{ Math.round(scale * 100) }}%</div>
      
      <button 
        @click="zoomIn" 
        class="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
        title="放大"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
      
      <button 
        @click="resetZoom" 
        class="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
        title="重置缩放"
      >
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
    </div>
    
    <!-- 右侧区域：操作按钮 -->
    <div class="flex items-center space-x-3">
      <button 
        @click="$emit('save')" 
        class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center transition-all duration-200 shadow-sm"
      >
        <i class="fa-solid fa-floppy-disk mr-1.5"></i>
        保存
      </button>
      
      <button 
        @click="onRunClick" 
        class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-600 flex items-center transition-all duration-200 shadow-sm"
      >
        <i class="fa-solid fa-play mr-1.5"></i>
        运行
      </button>
      
      <button 
        @click="$emit('debug')" 
        class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center transition-all duration-200 shadow-sm"
      >
        <i class="fa-solid fa-bug mr-1.5"></i>
        调试
      </button>
      
      <button 
        @click="$emit('publish')" 
        class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 rounded-lg text-sm font-medium text-white hover:from-green-700 hover:to-green-600 flex items-center transition-all duration-200 shadow-sm"
      >
        <i class="fa-solid fa-circle-check mr-1.5"></i>
        发布
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';

// 定义属性
const props = defineProps<{
  scale: number;
}>();

// 定义事件
const emit = defineEmits(['zoom-in', 'zoom-out', 'reset-zoom', 'save', 'run', 'debug', 'publish']);

// 缩放控制
const zoomIn = () => {
  emit('zoom-in');
};

const zoomOut = () => {
  emit('zoom-out');
};

const resetZoom = () => {
  emit('reset-zoom');
};

// 运行按钮点击处理
const onRunClick = () => {
  console.log('工作流工具栏：点击运行按钮');
  emit('run', {
    timestamp: new Date().toISOString(),
    source: 'toolbar'
  });
};
</script>

<style lang="scss" scoped>
.workflow-toolbar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05);
  
  button {
    &:active {
      transform: translateY(1px);
      box-shadow: none;
    }
  }
}
</style> 