<template>
  <div class="space-y-5">
    <h4 class="text-md font-medium text-gray-700">开始节点配置</h4>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">初始变量</label>
      <div class="space-y-4">
        <div 
          v-for="(variable, index) in startConfig.variables" 
          :key="`variable-${index}`"
          class="flex items-center gap-2 relative"
        >
          <input 
            type="text" 
            v-model="startConfig.variables[index]" 
            class="flex-1 px-3 py-2 h-10 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="变量名称"
            @input="emitUpdate"
          />
          <div 
            @click="removeVariable(index)" 
            class="delete-btn flex items-center justify-center w-10 h-10 rounded-md bg-red-100 text-red-500 hover:text-white hover:bg-red-500 transition-colors duration-200 cursor-pointer"
            title="删除"
          >
            <span class="text-lg font-medium leading-none">×</span>
          </div>
        </div>
        <div class="flex">
          <div 
            @click="addVariable" 
            class="add-btn text-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
          >
            <span class="font-bold">+</span> 添加初始变量
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface StartConfig {
  variables: string[];
}

const props = defineProps<{
  modelValue: StartConfig;
}>();

const emit = defineEmits(['update:modelValue']);

const startConfig = ref<StartConfig>({ variables: [] });

watch(() => props.modelValue, (newVal) => {
  startConfig.value = { 
    variables: [...(newVal.variables || [])] 
  };
}, { immediate: true });

const emitUpdate = () => {
  emit('update:modelValue', {
    variables: startConfig.value.variables
  });
};

const addVariable = () => {
  startConfig.value.variables.push('');
  emitUpdate();
};

const removeVariable = (index: number) => {
  startConfig.value.variables.splice(index, 1);
  emitUpdate();
};
</script>

<style scoped>
/* 删除按钮悬停效果 */
.delete-btn {
  border: 1px solid #fecaca;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  border-color: #ef4444;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 添加按钮悬停效果 */
.add-btn {
  border: 1px solid #dbeafe;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-left: 0;
}

.add-btn:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
