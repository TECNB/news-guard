<template>
  <div class="workflow-toolbar w-full h-14 bg-white border-b border-gray-200 flex items-center px-4 z-10">
    <!-- 左侧区域：标题 -->
    <div class="flex items-center">
      <h1 class="text-lg font-medium text-gray-800">工作流编排</h1>
    </div>
    
    <!-- 中间区域：缩放控制 -->
    <div class="flex items-center mx-auto space-x-3">
      <button 
        @click="zoomOut" 
        class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md"
        title="缩小"
      >
        <i class="fa-solid fa-minus"></i>
      </button>
      
      <div class="text-sm text-gray-600">{{ Math.round(scale * 100) }}%</div>
      
      <button 
        @click="zoomIn" 
        class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md"
        title="放大"
      >
        <i class="fa-solid fa-plus"></i>
      </button>
      
      <button 
        @click="resetZoom" 
        class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md"
        title="重置缩放"
      >
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
    </div>
    
    <!-- 右侧区域：操作按钮 -->
    <div class="flex items-center space-x-2">
      <button 
        @click="$emit('save')" 
        class="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
      >
        <i class="fa-solid fa-floppy-disk mr-1"></i>
        保存
      </button>
      
      <button 
        @click="$emit('run')" 
        class="px-3 py-1.5 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
      >
        <i class="fa-solid fa-play mr-1"></i>
        运行
      </button>
      
      <button 
        @click="$emit('debug')" 
        class="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
      >
        <i class="fa-solid fa-bug mr-1"></i>
        调试
      </button>
      
      <button 
        @click="$emit('publish')" 
        class="px-3 py-1.5 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700 flex items-center"
      >
        <i class="fa-solid fa-circle-check mr-1"></i>
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
</script>

<style lang="scss" scoped>
.workflow-toolbar {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style> 