<template>
  <div class="run-panel fixed top-0 right-0 w-96 h-full bg-white border-l border-gray-200 shadow-lg z-20 flex flex-col">
    <!-- 面板头部 -->
    <div class="flex justify-between items-center p-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold">运行面板</h2>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>

    <!-- 标签栏 -->
    <div class="tabs border-b border-gray-200">
      <div class="flex">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === tab.value ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          {{ tab.label }}
        </button>
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
    
    // 设置结束节点的输出值
    if (endNode) {
      workflowStore.setNodeOutputValue(endNode.id, 'result', workflowStore.result);
    }

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
  
  // 添加追踪信息
  workflowStore.traces.push({
    node: node.name || node.type,
    timestamp: new Date().toLocaleTimeString(),
    message: '开始执行'
  });
  
  // 根据节点类型执行不同操作
  switch (node.type) {
    case 'start':
      // 开始节点，直接执行下一个节点
      break;
      
    case 'end':
      // 结束节点，完成执行
      workflowStore.startNodeExecution(node.id);
      
      workflowStore.traces.push({
        node: node.name || node.type,
        timestamp: new Date().toLocaleTimeString(),
        message: '工作流执行完成'
      });
      
      workflowStore.completeNodeExecution(node.id, true);
      return;
      
    case 'llm':
      // 执行LLM节点
      await executeLlmNode(node, context);
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
      
      workflowStore.traces.push({
        node: node.name || node.type,
        timestamp: new Date().toLocaleTimeString(),
        message: '知识检索功能开发中'
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
      
      workflowStore.traces.push({
        node: node.name || node.type,
        timestamp: new Date().toLocaleTimeString(),
        message: `条件表达式: ${expression}（默认选择第一个出口）`
      });
      
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
      workflowStore.traces.push({
        node: node.name || node.type,
        timestamp: new Date().toLocaleTimeString(),
        message: `未知节点类型: ${node.type}`
      });
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
        max_tokens: 800,
        stream: true
      },
      // 流式处理
      async (chunk: string) => {
        // 累加LLM输出
        llmResult += chunk;
        
        // 只有当前节点是结束节点需要的输出节点时才更新结果面板
        if (isRequiredNode && activeTab.value === 'result') {
          // 直接更新结果，不添加任何前缀或格式
          workflowStore.result = llmResult;
        }
      },
      // 完成处理
      (fullText: string) => {
        console.log(`[RunPanel] LLM节点 "${node.name}" 执行完成`);
      
        
        // 更新追踪
        workflowStore.traces.push({
          node: node.name || node.type,
          timestamp: new Date().toLocaleTimeString(),
          message: 'LLM响应完成'
        });
        
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
        
        // 更新追踪
        workflowStore.traces.push({
          node: node.name || node.type,
          timestamp: new Date().toLocaleTimeString(),
          message: `请求失败: ${error.message || '未知错误'}`
        });
        
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
</style> 