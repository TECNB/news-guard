<template>
  <div 
    class="absolute" 
    :style="{ left: `${node.x}px`, top: `${node.y}px` }"
    @contextmenu.prevent="showContextMenu"
  >
    <div 
      class="node bg-white rounded-2xl shadow-md border border-gray-200 p-3 cursor-move relative min-w-[240px] transition duration-200"
      :class="{ 'border-blue-500 ring-2 ring-blue-200': isSelected }"
      @mousedown.stop="onNodeDragStart"
      @click.stop="onNodeClick"
      @mouseenter="showControls = true"
      @mouseleave="showControls = false"
    >
      <!-- 控制栏 -->
      <div v-if="showControls || isSelected" class="node-controls absolute -top-5 -right-1 bg-white rounded-lg shadow-md z-20">
        <div class="inline-block text-blue-500 hover:bg-blue-50 rounded px-2 py-[0.5px]" @click.stop="runNode">
          <i class="fa-solid fa-play fa-2xs"></i>
        </div>
        <div class="inline-block text-gray-500 hover:bg-gray-50 rounded px-2 py-[0.5px]" @click.stop="showContextMenu">
          <i class="fa-solid fa-ellipsis-vertical fa-2xs"></i>
        </div>
      </div>

      <!-- 右键菜单 -->
      <div v-if="contextMenuVisible" class="context-menu fixed bg-white shadow-lg rounded-lg border border-gray-200 z-[100] px-2 py-1 min-w-[160px]"
        :style="{ 
          left: `${contextMenuX}px`, 
          top: `${contextMenuY}px`,
          transform: 'translate(0, 0)',
          maxHeight: '80vh',
          overflowY: 'auto',
          minWidth: '220px'
        }"
      >
        <div class="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between" @click="runNode">
          <span class="text-gray-500">运行此步骤</span>
        </div>
        <div class="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between" @click="editNode">
          <span class="text-gray-500">更改节点</span>
        </div>
        <div class="border-t border-gray-200 my-1"></div>
        <div class="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between" @click="cloneNode">
          <span class="text-gray-500">拷贝</span>
          <span class="text-xs text-gray-400">⌘D</span>
        </div>
        <div class="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between" @click="copyNode">
          <span class="text-gray-500">复制</span>
          <span class="text-xs text-gray-400">⌘C</span>
        </div>
        <div class="border-t border-gray-200 my-1"></div>
        <div class="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-red-500" @click="onDeleteNode">
          <span class="text-gray-500">删除</span>
          <span class="text-xs text-gray-400">⌫</span>
        </div>
        <div class="border-t border-gray-200 my-1"></div>
        <div class="flex flex-col p-2 hover:bg-gray-50 cursor-pointer">
          <span class="text-left text-gray-500">关于</span>
          <span v-if="node.type === '开始' || node.type === 'start'" class="text-left text-xs text-gray-500 mt-1">定义一个 workflow 流程启动的初始参数</span>
          <span v-else-if="node.type === 'LLM' || node.type === 'llm' || node.type === 'deepseek-chat'" class="text-left text-xs text-gray-500 mt-1">调用大语言模型回答问题或者对自然语言进行处理</span>
        </div>
      </div>

      <div class="flex items-center mb-2">
        <!-- 节点图标 - 根据节点类型显示不同图标 -->
        <div class="mr-3 text-xl">
          <i v-if="node.type === '开始' || node.type === 'start'" class="fa-solid fa-home text-green-500"></i>
          <i v-else-if="node.type === 'LLM' || node.type === 'llm'" class="fa-solid fa-robot text-blue-500"></i>
          <i v-else-if="node.type === 'conditional'" class="fa-regular fa-code-branch text-yellow-500"></i>
          <i v-else-if="node.type === 'end'" class="fa-regular fa-file-export text-red-500"></i>
          <i v-else-if="node.type === 'knowledge'" class="fa-regular fa-database text-purple-500"></i>
          <i v-else class="fa-solid fa-cube text-gray-500"></i>
        </div>
        <div>
          <div class="font-medium text-gray-800">{{ node.name }}</div>
        </div>
      </div>
      
      <!-- 开始节点变量展示 -->
      <div v-if="node.type === 'start' && hasVariables" class="">
        <div v-for="(value, key) in extractedVariables" :key="key" 
             class="bg-gray-50 rounded-md px-1 py-1 flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-blue-500 mr-1">{x}</span>
            <span class="text-gray-700">{{ key }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-xs text-gray-500 mr-2">必填</span>
            <i class="fa-solid fa-bars-staggered text-gray-400"></i>
          </div>
        </div>
      </div>

      <!-- LLM节点模型名称 -->
      <div v-if="isModelNode" class="mt-2">
        <div v-if="node.config && node.config.model" 
             class="bg-gray-50 rounded-md px-3 py-2 flex items-center justify-between">
          <div class="flex items-center">
            <i  class="fa-solid fa-microchip text-blue-400"></i>
            <span class="text-gray-700">{{ node.config.model }}</span>
          </div>
          <div>
            <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">CHAT</span>
          </div>
        </div>
      </div>
      
      <!-- 节点连接点 -->
      <div 
        class="connector-out absolute -right-2 top-[27px] w-4 h-4 bg-blue-500 rounded-full cursor-crosshair z-10 transition duration-200 hover:scale-[1.2] hover:ring-2 hover:ring-blue-300/30"
        @mousedown.stop="onStartConnection($event, 'output')"
      ></div>
      <div 
        class="connector-in absolute -left-2 top-[27px] w-4 h-4 bg-green-500 rounded-full cursor-crosshair z-10 transition duration-200 hover:scale-[1.2] hover:ring-2 hover:ring-blue-300/30"
        @mousedown.stop="onStartConnection($event, 'input')"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Node } from '../../types/workflow';
import { useWorkflowStore } from '../../stores/workflowStore';

// 接收属性
const props = defineProps<{
  node: Node;
  isSelected: boolean;
  canvasRef: HTMLElement | null;
  scale?: number;
  translateX?: number;
  translateY?: number;
}>();

// 定义事件
const emit = defineEmits(['drag-start', 'click', 'connection-start']);

// 控制栏状态
const showControls = ref(false);
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

// 获取工作流 store
const workflowStore = useWorkflowStore();

// 事件处理
const onNodeDragStart = (event: MouseEvent) => {
  emit('drag-start', event, props.node.id);
};

const onNodeClick = (event: MouseEvent) => {
  contextMenuVisible.value = false;
  emit('click', event, props.node.id);
};

// 右键菜单
const showContextMenu = (event?: MouseEvent) => {
  if (event && props.canvasRef) {
    event.preventDefault();
    event.stopPropagation();
    
    // 获取画布的位置信息
    const canvasRect = props.canvasRef.getBoundingClientRect();
    
    // 获取画布的缩放和平移值
    const scale = props.scale || 1;
    const translateX = props.translateX || 0;
    const translateY = props.translateY || 0;
    
    // 将全局坐标转换为相对于画布的坐标，考虑缩放和平移
    contextMenuX.value = (event.clientX - canvasRect.left) / scale - translateX;
    contextMenuY.value = (event.clientY - canvasRect.top) / scale - translateY;
    
    // 获取菜单的预计尺寸
    const menuWidth = 200;
    const menuHeight = 250;
    
    // 确保菜单不会超出画布，考虑缩放
    const canvasWidth = canvasRect.width / scale;
    const canvasHeight = canvasRect.height / scale;
    
    if (contextMenuX.value + menuWidth > canvasWidth) {
      contextMenuX.value = canvasWidth - menuWidth;
    }
    
    if (contextMenuY.value + menuHeight > canvasHeight) {
      contextMenuY.value = canvasHeight - menuHeight;
    }
    
    contextMenuVisible.value = true;
  }
};

// 连接点事件处理
const onStartConnection = (event: MouseEvent, type: 'input' | 'output') => {
  // 发出开始连接事件
  emit('connection-start', event, props.node.id, type);
};

// 菜单功能
const runNode = () => {
  contextMenuVisible.value = false;
};

const editNode = () => {
  contextMenuVisible.value = false;
};

const cloneNode = () => {
  contextMenuVisible.value = false;
};

const copyNode = () => {
  contextMenuVisible.value = false;
};

const onDeleteNode = () => {
  workflowStore.deleteNode(props.node.id);
};

// 计算属性：检查是否有变量可以显示
const hasVariables = computed(() => {
  // 仅对开始节点检查是否有输入变量
  if (props.node.type === '开始' || props.node.type === 'start') {
    return props.node.inputs && props.node.inputs.length > 0;
  }
  return false;
});

// 计算属性：提取可以展示的变量
const extractedVariables = computed(() => {
  // 仅对开始节点获取输入变量
  if ((props.node.type === '开始' || props.node.type === 'start') && props.node.inputs) {
    // 从 workflowStore 获取输入变量
    return workflowStore.inputVariables;
  }
  return {};
});

// 计算属性：检查是否为模型节点
const isModelNode = computed(() => {
  return props.node.type === 'LLM' || props.node.type === 'llm' || props.node.type === 'deepseek-chat';
});
</script>

<style lang="scss" scoped>
.context-menu {
  animation: menuFadeIn 0.15s ease-out;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
