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
        @click="$emit('reset')" 
        class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 flex items-center transition-all duration-200 shadow-sm"
      >
        <i class="fa-solid fa-rotate-left mr-1.5"></i>
        重置
      </button>
      
      <button 
        @click="showPublishDialog" 
        class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 rounded-lg text-sm font-medium text-white hover:from-green-700 hover:to-green-600 flex items-center transition-all duration-200 shadow-sm"
      >
        <i class="fa-solid fa-circle-check mr-1.5"></i>
        发布
      </button>
    </div>
  </div>

  <!-- 使用独立的发布确认对话框组件 -->
  <PublishDialog 
    :visible="publishDialogVisible" 
    @close="onPublishConfirm" 
    @view-docs="onViewDocs"
  />
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref } from 'vue';
import PublishDialog from './PublishDialog.vue';

// 定义属性
const props = defineProps<{
  scale: number;
}>();

// 定义事件
const emit = defineEmits(['zoom-in', 'zoom-out', 'reset-zoom', 'save', 'run', 'reset', 'publish']);

// 发布对话框相关状态
const publishDialogVisible = ref(false);

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

// 显示发布对话框
const showPublishDialog = () => {
  publishDialogVisible.value = true;
};

// 发布确认处理
const onPublishConfirm = (confirmed: boolean) => {
  publishDialogVisible.value = false;
  if (confirmed) {
    emit('publish', {
      timestamp: new Date().toISOString(),
      source: 'toolbar-dialog'
    });
  }
};

// 查看接口文档
const onViewDocs = () => {
  // 实现查看接口文档的逻辑，可以打开新页面或跳转
  window.open('/api/docs', '_blank');
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