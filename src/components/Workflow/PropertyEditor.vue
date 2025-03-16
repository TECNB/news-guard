<template>
  <div class="property-editor w-full h-full bg-white border-l border-gray-200 overflow-y-auto">
    <div v-if="selectedNode" class="p-4">
      <!-- 标题区域和关闭按钮 -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-800">节点属性</h3>
        <button 
          @click="closeEditor" 
          class="text-gray-500 hover:text-gray-700 p-1"
          title="关闭"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <!-- 节点类型信息 -->
      <div class="mb-6 pb-4 border-b border-gray-200">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-3 h-3 rounded-full" :class="nodeTypeColor"></span>
          <span class="font-medium text-gray-700">{{ selectedNode.name }}</span>
        </div>
        <div class="text-sm text-gray-500">类型: {{ selectedNode.type }}</div>
      </div>
      
      <!-- 通用属性 -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
        <input 
          type="text" 
          v-model="selectedNode.name" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <!-- 节点特定属性 -->
      <div class="mb-6">
        <div v-if="selectedNode.type === 'llm'" class="space-y-4">
          <h4 class="text-md font-medium text-gray-700">LLM 配置</h4>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">模型</label>
            <select 
              v-model="selectedNode.config.model" 
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
                v-model.number="selectedNode.config.temperature" 
                min="0" 
                max="1" 
                step="0.1"
                class="w-full"
              />
              <span class="text-sm text-gray-600 w-10 text-right">{{ selectedNode.config.temperature }}</span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">系统提示词</label>
            <textarea 
              v-model="selectedNode.config.systemPrompt" 
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
        </div>
        
        <div v-else-if="selectedNode.type === 'knowledge'" class="space-y-4">
          <h4 class="text-md font-medium text-gray-700">知识库配置</h4>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">知识库选择</label>
            <select 
              v-model="selectedNode.config.knowledgeBase" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="news">新闻数据库</option>
              <option value="facts">事实库</option>
              <option value="custom">自定义知识库</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">检索结果数量</label>
            <input 
              type="number" 
              v-model.number="selectedNode.config.topK" 
              min="1" 
              max="10"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div v-else-if="selectedNode.type === 'conditional'" class="space-y-4">
          <h4 class="text-md font-medium text-gray-700">条件配置</h4>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">条件类型</label>
            <select 
              v-model="selectedNode.config.conditionType" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="content">内容匹配</option>
              <option value="sentiment">情感分析</option>
              <option value="category">分类结果</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">条件表达式</label>
            <textarea 
              v-model="selectedNode.config.expression" 
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- 输入/输出配置 -->
      <div class="mb-6">
        <h4 class="text-md font-medium text-gray-700 mb-2">输入/输出</h4>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">输入变量</label>
          <div class="space-y-2">
            <div 
              v-for="(input, index) in selectedNode.inputs" 
              :key="`input-${index}`"
              class="flex items-center gap-2"
            >
              <input 
                type="text" 
                v-model="selectedNode.inputs[index]" 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                placeholder="变量名称"
              />
              <button 
                @click="removeInput(index)" 
                class="text-red-500 hover:text-red-700"
              >
                <span class="text-xl">×</span>
              </button>
            </div>
            <button 
              @click="addInput" 
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span class="mr-1">+</span> 添加输入变量
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">输出变量</label>
          <div class="space-y-2">
            <div 
              v-for="(output, index) in selectedNode.outputs" 
              :key="`output-${index}`"
              class="flex items-center gap-2"
            >
              <input 
                type="text" 
                v-model="selectedNode.outputs[index]" 
                class="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                placeholder="变量名称"
              />
              <button 
                @click="removeOutput(index)" 
                class="text-red-500 hover:text-red-700"
              >
                <span class="text-xl">×</span>
              </button>
            </div>
            <button 
              @click="addOutput" 
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span class="mr-1">+</span> 添加输出变量
            </button>
          </div>
        </div>
      </div>
      
      <!-- 保存按钮 -->
      <div class="flex justify-end mt-6">
        <button 
          @click="saveChanges" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          保存更改
        </button>
      </div>
    </div>
    
    <div v-else class="h-full flex items-center justify-center text-gray-400">
      <div class="text-center">
        <i class="fa-solid fa-flow-cascade text-5xl mb-3"></i>
        <p>选择一个节点来查看或编辑属性</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { Node, NodeConfig, NODE_TYPES } from '../../types/workflow';

// 接收选中的节点
const props = defineProps<{
  node: Node | null;
}>();

// 定义事件
const emit = defineEmits(['update:node', 'save', 'close']);

// 计算属性：节点类型对应的颜色
const nodeTypeColor = computed(() => {
  if (!props.node) return '';
  
  const nodeType = NODE_TYPES.find(nt => nt.type === props.node?.type);
  return nodeType ? nodeType.colorClass : 'bg-gray-500';
});

// 本地状态，用于编辑
const selectedNode = ref<Node | null>(null);

// 当传入的节点变化时，更新本地状态
watch(() => props.node, (newNode) => {
  if (newNode) {
    // 深拷贝节点对象，避免直接修改props
    selectedNode.value = JSON.parse(JSON.stringify(newNode));
  } else {
    selectedNode.value = null;
  }
}, { immediate: true });

// 添加输入变量
const addInput = () => {
  if (selectedNode.value) {
    selectedNode.value.inputs.push('');
  }
};

// 移除输入变量
const removeInput = (index: number) => {
  if (selectedNode.value) {
    selectedNode.value.inputs.splice(index, 1);
  }
};

// 添加输出变量
const addOutput = () => {
  if (selectedNode.value) {
    selectedNode.value.outputs.push('');
  }
};

// 移除输出变量
const removeOutput = (index: number) => {
  if (selectedNode.value) {
    selectedNode.value.outputs.splice(index, 1);
  }
};

// 保存更改
const saveChanges = () => {
  if (selectedNode.value) {
    emit('update:node', selectedNode.value);
    emit('save', selectedNode.value);
  }
};

// 关闭编辑器
const closeEditor = () => {
  emit('close');
};
</script>

<style lang="scss" scoped>
.property-editor {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style> 