<template>
  <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 3;">
    <path 
      v-for="edge in edges" 
      :key="edge.id"
      :d="calculatePath(edge)" 
      stroke="#94a3b8" 
      stroke-width="2" 
      fill="none"
      class="connection-path"
    />
  </svg>
</template>

<script setup lang="ts">
import { Node, Edge } from '../../types/workflow';
import { calculatePath as calculatePathUtil } from '../../utils/workflow/nodeUtils';

// 接收属性
const props = defineProps<{
  edges: Edge[];
  nodes: Node[];
}>();

// 计算路径
const calculatePath = (edge: Edge) => {
  return calculatePathUtil(edge, props.nodes);
};
</script>

<style lang="scss" scoped>
.connection-path {
  transition: stroke 0.3s;
}

.connection-path:hover {
  stroke: #4f46e5;
  stroke-width: 3;
}
</style> 