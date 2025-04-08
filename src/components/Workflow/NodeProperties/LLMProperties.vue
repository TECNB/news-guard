<template>
  <div class="space-y-4">
    <h4 class="text-md font-medium text-gray-700">LLM 配置</h4>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
      <select 
        v-model="modelValue.model" 
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="deepseek-chat">deepseek-chat</option>
        <option value="GPT-4o">GPT-4o</option>
        <option value="Gemini 2.5 Pro">Gemini 2.5 Pro</option>
        <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
      </select>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">温度</label>
      <div class="flex items-center gap-2">
        <input 
          type="range" 
          v-model.number="modelValue.temperature" 
          min="0" 
          max="1" 
          step="0.1"
          class="w-full"
        />
        <span class="text-sm text-gray-600 w-10 text-right">{{ modelValue.temperature }}</span>
      </div>
    </div>
    
    <div class="relative">
      <label class="block text-sm font-medium text-gray-700 mb-1">系统提示词</label>
      
      <!-- 使用新的编辑器组件 -->
      <LLMPromptEditor
        v-model="modelValue.systemPrompt"
        :suggestionsEnabled="true"
        @variable-input="handleVariableInput"
      />
      
      <!-- 变量建议下拉框 -->
      <variable-suggestions
        v-if="showVariableSuggestions"
        :position="suggestionsPosition"
        :filter="currentVariableInput"
        @select="insertVariable"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import LLMPromptEditor from '@/components/Workflow/NodeProperties/LLMPromptEditor.vue';
import VariableSuggestions from '@/components/Workflow/NodeProperties/VariableSuggestions.vue';
import { useCursorPosition } from '@/utils/workflow/cursorUtils';
import type { LLMConfig } from '@/types/workflow';

// 使用 defineModel() 宏实现双向绑定，提供默认值确保不为 undefined
const modelValue = defineModel<LLMConfig>('modelValue', {
  default: () => ({
    model: '',
    temperature: 0,
    systemPrompt: '',
    trueSystemPrompt: ''
  })
});

// 变量建议相关
const showVariableSuggestions = ref(false);
const suggestionsPosition = ref({ 
  left: '0px', 
  top: '0px'
});
const { cursorPosition, getCursorPosition, updateCursorPosition } = useCursorPosition();
const currentVariableInput = ref('');

// 处理变量输入
const handleVariableInput = (data: { text: string, position: number }) => {
  // 获取用户已经输入的部分变量名
  currentVariableInput.value = data.text;
  
  // 计算建议框位置
  const textareaElement = document.querySelector('textarea.prompt-container');
  if (textareaElement) {
    // 先更新光标位置
    updateCursorPosition(textareaElement as HTMLTextAreaElement);
    const pos = getCursorPosition(textareaElement as HTMLTextAreaElement);
    
    // 设置菜单显示在光标上方
    suggestionsPosition.value = {
      left: `${pos.left}px`,
      top: `${pos.top}px`
    };
    
    showVariableSuggestions.value = true;
  } else {
    showVariableSuggestions.value = false;
  }
};

// 插入变量到提示词
const insertVariable = (variable: string) => {
  const textareaElement = document.querySelector('textarea.prompt-container');
  if (!textareaElement) {
    showVariableSuggestions.value = false;
    return;
  }
  
  const textarea = textareaElement as HTMLTextAreaElement;
  
  // 先更新光标位置
  updateCursorPosition(textarea);
  const { start, end } = cursorPosition.value;
  const text = textarea.value;
  
  // 检查光标位置是否合法 - 允许从位置0开始
  if (start === undefined || start < 0) {
    console.warn(`[LLMProperties] 无效的光标位置: ${start}`);
    showVariableSuggestions.value = false;
    return;
  }
  
  // 确保是在输入变量名的上下文中
  const lastOpenBrace = text.lastIndexOf('{', start - 1);
  const lastCloseBrace = text.lastIndexOf('}', start - 1);
  
  let newText: string;
  if (lastOpenBrace < 0 || lastOpenBrace < lastCloseBrace) {
    // 直接插入完整变量
    newText = 
      text.substring(0, start) + 
      `{${variable}}` + 
      text.substring(end || start);
  } else {
    // 替换已经开始输入的变量
    newText = 
      text.substring(0, lastOpenBrace) + 
      `{${variable}}` + 
      text.substring(end || start);
  }
  
  // 更新提示词，使用 defineModel 的方式
  modelValue.value = {
    ...modelValue.value,
    systemPrompt: newText
  };
  
  // 立即隐藏建议框
  showVariableSuggestions.value = false;
};

// 点击外部关闭变量建议框
const handleClickOutside = (event: MouseEvent) => {
  if (showVariableSuggestions.value) {
    const target = event.target as HTMLElement;
    const suggestionsElement = document.querySelector('.variable-suggestions');
    const textareaElement = document.querySelector('textarea.prompt-container');
    
    if (suggestionsElement && !suggestionsElement.contains(target) && 
        textareaElement && !textareaElement.contains(target)) {
      showVariableSuggestions.value = false;
    }
  }
};

// 更新光标位置的事件处理函数
const handleSelectionChange = () => {
  const textareaElement = document.querySelector('textarea.prompt-container');
  if (textareaElement) {
    updateCursorPosition(textareaElement as HTMLTextAreaElement);
  }
};

onMounted(() => {
  // 添加全局点击事件监听
  document.addEventListener('click', handleClickOutside);
  
  // 监听文本区域的选择变化
  const textareaElement = document.querySelector('textarea.prompt-container');
  if (textareaElement) {
    textareaElement.addEventListener('click', handleSelectionChange);
    textareaElement.addEventListener('keyup', handleSelectionChange);
    textareaElement.addEventListener('select', handleSelectionChange);
  }
});

onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('click', handleClickOutside);
  
  // 移除文本区域事件监听
  const textareaElement = document.querySelector('textarea.prompt-container');
  if (textareaElement) {
    textareaElement.removeEventListener('click', handleSelectionChange);
    textareaElement.removeEventListener('keyup', handleSelectionChange);
    textareaElement.removeEventListener('select', handleSelectionChange);
  }
});
</script>

<style scoped>

</style>
