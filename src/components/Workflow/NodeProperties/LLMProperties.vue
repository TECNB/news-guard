<template>
  <div class="space-y-4">
    <h4 class="text-md font-medium text-gray-700">LLM 配置</h4>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
      <select 
        v-model="modelConfig.model" 
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        @change="updateModelConfig"
      >
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="claude-3-opus">Claude 3 Opus</option>
        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
      </select>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">温度</label>
      <div class="flex items-center gap-2">
        <input 
          type="range" 
          v-model.number="modelConfig.temperature" 
          min="0" 
          max="1" 
          step="0.1"
          class="w-full"
          @change="updateModelConfig"
        />
        <span class="text-sm text-gray-600 w-10 text-right">{{ modelConfig.temperature }}</span>
      </div>
    </div>
    
    <div class="relative">
      <label class="block text-sm font-medium text-gray-700 mb-1">系统提示词</label>
      <textarea 
        ref="promptTextarea"
        v-model="modelConfig.systemPrompt" 
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        @input="handlePromptInput"
        @keydown="handleKeyDown"
        @change="updateModelConfig"
      ></textarea>
      
      <variable-suggestions
        v-if="showVariableSuggestions"
        :variables="variables"
        :position="suggestionsPosition"
        @select="insertVariable"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, reactive } from 'vue';
import VariableSuggestions from '@/components/Workflow/NodeProperties/VariableSuggestions.vue';
import { useCursorPosition } from '@/utils/workflow/cursorUtils';
import type { LLMConfig } from '@/types/workflow';

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
  modelValue: LLMConfig & { trueSystemPrompt?: string };
  variables: string[] | NodeVariables[];
  variableValues?: Record<string, any>;
}>();

const emit = defineEmits(['update:modelValue']);

// 使用reactive而不是computed，以便我们可以更精确地控制何时更新父组件
const modelConfig = reactive<LLMConfig>({
  model: props.modelValue.model,
  temperature: props.modelValue.temperature,
  systemPrompt: props.modelValue.systemPrompt
});

// 当props变化时更新本地状态
watch(() => props.modelValue, (newValue) => {
  modelConfig.model = newValue.model;
  modelConfig.temperature = newValue.temperature;
  modelConfig.systemPrompt = newValue.systemPrompt;
}, { deep: true });

// 更新模型配置到父组件
const updateModelConfig = () => {
  console.log('LLM属性：更新配置到父组件:', modelConfig);
  
  // 保持trueSystemPrompt值不变
  const updatedConfig = { 
    ...modelConfig,
    trueSystemPrompt: props.modelValue.trueSystemPrompt 
  };
  
  emit('update:modelValue', updatedConfig);
};

const promptTextarea = ref<HTMLTextAreaElement | null>(null);
const showVariableSuggestions = ref(false);
const suggestionsPosition = ref({ left: '0px', top: '0px' });
const { cursorPosition, getCursorPosition } = useCursorPosition();

// 监听变量值变化，处理系统提示词中的变量
watch(() => props.variableValues, (newValues) => {
  if (newValues) {
    console.log('LLM属性：接收到新的变量值', newValues);
    
    // 检查系统提示词中是否包含变量
    const systemPrompt = modelConfig.systemPrompt;
    if (systemPrompt.includes('{')) {
      // 打印变量替换前后的提示词，用于调试
      console.log('替换前的提示词:', systemPrompt);
      
      // 创建带有变量值的提示词副本（此处仅用于调试，不修改原始提示词）
      const interpolatedPrompt = interpolatePrompt(systemPrompt, newValues);
      console.log('替换后的提示词:', interpolatedPrompt);
    }
  }
}, { deep: true, immediate: true });

// 插值处理函数，将提示词中的变量替换为实际值
const interpolatePrompt = (prompt: string, values: Record<string, any>): string => {
  return prompt.replace(/\{([^}]+)\}/g, (match, varName) => {
    return values[varName] !== undefined ? values[varName] : match;
  });
};

const handlePromptInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  const text = textarea.value;
  const position = textarea.selectionStart;

  cursorPosition.value = {
    start: textarea.selectionStart,
    end: textarea.selectionEnd
  };

  if (text[position - 1] === '{') {
    const pos = getCursorPosition(textarea);
    console.log('光标位置:', pos);
    
    suggestionsPosition.value = {
      left: `${pos.left}px`,
      top: `${pos.top + 24}px`
    };
    
    console.log('显示建议框:', suggestionsPosition.value);
    showVariableSuggestions.value = true;
  } else {
    showVariableSuggestions.value = false;
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (showVariableSuggestions.value && event.key === 'Escape') {
    showVariableSuggestions.value = false;
    event.preventDefault();
    return;
  }

  if (showVariableSuggestions.value && event.key === '{') {
    event.preventDefault();
    return;
  }
};

const insertVariable = (variable: string) => {
  if (!promptTextarea.value) return;
  
  const textarea = promptTextarea.value;
  const { start, end } = cursorPosition.value;
  const text = textarea.value;
  
  const newText = 
    text.substring(0, start - 1) + 
    `{${variable}}` + 
    text.substring(end);
  
  modelConfig.systemPrompt = newText;
  showVariableSuggestions.value = false;
  
  // 确保更新回父组件
  updateModelConfig();
  
  nextTick(() => {
    if (promptTextarea.value) {
      const newCursorPosition = start - 1 + variable.length + 2;
      promptTextarea.value.focus();
      promptTextarea.value.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  });
};
</script>
