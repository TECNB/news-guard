<template>
  <div class="space-y-5">    
    <!-- 输入变量区域 - 只对非LLM和非search节点显示 -->
    <div v-if="!isSpecialNode">
      <label class="block text-sm font-medium text-gray-700 mb-1">输入变量</label>
      <div class="space-y-2">
        <div 
          v-for="(input, index) in localIO.inputs" 
          :key="`input-${index}`"
          class="flex items-center gap-2"
        >
          <input 
            type="text" 
            v-model="localIO.inputs[index]" 
            class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="变量名称"
            @input="updateModelValue"
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
    
    <!-- LLM节点固定输出格式 -->
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
    
    <!-- 搜索节点固定输出格式 -->
    <div v-else-if="isSearchNode">
      <label class="block text-sm font-medium text-gray-700 mb-1">输出变量</label>
      <div class="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div class="flex items-center">
          <span class="text-blue-500 w-5 text-center mr-2">
            <i class="fa-solid fa-bracket-curly text-xs"></i>
          </span>
          <span class="text-sm font-medium">results</span>
          <span class="text-xs text-gray-500 ml-2">(Array) 搜索结果</span>
        </div>
      </div>
    </div>
    
    <!-- 普通节点允许自定义输出变量 -->
    <div v-else>
      <label class="block text-sm font-medium text-gray-700 mb-1">输出变量</label>
      <div class="space-y-2">
        <div 
          v-for="(output, index) in localIO.outputs" 
          :key="`output-${index}`"
          class="flex items-center gap-2"
        >
          <input 
            type="text" 
            v-model="localIO.outputs[index]" 
            class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="变量名称"
            @input="updateModelValue"
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

// 本地IO状态，用于修改
const localIO = ref<IOConfig>({
  inputs: [...props.modelValue.inputs],
  outputs: [...props.modelValue.outputs],
  nodeType: props.modelValue.nodeType
});

// 当props变化时同步到本地状态
watch(() => props.modelValue, (newValue) => {
  localIO.value = {
    inputs: [...newValue.inputs],
    outputs: [...newValue.outputs],
    nodeType: newValue.nodeType
  };
}, { deep: true });

// 判断是否为LLM节点
const isLLMNode = computed(() => props.modelValue.nodeType === 'llm');

// 判断是否为搜索节点
const isSearchNode = computed(() => props.modelValue.nodeType === 'search');

// 判断是否是特殊处理的节点（LLM或Search）
const isSpecialNode = computed(() => isLLMNode.value || isSearchNode.value);

// 更新父组件的值
const updateModelValue = () => {
  emit('update:modelValue', {
    inputs: [...localIO.value.inputs],
    outputs: [...localIO.value.outputs],
    nodeType: localIO.value.nodeType
  });
};

const addInput = () => {
  // 如果是特殊节点，不允许添加输入
  if (isSpecialNode.value) return;
  
  localIO.value.inputs.push('');
  updateModelValue();
};

const removeInput = (index: number) => {
  // 如果是特殊节点，不允许删除输入
  if (isSpecialNode.value) return;
  
  localIO.value.inputs.splice(index, 1);
  updateModelValue();
};

const addOutput = () => {
  // 如果是特殊节点，不允许添加输出
  if (isSpecialNode.value) return;
  
  localIO.value.outputs.push('');
  updateModelValue();
};

const removeOutput = (index: number) => {
  // 如果是特殊节点，不允许删除输出
  if (isSpecialNode.value) return;
  
  localIO.value.outputs.splice(index, 1);
  updateModelValue();
};
</script>
