<template>
  <div class="prompt-outer-container">
    <!-- 显示模式 - 自定义编辑器 -->
    <div 
      v-if="!isEditing"
      ref="displayDiv"
      class="prompt-container prompt-display-mode"
      @click="startEditing($event)"
    >
      <div class="prompt-content">
        <span v-for="(part, index) in highlightedParts" :key="index">
          <span v-if="part.type === 'variable'" class="variable-text">{{ part.text }}</span>
          <span v-else class="normal-text">{{ part.text }}</span>
        </span>
        <!-- 确保显示空内容时有正确高度 -->
        <span v-if="!modelValue" class="text-gray-400">&nbsp;</span>
      </div>
    </div>
    
    <!-- 编辑模式 - 使用textarea -->
    <textarea 
      v-else
      ref="promptTextarea"
      :value="modelValue"
      class="prompt-container"
      @input="handleInput"
      @keydown="handleKeyDown"
      @blur="stopEditing"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue';
import { useCursorPosition } from '@/utils/workflow/cursorUtils';
import { adjustTextareaHeight, getTextPositionFromClick } from '@/utils/workflow/editor/textareaUtils';
import { parseTextVariables, type NodeVariables } from '@/utils/workflow/editor/variableHighlighter';
import { useWorkflowStore } from '@/stores/workflowStore';

// 使用 defineModel() 宏实现双向绑定，提供默认值确保不为 undefined
const modelValue = defineModel<string>('modelValue', { 
  default: '' 
});

const props = defineProps<{
  variables?: string[] | NodeVariables[];
  suggestionsEnabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'variable-input', value: { text: string, position: number }): void;
}>();

// 获取工作流存储
const workflowStore = useWorkflowStore();

// 获取有效的变量列表
const effectiveVariables = computed(() => {
  // 如果提供了外部变量，则优先使用
  if (props.variables) {
    return props.variables;
  }
  
  // 否则从workflowStore获取
  const selectedNodeId = workflowStore.selectedNodeId;
  if (!selectedNodeId) return [];
  
  return workflowStore.getNodeAvailableVariables(selectedNodeId);
});

// 引用DOM元素
const promptTextarea = ref<HTMLTextAreaElement | null>(null);
const displayDiv = ref<HTMLDivElement | null>(null);

// 管理编辑状态
const isEditing = ref(false);

// 存储点击位置
const clickPosition = ref<number | null>(null);

// 解析文本中的变量，用于高亮显示
const highlightedParts = computed(() => {
  return parseTextVariables(modelValue.value, effectiveVariables.value);
});

// 光标位置相关
const { cursorPosition, getCursorPosition } = useCursorPosition();

// 编辑控制函数
const startEditing = (event?: MouseEvent) => {
  // 在编辑模式下，记录滚动位置以保持一致性
  const scrollTop = displayDiv.value?.scrollTop || 0;
  
  // 获取显示模式的高度，用于设置textarea的初始高度
  const displayHeight = displayDiv.value?.clientHeight || 0;

  // 如果有点击事件，计算点击位置对应的文本位置
  if (event && displayDiv.value) {
    // 计算点击位置在文本中的索引
    clickPosition.value = getTextPositionFromClick(event, displayDiv.value, modelValue.value);
  } else {
    clickPosition.value = null;
  }
  
  // 先设置编辑状态再进行DOM操作
  isEditing.value = true;
  
  nextTick(() => {
    if (promptTextarea.value) {
      // 先设置初始高度，避免闪烁为最小高度
      if (displayHeight > 0) {
        promptTextarea.value.style.height = `${displayHeight}px`;
      }
      
      // 然后设置焦点
      promptTextarea.value.focus();
      
      // 设置光标位置（如果有）
      if (clickPosition.value !== null) {
        promptTextarea.value.setSelectionRange(clickPosition.value, clickPosition.value);
      }
      
      // 恢复滚动位置
      promptTextarea.value.scrollTop = scrollTop;
      
      // 最后调整为实际内容高度
      adjustTextareaHeight(promptTextarea.value);
    }
  });
};

const stopEditing = () => {
  // 在退出编辑状态前记录滚动位置
  const scrollTop = promptTextarea.value?.scrollTop || 0;
  
  // 切换到显示模式
  isEditing.value = false;
  
  // 触发change事件
  emit('change', modelValue.value);
  
  // 等待DOM更新后恢复滚动位置
  nextTick(() => {
    if (displayDiv.value && scrollTop > 0) {
      displayDiv.value.scrollTop = scrollTop;
    }
  });
};

// 处理用户输入
const handleInput = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  const text = textarea.value;
  const position = textarea.selectionStart;

  // 更新模型值
  modelValue.value = text;

  // 记录光标位置
  cursorPosition.value = {
    start: textarea.selectionStart,
    end: textarea.selectionEnd
  };

  // 调整textarea高度
  adjustTextareaHeight(textarea);

  // 变量输入检测 (如果启用了建议功能)
  if (props.suggestionsEnabled) {
    // 检测用户是否正在输入变量名（输入了"{"之后）
    const lastOpenBrace = text.lastIndexOf('{', position - 1);
    const lastCloseBrace = text.lastIndexOf('}', position - 1);
    
    // 如果最后一个"{"在最后一个"}"之后，说明用户正在输入变量
    if (lastOpenBrace > lastCloseBrace && lastOpenBrace < position) {
      // 获取用户已经输入的部分变量名
      const partialVar = text.substring(lastOpenBrace + 1, position);
      
      // 通知父组件处理变量输入
      emit('variable-input', {
        text: partialVar,
        position: position
      });
    }
  }
};

// 处理按键事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 可以添加键盘快捷键处理逻辑
};

// 在开始编辑时调整textarea高度
watch(isEditing, (newValue) => {
  if (newValue && promptTextarea.value) {
    nextTick(() => {
      adjustTextareaHeight(promptTextarea.value as HTMLTextAreaElement);
    });
  }
});

onMounted(() => {
  isEditing.value = false;
});
</script>

<style scoped>
/* 外部容器 - 用于保持位置和尺寸一致 */
.prompt-outer-container {
  position: relative;
  width: 100%;
  height: auto;
}

/* 统一的提示词容器样式 */
.prompt-container {
  width: 100%;
  min-height: 100px; /* 最小高度100px */
  max-height: 400px; /* 最大高度400px */
  
  height: auto; /* 自动调整高度 */
  padding: 0.75rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #374151;
  font-family: inherit;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  background-color: white;
  outline: none;
  transition: all 0.2s;
  cursor: text;
  overflow-y: auto; /* 垂直滚动 */
  overflow-x: hidden; /* 水平不滚动 */
  white-space: pre-wrap;
  word-wrap: break-word;
  resize: vertical;
}

/* 确保textarea和显示模式字体完全一致 */
.prompt-container, .normal-text {
  font-size: 0.875rem;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-weight: normal;
  color: #374151;
  letter-spacing: normal;
  word-spacing: normal;
}

/* 显示模式的内容容器 */
.prompt-content {
  min-height: 100%;
  width: 100%;
  height: auto; /* 确保内容容器也能自动增高 */
}

/* 确保显示模式与textarea渲染一致 */
.prompt-display-mode {
  /* 继承textarea的所有文本相关样式 */
  tab-size: 4;
  text-rendering: auto;
  text-transform: none;
  text-indent: 0px;
  text-shadow: none;
  text-align: start;
  /* 确保空格和换行处理方式一致 */
  white-space: pre-wrap;
  overflow-wrap: break-word;
  display: block;
  /* 确保滚动条行为一致 */
  overflow-y: auto;
  overflow-x: hidden;
  height: auto; /* 自动高度 */
}

/* 自定义滚动条样式以保持一致性 */
.prompt-container::-webkit-scrollbar, 
.prompt-display-mode::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.prompt-container::-webkit-scrollbar-thumb, 
.prompt-display-mode::-webkit-scrollbar-thumb {
  background: #CBD5E0;
  border-radius: 4px;
}

.prompt-container::-webkit-scrollbar-track, 
.prompt-display-mode::-webkit-scrollbar-track {
  background: transparent;
}

.prompt-container:focus-visible, 
.prompt-container:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3B82F6;
  border-color: #3B82F6;
}

/* 变量文本样式 */
.variable-text {
  color: #3B82F6;
  background-color: #EFF6FF;
  font-weight: 600;
  border-radius: 4px;
  padding: 0 2px;
  border: 1px solid #BFDBFE;
  /* 确保变量文本与普通文本在行高上对齐 */
  line-height: inherit;
  display: inline-block;
  vertical-align: baseline;
}

/* 保证普通文本与textarea一致 */
.normal-text {
  /* 这里的样式将与textarea的默认文本样式完全匹配 */
  white-space: pre-wrap;
  word-break: normal;
  display: inline;
}
</style> 