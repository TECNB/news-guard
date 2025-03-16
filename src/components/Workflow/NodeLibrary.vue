<template>
  <div 
    class="node-library fixed bg-white shadow-lg rounded-md py-2 z-10"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <div 
      v-for="nodeType in nodeTypes" 
      :key="nodeType.type"
      class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
      @click="$emit('select-node-type', nodeType)"
    >
      <span class="w-4 h-4 mr-2 rounded-full" :class="nodeType.colorClass"></span>
      <i class="fa-solid" :class="getNodeIcon(nodeType.type)" v-if="getNodeIcon(nodeType.type)"></i>
      {{ nodeType.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { getNodeIcon } from '../../utils/workflow/menuUtils';

// 接收属性
const props = defineProps<{
  x: number;
  y: number;
  nodeTypes: { type: string; name: string; colorClass: string }[];
}>();

// 定义事件
const emit = defineEmits(['select-node-type']);
</script>

<style lang="scss" scoped>
.node-library {
  min-width: 200px;
}
</style> 