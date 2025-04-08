<template>
  <div 
    ref="canvasRef" 
    class="workflow-canvas bg-gray-50 w-full h-full relative overflow-hidden select-none"
    @contextmenu.prevent="onContextMenu"
    @click="hideContextMenu"
    @mouseup="onMouseUp"
  >
    <!-- 工作流主画布区域 -->
    <div 
      class="canvas-content w-full h-full origin-top-left transition duration-100" 
      :style="{ transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)` }"
      @wheel.prevent="handleZoom"
      @mousedown="onCanvasDragStart"
      @mousemove="onCanvasDrag"
      @mouseup="onCanvasDragEnd"
      @mouseleave="onCanvasDragEnd"
    >
      <!-- 网格背景 -->
      <div class="grid-background absolute inset-0 pointer-events-none">
        <!-- 网格将通过CSS实现 -->
      </div>
      
      <!-- 工作流节点 -->
      <WorkflowNode
        v-for="node in workflowStore.nodes" 
        :key="node.id"
        :node="node"
        :is-selected="workflowStore.selectedNodeId === node.id"
        :canvas-ref="canvasRef"
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        @drag-start="onNodeDragStart"
        @click="onNodeClick"
        @connection-start="onConnectionStart"
      />
      
      <!-- 连线 -->
      <PathsRenderer 
        :edges="workflowStore.edges"
        :nodes="workflowStore.nodes"
      />

      <!-- 临时连线 -->
      <svg v-if="drawingConnection" class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 5;">
        <path 
          :d="temporaryConnectionPath" 
          stroke="#4f46e5" 
          stroke-width="2" 
          fill="none" 
          stroke-dasharray="5,5"
          class="temporary-connection-path"
        />
      </svg>

      <!-- 连接节点检测层 -->
      <ConnectionHitboxes
        v-if="drawingConnection"
        :nodes="workflowStore.nodes"
        :visible="drawingConnection"
        :source-node-id="connectionStartNodeId"
        @hit-input="onConnectionHitInput"
        @hit-output="onConnectionHitOutput"
      />

      <!-- 无选择状态显示 -->
      <div v-if="!workflowStore.selectedNodeId && workflowStore.nodes.length === 0" class="absolute inset-0 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <i class="fa-solid fa-diagram-project text-5xl mb-3"></i>
          <p class="text-lg">点击右键添加节点开始创建工作流</p>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <ContextMenu
      v-if="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      @add-node="onOpenNodeLibrary"
      @add-comment="onAddComment"
      @run-workflow="onRunWorkflow"
    />

    <!-- 节点库弹出菜单 -->
    <NodeLibrary
      v-if="nodeLibraryVisible"
      :x="nodeLibraryX"
      :y="nodeLibraryY"
      :node-types="nodeTypes"
      @select-node-type="onAddNode"
    />

    <!-- 运行面板 -->
    <RunPanel
      v-if="showRunPanel"
      @close="closeRunPanel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineExpose, onBeforeUnmount } from 'vue';
import { NODE_TYPES } from '../../types/workflow';
import { useWorkflowStore } from '../../stores/workflowStore';
import WorkflowNode from './WorkflowNode.vue';
import ContextMenu from './ContextMenu.vue';
import NodeLibrary from './NodeLibrary.vue';
import PathsRenderer from './PathsRenderer.vue';
import RunPanel from './RunPanel.vue';
import ConnectionHitboxes from './ConnectionHitboxes.vue';

// 导入工具函数
import { startCanvasDrag, dragCanvas, stopCanvasDrag } from '../../utils/workflow/dragUtils';
import { showContextMenu, hideContextMenu as hideContextMenuUtil, openNodeLibrary } from '../../utils/workflow/menuUtils';

// 获取工作流 store
const workflowStore = useWorkflowStore();

// 节点类型定义
const nodeTypes = NODE_TYPES;

// 画布状态
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);

// 节点状态
const isDraggingNode = ref(false);
const draggingNodeId = ref<string | null>(null);
const nodeStartX = ref(0);
const nodeStartY = ref(0);
const nodeMoved = ref(false);

// 右键菜单状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

// 节点库状态
const nodeLibraryVisible = ref(false);
const nodeLibraryX = ref(0);
const nodeLibraryY = ref(0);

// 连线状态
const drawingConnection = ref(false);
const connectionStartNodeId = ref<string | null>(null);
const connectionStartType = ref<'input' | 'output' | null>(null);
const connectionBranch = ref<string | undefined>(undefined);
const connectionEndX = ref(0);
const connectionEndY = ref(0);

// 运行面板状态
const showRunPanel = ref(false);

// DOM引用
const canvasRef = ref<HTMLElement | null>(null);

// 定义事件
const emit = defineEmits(['scale-change', 'node-selected']);

// 临时连线的路径
const temporaryConnectionPath = computed(() => {
  if (!drawingConnection.value || !connectionStartNodeId.value) return '';
  
  // 找到起始节点
  const startNode = workflowStore.nodes.find(node => node.id === connectionStartNodeId.value);
  if (!startNode) return '';

  // 计算起始点坐标 (考虑节点位置和连接点位置)
  let startX, startY;
  
  if (connectionStartType.value === 'output') {
    // 输出连接点在节点右侧
    startX = startNode.x + 240; // 节点宽度
    
    // 检查是否是条件节点，并根据分支类型确定连接点位置
    if (startNode.type === 'conditional' && connectionBranch.value) {
      if (connectionBranch.value === 'if') {
        startY = startNode.y + 60; // IF 连接点位置
      } else if (connectionBranch.value.startsWith('elif-')) {
        const branchIndex = parseInt(connectionBranch.value.replace('elif-', ''));
        // 基础位置
        const basePosition = 35;
        // 计算 IF 分支的空间
        const ifSpace = startNode.config?.conditions?.length ? 30 + startNode.config.conditions.length * 20 : 0;
        // 计算之前的 ELIF 分支所占的空间
        const previousElifSpace = branchIndex > 0 ? branchIndex * 50 : 0;
        
        startY = startNode.y + basePosition + ifSpace + previousElifSpace + 30;
      } else if (connectionBranch.value === 'else') {
        // 基础位置
        const basePosition = 40;
        // 计算 IF 分支的空间
        const ifSpace = startNode.config?.conditions?.length ? 30 + startNode.config.conditions.length * 20 : 0;
        // 计算所有 ELIF 分支所占的空间
        const elifSpace = startNode.config?.branches?.length ? startNode.config.branches.length * 50 : 0;
        
        startY = startNode.y + basePosition + ifSpace + elifSpace + 30;
      } else {
        startY = startNode.y + 34; // 默认位置
      }
    } else {
      startY = startNode.y + 34; // 默认连接点位置
    }
  } else {
    // 输入连接点在节点左侧中心
    startX = startNode.x;
    startY = startNode.y + 34;
  }

  // 计算控制点 (为了创建贝塞尔曲线)
  const dx = connectionEndX.value - startX;
  const controlPointX1 = startX + dx * 0.5;
  const controlPointX2 = connectionEndX.value - dx * 0.5;

  // 返回贝塞尔曲线路径
  return `M ${startX} ${startY} C ${controlPointX1} ${startY}, ${controlPointX2} ${connectionEndY.value}, ${connectionEndX.value} ${connectionEndY.value}`;
});

// 右键菜单处理
const onContextMenu = (event: MouseEvent) => {
  showContextMenu(event, contextMenuVisible, contextMenuX, contextMenuY, nodeLibraryVisible);
};

const hideContextMenu = () => {
  hideContextMenuUtil(contextMenuVisible);
};

// 节点库菜单处理
const onOpenNodeLibrary = () => {
  openNodeLibrary(nodeLibraryVisible, nodeLibraryX, nodeLibraryY, contextMenuX, contextMenuY, contextMenuVisible);
};

// 添加节点
const onAddNode = (nodeType: { type: string; name: string }) => {
  // 获取canvas元素的位置信息
  const canvasRect = canvasRef.value?.getBoundingClientRect();
  
  if (canvasRect) {
    // 计算相对于canvas的坐标
    const x = ((nodeLibraryX.value - canvasRect.left) - translateX.value) / scale.value;
    const y = ((nodeLibraryY.value - canvasRect.top) - translateY.value) / scale.value;
    
    // 使用store添加节点
    const newNodeId = workflowStore.addNode(nodeType.type, x, y);
    
    // 隐藏节点库并选择新节点
    nodeLibraryVisible.value = false;
    workflowStore.selectNode(newNodeId);
  }
};

// 添加注释
const onAddComment = () => {
  nodeLibraryVisible.value = false;
  contextMenuVisible.value = false;
};

// 运行工作流
const onRunWorkflow = () => {
  contextMenuVisible.value = false;
  openRunPanel();
};

// 缩放处理
const handleZoom = (event: WheelEvent) => {
  const delta = event.deltaY > 0 ? -0.05 : 0.05;
  const newScale = Math.max(0.5, Math.min(2, scale.value + delta));
  setScale(newScale);
  // 发出缩放更新事件
  emit('scale-change', newScale);
};

// 设置缩放比例
const setScale = (newScale: number) => {
  scale.value = newScale;
};

// 获取当前缩放比例
const getScale = () => {
  return scale.value;
};

// 画布拖动处理
const onCanvasDragStart = (event: MouseEvent) => {
  if (drawingConnection.value) return; // 如果正在绘制连线，不允许画布拖动
  startCanvasDrag(event, isDragging, dragStartX, dragStartY, translateX, translateY);
};

const onCanvasDrag = (event: MouseEvent) => {
  dragCanvas(event, isDragging, dragStartX, dragStartY, translateX, translateY);
};

const onCanvasDragEnd = () => {
  stopCanvasDrag(isDragging);
};

// 节点点击处理
const onNodeClick = (event: MouseEvent, nodeId: string) => {
  if (drawingConnection.value) return; // 如果正在绘制连线，不处理节点点击
  
  // 只有当节点未移动时，才认为是点击事件
  if (!nodeMoved.value) {
    workflowStore.selectNode(nodeId);
    
    // 为了向后兼容，同时发出事件
    const selectedNode = workflowStore.nodes.find(n => n.id === nodeId);
    if (selectedNode) {
      emit('node-selected', selectedNode);
    }
  }
};

// 节点拖动处理
const onNodeDragStart = (event: MouseEvent, nodeId: string) => {
  if (drawingConnection.value) return; // 如果正在绘制连线，不允许节点拖动
  
  event.stopPropagation();
  
  // 设置拖动状态
  isDraggingNode.value = true;
  draggingNodeId.value = nodeId;
  nodeMoved.value = false;
  
  // 保存初始位置
  const node = workflowStore.nodes.find(n => n.id === nodeId);
  if (node) {
    nodeStartX.value = event.clientX - node.x;
    nodeStartY.value = event.clientY - node.y;
    
    // 在鼠标按下时，标记该节点为选中
    if (workflowStore.selectedNodeId !== nodeId) {
      workflowStore.selectNode(nodeId);
    }
  }
  
  // 添加全局事件监听
  window.addEventListener('mousemove', handleDragNode);
  window.addEventListener('mouseup', handleStopNodeDrag);
};

const handleDragNode = (event: MouseEvent) => {
  if (!isDraggingNode.value || !draggingNodeId.value) return;
  
  // 找到当前正在拖动的节点
  const node = workflowStore.nodes.find(n => n.id === draggingNodeId.value);
  if (node) {
    // 计算新位置
    const x = event.clientX - nodeStartX.value;
    const y = event.clientY - nodeStartY.value;
    
    // 更新节点位置
    workflowStore.updateNodePosition(node.id, x, y);
    
    // 标记为已移动
    nodeMoved.value = true;
  }
};

const handleStopNodeDrag = (event: MouseEvent) => {
  if (isDraggingNode.value && draggingNodeId.value && nodeMoved.value) {
    // 如果节点被移动了，则不触发选择事件
    event.stopPropagation();
    
    // 如果移动了，但我们希望保持选中状态
    if (!workflowStore.selectedNodeId && draggingNodeId.value) {
      workflowStore.selectNode(draggingNodeId.value);
    }
  } else if (isDraggingNode.value && draggingNodeId.value && !nodeMoved.value) {
    // 如果没有移动，则视为点击
    workflowStore.selectNode(draggingNodeId.value);
  }
  
  // 重置拖动状态
  isDraggingNode.value = false;
  draggingNodeId.value = null;
  
  // 移除全局事件监听
  window.removeEventListener('mousemove', handleDragNode);
  window.removeEventListener('mouseup', handleStopNodeDrag);
};

// 连线处理
const onConnectionStart = (event: MouseEvent, nodeId: string, type: 'input' | 'output', branch?: string) => {
  // 开始绘制连线
  drawingConnection.value = true;
  connectionStartNodeId.value = nodeId;
  connectionStartType.value = type;
  connectionBranch.value = branch;
  
  // 设置初始终点位置为鼠标位置
  // 需要考虑画布缩放和平移
  const rect = canvasRef.value?.getBoundingClientRect();
  if (rect) {
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    // 反向计算缩放和平移后的坐标
    connectionEndX.value = canvasX / scale.value - translateX.value;
    connectionEndY.value = canvasY / scale.value - translateY.value;
  }
  
  // 添加全局鼠标移动和释放事件监听
  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);
  
  // 阻止事件冒泡
  event.stopPropagation();
};

// 处理连接命中输入点
const onConnectionHitInput = (nodeId: string) => {
  tryCreateConnection(nodeId, 'input');
};

// 处理连接命中输出点
const onConnectionHitOutput = (nodeId: string, branchType?: string) => {
  tryCreateConnection(nodeId, 'output', branchType);
};

// 尝试创建连接
const tryCreateConnection = (nodeId: string, type: 'input' | 'output', branchType?: string) => {
  // 如果不是在绘制连线，直接返回
  if (!drawingConnection.value) return;
  
  // 如果起点和终点是同一个节点，不创建连线
  if (connectionStartNodeId.value === nodeId) {
    cancelConnection();
    return;
  }
  
  // 检查连接类型的有效性
  // 只允许输出->输入的连接
  if (
    (connectionStartType.value === 'output' && type === 'input') ||
    (connectionStartType.value === 'input' && type === 'output')
  ) {
    // 创建新连线
    const source = connectionStartType.value === 'output' ? connectionStartNodeId.value! : nodeId;
    const target = connectionStartType.value === 'output' ? nodeId : connectionStartNodeId.value!;
    
    // 检查源节点和目标节点是否存在
    const sourceNode = workflowStore.nodes.find(n => n.id === source);
    const targetNode = workflowStore.nodes.find(n => n.id === target);
    
    if (sourceNode && targetNode) {
      // 使用store添加边，包含分支类型信息
      workflowStore.addEdge(source, target);
      
      // 这里可以保存分支信息到边的属性中，但需要先修改 workflowStore 的接口
      // TODO: 修改 workflowStore.addEdge 方法，支持分支类型参数
    }
  }
  
  // 结束连线绘制
  cancelConnection();
};

// 全局鼠标移动处理
const handleGlobalMouseMove = (event: MouseEvent) => {
  if (drawingConnection.value) {
    // 更新临时连线的终点位置
    const rect = canvasRef.value?.getBoundingClientRect();
    if (rect) {
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;
      
      // 反向计算缩放和平移后的坐标
      connectionEndX.value = canvasX / scale.value - translateX.value;
      connectionEndY.value = canvasY / scale.value - translateY.value;
    }
  }
};

// 全局鼠标释放处理
const handleGlobalMouseUp = (event: MouseEvent) => {
  // 如果在画布空白处抬起鼠标，取消连线
  if (drawingConnection.value) {
    cancelConnection();
  }
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
};

// 鼠标抬起处理
const onMouseUp = (event: MouseEvent) => {
  // 如果在画布空白处抬起鼠标，取消连线
  if (drawingConnection.value) {
    cancelConnection();
  }
};

// 取消连线
const cancelConnection = () => {
  drawingConnection.value = false;
  connectionStartNodeId.value = null;
  connectionStartType.value = null;
  connectionBranch.value = undefined;
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
};

// 打开运行面板
const openRunPanel = () => {
  showRunPanel.value = true;
  workflowStore.prepareRun();
};

// 关闭运行面板
const closeRunPanel = () => {
  showRunPanel.value = false;
};

// 生命周期钩子
onMounted(() => {
  // 初始化操作，可能包括加载保存的工作流
  // 添加键盘事件监听，按下D键时打印工作流状态
  window.addEventListener('keydown', handleKeyDown);
});

// 在onBeforeUnmount中移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 按下D键时打印调试信息
  if (event.key === 'd' && event.ctrlKey) {
    console.log('========== 调试输出 ==========');
    workflowStore.logWorkflowState();
    console.log('==============================');
  }
};

// 暴露方法给父组件
defineExpose({
  setScale,
  getScale,
  openRunPanel
});
</script>

<style lang="scss" scoped>
.workflow-canvas {
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgb(243 244 246 / .5) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(243 244 246 / .5) 1px, transparent 1px);
}

.temporary-connection-path {
  animation: dash 1s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}

.connection-hitbox-input:hover {
  background-color: rgba(52, 211, 153, 0.5);
  border-color: rgba(16, 185, 129, 0.8);
}

.connection-hitbox-output:hover {
  background-color: rgba(59, 130, 246, 0.5);
  border-color: rgba(37, 99, 235, 0.8);
}
</style> 