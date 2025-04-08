<template>
  <div class="property-editor w-full h-full bg-white border-l border-gray-200 overflow-y-auto">
    <div v-if="selectedNode" class="p-4">
      <!-- 标题区域和关闭按钮 -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-800">节点属性</h3>
        <div 
          @click="closeEditor" 
          class="text-gray-500 hover:text-gray-700 p-1"
          title="关闭"
        >
          <i class="fa-solid fa-xmark"></i>
        </div>
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
        />
        <knowledge-properties
          v-else-if="selectedNode.type === 'knowledge'"
          v-model="knowledgeConfig"
        />
        <conditional-properties
          v-else-if="selectedNode.type === 'conditional'"
          v-model="conditionalConfig"
        />
        <search-properties
          v-else-if="selectedNode.type === 'search'"
          v-model="searchConfig"
        />
      </div>
      
      <!-- 输入/输出配置 -->
      <div class="mb-6" v-if="selectedNode.type !== 'start' && selectedNode.type !== 'end' && selectedNode.type !== 'conditional'">
        <IOEditor
          v-model="ioValue"
        />
      </div>
      
      <div class="mb-6" v-if="selectedNode.type === 'end'">
        <OutputProperties
          v-model="outputVariables"
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
import { NODE_TYPES, LLMConfig, KnowledgeConfig, StartConfig, SearchConfig } from '../../types/workflow';
import IOEditor from './NodeProperties/IOEditor.vue';
import LLMProperties from './NodeProperties/LLMProperties.vue';
import KnowledgeProperties from './NodeProperties/KnowledgeProperties.vue';
import ConditionalProperties from './NodeProperties/ConditionalProperties.vue';
import StartProperties from './NodeProperties/StartProperties.vue';
import { useWorkflowStore } from '../../stores/workflowStore';
import OutputProperties from './NodeProperties/OutputProperties.vue';
import SearchProperties from './NodeProperties/SearchProperties.vue';

// 使用工作流store
const workflowStore = useWorkflowStore();

// 直接从store获取选中的节点
const selectedNode = computed(() => workflowStore.selectedNode);

// 节点名称（用于直接编辑）
const nodeName = computed({
  get: () => selectedNode.value?.name || '',
  set: (value) => {
    if (selectedNode.value) {
      localNodeChanges.value.name = value;
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

// 获取配置（对所有节点类型通用）
// 如果本地有变更，返回变更的配置；否则返回节点原始配置
const getNodeConfig = <T>(nodeType: string, configProp: string = 'config', defaultConfigProvider?: () => T): T => {
  // 如果有本地变更且节点类型匹配，优先返回本地变更
  if (localNodeChanges.value[configProp] && selectedNode.value?.type === nodeType) {
    return localNodeChanges.value[configProp] as T;
  }
  
  // 如果节点类型不匹配或没有选中节点，返回默认值
  if (!selectedNode.value || selectedNode.value.type !== nodeType) {
    // 如果提供了默认配置提供者函数，使用它
    if (defaultConfigProvider) {
      return defaultConfigProvider();
    }
    // 否则尝试使用 store 中的默认配置
    if (configProp === 'config') {
      return workflowStore.getDefaultNodeConfig(nodeType) as unknown as T;
    }
    // 对于 inputs 和 outputs，返回空数组
    return (configProp === 'inputs' || configProp === 'outputs' ? [] : {}) as unknown as T;
  }
  
  // 否则返回原始配置
  if (configProp === 'config') {
    return selectedNode.value.config as unknown as T;
  } else if (configProp === 'inputs') {
    return selectedNode.value.inputs as unknown as T;
  } else if (configProp === 'outputs') {
    return selectedNode.value.outputs as unknown as T;
  }
  
  // 默认返回配置或空对象
  return (configProp === 'config' 
    ? workflowStore.getDefaultNodeConfig(nodeType)
    : (configProp === 'inputs' || configProp === 'outputs' ? [] : {})) as unknown as T;
};

// 更新配置（对所有节点类型通用）
const updateNodeConfig = <T>(nodeType: string, configProp: string, value: T): void => {
  console.log('更新节点配置', nodeType, configProp, value);
  if (!selectedNode.value || selectedNode.value.type !== nodeType) return;
  localNodeChanges.value[configProp] = value;
};

// 计算属性：LLM配置
const llmConfig = computed<LLMConfig>({
  get: () => getNodeConfig<LLMConfig>('llm', 'config'),
  set: (value) => updateNodeConfig('llm', 'config', value)
});

// 计算属性：开始节点配置
const startConfig = computed<StartConfig>({
  get: () => ({ 
    variables: getNodeConfig<string[]>('start', 'inputs', () => []) 
  }),
  set: (value) => updateNodeConfig('start', 'inputs', value.variables)
});

// 计算属性：知识库配置
const knowledgeConfig = computed<KnowledgeConfig>({
  get: () => getNodeConfig<KnowledgeConfig>('knowledge', 'config'),
  set: (value) => updateNodeConfig('knowledge', 'config', value)
});

// 计算属性：条件配置
const conditionalConfig = computed<any>({
  get: () => getNodeConfig<any>('conditional', 'config'),
  set: (value) => updateNodeConfig('conditional', 'config', value)
});

// 计算属性：搜索配置
const searchConfig = computed<SearchConfig>({
  get: () => getNodeConfig<SearchConfig>('search', 'config'),
  set: (value) => updateNodeConfig('search', 'config', value)
});

// 计算属性：IO值
const ioValue = computed({
  get: () => {
    if (!selectedNode.value) return { inputs: [], outputs: [], nodeType: '' };
    
    // 优先使用本地变更的输入输出
    const inputs = localNodeChanges.value.inputs 
      ? localNodeChanges.value.inputs 
      : selectedNode.value.inputs;
      
    const outputs = localNodeChanges.value.outputs 
      ? localNodeChanges.value.outputs 
      : selectedNode.value.outputs;
    
    return {
      inputs,
      outputs,
      nodeType: selectedNode.value.type
    };
  },
  set: (value: { inputs: string[]; outputs: string[]; nodeType?: string }) => {
    if (!selectedNode.value) return;
    localNodeChanges.value.inputs = value.inputs;
    localNodeChanges.value.outputs = value.outputs;
  }
});

// 计算属性：输出配置
const outputVariables = computed({
  get: () => getNodeConfig<string[]>('end', 'outputs', () => []),
  set: (value) => updateNodeConfig('end', 'outputs', value)
});

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
