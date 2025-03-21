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
          v-model="nodeName" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <!-- 节点特定属性 -->
      <div class="mb-6">
        <start-properties
          v-if="selectedNode.type === 'start'"
          v-model="startConfig"
        />
        <LLMProperties
          v-else-if="selectedNode.type === 'llm'"
          v-model="llmConfig"
          :variables="startNodeVariables"
          :variable-values="selectedNode.config.variableValues"
        />
        <knowledge-properties
          v-else-if="selectedNode.type === 'knowledge'"
          v-model="knowledgeConfig"
        />
        <conditional-properties
          v-else-if="selectedNode.type === 'conditional'"
          v-model="conditionalConfig"
        />
      </div>
      
      <!-- 输入/输出配置 -->
      <div class="mb-6" v-if="selectedNode.type !== 'start'">
        <IOEditor
          :model-value="ioValue"
          @update:model-value="updateIO"
        />
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
import { computed, ref, watch } from 'vue';
import { NODE_TYPES, LLMConfig, KnowledgeConfig, ConditionalConfig, StartConfig } from '../../types/workflow';
import IOEditor from './NodeProperties/IOEditor.vue';
import LLMProperties from './NodeProperties/LLMProperties.vue';
import KnowledgeProperties from './NodeProperties/KnowledgeProperties.vue';
import ConditionalProperties from './NodeProperties/ConditionalProperties.vue';
import StartProperties from './NodeProperties/StartProperties.vue';
import { useWorkflowStore } from '../../stores/workflowStore';

// 使用工作流store
const workflowStore = useWorkflowStore();

// 直接从store获取选中的节点
const selectedNode = computed(() => workflowStore.selectedNode);

// 节点名称（用于直接编辑）
const nodeName = computed({
  get: () => selectedNode.value?.name || '',
  set: (value) => {
    if (selectedNode.value) {
      // 创建节点的拷贝进行修改
      const updatedNode = { ...selectedNode.value, name: value };
      // 将修改同步到工作节点对象
      localNodeChanges.value = { ...localNodeChanges.value, name: value };
    }
  }
});

// 本地存储节点变更，只有点击保存时才更新到store
const localNodeChanges = ref<any>({});

// 监听选中节点变化，重置本地变更
watch(() => workflowStore.selectedNodeId, () => {
  localNodeChanges.value = {};
}, { immediate: true });

// 计算属性：节点类型对应的颜色
const nodeTypeColor = computed(() => {
  if (!selectedNode.value) return '';
  
  const nodeType = NODE_TYPES.find(nt => nt.type === selectedNode.value?.type);
  return nodeType ? nodeType.colorClass : 'bg-gray-500';
});

// 计算属性：获取开始节点的变量
const startNodeVariables = computed(() => {
  const startNode = workflowStore.nodes.find(
    node => node.type === 'start' || node.type === '开始'
  );
  
  if (!startNode) return [];
  return startNode.inputs.filter(input => input.trim() !== '');
});

// 计算属性：LLM配置
const llmConfig = computed<LLMConfig>({
  get: () => {
    if (!selectedNode.value || selectedNode.value.type !== 'llm') {
      return { model: 'gpt-3.5-turbo', temperature: 0.7, systemPrompt: '' };
    }
    return {
      model: selectedNode.value.config.model || 'gpt-3.5-turbo',
      temperature: selectedNode.value.config.temperature || 0.7,
      systemPrompt: selectedNode.value.config.systemPrompt || '',
      trueSystemPrompt: selectedNode.value.config.trueSystemPrompt
    };
  },
  set: (value) => {
    if (!selectedNode.value || selectedNode.value.type !== 'llm') return;
    // 保存到本地变更
    const variableValues = selectedNode.value.config.variableValues;
    localNodeChanges.value.config = { 
      ...value,
      variableValues
    };
  }
});

// 计算属性：开始节点配置
const startConfig = computed<StartConfig>({
  get: () => {
    if (!selectedNode.value || selectedNode.value.type !== 'start') {
      return { variables: [] };
    }
    return {
      variables: selectedNode.value.inputs || []
    };
  },
  set: (value) => {
    if (!selectedNode.value || selectedNode.value.type !== 'start') return;
    // 保存到本地变更
    localNodeChanges.value.inputs = value.variables;
  }
});

// 计算属性：知识库配置
const knowledgeConfig = computed<KnowledgeConfig>({
  get: () => {
    if (!selectedNode.value || selectedNode.value.type !== 'knowledge') {
      return { knowledgeBase: 'news', topK: 3 };
    }
    return {
      knowledgeBase: selectedNode.value.config.knowledgeBase || 'news',
      topK: selectedNode.value.config.topK || 3
    };
  },
  set: (value) => {
    if (!selectedNode.value || selectedNode.value.type !== 'knowledge') return;
    // 保存到本地变更
    localNodeChanges.value.config = value;
  }
});

// 计算属性：条件配置
const conditionalConfig = computed<ConditionalConfig>({
  get: () => {
    if (!selectedNode.value || selectedNode.value.type !== 'conditional') {
      return { conditionType: 'content', expression: '' };
    }
    return {
      conditionType: selectedNode.value.config.conditionType || 'content',
      expression: selectedNode.value.config.expression || ''
    };
  },
  set: (value) => {
    if (!selectedNode.value || selectedNode.value.type !== 'conditional') return;
    // 保存到本地变更
    localNodeChanges.value.config = value;
  }
});

// 计算属性：IO值
const ioValue = computed(() => {
  if (!selectedNode.value) return { inputs: [], outputs: [] };
  return {
    inputs: selectedNode.value.inputs,
    outputs: selectedNode.value.outputs
  };
});

// 更新输入输出变量
const updateIO = (value: { inputs: string[]; outputs: string[]; }) => {
  if (!selectedNode.value) return;
  // 保存到本地变更
  localNodeChanges.value.inputs = value.inputs;
  localNodeChanges.value.outputs = value.outputs;
};

// 保存更改
const saveChanges = () => {
  if (selectedNode.value && Object.keys(localNodeChanges.value).length > 0) {
    // 创建更新后的节点对象
    const updatedNode = {
      ...selectedNode.value,
      ...localNodeChanges.value
    };
    
    // 使用store更新节点
    workflowStore.updateNode(updatedNode);
    console.log('节点属性已保存');
    
    // 清空本地变更
    localNodeChanges.value = {};
  }
};

// 关闭编辑器
const closeEditor = () => {
  // 清除选中状态
  workflowStore.selectNode(null);
};
</script>

<style lang="scss" scoped>
.property-editor {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style>
