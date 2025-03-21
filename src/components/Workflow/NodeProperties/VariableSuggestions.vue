<template>
  <div 
    class="variable-suggestions absolute z-100 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 max-h-60 overflow-y-auto w-[280px] max-h-[250px]"
    :style="position"
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
        @click="$emit('select', variable.name)"
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

const props = defineProps<{
  variables: string[] | NodeVariables[];
  position: {
    left: string;
    top: string;
  };
}>();

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

defineEmits<{
  (e: 'select', variable: string): void;
}>();
</script>

<style scoped>
.variable-suggestions {
  animation: fadeIn 0.2s ease-out;
}

.suggestion-item:hover {
  transform: translateX(2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
