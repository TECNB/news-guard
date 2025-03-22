<template>
  <div class="space-y-4">
    <h4 class="text-md font-medium text-gray-700">LLM 配置</h4>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
      <select 
        v-model="modelValue.model" 
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        :variables="variables"
        :suggestionsEnabled="true"
        @variable-input="handleVariableInput"
      />
      
      <!-- 变量建议下拉框 -->
      <variable-suggestions
        v-if="showVariableSuggestions"
        :variables="filteredVariables"
        :position="suggestionsPosition"
        @select="insertVariable"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import LLMPromptEditor from '@/components/Workflow/NodeProperties/LLMPromptEditor.vue';
import VariableSuggestions from '@/components/Workflow/NodeProperties/VariableSuggestions.vue';
import { useCursorPosition } from '@/utils/workflow/cursorUtils';
import { getAllValidVariableNames, type NodeVariables } from '@/utils/workflow/editor/variableHighlighter';
import type { LLMConfig } from '@/types/workflow';
import { useWorkflowStore } from '@/stores/workflowStore';

// 使用 defineModel() 宏实现双向绑定，提供默认值确保不为 undefined
const modelValue = defineModel<LLMConfig>('modelValue', {
  default: () => ({
    model: '',
    temperature: 0,
    systemPrompt: '',
    trueSystemPrompt: ''
  })
});

// 使用工作流 store
const workflowStore = useWorkflowStore();

// 从 store 获取当前选中节点的变量
const variables = computed(() => {
  if (!workflowStore.selectedNodeId) return [];
  return workflowStore.getNodeAvailableVariables(workflowStore.selectedNodeId);
});

// 变量建议相关
const showVariableSuggestions = ref(false);
const suggestionsPosition = ref({ 
  left: '0px', 
  top: '0px'
});
const { cursorPosition, getCursorPosition, updateCursorPosition } = useCursorPosition();
const filteredVariables = ref<string[] | NodeVariables[]>([]);

// 处理变量输入
const handleVariableInput = (data: { text: string, position: number }) => {
  // 获取用户已经输入的部分变量名
  const partialVar = data.text;
  
  // 更新过滤后的变量列表
  if (!variables.value || !Array.isArray(variables.value) || variables.value.length === 0) {
    // 无变量的情况
    filteredVariables.value = [];
    showVariableSuggestions.value = false;
    return;
  }
  
  if (typeof variables.value[0] === 'string') {
    // 如果是字符串数组
    const allVars = variables.value as string[];
    filteredVariables.value = allVars.filter(v => 
      v.toLowerCase().includes(partialVar.toLowerCase())
    );
  } else {
    // 如果是节点变量数组
    const nodeVars = variables.value as NodeVariables[];
    filteredVariables.value = nodeVars.map(nodeVar => {
      // 复制节点信息
      const filtered: NodeVariables = {
        nodeId: nodeVar.nodeId,
        nodeName: nodeVar.nodeName,
        variables: nodeVar.variables.filter(v =>
          v.name.toLowerCase().includes(partialVar.toLowerCase())
        )
      };
      return filtered;
    }).filter(nodeVar => nodeVar.variables.length > 0); // 只保留有变量的节点
  }
  
  if (Array.isArray(filteredVariables.value) && filteredVariables.value.length > 0) {
    // 计算建议框位置 - 这里可能需要修改为使用编辑器组件提供的方法
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
    }
    
    console.log('显示建议框:', suggestionsPosition.value);
    console.log('过滤后的变量:', filteredVariables.value);
    
    showVariableSuggestions.value = true;
  } else {
    showVariableSuggestions.value = false;
  }
};

// 插入变量到提示词
const insertVariable = (variable: string) => {
  // 确保插入的是有效变量
  const allValidVariables = getAllValidVariableNames(variables.value);
  if (!allValidVariables.includes(variable)) {
    console.warn(`[LLMProperties] 尝试插入无效变量: ${variable}`);
    showVariableSuggestions.value = false;
    return;
  }
  
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
