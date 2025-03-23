<template>
  <div class="space-y-5">
    <h4 class="text-md font-medium text-gray-700">输出配置</h4>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">输出变量</label>
      <div class="space-y-2">
        <div 
          v-for="(output, index) in modelValue" 
          :key="`output-${index}`"
          class="flex items-center gap-2 relative"
        >
          <input 
            type="text" 
            :value="output"
            @input="updateOutput(index, $event)"
            @focus="showSuggestion(index, $event)"
            @click="showSuggestion(index, $event)"
            @blur="scheduleHideSuggestion"
            class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
            placeholder="变量名称"
            ref="inputRefs"
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
    
    <!-- 变量建议弹窗 (移到外层以避免定位问题) -->
    <VariableSuggestions
      v-if="activeIndex !== null && showSuggestions"
      :position="suggestionPosition"
      @select="onSelectVariable"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted,Ref } from 'vue';
import VariableSuggestions from './VariableSuggestions.vue';

// 使用defineModel创建双向绑定
const modelValue = defineModel<string[]>({ default: () => [] });

// 用于变量建议功能
const inputRefs = ref<HTMLInputElement[]>([]);
const activeIndex = ref<number | null>(null);
const showSuggestions = ref(false);
const suggestionPosition = ref({ left: '0px', top: '0px' });
let hideTimeout: any = null;

// 添加输出变量
const addOutput = () => {
  // 创建新数组以确保响应性
  modelValue.value = [...modelValue.value, ''];
  console.log('modelValue.value:', modelValue.value); 
  // 延迟执行获取DOM，确保模板已更新
  setTimeout(() => {
    const lastIndex = modelValue.value.length - 1;
    if (inputRefs.value[lastIndex]) {
      inputRefs.value[lastIndex].focus();
    }
  }, 0);
};

// 删除输出变量
const removeOutput = (index: number) => {
  const newOutputs = [...modelValue.value];
  newOutputs.splice(index, 1);
  modelValue.value = newOutputs;
};

// 更新指定索引的输出变量
const updateOutput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const newOutputs = [...modelValue.value];
  newOutputs[index] = input.value;
  modelValue.value = newOutputs;
};

// 显示变量建议
const showSuggestion = (index: number, event: Event) => {
  // 清除任何待执行的隐藏操作
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  
  const input = event.target as HTMLInputElement;
  const rect = input.getBoundingClientRect();
  
  // 计算建议框位置 - 使用固定定位，不需要考虑页面滚动
  // 建议框定位在输入框上方
  suggestionPosition.value = {
    left: `${rect.left}px`,
    top: `${rect.top - 20}px` // 在输入框顶部上方10px
  };
  
  // 显示建议
  activeIndex.value = index;
  showSuggestions.value = true;
};

// 计划隐藏建议框（延迟执行，避免点击选择变量时过早隐藏）
const scheduleHideSuggestion = () => {
  hideTimeout = setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
};

// 选择变量,modelValue.value为
const onSelectVariable = (variable: string) => {
  if (activeIndex.value !== null) {
    const newOutputs = [...modelValue.value];
    console.log('modelValue.value:', newOutputs);
    newOutputs[activeIndex.value] = variable;
    modelValue.value = newOutputs;
    console.log('选择变量:', variable);
    showSuggestions.value = false;
  }
};

// 事件处理函数
const handleResize = () => {
  showSuggestions.value = false;
};

const handleScroll = () => {
  if (showSuggestions.value) {
    scheduleHideSuggestion();
  }
};

// 组件挂载时
onMounted(() => {
  // 添加窗口大小变化监听，当窗口大小变化时关闭建议框
  window.addEventListener('resize', handleResize);
  
  // 添加滚动监听，当页面滚动时关闭建议框
  window.addEventListener('scroll', handleScroll);
});

// 组件卸载时清理
onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.relative {
  position: relative;
}

/* 确保父容器相对定位，作为定位上下文 */
.space-y-5 {
  position: relative;
}

/* 输入框样式优化 */
input {
  z-index: 1;
  position: relative;
}

/* 确保建议框是最顶层 */
:deep(.variable-suggestions) {
  z-index: 1000;
  position: fixed !important;
  transform: translateY(-100%); /* 将建议框向上移动自身高度，使其位于输入框上方 */
  margin-top: -5px; /* 微调位置 */
}
</style> 