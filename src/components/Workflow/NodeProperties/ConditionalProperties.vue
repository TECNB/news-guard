<template>
  <div class="space-y-4 relative">
    <!-- IF 条件 -->
    <div class="mb-4">
      <div class="flex items-baseline">
        <div class="text-xl font-medium mr-2">IF</div>
        <div class="text-lg text-gray-500">CASE 1</div>
      </div>
      
      <div v-if="config.conditions.length > 0">
        <div v-for="(condition, index) in config.conditions" :key="index" class="mb-4 bg-gray-50 rounded-lg p-4">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center">
              <div class="bg-gray-200 py-1 px-3 rounded-md mr-2">开始</div>
              <div class="text-blue-500 cursor-pointer" @click.stop="showFieldSuggestion('condition', index, $event)">
                [x] {{ condition.field || '选择变量' }}
              </div>
            </div>
            <button 
              @click="removeCondition(index)" 
              class="text-gray-400 hover:text-red-500 transition-colors duration-200 focus:outline-none"
              title="移除此条件"
            >
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
          
          <div class="flex mt-2">
            <select 
              v-model="condition.operator"
              class="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 mr-2 w-1/3"
            >
              <option value="eq">是</option>
              <option value="in">包含</option>
              <option value="neq">不是</option>
              <option value="gt">大于</option>
              <option value="lt">小于</option>
            </select>
            
            <input 
              v-model="condition.value" 
              type="text" 
              class="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 flex-1"
            />
          </div>
        </div>
      </div>
      
      <button 
        @click="addCondition" 
        class="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none mt-2"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        添加条件
      </button>
    </div>
    
    <!-- ELIF 条件 -->
    <div v-if="config.branches.length > 0">
      <div v-for="(branch, branchIndex) in config.branches" :key="`branch-${branchIndex}`" class="mb-4">
        <div class="flex items-baseline mb-4">
          <div class="text-xl font-medium mr-4">ELIF</div>
          <div class="text-lg text-gray-500">CASE {{ branchIndex + 2 }}</div>
        </div>
        
        <div class="mb-4 bg-gray-50 rounded-lg p-4">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center">
              <div class="bg-gray-200 py-1 px-3 rounded-md mr-2">开始</div>
              <div class="text-blue-500 cursor-pointer" @click.stop="showFieldSuggestion('branch', branchIndex, $event)">
                [x] {{ branch.field || '选择变量' }}
              </div>
            </div>
            <button 
              @click="removeBranch(branchIndex)" 
              class="text-gray-400 hover:text-red-500 transition-colors duration-200 focus:outline-none"
              title="移除此分支"
            >
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
          
          <div class="flex mt-2">
            <select 
              v-model="branch.operator"
              class="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 mr-2 w-1/3"
            >
              <option value="eq">是</option>
              <option value="in">包含</option>
              <option value="neq">不是</option>
              <option value="gt">大于</option>
              <option value="lt">小于</option>
            </select>
            
            <input 
              v-model="branch.value" 
              type="text" 
              class="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 flex-1"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加 ELIF 按钮 -->
    <button 
      @click="addBranch" 
      class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium bg-gray-50 hover:bg-gray-100 focus:outline-none mb-4"
    >
      <i class="fa-solid fa-plus mr-2"></i>
      ELIF
    </button>
    
    <!-- ELSE 部分 - 如果没有条件就不显示 -->
    <div v-if="config.conditions.length > 0 || config.branches.length > 0" class="mb-4">
      <div class="flex items-baseline mb-4">
        <div class="text-xl font-medium">ELSE</div>
      </div>
      <div class="bg-gray-50 p-4 rounded-lg">
        <p class="text-gray-500 text-sm">用于定义当 if 条件不满足时应执行的逻辑。</p>
      </div>
    </div>
    
    <!-- 变量建议弹窗 -->
    <Teleport to="body">
      <VariableSuggestions
        v-if="showSuggestions"
        :position="suggestionPosition"
        @select="onSelectVariable"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import VariableSuggestions from './VariableSuggestions.vue';

interface Condition {
  field: string;
  operator: string;
  value: string | number;
}

interface ConditionalConfig {
  conditions: Condition[];
  branches: Condition[];
  elseAction: string;
}

// 默认配置 - 初始为空
const defaultConfig: ConditionalConfig = {
  conditions: [],
  branches: [],
  elseAction: ''
};

const props = defineProps<{
  modelValue: ConditionalConfig;
}>();

const emit = defineEmits(['update:modelValue']);

const config = computed({
  get: () => {
    // 确保返回的对象具有所需的所有属性
    return {
      ...defaultConfig,
      ...props.modelValue
    };
  },
  set: (value: ConditionalConfig) => emit('update:modelValue', value)
});

// 添加条件
const addCondition = () => {
  const newConfig = { ...config.value };
  newConfig.conditions.push({
    field: '',
    operator: 'eq',
    value: ''
  });
  config.value = newConfig;
};

// 移除条件
const removeCondition = (index: number) => {
  const newConfig = { ...config.value };
  newConfig.conditions.splice(index, 1);
  config.value = newConfig;
};

// 添加分支
const addBranch = () => {
  const newConfig = { ...config.value };
  newConfig.branches.push({
    field: '',
    operator: 'eq',
    value: ''
  });
  config.value = newConfig;
};

// 移除分支
const removeBranch = (index: number) => {
  const newConfig = { ...config.value };
  newConfig.branches.splice(index, 1);
  config.value = newConfig;
};

// ===== 变量选择相关逻辑 =====

// 当前激活的字段
const activeFieldType = ref<string | null>(null); // 'condition' 或 'branch'
const activeFieldIndex = ref<number | null>(null);
const showSuggestions = ref(false);
const suggestionPosition = ref({ left: '0px', top: '0px' });
let hideTimeout: any = null;

// 显示字段变量建议
const showFieldSuggestion = (fieldType: string, index: number, event: Event) => {
  // 阻止事件冒泡，防止触发document的点击事件
  event.stopPropagation();
  
  // 清除任何待执行的隐藏操作
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  
  // 计算建议框位置 - 使用fixed定位的坐标（相对于视口）
  suggestionPosition.value = {
    left: `${rect.left}px`,
    top: `${rect.top - 5}px` // 稍微上移以避免遮挡元素
  };
  
  // 记录当前激活的字段
  activeFieldType.value = fieldType;
  activeFieldIndex.value = index;
  showSuggestions.value = true;
};

// 计划隐藏建议框
const scheduleHideSuggestion = () => {
  hideTimeout = setTimeout(() => {
    showSuggestions.value = false;
  }, 150);
};

// 处理变量选择
const onSelectVariable = (variable: string) => {
  if (activeFieldType.value && activeFieldIndex.value !== null) {
    const newConfig = { ...config.value };
    
    if (activeFieldType.value === 'condition') {
      newConfig.conditions[activeFieldIndex.value].field = variable;
    } else if (activeFieldType.value === 'branch') {
      newConfig.branches[activeFieldIndex.value].field = variable;
    }
    
    config.value = newConfig;
    showSuggestions.value = false;
  }
};

// 事件处理函数
const handleClickOutside = (event: MouseEvent) => {
  // 判断点击是否在变量选择器内部
  // 如果已经点击了变量选择器内部的元素，不应该关闭
  const target = event.target as HTMLElement;
  const isSuggestionClick = target.closest('.variable-suggestions') !== null;
  
  // 如果点击的是变量选择器内部元素，不触发关闭
  if (showSuggestions.value && !isSuggestionClick) {
    scheduleHideSuggestion();
  }
};

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
  // 添加全局点击事件，处理点击外部关闭建议框
  document.addEventListener('mousedown', handleClickOutside);
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
});

// 组件卸载时清理
onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
  
  // 移除事件监听
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* TailwindCSS默认样式会应用到这些元素上 */
select, input {
  max-width: 100%;
}

/* 确保容器内的元素不会溢出 */
.flex {
  flex-wrap: wrap;
}

/* 响应式调整 */
@media (max-width: 640px) {
  select {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .flex {
    flex-direction: column;
  }
}

/* 变量选择器相关样式 */
.space-y-4 {
  position: relative;
}

/* 变量显示样式 */
.text-blue-500.cursor-pointer {
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.text-blue-500.cursor-pointer:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

/* 覆盖VariableSuggestions的样式，确保正确显示 */
:deep(.variable-suggestions) {
  position: fixed !important;
  z-index: 9999;
}
</style>
