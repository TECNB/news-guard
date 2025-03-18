<template>
  <div class="space-y-4">
    <h4 class="text-md font-medium text-gray-700">输入/输出配置</h4>
    
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">输入变量</label>
      <div class="space-y-2">
        <div 
          v-for="(input, index) in io.inputs" 
          :key="`input-${index}`"
          class="flex items-center gap-2"
        >
          <input 
            type="text" 
            v-model="io.inputs[index]" 
            class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="变量名称"
            @input="emitUpdate"
          />
          <button 
            @click="removeInput(index)" 
            class="text-red-500 hover:text-red-700"
            title="删除"
          >
            <span class="text-xl">×</span>
          </button>
        </div>
        <button 
          @click="addInput" 
          class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>+</span> 添加输入变量
        </button>
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">输出变量</label>
      <div class="space-y-2">
        <div 
          v-for="(output, index) in io.outputs" 
          :key="`output-${index}`"
          class="flex items-center gap-2"
        >
          <input 
            type="text" 
            v-model="io.outputs[index]" 
            class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="变量名称"
            @input="emitUpdate"
          />
          <button 
            @click="removeOutput(index)" 
            class="text-red-500 hover:text-red-700"
            title="删除"
          >
            <span class="text-xl">×</span>
          </button>
        </div>
        <button 
          @click="addOutput" 
          class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>+</span> 添加输出变量
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface IOConfig {
  inputs: string[];
  outputs: string[];
}

const props = defineProps<{
  modelValue: IOConfig;
}>();

const emit = defineEmits(['update:modelValue']);

const io = ref<IOConfig>({
  inputs: [],
  outputs: []
});

watch(() => props.modelValue, (newValue) => {
  io.value = {
    inputs: [...newValue.inputs],
    outputs: [...newValue.outputs]
  };
}, { immediate: true });

const emitUpdate = () => {
  emit('update:modelValue', {
    inputs: [...io.value.inputs],
    outputs: [...io.value.outputs]
  });
};

const addInput = () => {
  io.value.inputs.push('');
  emitUpdate();
};

const removeInput = (index: number) => {
  io.value.inputs.splice(index, 1);
  emitUpdate();
};

const addOutput = () => {
  io.value.outputs.push('');
  emitUpdate();
};

const removeOutput = (index: number) => {
  io.value.outputs.splice(index, 1);
  emitUpdate();
};
</script>
