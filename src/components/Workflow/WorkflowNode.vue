<template>
  <div class="absolute" :style="{ left: `${node.x}px`, top: `${node.y}px` }" @contextmenu.prevent="showContextMenu">
    <div
      class="node bg-white rounded-2xl shadow-md border border-gray-200 p-3 cursor-move relative min-w-[240px] transition duration-200"
      :class="{ 'border-blue-500 ring-2 ring-blue-200': isSelected }" @mousedown.stop="onNodeDragStart"
      @click.stop="onNodeClick" @mouseenter="showControls = true" @mouseleave="showControls = false">
      <!-- 控制栏 -->
      <div v-if="showControls || isSelected"
        class="node-controls absolute -top-5 -right-1 bg-white rounded-lg shadow-md z-20">
        <div class="inline-block text-blue-500 hover:bg-blue-50 rounded px-2 py-[0.5px]" @click.stop="runNode">
          <i class="fa-solid fa-play fa-2xs"></i>
        </div>
        <div class="inline-block text-gray-500 hover:bg-gray-50 rounded px-2 py-[0.5px]" @click.stop="showContextMenu">
          <i class="fa-solid fa-ellipsis-vertical fa-2xs"></i>
        </div>
      </div>

      <!-- 右键菜单 -->
      <div v-if="contextMenuVisible"
        class="context-menu fixed bg-white shadow-lg rounded-lg border border-gray-200 z-[100] px-2 py-1 min-w-[160px]"
        :style="{
          left: `${contextMenuX}px`,
          top: `${contextMenuY}px`,
          transform: 'translate(0, 0)',
          maxHeight: '80vh',
          overflowY: 'auto',
          minWidth: '220px'
        }">
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
        <div class="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between text-red-500"
          @click="onDeleteNode">
          <span class="text-gray-500">删除</span>
          <span class="text-xs text-gray-400">⌫</span>
        </div>
        <div class="border-t border-gray-200 my-1"></div>
        <div class="flex flex-col p-2 hover:bg-gray-50 cursor-pointer">
          <span class="text-left text-gray-500">关于</span>
          <span v-if="node.type === '开始' || node.type === 'start'" class="text-left text-xs text-gray-500 mt-1">定义一个
            workflow 流程启动的初始参数</span>
          <span v-else-if="node.type === 'LLM' || node.type === 'llm' || node.type === 'deepseek-chat'"
            class="text-left text-xs text-gray-500 mt-1">调用大语言模型回答问题或者对自然语言进行处理</span>
          <span v-else-if="node.type === 'search'" class="text-left text-xs text-gray-500 mt-1">联网搜索并获取最新信息</span>
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
          <i v-else-if="node.type === 'search'" class="fa-solid fa-globe text-blue-400"></i>
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
            <i class="fa-solid fa-microchip text-blue-400"></i>
            <span class="text-gray-700">{{ node.config.model }}</span>
          </div>
          <div>
            <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">CHAT</span>
          </div>
        </div>
      </div>

      <!-- 搜索节点配置展示 -->
      <div v-if="node.type === 'search' && node.config" class="mt-2">
        <div class="bg-gray-50 rounded-md px-3 py-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass text-blue-400"></i>
            <span class="text-gray-700">{{ getSearchEngineName(node.config.searchEngine) }}</span>
          </div>
          <div>
            <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">{{ node.config.maxResults }}条结果</span>
          </div>
        </div>
      </div>

      <!-- 条件节点配置显示 -->
      <div v-if="node.type === 'conditional' && node.config" class="mt-2 space-y-2">
        <!-- IF 条件显示 -->
        <div v-if="node.config.conditions && node.config.conditions.length > 0" class="">
          <div class="flex justify-between items-baseline mb-1">
            <div class="text-xs text-gray-500">CASE 1</div>
            <div class="text-sm font-medium mr-2">IF</div>
          </div>
          <div v-for="(condition, index) in node.config.conditions" :key="`condition-${index}`"
            class="text-xs py-1 flex items-center bg-gray-50 rounded-md">
            <span class="text-blue-500">[x] {{ condition.field || '选择变量' }}</span>
            <span class="text-gray-600 ml-1">
              {{ getOperatorText(condition.operator) }} {{ condition.value }}
            </span>
          </div>
        </div>

        <!-- ELIF 分支显示 -->
        <div v-for="(branch, branchIndex) in node.config.branches" :key="`branch-${branchIndex}`" class="">
          <div class="flex justify-between items-baseline mb-1">
            <div class="text-xs text-gray-500">CASE {{ branchIndex + 2 }}</div>
            <div class="text-sm font-medium mr-2">ELIF</div>
          </div>
          <div class="text-xs py-1 flex items-center bg-gray-50 rounded-md">
            <span class="text-blue-500">[x] {{ branch.field || '选择变量' }}</span>
            <span class="text-gray-600 ml-1">
              {{ getOperatorText(branch.operator) }} {{ branch.value }}
            </span>
          </div>
        </div>

        <!-- ELSE 显示 -->
        <div v-if="hasConditions" class="">
          <div class="text-right text-sm font-medium mr-2">ELSE</div>
        </div>
      </div>

      <!-- 节点连接点 -->
      <!-- 输入连接点，对所有节点都显示 -->
      <div
        class="connector-in absolute -left-2 top-[27px] w-4 h-4 bg-green-500 rounded-full cursor-crosshair z-10 transition duration-200 hover:scale-[1.2] hover:ring-2 hover:ring-blue-300/30"
        @mousedown.stop="onStartConnection($event, 'input')"></div>

      <!-- 条件节点的多个输出连接点 -->
      <template v-if="node.type === 'conditional'">
        <!-- IF 分支输出 -->
        <div v-if="node.config && node.config.conditions && node.config.conditions.length > 0"
          class="connector-out absolute -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-crosshair z-10 transition duration-200 hover:scale-[1.2] hover:ring-2 hover:ring-blue-300/30"
          :style="{ top: `${getIfConnectorPosition()}px` }" @mousedown.stop="onStartConnection($event, 'output', 'if')"
          title="IF 分支">
        </div>

        <!-- ELIF 分支输出 -->
        <div v-for="(branch, branchIndex) in node.config?.branches || []" :key="`branch-output-${branchIndex}`"
          class="connector-out absolute -right-2 w-4 h-4 bg-yellow-500 rounded-full cursor-crosshair z-10 transition duration-200 hover:scale-[1.2] hover:ring-2 hover:ring-blue-300/30"
          :style="{ top: `${getElifConnectorPosition(branchIndex)}px` }"
          @mousedown.stop="onStartConnection($event, 'output', `elif-${branchIndex}`)"
          :title="`ELIF ${branchIndex + 1} 分支`">
        </div>

        <!-- ELSE 分支输出 -->
        <div v-if="hasConditions"
          class="connector-out absolute -right-2 w-4 h-4 bg-gray-500 rounded-full cursor-crosshair z-10 transition duration-200 hover:scale-[1.2] hover:ring-2 hover:ring-blue-300/30"
          :style="{ top: `${getElseConnectorPosition()}px` }"
          @mousedown.stop="onStartConnection($event, 'output', 'else')" title="ELSE 分支">
        </div>
      </template>

      <!-- 非条件节点的标准输出连接点 -->
      <div v-else
        class="connector-out absolute -right-2 top-[27px] w-4 h-4 bg-blue-500 rounded-full cursor-crosshair z-10 transition duration-200 hover:scale-[1.2] hover:ring-2 hover:ring-blue-300/30"
        @mousedown.stop="onStartConnection($event, 'output')"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Node } from '../../types/workflow';
import { useWorkflowStore } from '../../stores/workflowStore';

// 条件节点的接口定义
interface Condition {
  field: string;
  operator: string;
  value: string | number;
}

// 更新 Node 类型上的 config 属性，使其能够接受 ConditionalConfig
declare module '../../types/workflow' {
  interface NodeConfig {
    model?: string;
    conditions?: Condition[];
    branches?: Condition[];
    searchEngine?: string;
    maxResults?: number;
    timeout?: number;
  }
}

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
const onStartConnection = (event: MouseEvent, type: 'input' | 'output', branch?: string) => {
  // 发出开始连接事件
  emit('connection-start', event, props.node.id, type, branch);
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

// 获取搜索引擎显示名称
const getSearchEngineName = (engine: string | undefined) => {
  if (!engine) return '默认搜索';

  const searchEngines: Record<string, string> = {
    'google': '谷歌搜索',
    'bing': '必应搜索',
    'default': '默认搜索'
  };
  return searchEngines[engine] || searchEngines['default'];
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

// 计算属性：检查是否为条件节点且有条件或分支
const hasConditions = computed(() => {
  return props.node.type === 'conditional' &&
    props.node.config &&
    ((props.node.config.conditions && props.node.config.conditions.length > 0) ||
      (props.node.config.branches && props.node.config.branches.length > 0));
});

// 计算属性：获取操作符文本
const getOperatorText = (operator: string) => {
  const operatorMap: Record<string, string> = {
    'eq': '是',
    'in': '包含',
    'neq': '不是',
    'gt': '大于',
    'lt': '小于',
    '==': '等于',
    '!=': '不等于',
    '>': '大于',
    '<': '小于',
    '>=': '大于等于',
    '<=': '小于等于'
  };
  return operatorMap[operator] || operator;
};

// 计算属性：获取 IF 分支连接点的位置
const getIfConnectorPosition = () => {
  // 基础位置为60px，表示节点顶部和第一个条件之间的距离
  const basePosition = 50;
  return basePosition;
};

// 计算属性：获取 ELIF 分支连接点的位置
const getElifConnectorPosition = (branchIndex: number) => {
  // 基础位置
  const basePosition = 25;
  // 计算 IF 分支的空间
  const ifSpace = props.node.config?.conditions?.length ? 30 + props.node.config.conditions.length * 20 : 0;
  // 计算之前的 ELIF 分支所占的空间
  const previousElifSpace = branchIndex > 0 ? branchIndex * 50 : 0;

  return basePosition + ifSpace + previousElifSpace + 30;
};

// 计算属性：获取 ELSE 分支连接点的位置
const getElseConnectorPosition = () => {
  // 基础位置
  const basePosition = 32;
  // 计算 IF 分支的空间
  const ifSpace = props.node.config?.conditions?.length ? 30 + props.node.config.conditions.length * 20 : 0;
  // 计算所有 ELIF 分支所占的空间
  const elifSpace = props.node.config?.branches?.length ? props.node.config.branches.length * 50 : 0;

  return basePosition + ifSpace + elifSpace + 30;
};
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
