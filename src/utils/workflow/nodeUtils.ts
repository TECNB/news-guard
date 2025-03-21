import { Node, Edge } from '../../types/workflow';
import { Ref } from 'vue';

/**
 * 处理节点点击事件
 */
export function handleNodeClick(
  event: MouseEvent, 
  nodeId: string, 
  nodeMoved: Ref<boolean>,
  selectNodeFn: (nodeId: string) => void
) {
  // 只有当节点未移动时，才认为是点击事件
  if (!nodeMoved.value) {
    selectNodeFn(nodeId);
  }
}

/**
 * 选择节点
 */
export function selectNode(
  nodeId: string,
  nodes: Node[],
  selectedNodeId: Ref<string | null>,
  emit: (event: 'node-selected', ...args: any[]) => void
) {
  selectedNodeId.value = nodeId;
  const node = nodes.find(n => n.id === nodeId);
  if (node) {
    emit('node-selected', node);
  }
}

/**
 * 计算连线路径
 */
export function calculatePath(source: Node | { x: number, y: number }, target: Node | { x: number, y: number }) {
  const startX = source.x + 240;
  const startY = source.y + 34;
  const endX = target.x;
  const endY = target.y + 34;
  
  // 计算控制点，确保曲线平滑
  const dx = Math.abs(endX - startX);
  const offsetX = Math.max(100, dx * 0.4);
  
  // 贝塞尔曲线
  return `M ${startX} ${startY} C ${startX + offsetX} ${startY}, ${endX - offsetX} ${endY}, ${endX} ${endY}`;
}

/**
 * 更新节点
 */
export function updateNode(updatedNode: Node, nodes: Node[]) {
  const index = nodes.findIndex(n => n.id === updatedNode.id);
  if (index !== -1) {
    // 更新节点，保持位置不变
    const position = { x: nodes[index].x, y: nodes[index].y };
    nodes[index] = { ...updatedNode, ...position };
  }
}

/**
 * 添加节点
 */
export function addNode(
  nodeType: { type: string; name: string },
  canvasRef: Ref<HTMLElement | null>,
  nodeLibraryX: Ref<number>,
  nodeLibraryY: Ref<number>,
  translateX: Ref<number>,
  translateY: Ref<number>,
  scale: Ref<number>,
  nodes: Node[],
  nodeLibraryVisible: Ref<boolean>,
  selectNodeFn: (nodeId: string) => void,
  createNodeFn: (type: string, x: number, y: number) => Node
) {
  // 获取canvas元素的位置信息
  const canvasRect = canvasRef.value?.getBoundingClientRect();
  
  if (canvasRect) {
    // 使用工厂函数创建节点，将全局坐标转换为相对于canvas的坐标
    const newNode = createNodeFn(
      nodeType.type, 
      ((nodeLibraryX.value - canvasRect.left) - translateX.value) / scale.value,
      ((nodeLibraryY.value - canvasRect.top) - translateY.value) / scale.value
    );
    
    nodes.push(newNode);
    nodeLibraryVisible.value = false;
    selectNodeFn(newNode.id);
  }
}

/**
 * 获取工作流
 */
export function getWorkflow(nodes: Node[], edges: Edge[]) {
  return {
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges))
  };
} 