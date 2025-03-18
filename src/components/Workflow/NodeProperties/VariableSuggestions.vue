<template>
  <div 
    class="variable-suggestions absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 max-h-60 overflow-y-auto"
    :style="position"
  >
    <div 
      v-for="variable in variables" 
      :key="variable"
      class="suggestion-item p-2 hover:bg-blue-50 cursor-pointer rounded flex items-center gap-2 text-sm"
      @click="$emit('select', variable)"
    >
      <span class="text-blue-500 w-5 text-center">
        <i class="fa-solid fa-bracket-curly text-xs"></i>
      </span>
      <span>{{ variable }}</span>
    </div>
    <div v-if="variables.length === 0" class="p-2 text-gray-500 text-sm">
      没有可用的变量
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variables: string[];
  position: {
    left: string;
    top: string;
  };
}>();

defineEmits<{
  (e: 'select', variable: string): void;
}>();
</script>

<style scoped>
.variable-suggestions {
  width: 200px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.suggestion-item {
  transition: all 0.15s ease;
}

.suggestion-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
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
