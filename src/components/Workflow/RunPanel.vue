<template>
  <div class="run-panel fixed top-0 right-0 w-96 h-full bg-white shadow-lg z-20 flex flex-col">
    <!-- 面板头部 -->
    <div class="flex justify-between items-center px-5 py-4 border-b border-gray-100">
      <div class="flex items-center">
        <div class="w-1.5 h-6 bg-teal-400 rounded-full mr-3" style="background-color: #49CFAD;"></div>
        <h2 class="text-lg font-semibold text-gray-800">运行面板</h2>
      </div>
      <div 
        @click="$emit('close')" 
        class="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
        role="button"
        aria-label="关闭面板"
        tabindex="0"
        @keydown.enter="$emit('close')"
        @keydown.space="$emit('close')"
      >
        <i class="fa-solid fa-xmark text-lg"></i>
      </div>
    </div>

    <!-- 标签栏 -->
    <div class="tabs-container border-b border-gray-100">
      <!-- 标签导航 -->
      <div class="flex px-1 pt-2">
        <div 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value" 
          class="tab-button relative mx-1 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center justify-center cursor-pointer"
          :class="[
            activeTab === tab.value 
              ? 'active-tab text-white' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          ]"
          role="tab"
          :aria-selected="activeTab === tab.value"
          tabindex="0"
          @keydown.enter="activeTab = tab.value"
          @keydown.space="activeTab = tab.value"
        >
          <!-- 激活状态背景 -->
          <div 
            v-if="activeTab === tab.value" 
            class="absolute inset-0 rounded-t-lg bg-gradient-to-r z-0"
            style="background: linear-gradient(90deg, #49CFAD, #4AC5BD); box-shadow: 0 2px 8px rgba(73, 207, 173, 0.25);"
          ></div>
          
          <!-- 图标和文本内容 -->
          <div class="flex items-center justify-center relative z-10">
            <i 
              v-if="tab.value === 'input'" 
              class="tab-icon fa-regular fa-pen-to-square mr-2"
              :class="{'text-white': activeTab === tab.value}"
            ></i>
            <i 
              v-if="tab.value === 'result'" 
              class="tab-icon fa-regular fa-file-lines mr-2"
              :class="{'text-white': activeTab === tab.value}"
            ></i>
            <i 
              v-if="tab.value === 'detail'" 
              class="tab-icon fa-regular fa-circle-info mr-2"
              :class="{'text-white': activeTab === tab.value}"
            ></i>
            <i 
              v-if="tab.value === 'trace'" 
              class="tab-icon fa-solid fa-chart-line mr-2"
              :class="{'text-white': activeTab === tab.value}"
            ></i>
            {{ tab.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 p-4 overflow-hidden">
      <!-- 使用动态组件切换不同的面板 -->
      <component 
        :is="currentPanel" 
        @startRun="startRun"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue';
import { streamDeepSeekResponse } from '../../utils/deepseekApi';
import { performSearch } from '../../utils/searchApi'; // 导入搜索API
import { useWorkflowStore } from '../../stores/workflowStore';
import { Node as WorkflowNode } from '../../types/workflow'; // 导入自定义Node类型

// 导入子组件
import InputPanel from '../Panel/InputPanel.vue';
import ResultPanel from '../Panel/ResultPanel.vue';
import DetailPanel from '../Panel/DetailPanel.vue';
import TracePanel from '../Panel/TracePanel.vue';

const emit = defineEmits(['close']);

// 获取工作流 store
const workflowStore = useWorkflowStore();

// 本地状态
const activeTab = ref('input');

// 标签定义
const tabs = [
  { label: '输入', value: 'input' },
  { label: '结果', value: 'result' },
  { label: '详情', value: 'detail' },
  { label: '追踪', value: 'trace' }
];

// 面板组件
const panelComponents = {
  'input': markRaw(InputPanel),
  'result': markRaw(ResultPanel),
  'detail': markRaw(DetailPanel),
  'trace': markRaw(TracePanel)
};

// 当前应显示的面板组件
const currentPanel = computed(() => {
  return panelComponents[activeTab.value as keyof typeof panelComponents];
});

// 开始运行
const startRun = (values: Record<string, any>) => {
  console.log('[RunPanel] 开始运行工作流，输入值:', values);
  
  // 切换到结果标签
  activeTab.value = 'result';
  
  // 清空之前的结果
  workflowStore.result = '';
  
  // 执行工作流程引擎
  executeWorkflow(values);
};

// 工作流执行引擎
const executeWorkflow = async (inputValues: Record<string, any>) => {
  console.log('[RunPanel] 开始执行工作流引擎');
  
  // 准备工作流运行环境
  workflowStore.prepareRun();

  // 将输入值应用于工作流
  workflowStore.executeRun(inputValues);

  // 记录工作流开始时间
  const workflowStartTime = Date.now();
  
  // 记录工作流输入变量
  recordWorkflowInput(inputValues);
  
  // 验证工作流结构
  const { valid, startNode, endNode } = validateWorkflow();
  if (!valid || !startNode) {
    workflowStore.isRunning = false;
    return;
  }
  
  // 确定结束节点需要的输出变量
  const requiredOutputVariables = getRequiredOutputVariables(endNode);
  
  // 执行节点链
  const executionContext = {
    variables: { ...inputValues },
    visited: new Set<string>(),
    requiredOutputVariables // 将需要的输出变量传递给执行上下文
  };
  
  try {
    // 从开始节点开始执行
    await executeNode(startNode.id, executionContext);
  

    // 记录工作流执行统计信息
    recordWorkflowStats(workflowStartTime, executionContext, endNode);
  } catch (error) {
    // 记录工作流执行错误
    recordWorkflowError(error);
  } finally {
    workflowStore.isRunning = false;
  }
};

// 执行单个节点
const executeNode = async (nodeId: string, context: any): Promise<void> => {
  // 防止循环执行
  if (context.visited.has(nodeId)) {
    console.log(`[RunPanel] 节点 ${nodeId} 已经执行过，跳过`);
    return;
  }
  
  // 标记为已访问
  context.visited.add(nodeId);
  
  // 获取当前节点
  const node = workflowStore.nodes.find(n => n.id === nodeId) as WorkflowNode;
  if (!node) {
    console.error(`[RunPanel] 未找到节点 ${nodeId}`);
    return;
  }
  
  console.log(`[RunPanel] 执行节点: ${node.name} (${node.type})`);
  
  // 根据节点类型执行不同操作
  switch (node.type) {
    case 'start':
      // 开始节点
      workflowStore.startNodeExecution(node.id);
      workflowStore.completeNodeExecution(node.id, true);
      break;
      
    case 'end':
      // 结束节点，完成执行
      workflowStore.startNodeExecution(node.id);
      
      // 设置结束节点的输出值
      workflowStore.setNodeOutputValue(node.id, 'result', workflowStore.result);
      console.log('[RunPanel] 结束节点输出值:', workflowStore.result);
      
      workflowStore.completeNodeExecution(node.id, true);
      return;
      
    case 'llm':
      // 执行LLM节点
      await executeLlmNode(node, context);
      break;
      
    case 'search': // 新增: 搜索节点处理
      await executeSearchNode(node, context);
      break;
      
    case 'knowledge':
      // 知识检索节点
      workflowStore.startNodeExecution(node.id);
      workflowStore.prepareNodeExecution(node.id, context.variables);
      
      // 确定当前节点是否是结束节点需要的输出节点
      const isKnowledgeNodeRequired = workflowStore.isNodeRequiredForOutput(node.id, context.requiredOutputVariables);
      
      workflowStore.details.push({
        name: '知识检索',
        description: node.name || '知识检索节点',
        value: '功能开发中'
      });
      
      // 设置知识节点的输出
      const knowledgeOutputValue = '知识检索功能开发中，敬请期待！';
      if (node.outputs && node.outputs.includes('knowledge')) {
        workflowStore.setNodeOutputValue(node.id, 'knowledge', knowledgeOutputValue);
        context.variables[`knowledge_${node.id}`] = knowledgeOutputValue;
        context.variables['knowledge'] = knowledgeOutputValue;
        
        // 只有当为所需节点时才更新结果
        if (isKnowledgeNodeRequired && activeTab.value === 'result') {
          workflowStore.result = knowledgeOutputValue;
        }
      }
      
      workflowStore.completeNodeExecution(node.id, true);
      break;
      
    case 'conditional':
      // 条件节点
      workflowStore.startNodeExecution(node.id);
      workflowStore.prepareNodeExecution(node.id, context.variables);
      
      // 确定当前节点是否是结束节点需要的输出节点
      const isConditionNodeRequired = workflowStore.isNodeRequiredForOutput(node.id, context.requiredOutputVariables);
      
      // 获取替换变量后的表达式
      const expression = node.config?.trueExpression || node.config?.expression || '';
      console.log(`[RunPanel] 条件节点表达式: ${expression}`);
      
      // 设置条件节点的输出
      if (node.outputs && node.outputs.length > 0) {
        // 目前默认设置为true分支
        const conditionValue = 'true';
        workflowStore.setNodeOutputValue(node.id, 'condition', conditionValue);
        context.variables[`condition_${node.id}`] = conditionValue;
        context.variables['condition'] = conditionValue;
        
        // 只有当为所需节点时才更新结果
        if (isConditionNodeRequired && activeTab.value === 'result') {
          workflowStore.result = conditionValue;
        }
      }
      
      workflowStore.completeNodeExecution(node.id, true);
      break;
      
    default:
      console.log(`[RunPanel] 未知节点类型: ${node.type}`);
      // 未知节点类型，由 ExecutionManager 统一处理追踪信息
      workflowStore.completeNodeExecution(node.id, false, `未知节点类型: ${node.type}`);
  }
  
  // 执行下一个节点
  const outgoingEdges = workflowStore.edges.filter(edge => edge.source === nodeId);
  for (const edge of outgoingEdges) {
    await executeNode(edge.target, context);
  }
};

// 执行LLM节点
const executeLlmNode = async (node: WorkflowNode, context: any): Promise<void> => {
  console.log(`[RunPanel] 执行LLM节点: ${node.name}`);
  
  // 更新节点状态为开始执行
  workflowStore.startNodeExecution(node.id);
  
  // 执行前先准备节点 - 这会替换提示词中的变量
  workflowStore.prepareNodeExecution(node.id, context.variables);
  
  // 获取当前节点的正确提示词
  let prompt = node.config?.trueSystemPrompt || node.config?.systemPrompt || '';
  if (!prompt) {
    prompt = `${JSON.stringify(context.variables)}`;
  }
  
  console.log(`[RunPanel] LLM节点提示词: ${prompt}`);
  
  // 确定当前节点是否是结束节点需要的输出节点
  const isRequiredNode = workflowStore.isNodeRequiredForOutput(node.id, context.requiredOutputVariables);
  
  console.log(`[RunPanel] 节点 ${node.id} 是否为结束节点所需: ${isRequiredNode}`);
  
  // 调用API
  let llmResult = '';
  
  try {
    await streamDeepSeekResponse(
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: (node.config as any)?.temperature || 0.7,
        max_tokens: 8192,
        stream: true
      },
      // 流式处理
      async (chunk: string) => {
        // 累加LLM输出
        llmResult += chunk;
        
        // 只有当前节点是结束节点需要的输出节点时才更新结果面板
        if (isRequiredNode) {
          // 直接更新结果，不添加任何前缀或格式
          workflowStore.result = llmResult;
        }
      },
      // 完成处理
      (fullText: string) => {
        console.log(`[RunPanel] LLM节点 "${node.name}" 执行完成`);
      
        // 保存节点输出
        if (node.outputs && node.outputs.includes('text')) {
          const outputName = 'text';
          // 设置到节点输出中
          workflowStore.setNodeOutputValue(node.id, outputName, fullText);
          
          // 保持原有的上下文变量设置，保证向后兼容
          const variableName = `${outputName}_${node.id}`;
          context.variables[variableName] = fullText;
          context.variables[outputName] = fullText;
          
          console.log(`[RunPanel] 存储LLM输出到变量 '${variableName}' 和节点输出`);
        }
        
        // 更新节点状态为完成
        workflowStore.completeNodeExecution(node.id, true);
      },
      // 错误处理
      (error: any) => {
        console.error(`LLM节点 "${node.name}" 执行失败:`, error);
        
        // 如果是需要的节点才更新结果显示
        if (isRequiredNode) {
          const errorMessage = `执行失败: ${error.message || '未知错误'}`;
          workflowStore.result = errorMessage;
        }
        
        // 更新节点状态为错误
        workflowStore.completeNodeExecution(node.id, false, error.message || '未知错误');
      }
    );
  } catch (error) {
    console.error(`LLM节点 "${node.name}" 执行出错:`, error);
    
    // 如果是需要的节点才更新结果显示
    if (isRequiredNode) {
      const errorMessage = `执行出错: ${error instanceof Error ? error.message : '未知错误'}`;
      workflowStore.result = errorMessage;
    }
    
    // 更新节点状态为错误
    workflowStore.completeNodeExecution(node.id, false, error instanceof Error ? error.message : '未知错误');
  }
};

// 执行搜索节点
const executeSearchNode = async (node: WorkflowNode, context: any): Promise<void> => {
  console.log(`[RunPanel] 执行搜索节点: ${node.name}`);
  
  // 更新节点状态为开始执行
  workflowStore.startNodeExecution(node.id);
  
  // 执行前先准备节点 - 这会替换提示词中的变量
  workflowStore.prepareNodeExecution(node.id, context.variables);
  
  // 获取搜索配置
  const searchEngine = node.config?.searchEngine || 'google';
  const maxResults = node.config?.maxResults || 5;
  let queryPrompt = node.config?.queryPrompt || '';
  
  // 替换查询中的变量
  queryPrompt = workflowStore.replaceVariables(queryPrompt, node.id, context.variables);
  
  console.log(`[RunPanel] 搜索节点查询: ${queryPrompt}, 引擎: ${searchEngine}, 最大结果数: ${maxResults}`);
  
  // 确定当前节点是否是结束节点需要的输出节点
  const isRequiredNode = workflowStore.isNodeRequiredForOutput(node.id, context.requiredOutputVariables);
  
  try {
    // 执行搜索
    const searchResults = await performSearch(searchEngine, queryPrompt, maxResults);
    
    // 格式化搜索结果为易读文本
    const formattedResults = formatSearchResults(searchResults);

    console.log(`[RunPanel] 搜索结果: ${formattedResults}`);
    
    // 记录搜索结果到详情
    workflowStore.details.push({
      name: '搜索执行',
      description: node.name || '搜索节点',
      value: `查询: "${queryPrompt}" 找到 ${searchResults.length} 条结果`
    });
    
    // 保存节点输出 - 确保输出格式化文本而不是对象
    if (node.outputs && node.outputs.includes('results')) {
      // 直接使用格式化文本作为主要输出，避免[object Object]问题
      workflowStore.setNodeOutputValue(node.id, 'results', formattedResults);
      
      // 在变量中保存两种格式
      // 1. 格式化文本 - 用于显示和传递给其他节点
      context.variables[`results_${node.id}`] = formattedResults;
      context.variables['results'] = formattedResults;
      
      // 如果是需要的节点，更新结果面板显示格式化文本
      if (isRequiredNode && activeTab.value === 'result') {
        workflowStore.result = formattedResults;
      }
    }
    
    // 更新节点状态为完成
    workflowStore.completeNodeExecution(node.id, true);
  } catch (error) {
    console.error(`搜索节点 "${node.name}" 执行失败:`, error);
    
    // 记录错误到详情
    workflowStore.details.push({
      name: '搜索错误',
      description: node.name || '搜索节点',
      value: error instanceof Error ? error.message : '未知错误'
    });
    
    // 如果是需要的节点才更新结果显示
    if (isRequiredNode) {
      const errorMessage = `搜索失败: ${error instanceof Error ? error.message : '未知错误'}`;
      workflowStore.result = errorMessage;
    }
    
    // 更新节点状态为错误
    workflowStore.completeNodeExecution(node.id, false, error instanceof Error ? error.message : '未知错误');
  }
};

// 格式化搜索结果为文本
const formatSearchResults = (results: any[]): string => {
  if (!results || results.length === 0) {
    return "没有找到相关搜索结果。";
  }
  
  let formattedText = `找到 ${results.length} 条搜索结果:\n\n`;
  
  results.forEach((result, index) => {
    formattedText += `${index + 1}. ${result.title}\n`;
    formattedText += `   链接: ${result.link}\n`;
    if (result.snippet) {
      formattedText += `   摘要: ${result.snippet}\n`;
    }
    formattedText += '\n';
  });
  
  return formattedText;
};

// 获取结束节点需要的输出变量
const getRequiredOutputVariables = (endNode: WorkflowNode | undefined): Set<string> => {
  const requiredOutputVariables = new Set<string>();
  
  if (!endNode) {
    return requiredOutputVariables;
  }
  
  // 从结束节点配置中获取需要的输入变量
  if (endNode.config) {
    const inputVariables = (endNode.config as any).inputVariables || [];
    inputVariables.forEach((variable: string) => {
      // 直接添加变量名
      requiredOutputVariables.add(variable);
      
      // 如果变量格式为 "outputName_nodeId"，也提取nodeId
      const match = variable.match(/^(\w+)_(\w+-\d+-\d+)$/);
      if (match) {
        const [_, outputName, nodeId] = match;
        // 添加节点ID，用于后续判断哪个节点的输出需要直接显示
        requiredOutputVariables.add(nodeId);
      }
    });
  }
  
  // 如果结束节点没有指定输入变量，则找到连接到结束节点的节点
  if (requiredOutputVariables.size === 0) {
    const incomingEdges = workflowStore.edges.filter(edge => edge.target === endNode.id);
    incomingEdges.forEach(edge => {
      requiredOutputVariables.add(edge.source);
    });
  }
  
  console.log('[RunPanel] 结束节点需要的输出变量:', [...requiredOutputVariables]);
  return requiredOutputVariables;
};

// 检验工作流节点结构
const validateWorkflow = () => {
  // 找到开始节点
  const startNode = workflowStore.nodes.find(node => node.type === 'start');
  if (!startNode) {
    workflowStore.result = '错误: 工作流缺少开始节点';
    return { valid: false, startNode: undefined, endNode: undefined };
  }
  
  // 找到结束节点
  const endNode = workflowStore.nodes.find(node => node.type === 'end');
  
  // 检查是否有从开始节点到结束节点的路径
  let hasPathToEnd = false;
  if (endNode) {
    hasPathToEnd = workflowStore.hasPathToEndNode(startNode.id);
  }
  
  if (!endNode || !hasPathToEnd) {
    // 记录无结束节点或无路径的提示信息
    workflowStore.details.push({
      name: '工作流验证',
      description: '结束节点检查',
      value: '未连接到结束节点'
    });
    return { valid: false, startNode, endNode };
  }
  
  return { valid: true, startNode, endNode };
};


// 记录工作流输入变量
const recordWorkflowInput = (inputValues: Record<string, any>) => {
  workflowStore.details.push({
    name: '工作流输入',
    description: '开始节点输入变量',
    value: JSON.stringify(inputValues, null, 2)
  });
  
  console.log('[RunPanel] 已记录工作流输入:', inputValues);
};

// 记录工作流执行统计信息
const recordWorkflowStats = (
  startTime: number, 
  executionContext: any, 
  endNode: WorkflowNode | undefined
) => {
  // 记录工作流结束时间和总用时
  const workflowEndTime = Date.now();
  const executionTime = workflowEndTime - startTime;

  // 记录工作流执行信息
  workflowStore.details.push({
    name: '工作流执行',
    description: '执行时间',
    value: `${executionTime} 毫秒`
  });
  
  // 记录工作流步数
  workflowStore.details.push({
    name: '工作流执行',
    description: '执行步数',
    value: `${executionContext.visited.size} 步`
  });
  
  // 记录工作流输出变量
  if (endNode && endNode.outputValues) {
    workflowStore.details.push({
      name: '工作流输出',
      description: '结束节点输出',
      value: JSON.stringify(endNode.outputValues, null, 2)
    });
  } else {
    // 如果结束节点没有直接的输出值，提供空值
    workflowStore.details.push({
      name: '工作流输出',
      description: '结束节点输出',
      value: JSON.stringify("", null, 2)
    });
  }
};

// 记录工作流执行错误
const recordWorkflowError = (error: any) => {
  console.error('工作流执行出错:', error);
  
  // 设置错误结果
  workflowStore.result = `执行出错: ${error instanceof Error ? error.message : '未知错误'}`;
  
  // 记录错误信息到详情中
  workflowStore.details.push({
    name: '工作流执行',
    description: '执行状态',
    value: `失败: ${error instanceof Error ? error.message : '未知错误'}`
  });
};
</script>

<style scoped>
.run-panel {
  /* 保留原有样式 */
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.tab-button {
  min-width: 80px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  transform-origin: bottom;
}

.tab-button:not(.active-tab):hover {
  transform: translateY(-1px);
  background-color: rgba(249, 250, 251, 0.8);
}

.tab-button:not(.active-tab):active {
  transform: translateY(0);
}

.tab-icon {
  transition: color 0.3s ease;
}

.active-tab::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: white;
  z-index: 10;
}
</style> 