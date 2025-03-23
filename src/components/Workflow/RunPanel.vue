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

// 使用computed获取store中的数据
const isRunning = computed(() => workflowStore.isRunning);
const result = computed(() => workflowStore.result);
const details = computed(() => workflowStore.details);
const traces = computed(() => workflowStore.traces);

// 本地状态
const activeTab = ref('input');
const isApiLoading = ref(false);
const resultText = ref('');

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
  
  // 找到开始节点
  const startNode = workflowStore.nodes.find(node => node.type === 'start');
  if (!startNode) {
    workflowStore.result = '错误: 工作流缺少开始节点';
    workflowStore.isRunning = false;
    return;
  }
  
  // 找到连接到结束节点的路径
  const endNode = workflowStore.nodes.find(node => node.type === 'end');
  let hasPathToEnd = false;
  
  if (endNode) {
    // 使用workflowStore中的方法检查路径
    hasPathToEnd = workflowStore.hasPathToEndNode(startNode.id);
  }
  
  if (!endNode || !hasPathToEnd) {
    // 修改无结束节点的提示信息
    workflowStore.result = '抱歉没有连接到结束节点，请转到详细信息面板查看它';
    workflowStore.details.push({
      name: '工作流验证',
      description: '结束节点检查',
      value: '未连接到结束节点'
    });
  }
  
  // 执行节点链
  const executionContext = {
    variables: { ...inputValues },
    visited: new Set<string>()
  };
  
  try {
    // 从开始节点开始执行
    await executeNode(startNode.id, executionContext);
    
    // 执行完成后，获取最终结果并设置到result
    if (endNode && hasPathToEnd) {
      workflowStore.result = workflowStore.getFinalResult();
    }
  } catch (error) {
    console.error('工作流执行出错:', error);
    workflowStore.result += `\n\n执行出错: ${error instanceof Error ? error.message : '未知错误'}`;
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
      
      workflowStore.result += `\n\n[知识检索节点 "${node.name}" 执行中...]\n知识检索功能开发中，敬请期待！`;
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
      if (node.outputs && node.outputs.includes('knowledge')) {
        const outputValue = '知识检索功能开发中，敬请期待！';
        workflowStore.setNodeOutputValue(node.id, 'knowledge', outputValue);
        context.variables[`knowledge_${node.id}`] = outputValue;
        context.variables['knowledge'] = outputValue;
      }
      
      workflowStore.completeNodeExecution(node.id, true);
      break;
      
    case 'conditional':
      // 条件节点
      workflowStore.startNodeExecution(node.id);
      workflowStore.prepareNodeExecution(node.id, context.variables);
      
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
        workflowStore.setNodeOutputValue(node.id, 'condition', 'true');
        context.variables[`condition_${node.id}`] = 'true';
        context.variables['condition'] = 'true';
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
    prompt = `请分析以下内容:\n\n${JSON.stringify(context.variables)}`;
  }
  
  console.log(`[RunPanel] LLM节点提示词: ${prompt}`);
  
  // 记录执行开始
  workflowStore.details.push({
    name: 'LLM调用',
    description: node.name || 'LLM节点',
    value: '开始'
  });
  
  // 显示临时状态
  workflowStore.result += `\n\n[LLM节点 "${node.name}" 执行中...]\n等待响应...`;
  
  // 调用API
  let llmResult = '';
  isApiLoading.value = true;
  
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
        if (llmResult === '') {
          isApiLoading.value = false;
        }
        
        llmResult += chunk;
        
        // 更新临时结果，标记当前节点的输出
        workflowStore.result = workflowStore.result || '';
        workflowStore.result = workflowStore.result.replace(/\[LLM节点 ".+" 执行中...\]\n等待响应.../, '');
        workflowStore.result += llmResult === chunk 
          ? `\n\n[LLM节点 "${node.name}" 执行中...]\n${llmResult}`
          : chunk;
      },
      // 完成处理
      (fullText: string) => {
        console.log(`[RunPanel] LLM节点 "${node.name}" 执行完成`);
        
        // 更新详情
        workflowStore.details.push({
          name: 'LLM调用',
          description: node.name || 'LLM节点',
          value: '成功'
        });
        
        // 更新追踪
        workflowStore.traces.push({
          node: node.name || node.type,
          timestamp: new Date().toLocaleTimeString(),
          message: 'LLM响应完成'
        });
        
        // 如果节点定义了输出变量，存储到上下文和节点输出中
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
        
        isApiLoading.value = false;
      },
      // 错误处理
      (error: any) => {
        console.error(`LLM节点 "${node.name}" 执行失败:`, error);
        
        // 更新详情
        workflowStore.details.push({
          name: 'LLM调用',
          description: node.name || 'LLM节点',
          value: '失败'
        });
        
        // 更新追踪
        workflowStore.traces.push({
          node: node.name || node.type,
          timestamp: new Date().toLocaleTimeString(),
          message: `请求失败: ${error.message || '未知错误'}`
        });
        
        // 更新临时结果
        workflowStore.result = workflowStore.result.replace(/\[LLM节点 ".+" 执行中...\]\n等待响应.../, '');
        workflowStore.result += `\n\n[LLM节点 "${node.name}" 执行失败]\n错误: ${error.message || '未知错误'}`;
        
        // 更新节点状态为错误
        workflowStore.completeNodeExecution(node.id, false, error.message || '未知错误');
        
        isApiLoading.value = false;
      }
    );
  } catch (error) {
    console.error(`LLM节点 "${node.name}" 执行出错:`, error);
    workflowStore.result = workflowStore.result.replace(/\[LLM节点 ".+" 执行中...\]\n等待响应.../, '');
    workflowStore.result += `\n\n[LLM节点 "${node.name}" 执行出错]\n${error instanceof Error ? error.message : '未知错误'}`;
    
    // 更新节点状态为错误
    workflowStore.completeNodeExecution(node.id, false, error instanceof Error ? error.message : '未知错误');
    
    isApiLoading.value = false;
  }
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