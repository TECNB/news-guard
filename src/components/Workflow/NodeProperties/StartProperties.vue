<template>
  <div class="space-y-4">
    <h4 class="text-md font-medium text-gray-700">开始节点配置</h4>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">初始变量</label>
      <div class="space-y-2">
        <div 
          v-for="(variable, index) in startConfig.variables" 
          :key="`variable-${index}`"
          class="flex items-center gap-2"
        >
          <input 
            type="text" 
            v-model="startConfig.variables[index]" 
            class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="变量名称"
            @input="emitUpdate"
          />
          <button 
            @click="removeVariable(index)" 
            class="text-red-500 hover:text-red-700"
          >
            <span class="text-xl">×</span>
          </button>
        </div>
        <button 
          @click="addVariable" 
          class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <span class="mr-1">+</span> 添加初始变量
        </button>
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
