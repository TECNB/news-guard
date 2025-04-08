import { defineStore } from 'pinia';
import { Node, Edge, NODE_TYPES, Workflow } from '../types/workflow';
import {
  createWorkflowUtils 
} from '../utils/workflow/store';
import { initialWorkflowData } from '../constants/initialWorkflowData';

// 创建工作流工具实例
const workflowUtils = createWorkflowUtils();
const { 
  logger, 
  nodeManager, 
  edgeManager, 
  variableResolver, 
  executionManager 
} = workflowUtils;

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    // 工作流节点
    nodes: initialWorkflowData.nodes as Node[],
    // 工作流连线
    edges: initialWorkflowData.edges as Edge[],
    // 当前选中的节点ID
    selectedNodeId: null as string | null,
    // 工作流基本信息
    name: '新工作流',
    description: '',
    // 工作流运行相关
    isRunning: false,
    result: '',
    details: [] as Array<{name: string, description: string, value: any}>,
    traces: [] as Array<{
      node: string, 
      timestamp: string, 
      message: string, 
      status?: string,
      data?: {
        inputs: Record<string, any>,
        outputs: Record<string, any>,
        error?: string
      }
    }>,
  }),
  
  getters: {
    workflow(): Workflow {
      return {
        name: this.name,
        description: this.description,
        nodes: this.nodes,
        edges: this.edges
      };
    },
    
    selectedNode(): Node | undefined {
      return this.nodes.find(node => node.id === this.selectedNodeId);
    },
    
    // 获取开始节点
    startNode(): Node | undefined {
      return nodeManager.getStartNode(this.nodes);
    },
    
    // 获取开始节点的输入变量
    inputVariables(): Record<string, any> {
      return variableResolver.getInputVariables(this.nodes);
    },
    
    // 获取指定节点可用的所有变量（包括前置节点的输出）
    getNodeAvailableVariables(): (nodeId: string | null) => any[] {
      return (nodeId: string | null) => {
        return variableResolver.getNodeAvailableVariables(nodeId, this.nodes, this.edges);
      };
    },
    
    // 获取任何节点类型的默认配置
    getDefaultNodeConfig() {
      return (nodeType: string): any => {
        const nodeTypeObj = NODE_TYPES.find(nt => nt.type === nodeType);
        return nodeTypeObj ? { ...nodeTypeObj.defaultConfig } : {};
      };
    }
  },
  
  actions: {
    // 添加节点
    addNode(type: string, x: number, y: number): string {
      return nodeManager.addNode(this.nodes, type, x, y);
    },
    
    // 更新节点
    updateNode(updatedNode: Node): void {
      nodeManager.updateNode(this.nodes, updatedNode);
    },
    
    // 删除节点
    deleteNode(nodeId: string): void {
      this.selectedNodeId = nodeManager.deleteNode(
        this.nodes, 
        this.edges, 
        nodeId, 
        this.selectedNodeId
      );
    },
    
    // 添加边
    addEdge(source: string, target: string): void {
      edgeManager.addEdge(this.edges, source, target);
    },
    
    // 删除边
    removeEdge(edgeId: string): void {
      edgeManager.removeEdge(this.edges, edgeId);
    },
    
    // 选择节点
    selectNode(nodeId: string | null): void {
      const result = nodeManager.selectNode(this.nodes, nodeId, this.selectedNodeId);
      this.selectedNodeId = result.selectedNodeId;
    },
    
    // 设置工作流位置
    updateNodePosition(nodeId: string, x: number, y: number): void {
      nodeManager.updateNodePosition(this.nodes, nodeId, x, y);
    },
    
    // 设置节点的输出值 - 直接操作node.outputValues
    setNodeOutputValue(nodeId: string, outputName: string, value: any): void {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        if (!node.outputValues) {
          node.outputValues = {};
        }
        node.outputValues[outputName] = value;
      }
    },
    
    // 获取节点的输出值 - 直接从node.outputValues获取
    getNodeOutputValue(nodeId: string, outputName: string): any {
      const node = this.nodes.find(n => n.id === nodeId);
      if (!node || !node.outputValues) return undefined;
      return node.outputValues[outputName];
    },
    
    // 获取所有节点的输出值 - 从节点中收集
    getAllNodeOutputValues(): Record<string, any> {
      const allOutputs: Record<string, any> = {};
      this.nodes.forEach(node => {
        if (node.outputValues) {
          allOutputs[node.id] = { ...node.outputValues };
        }
      });
      return allOutputs;
    },
    
    // 准备运行工作流
    prepareRun(): void {
      this.isRunning = false;
      // 清除所有节点的输出值
      this.nodes.forEach(node => {
        node.outputValues = {};
      });
      // 使用更新后的方法
      executionManager.prepareRun(
        this.nodes,
        { value: this.result },
        this.details,
        this.traces
      );
      this.result = '';
    },
    
    // 执行工作流
    executeRun(inputValues: Record<string, any>): void {
      // 使用原有方法
      this.isRunning = executionManager.executeRun(
        this.nodes,
        { value: this.result },
        this.details,
        this.traces,
        inputValues
      );
    },
    
    // 替换提示词中的变量
    replaceVariablesInPrompt(prompt: string, nodeId: string, inputValues: Record<string, any>): string {
      // 使用更新后的方法
      return variableResolver.replaceVariablesInPrompt(
        prompt,
        nodeId,
        inputValues,
        this.nodes
      );
    },
    
    // 通用的变量替换方法 - 用于替换任何字符串中的变量
    replaceVariables(text: string, currentNodeId: string, inputValues: Record<string, any>): string {
      // 使用更新后的方法
      return variableResolver.replaceVariables(
        text,
        currentNodeId,
        inputValues,
        this.nodes
      );
    },
    
    // 判断节点是否是结束节点需要的输出节点
    isNodeRequiredForOutput(nodeId: string, requiredOutputVariables: Set<string>): boolean {
      if (!requiredOutputVariables || requiredOutputVariables.size === 0) return false;
      
      // 直接检查节点ID是否在需要的变量集合中
      if (requiredOutputVariables.has(nodeId)) return true;
      
      // 获取节点对象
      const node = this.nodes.find(n => n.id === nodeId);
      if (!node || !node.outputs) return false;
      
      // 检查节点的输出变量是否匹配需要的变量
      return node.outputs.some(output => 
        requiredOutputVariables.has(`${output}_${nodeId}`)
      );
    },
    
    // 准备节点执行
    prepareNodeExecution(nodeId: string, inputValues: Record<string, any>): void {
      // 使用更新后的方法
      executionManager.prepareNodeExecution(
        this.nodes,
        nodeId,
        inputValues
      );
    },
    
    // 开始执行节点
    startNodeExecution(nodeId: string): void {
      executionManager.startNodeExecution(
        this.nodes,
        nodeId,
        this.traces
      );
    },
    
    // 完成节点执行
    completeNodeExecution(nodeId: string, success: boolean = true, error?: string): void {
      executionManager.completeNodeExecution(
        this.nodes,
        nodeId,
        this.traces,
        success,
        error
      );
    },
    
    // 重置工作流
    resetWorkflow(): void {
      logger.log(`重置工作流`);
      this.nodes = [];
      this.edges = [];
      this.selectedNodeId = null;
      this.name = '新工作流';
      this.description = '';
      this.isRunning = false;
      this.result = '';
      this.details = [];
      this.traces = [];
      // nodeOutputValues已经移除，不需要重置
      logger.log(`工作流已重置`);
    },
    
    // 加载工作流
    loadWorkflow(workflow: Workflow): void {
      logger.log(`加载工作流 name=${workflow.name}, nodes=${workflow.nodes.length}, edges=${workflow.edges.length}`);
      this.nodes = workflow.nodes;
      this.edges = workflow.edges;
      this.name = workflow.name;
      this.description = workflow.description || '';
      this.selectedNodeId = null;
      logger.log(`工作流已加载`);
    },
    
    // 获取工作流的完整状态（用于调试）
    getDebugState(): object {
      return {
        nodes: this.nodes,
        edges: this.edges,
        selectedNodeId: this.selectedNodeId,
        name: this.name,
        description: this.description,
        inputVariables: this.inputVariables,
        isRunning: this.isRunning,
        result: this.result
      };
    },
    
    // 打印当前工作流状态（用于调试）
    logWorkflowState(): void {
      logger.group('工作流状态');
      logger.log(`名称: ${this.name}`);
      logger.log(`描述: ${this.description}`);
      logger.log(`节点数量: ${this.nodes.length}`);
      logger.log(`连线数量: ${this.edges.length}`);
      logger.log(`当前选中节点ID: ${this.selectedNodeId}`);
      logger.log('节点列表:');
      this.nodes.forEach(node => {
        // 不打印具体位置信息
        logger.log(`  - ID: ${node.id}, 类型: ${node.type}, 名称: ${node.name}`);
      });
      logger.log('连线列表:');
      this.edges.forEach(edge => {
        logger.log(`  - ID: ${edge.id}, 源: ${edge.source}, 目标: ${edge.target}`);
      });
      logger.groupEnd();
    },

    // 检查从开始节点到结束节点的路径
    hasPathToEndNode(startNodeId: string): boolean {
      const endNode = nodeManager.getEndNode(this.nodes);
      if (!endNode) return false;
      
      return edgeManager.hasPath(this.edges, startNodeId, endNode.id);
    }
  }
});