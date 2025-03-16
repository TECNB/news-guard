<template>
  <div 
    class="absolute" 
    :style="{ left: `${node.x}px`, top: `${node.y}px` }"
  >
    <div 
      class="node bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-move"
      :class="{ 'border-blue-500 ring-2 ring-blue-200': isSelected }"
      @mousedown.stop="onNodeDragStart"
      @click.stop="onNodeClick"
    >
      <div class="font-medium text-gray-800">{{ node.name }}</div>
      <div class="text-xs text-gray-500">{{ node.type }}</div>
      
      <!-- 节点连接点 -->
      <div 
        class="connector-out absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-pointer"
        @mousedown.stop="onStartConnection($event, 'output')"
      ></div>
      <div 
        class="connector-in absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full cursor-pointer"
        @mousedown.stop="onStartConnection($event, 'input')"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Node } from '../../types/workflow';

// 接收属性
const props = defineProps<{
  node: Node;
  isSelected: boolean;
}>();

// 定义事件
const emit = defineEmits(['drag-start', 'click', 'connection-start', 'connection-end']);

// 事件处理
const onNodeDragStart = (event: MouseEvent) => {
  emit('drag-start', event, props.node.id);
};

const onNodeClick = (event: MouseEvent) => {
  emit('click', event, props.node.id);
};

// 连接点事件处理
const onStartConnection = (event: MouseEvent, type: 'input' | 'output') => {
  // 发出开始连接事件
  emit('connection-start', event, props.node.id, type);
};
</script>

<style lang="scss" scoped>
.node {
  min-width: 150px;
  transition: all 0.2s;
}

/* 光标样式 */
.connector-out, .connector-in {
  transition: transform 0.2s;
  z-index: 10;
}

.connector-out:hover, .connector-in:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.connector-out {
  cursor: crosshair;
}

.connector-in {
  cursor: crosshair;
}
</style> 