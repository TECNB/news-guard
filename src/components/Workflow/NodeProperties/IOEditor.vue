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
    
    <!-- LLM节点显示固定输出格式 -->
    <div v-if="isLLMNode">
      <label class="block text-sm font-medium text-gray-700 mb-1">输出变量</label>
      <div class="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div class="flex items-center">
          <span class="text-blue-500 w-5 text-center mr-2">
            <i class="fa-solid fa-bracket-curly text-xs"></i>
          </span>
          <span class="text-sm font-medium">text</span>
          <span class="text-xs text-gray-500 ml-2">(String) 生成内容</span>
        </div>
      </div>
    </div>
    
    <!-- 非LLM节点允许自定义输出变量 -->
    <div v-else>
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
import { ref, watch, computed } from 'vue';

interface IOConfig {
  inputs: string[];
  outputs: string[];
  nodeType?: string;
}

const props = defineProps<{
  modelValue: IOConfig;
}>();

const emit = defineEmits(['update:modelValue']);

const io = ref<IOConfig>({
  inputs: [],
  outputs: []
});

// 判断是否为LLM节点
const isLLMNode = computed(() => props.modelValue.nodeType === 'llm');

watch(() => props.modelValue, (newValue) => {
  io.value = {
    inputs: [...newValue.inputs],
    outputs: [...newValue.outputs],
    nodeType: newValue.nodeType
  };
  
  // 如果是LLM节点，确保其输出为["text"]
  if (isLLMNode.value && (!io.value.outputs.includes('text') || io.value.outputs.length !== 1)) {
    io.value.outputs = ['text'];
    emitUpdate();
  }
}, { immediate: true });

const emitUpdate = () => {
  emit('update:modelValue', {
    inputs: [...io.value.inputs],
    outputs: [...io.value.outputs],
    nodeType: io.value.nodeType
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
  // 如果是LLM节点，不允许添加输出
  if (isLLMNode.value) return;
  
  io.value.outputs.push('');
  emitUpdate();
};

const removeOutput = (index: number) => {
  // 如果是LLM节点，不允许删除输出
  if (isLLMNode.value) return;
  
  io.value.outputs.splice(index, 1);
  emitUpdate();
};
</script>
