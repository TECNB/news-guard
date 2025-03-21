<template>
  <svg class="paths-container absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;">
    <path 
      v-for="edge in edges" 
      :key="edge.id"
      :d="getEdgePath(edge)"
      stroke="#94a3b8" 
      stroke-width="2" 
      fill="none"
      marker-end="url(#arrowhead)"
    />
  </svg>
</template>

<script setup lang="ts">
import { Edge, Node } from '../../types/workflow';
import { calculatePath } from '../../utils/workflow/nodeUtils';

// 接收属性
const props = defineProps<{
  edges: Edge[];
  nodes: Node[];
}>();

// 计算每条边的路径
const getEdgePath = (edge: Edge): string => {
  const sourceNode = props.nodes.find(n => n.id === edge.source);
  const targetNode = props.nodes.find(n => n.id === edge.target);
  
  if (!sourceNode || !targetNode) return '';
  
  // 使用修改后的calculatePath函数
  return calculatePath(sourceNode, targetNode);
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