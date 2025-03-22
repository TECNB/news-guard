<template>
  <div 
    class="variable-suggestions suggestions-above z-100 bg-white border border-gray-200 rounded-md shadow-lg p-2 overflow-y-auto w-[280px] max-h-[250px]"
    :style="positionStyle"
    @mousedown.prevent
  >
    <!-- 按节点分组显示变量 -->
    <div v-for="(nodeVars, idx) in groupedVariables" :key="idx" class="mb-3">
      <!-- 节点名称标题 -->
      <div class="text-xs font-semibold text-gray-500 px-2 py-1 mb-1 border-b border-gray-100">
        {{ nodeVars.nodeName }}
      </div>
      
      <!-- 节点变量列表 -->
      <div 
        v-for="variable in nodeVars.variables" 
        :key="`${nodeVars.nodeId}-${variable.name}`"
        class="suggestion-item p-2 hover:bg-blue-50 cursor-pointer rounded flex items-center gap-2 text-sm transition duration-150 ease-in-out"
        @click.stop="handleSelect(variable.name)"
      >
        <span :class="`text-${variable.color || 'blue'}-500 w-5 text-center`">
          <i class="fa-solid fa-bracket-curly text-xs"></i>
        </span>
        <span>{{ variable.name }}</span>
        <span v-if="variable.type" class="text-xs text-gray-400 ml-auto">{{ variable.type }}</span>
      </div>
    </div>
    
    <!-- 没有变量时的提示 -->
    <div v-if="!groupedVariables.length" class="p-2 text-gray-500 text-sm">
      没有可用的变量
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Variable {
  name: string;
  type?: string;
  color?: string;
}

interface NodeVariables {
  nodeId: string;
  nodeName: string;
  variables: Variable[];
}

interface PositionProps {
  left: string;
  top: string;
}

const props = defineProps<{
  variables: string[] | NodeVariables[];
  position: PositionProps;
}>();

const emit = defineEmits<{
  (e: 'select', variable: string): void;
}>();

// 根据位置属性计算样式
const positionStyle = computed(() => {
  return {
    left: props.position.left,
    top: props.position.top
  };
});

// 计算分组后的变量列表
const groupedVariables = computed<NodeVariables[]>(() => {
  // 如果已经是分组格式，直接返回
  if (props.variables.length > 0 && typeof props.variables[0] !== 'string') {
    return props.variables as NodeVariables[];
  }
  
  // 如果是旧格式（简单字符串数组），则转换为分组格式
  if (props.variables.length > 0) {
    return [{
      nodeId: 'start',
      nodeName: '开始节点',
      variables: (props.variables as string[]).map(name => ({ 
        name, 
        color: 'green'
      }))
    }];
  }
  
  return [];
});

// 处理变量选择，防止事件冒泡
const handleSelect = (variable: string) => {
  emit('select', variable);
};
</script>

<style scoped>
.variable-suggestions {
  position: absolute;
  animation: fadeIn 0.15s ease-out;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  transform-origin: bottom left;
  /* 向上移动自身高度，显示在光标上方 */
  transform: translateY(-80%);
  margin-top: -5px; /* 微调位置 */
}

.suggestion-item:hover {
  transform: translateX(2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-90%);
  }
  to {
    opacity: 1;
    transform: translateY(-100%);
  }
}

/* 美化滚动条 */
.variable-suggestions::-webkit-scrollbar {
  width: 6px;
}

.variable-suggestions::-webkit-scrollbar-track {
  background: transparent;
}

.variable-suggestions::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.variable-suggestions::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
