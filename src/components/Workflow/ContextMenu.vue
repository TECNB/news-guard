<template>
  <div 
    class="context-menu fixed bg-white shadow-lg rounded-md py-2 z-10"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <div class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center" @click="$emit('add-node')">
      <i class="fa-solid fa-plus mr-2"></i> 添加节点
    </div>
    <div class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center" @click="$emit('add-comment')">
      <i class="fa-solid fa-comment mr-2"></i> 添加注释
    </div>
    <div class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center" @click="$emit('run-workflow')">
      <i class="fa-solid fa-play mr-2"></i> 运行工作流
    </div>
  </div>
</template>

<script setup lang="ts">
// 接收属性
const props = defineProps<{
  x: number;
  y: number;
}>();

// 定义事件
const emit = defineEmits(['add-node', 'add-comment', 'run-workflow']);
</script>

<style lang="scss" scoped>
.context-menu {
  min-width: 180px;
}
</style> 