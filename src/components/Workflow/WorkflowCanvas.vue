<template>
  <div 
    ref="canvasRef" 
    class="workflow-canvas bg-gray-50 w-full h-full relative overflow-hidden"
    @contextmenu.prevent="onContextMenu"
    @click="hideContextMenu"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <!-- 工作流主画布区域 -->
    <div 
      class="canvas-content w-full h-full" 
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
        v-for="node in nodes" 
        :key="node.id"
        :node="node"
        :is-selected="selectedNodeId === node.id"
        :canvas-ref="canvasRef"
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        @drag-start="onNodeDragStart"
        @click="onNodeClick"
        @connection-start="onConnectionStart"
        @delete="onDeleteNode"
      />
      
      <!-- 连线 -->
      <PathsRenderer 
        :edges="edges"
        :nodes="nodes"
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
      <div 
        v-if="drawingConnection" 
        class="connection-hitbox-layer absolute inset-0 w-full h-full" 
        style="z-index: 15;"
      >
        <div 
          v-for="node in nodes" 
          :key="`hitbox-${node.id}`"
          :style="{ 
            position: 'absolute', 
            left: `${node.x - 12}px`, 
            top: `${node.y + 28}px`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 20
          }"
          @mouseup.stop="onConnectionHitInput(node.id)"
          v-show="node.id !== connectionStartNodeId"
          class="connection-hitbox-input"
        ></div>
        <div 
          v-for="node in nodes" 
          :key="`hitbox-out-${node.id}`"
          :style="{ 
            position: 'absolute', 
            left: `${node.x + 240 - 12}px`, 
            top: `${node.y + 28}px`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 20
          }"
          @mouseup.stop="onConnectionHitOutput(node.id)"
          v-show="node.id !== connectionStartNodeId"
          class="connection-hitbox-output"
        ></div>
      </div>

      <!-- 无选择状态显示 -->
      <div v-if="!selectedNodeId && nodes.length === 0" class="absolute inset-0 flex items-center justify-center text-gray-400">
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

    <!-- 测试运行面板 -->
    <TestRunPanel
      v-if="showTestPanel"
      :input-variables="testInputVariables"
      :is-running="testRunning"
      :result="testResult"
      :details="testDetails"
      :traces="testTraces"
      @close="closeTestPanel"
      @run="executeTestRun"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from 'vue';
import { Node, Edge, NODE_TYPES, createNode } from '../../types/workflow';
import WorkflowNode from './WorkflowNode.vue';
import ContextMenu from './ContextMenu.vue';
import NodeLibrary from './NodeLibrary.vue';
import PathsRenderer from './PathsRenderer.vue';
import TestRunPanel from './TestRunPanel.vue';

// 导入工具函数
import { startCanvasDrag, dragCanvas, stopCanvasDrag, startNodeDrag, dragNode, stopNodeDrag } from '../../utils/workflow/dragUtils';
import { showContextMenu, hideContextMenu as hideContextMenuUtil, openNodeLibrary } from '../../utils/workflow/menuUtils';
import { handleNodeClick, selectNode, updateNode as updateNodeUtil, addNode as addNodeUtil, getWorkflow as getWorkflowUtil } from '../../utils/workflow/nodeUtils';

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
const nodes = reactive<Node[]>([]);
const edges = reactive<Edge[]>([]);
const selectedNodeId = ref<string | null>(null);
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
const connectionEndX = ref(0);
const connectionEndY = ref(0);

// 测试运行相关
const showTestPanel = ref(false);
const testInputVariables = reactive<Record<string, any>>({
  'news': '' // 默认输入变量，这可以根据开始节点获取
});
const testRunning = ref(false);
const testResult = ref('');
const testDetails = ref<Array<{name: string, description: string, value: any}>>([]);
const testTraces = ref<Array<{node: string, timestamp: string, message: string}>>([]);

// DOM引用
const canvasRef = ref<HTMLElement | null>(null);

// 定义事件
const emit = defineEmits(['node-selected', 'node-deselected', 'scale-change']);

// 临时连线的路径
const temporaryConnectionPath = computed(() => {
  if (!drawingConnection.value || !connectionStartNodeId.value) return '';
  
  // 找到起始节点
  const startNode = nodes.find(node => node.id === connectionStartNodeId.value);
  if (!startNode) return '';

  // 计算起始点坐标 (考虑节点位置和连接点位置)
  let startX, startY;
  
  if (connectionStartType.value === 'output') {
    // 输出连接点在节点右侧中心
    startX = startNode.x + 240; // 修改为新的节点宽度
    startY = startNode.y + 34; // 保持原有的垂直位置
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
  addNodeUtil(
    nodeType, 
    canvasRef, 
    nodeLibraryX, 
    nodeLibraryY, 
    translateX, 
    translateY, 
    scale, 
    nodes, 
    nodeLibraryVisible, 
    (nodeId) => selectNode(nodeId, nodes, selectedNodeId, emit), 
    createNode
  );
};

// 添加注释
const onAddComment = () => {
  nodeLibraryVisible.value = false;
  contextMenuVisible.value = false;
};

// 运行工作流
const onRunWorkflow = () => {
  contextMenuVisible.value = false;
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
  handleNodeClick(event, nodeId, nodeMoved, (nodeId) => selectNode(nodeId, nodes, selectedNodeId, emit));
};

// 节点拖动处理
const onNodeDragStart = (event: MouseEvent, nodeId: string) => {
  if (drawingConnection.value) return; // 如果正在绘制连线，不允许节点拖动
  startNodeDrag(
    event, 
    nodeId, 
    nodes, 
    isDraggingNode, 
    draggingNodeId, 
    nodeMoved, 
    nodeStartX, 
    nodeStartY, 
    selectedNodeId, 
    handleDragNode, 
    handleStopNodeDrag
  );
};

const handleDragNode = (event: MouseEvent) => {
  dragNode(event, nodes, isDraggingNode, draggingNodeId, nodeStartX, nodeStartY, nodeMoved);
};

const handleStopNodeDrag = (event: MouseEvent) => {
  stopNodeDrag(
    event, 
    nodes, 
    isDraggingNode, 
    draggingNodeId, 
    nodeMoved, 
    selectedNodeId, 
    (nodeId) => selectNode(nodeId, nodes, selectedNodeId, emit), 
    handleDragNode, 
    handleStopNodeDrag
  );
};

// 连线处理
const onConnectionStart = (event: MouseEvent, nodeId: string, type: 'input' | 'output') => {
  // 开始绘制连线
  drawingConnection.value = true;
  connectionStartNodeId.value = nodeId;
  connectionStartType.value = type;
  
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
const onConnectionHitOutput = (nodeId: string) => {
  tryCreateConnection(nodeId, 'output');
};

// 尝试创建连接
const tryCreateConnection = (nodeId: string, type: 'input' | 'output') => {
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
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: connectionStartType.value === 'output' ? connectionStartNodeId.value! : nodeId,
      target: connectionStartType.value === 'output' ? nodeId : connectionStartNodeId.value!,
    };
    
    // 检查是否已存在相同的连线
    const edgeExists = edges.some(
      edge => edge.source === newEdge.source && edge.target === newEdge.target
    );
    
    if (!edgeExists) {
      edges.push(newEdge);
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

// 鼠标移动处理
const onMouseMove = (event: MouseEvent) => {
  // 在画布内的鼠标移动主要通过全局事件处理
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
  
  // 移除全局事件监听
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
};

// 更新节点
const updateNode = (updatedNode: Node) => {
  updateNodeUtil(updatedNode, nodes);
};

// 获取工作流
const getWorkflow = () => {
  return getWorkflowUtil(nodes, edges);
};

// 删除连线
const removeEdge = (edgeId: string) => {
  const index = edges.findIndex(edge => edge.id === edgeId);
  if (index !== -1) {
    edges.splice(index, 1);
  }
};

// 删除节点
const onDeleteNode = (nodeId: string) => {
  // 找到要删除的节点索引
  const nodeIndex = nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex !== -1) {
    // 删除与该节点相关的所有边
    const relatedEdges = edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
    
    relatedEdges.forEach(edge => {
      const edgeIndex = edges.findIndex(e => e.id === edge.id);
      if (edgeIndex !== -1) {
        edges.splice(edgeIndex, 1);
      }
    });
    
    // 删除节点
    nodes.splice(nodeIndex, 1);
    
    // 如果删除的是当前选中的节点，清除选中状态
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null;
    }
  }
};

// 运行测试
const runTest = () => {
  showTestPanel.value = true;
  
  // 清空之前的测试数据
  testRunning.value = false;
  testResult.value = '';
  testDetails.value = [];
  testTraces.value = [];
  
  // 从开始节点获取所有必要的变量
  const startNode = nodes.find(node => node.type === 'start');
  
  // 清空并重新设置输入变量
  Object.keys(testInputVariables).forEach(key => {
    delete testInputVariables[key];
  });
  
  if (startNode && startNode.inputs && startNode.inputs.length > 0) {
    console.log('从开始节点获取的变量:', startNode.inputs);
    
    // 为每个开始节点定义的输入变量创建一个输入字段
    startNode.inputs.forEach(variable => {
      if (variable.trim() !== '') {
        testInputVariables[variable] = '';
      }
    });
  } else {
    // 如果没有找到开始节点或没有定义变量，提供一些默认变量
    console.log('未找到开始节点或变量定义，使用默认变量');
    testInputVariables['news'] = '';
    testInputVariables['query'] = '';
  }
  
  console.log('设置测试输入变量:', testInputVariables);
};

// 关闭测试面板
const closeTestPanel = () => {
  showTestPanel.value = false;
};

// 执行测试运行
const executeTestRun = (inputValues: Record<string, any>) => {
  testRunning.value = true;
  testResult.value = '';
  testDetails.value = [];
  testTraces.value = [];
  
  console.log('WorkflowCanvas: 执行测试运行，接收到的变量值:', inputValues);
  
  // 将输入的变量值应用到所有 LLM 节点
  nodes.forEach(node => {
    if (node.type === 'llm') {
      console.log(`处理 LLM 节点 ${node.id}`);
      
      // 确保节点配置中有系统提示词
      if (node.config && node.config.systemPrompt) {
        // 获取原始系统提示词
        const systemPrompt = node.config.systemPrompt;
        console.log('原始提示词:', systemPrompt);
        
        // 创建带有变量替换的真实提示词
        const trueSystemPrompt = systemPrompt.replace(/\{([^}]+)\}/g, (match, varName) => {
          if (inputValues[varName] !== undefined) {
            return inputValues[varName];
          }
          return match; // 如果没有找到对应变量值，保留原始占位符
        });
        
        console.log('替换后的提示词 (trueSystemPrompt):', trueSystemPrompt);
        
        // 将变量值保存到节点配置，用于属性面板显示
        node.config.variableValues = { ...inputValues };
        
        // 保存真实提示词到节点配置
        node.config.trueSystemPrompt = trueSystemPrompt;
        
        console.log(`已为节点 ${node.id} 设置变量值和真实提示词`);
      }
    }
  });
  
  // 更新选中节点的属性面板（如果当前选中的是 LLM 节点）
  if (selectedNodeId.value) {
    const selectedNode = nodes.find(node => node.id === selectedNodeId.value);
    if (selectedNode && selectedNode.type === 'llm') {
      console.log('更新选中的 LLM 节点的属性面板');
      // 这里会触发 LLMProperties.vue 中的 watch
      updateNode(selectedNode);
    }
  }
  
  // 这里模拟运行过程，实际应该调用后端API
  setTimeout(() => {
    testRunning.value = false;
    testResult.value = `运行完成，处理了输入: ${JSON.stringify(inputValues)}`;
    testDetails.value = [
      { name: '处理时间', description: '工作流执行耗时', value: '1.2秒' },
      { name: '处理节点', description: '参与处理的节点数', value: '3个' }
    ];
    testTraces.value = [
      { node: '开始节点', timestamp: new Date().toLocaleTimeString(), message: '开始执行' },
      { node: '处理节点1', timestamp: new Date().toLocaleTimeString(), message: '数据处理中' },
      { node: '结束节点', timestamp: new Date().toLocaleTimeString(), message: '执行完成' }
    ];
  }, 2000);
};

// 生命周期钩子
onMounted(() => {
  // 初始化操作，可能包括加载保存的工作流
});

// 暴露方法给父组件
defineExpose({
  setScale,
  getScale,
  updateNode,
  getWorkflow,
  removeEdge,
  runTest
});
</script>

<style lang="scss" scoped>
.workflow-canvas {
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgb(243 244 246 / .5) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(243 244 246 / .5) 1px, transparent 1px);
  user-select: none;
}

.canvas-content {
  transform-origin: 0 0;
  transition: transform 0.1s;
}

.temporary-connection-path {
  animation: dash 1s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -20;
  }
}

.connection-hitbox-input,
.connection-hitbox-output {
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  border: 2px dashed transparent;
}

.connection-hitbox-input:hover,
.connection-hitbox-output:hover {
  opacity: 0.7;
  transform: scale(1.1);
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