import { Ref } from 'vue';
import { Node } from '../../types/workflow';

/**
 * 开始拖动画布
 */
export function startCanvasDrag(
  event: MouseEvent, 
  isDragging: Ref<boolean>,
  dragStartX: Ref<number>,
  dragStartY: Ref<number>,
  translateX: Ref<number>,
  translateY: Ref<number>
) {
  if (event.button !== 0) return; // 只处理左键点击
  isDragging.value = true;
  dragStartX.value = event.clientX - translateX.value;
  dragStartY.value = event.clientY - translateY.value;
}

/**
 * 拖动画布中
 */
export function dragCanvas(
  event: MouseEvent, 
  isDragging: Ref<boolean>,
  dragStartX: Ref<number>,
  dragStartY: Ref<number>,
  translateX: Ref<number>,
  translateY: Ref<number>
) {
  if (!isDragging.value) return;
  translateX.value = event.clientX - dragStartX.value;
  translateY.value = event.clientY - dragStartY.value;
}

/**
 * 停止拖动画布
 */
export function stopCanvasDrag(isDragging: Ref<boolean>) {
  isDragging.value = false;
}

/**
 * 开始拖动节点
 */
export function startNodeDrag(
  event: MouseEvent, 
  nodeId: string,
  nodes: Node[],
  isDraggingNode: Ref<boolean>,
  draggingNodeId: Ref<string | null>,
  nodeMoved: Ref<boolean>,
  nodeStartX: Ref<number>,
  nodeStartY: Ref<number>,
  selectedNodeId: Ref<string | null>,
  dragNodeFn: (event: MouseEvent) => void,
  stopNodeDragFn: (event: MouseEvent) => void
) {
  event.stopPropagation();
  
  // 设置拖动状态
  isDraggingNode.value = true;
  draggingNodeId.value = nodeId;
  nodeMoved.value = false;
  
  // 保存初始位置
  const node = nodes.find(n => n.id === nodeId);
  if (node) {
    nodeStartX.value = event.clientX - node.x;
    nodeStartY.value = event.clientY - node.y;
    
    // 在鼠标按下时，标记该节点为选中
    if (selectedNodeId.value !== nodeId) {
      selectedNodeId.value = nodeId;
    }
  }
  
  // 添加全局事件监听
  window.addEventListener('mousemove', dragNodeFn);
  window.addEventListener('mouseup', stopNodeDragFn);
}

/**
 * 拖动节点中
 */
export function dragNode(
  event: MouseEvent,
  nodes: Node[],
  isDraggingNode: Ref<boolean>,
  draggingNodeId: Ref<string | null>,
  nodeStartX: Ref<number>,
  nodeStartY: Ref<number>,
  nodeMoved: Ref<boolean>
) {
  if (!isDraggingNode.value || !draggingNodeId.value) return;
  
  // 找到当前正在拖动的节点
  const node = nodes.find(n => n.id === draggingNodeId.value);
  if (node) {
    // 计算新位置
    node.x = event.clientX - nodeStartX.value;
    node.y = event.clientY - nodeStartY.value;
    
    // 标记为已移动
    nodeMoved.value = true;
  }
}

/**
 * 停止拖动节点
 */
export function stopNodeDrag(
  event: MouseEvent,
  nodes: Node[],
  isDraggingNode: Ref<boolean>,
  draggingNodeId: Ref<string | null>,
  nodeMoved: Ref<boolean>,
  selectedNodeId: Ref<string | null>,
  selectNodeFn: (nodeId: string) => void,
  dragNodeFn: (event: MouseEvent) => void,
  stopNodeDragFn: (event: MouseEvent) => void
) {
  if (isDraggingNode.value && draggingNodeId.value && nodeMoved.value) {
    // 如果节点被移动了，则不触发选择事件
    event.stopPropagation();
    
    // 如果移动了，但我们希望保持选中状态
    if (!selectedNodeId.value && draggingNodeId.value) {
      const node = nodes.find(n => n.id === draggingNodeId.value);
      if (node && selectNodeFn) {
        selectNodeFn(draggingNodeId.value);
      }
    }
  } else if (isDraggingNode.value && draggingNodeId.value && !nodeMoved.value) {
    // 如果没有移动，则视为点击
    const node = nodes.find(n => n.id === draggingNodeId.value);
    if (node && selectNodeFn) {
      selectNodeFn(draggingNodeId.value);
    }
  }
  
  // 重置拖动状态
  isDraggingNode.value = false;
  draggingNodeId.value = null;
  
  // 移除全局事件监听
  window.removeEventListener('mousemove', dragNodeFn);
  window.removeEventListener('mouseup', stopNodeDragFn);
} 