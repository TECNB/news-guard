<template>
  <svg class="paths-container absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;">
    <path 
      v-for="edge in edges" 
      :key="edge.id"
      :d="getEdgePath(edge)"
      :stroke="getEdgeColor(edge)"
      stroke-width="2" 
      fill="none"
      :marker-end="getEdgeMarker(edge)"
      class="connection-path"
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
  
  // 检查源节点是否是条件节点
  if (sourceNode.type === 'conditional') {
    return calculateConditionalNodePath(sourceNode, targetNode, edge);
  } else {
    // 使用标准方法计算路径
    return calculatePath(sourceNode, targetNode);
  }
};

// 专门为条件节点计算路径，考虑不同分支的位置
const calculateConditionalNodePath = (sourceNode: Node, targetNode: Node, edge: Edge): string => {
  // 这里我们需要根据边的源节点和目标节点的关系确定使用哪个连接点
  // 暂时我们通过查找边的 sourceHandle 或使用源节点前往同一目标的所有边的序号来模拟分支
  
  const startX = sourceNode.x + 240; // 节点右侧
  let startY = sourceNode.y + 34; // 默认连接点位置
  
  // 所有从源节点出发的边
  const outgoingEdges = props.edges.filter(e => e.source === sourceNode.id);
  
  // 查找当前边是第几个连接到目标节点的边
  const edgeIndex = outgoingEdges.findIndex(e => e.id === edge.id);
  
  if (edgeIndex === 0 && sourceNode.config.conditions && sourceNode.config.conditions.length > 0) {
    // 如果是第一个输出边，表示 IF 分支
    startY = sourceNode.y + 60; // IF 连接点位置
  } else if (edgeIndex > 0 && edgeIndex <= (sourceNode.config.branches?.length || 0)) {
    // 如果是中间输出边，表示 ELIF 分支
    // 计算 IF 分支的空间
    const ifSpace = sourceNode.config?.conditions?.length ? 30 + sourceNode.config.conditions.length * 20 : 0;
    // 计算之前的 ELIF 分支所占的空间
    const previousElifSpace = (edgeIndex - 1) > 0 ? (edgeIndex - 1) * 50 : 0;
    
    startY = sourceNode.y + 35 + ifSpace + previousElifSpace + 30;
  } else {
    // 如果是最后一个输出边，表示 ELSE 分支
    // 计算 IF 分支的空间
    const ifSpace = sourceNode.config?.conditions?.length ? 30 + sourceNode.config.conditions.length * 20 : 0;
    // 计算所有 ELIF 分支所占的空间
    const elifSpace = sourceNode.config?.branches?.length ? sourceNode.config.branches.length * 50 : 0;
    
    startY = sourceNode.y + 40 + ifSpace + elifSpace + 30;
  }
  
  const endX = targetNode.x;
  const endY = targetNode.y + 34;
  
  // 计算控制点，确保曲线平滑
  const dx = Math.abs(endX - startX);
  const offsetX = Math.max(100, dx * 0.4);
  
  // 贝塞尔曲线
  return `M ${startX} ${startY} C ${startX + offsetX} ${startY}, ${endX - offsetX} ${endY}, ${endX} ${endY}`;
};

// 获取边的颜色
const getEdgeColor = (edge: Edge): string => {
  const sourceNode = props.nodes.find(n => n.id === edge.source);
  
  if (sourceNode?.type === 'conditional') {
    // 获取这条边的分支类型
    const branchType = getBranchType(edge);
    
    if (branchType === 'if') {
      return '#3b82f6'; // 蓝色 - IF分支
    } else if (branchType.startsWith('elif')) {
      return '#eab308'; // 黄色 - ELIF分支
    } else if (branchType === 'else') {
      return '#6b7280'; // 灰色 - ELSE分支
    }
  }
  
  return '#94a3b8'; // 默认颜色
};

// 获取边的箭头标记
const getEdgeMarker = (edge: Edge): string => {
  const sourceNode = props.nodes.find(n => n.id === edge.source);
  
  if (sourceNode?.type === 'conditional') {
    // 获取这条边的分支类型
    const branchType = getBranchType(edge);
    
    if (branchType === 'if') {
      return 'url(#if-arrowhead)';
    } else if (branchType.startsWith('elif')) {
      return 'url(#elif-arrowhead)';
    } else if (branchType === 'else') {
      return 'url(#else-arrowhead)';
    }
  }
  
  return 'url(#arrowhead)';
};

// 获取边的分支类型
const getBranchType = (edge: Edge): string => {
  // 在实际实现中，这应该从 Edge 对象中获取分支类型信息
  // 这里我们通过序号模拟
  const sourceNode = props.nodes.find(n => n.id === edge.source);
  
  if (!sourceNode || sourceNode.type !== 'conditional') {
    return '';
  }
  
  // 所有从源节点出发的边
  const outgoingEdges = props.edges.filter(e => e.source === sourceNode.id);
  
  // 查找当前边是第几个输出边
  const edgeIndex = outgoingEdges.findIndex(e => e.id === edge.id);
  
  if (edgeIndex === 0 && sourceNode.config.conditions && sourceNode.config.conditions.length > 0) {
    // 第一个输出边是 IF 分支
    return 'if';
  } else if (edgeIndex > 0 && edgeIndex <= (sourceNode.config.branches?.length || 0)) {
    // 中间输出边是 ELIF 分支
    return `elif-${edgeIndex - 1}`;
  } else {
    // 最后一个输出边是 ELSE 分支
    return 'else';
  }
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