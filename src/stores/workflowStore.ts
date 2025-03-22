import { defineStore } from 'pinia';
import { Node, Edge, NODE_TYPES, createNode, createEdge, Workflow } from '../types/workflow';

export const useWorkflowStore = defineStore('workflow', {
  state: () => ({
    // 工作流节点
    nodes: [] as Node[],
    // 工作流连线
    edges: [] as Edge[],
    // 当前选中的节点ID
    selectedNodeId: null as string | null,
    // 工作流基本信息
    name: '新工作流',
    description: '',
    // 工作流运行相关
    isRunning: false,
    result: '',
    details: [] as Array<{name: string, description: string, value: any}>,
    traces: [] as Array<{node: string, timestamp: string, message: string}>,
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
      return this.nodes.find(node => node.type === 'start');
    },
    
    // 获取开始节点的输入变量
    inputVariables(): Record<string, any> {
      const startNode = this.startNode;
      const variables: Record<string, any> = {};
      
      if (startNode && startNode.inputs && startNode.inputs.length > 0) {
        startNode.inputs.forEach(variable => {
          if (variable.trim() !== '') {
            variables[variable] = '';
          }
        });
      }
      
      return variables;
    },
    
    // 获取指定节点可用的所有变量（包括前置节点的输出）
    getNodeAvailableVariables(): (nodeId: string | null) => any[] {
      return (nodeId: string | null) => {
        if (!nodeId) return [];
        
        const result = [];
        
        // 添加开始节点变量
        const startNode = this.nodes.find(node => node.type === 'start');
        if (startNode) {
          const variables = startNode.inputs
            .filter(input => input.trim() !== '')
            .map(name => ({ name }));
          
          if (variables.length > 0) {
            result.push({
              nodeId: startNode.id,
              nodeName: '开始节点',
              variables: variables.map(v => ({ 
                ...v, 
                color: 'green' 
              }))
            });
          }
        }
        
        // 找到当前节点的所有前置节点
        const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
        const predecessorIds = incomingEdges.map(edge => edge.source);
        
        // 获取前置节点的输出变量
        predecessorIds.forEach(predecessorId => {
          const node = this.nodes.find(n => n.id === predecessorId);
          if (!node || !node.outputs || node.outputs.length === 0) return;
          
          // 根据节点类型设置不同的颜色
          let color = 'blue';
          if (node.type === 'knowledge') color = 'purple';
          else if (node.type === 'llm') color = 'blue';
          else if (node.type === 'conditional') color = 'yellow';
          
          // 为LLM节点添加类型信息
          const variables = node.outputs.map(output => {
            if (node.type === 'llm' && output === 'text') {
              return { name: output, type: 'String', color };
            }
            return { name: output, color };
          });
          
          if (variables.length > 0) {
            result.push({
              nodeId: node.id,
              nodeName: `${node.name} (${node.type})`,
              variables
            });
          }
        });
        
        return result;
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
      console.log(`[WorkflowStore] 添加节点 type=${type}, x=${x}, y=${y}`);
      
      // 使用 createNode 函数创建节点并应用默认配置
      const newNode = createNode(type, x, y);
      
      this.nodes.push(newNode);
      console.log(`[WorkflowStore] 节点已添加 id=${newNode.id}`);
      console.log(`[WorkflowStore] 当前节点数量: ${this.nodes.length}`);
      return newNode.id;
    },
    
    // 更新节点
    updateNode(updatedNode: Node): void {
      console.log(`[WorkflowStore] 更新节点 id=${updatedNode.id}, type=${updatedNode.type}`);
      const index = this.nodes.findIndex(n => n.id === updatedNode.id);
      if (index !== -1) {
        // 更新节点，保持位置不变
        const position = { x: this.nodes[index].x, y: this.nodes[index].y };
        this.nodes[index] = { ...updatedNode, ...position };
        console.log(`[WorkflowStore] 节点已更新 id=${updatedNode.id}`);
        console.log(`[WorkflowStore] 更新后的节点:`, this.nodes[index]);
      } else {
        console.warn(`[WorkflowStore] 未找到要更新的节点 id=${updatedNode.id}`);
      }
    },
    
    // 删除节点
    deleteNode(nodeId: string): void {
      console.log(`[WorkflowStore] 删除节点 id=${nodeId}`);
      
      // 找到要删除的节点索引
      const nodeIndex = this.nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex !== -1) {
        // 删除与该节点相关的所有边
        const relatedEdges = this.edges.filter(edge => 
          edge.source === nodeId || edge.target === nodeId
        );
        
        console.log(`[WorkflowStore] 将删除与节点相关的 ${relatedEdges.length} 条边`);
        
        relatedEdges.forEach(edge => {
          const edgeIndex = this.edges.findIndex(e => e.id === edge.id);
          if (edgeIndex !== -1) {
            this.edges.splice(edgeIndex, 1);
            console.log(`[WorkflowStore] 已删除边 id=${edge.id}`);
          }
        });
        
        // 删除节点
        const deletedNode = this.nodes[nodeIndex];
        this.nodes.splice(nodeIndex, 1);
        console.log(`[WorkflowStore] 已删除节点 id=${nodeId}, type=${deletedNode.type}`);
        console.log(`[WorkflowStore] 当前节点数量: ${this.nodes.length}`);
        
        // 如果删除的是当前选中的节点，清除选中状态
        if (this.selectedNodeId === nodeId) {
          this.selectedNodeId = null;
          console.log(`[WorkflowStore] 已清除选中状态，因为选中的节点被删除`);
        }
      } else {
        console.warn(`[WorkflowStore] 未找到要删除的节点 id=${nodeId}`);
      }
    },
    
    // 添加边
    addEdge(source: string, target: string): void {
      console.log(`[WorkflowStore] 添加边 source=${source}, target=${target}`);
      
      const newEdge = createEdge(source, target);
      // 检查是否已存在相同的连线
      const edgeExists = this.edges.some(
        edge => edge.source === newEdge.source && edge.target === newEdge.target
      );
      
      if (!edgeExists) {
        this.edges.push(newEdge);
        console.log(`[WorkflowStore] 边已添加 id=${newEdge.id}`);
        console.log(`[WorkflowStore] 当前边数量: ${this.edges.length}`);
      } else {
        console.warn(`[WorkflowStore] 边已存在，未添加 source=${source}, target=${target}`);
      }
    },
    
    // 删除边
    removeEdge(edgeId: string): void {
      console.log(`[WorkflowStore] 删除边 id=${edgeId}`);
      
      const index = this.edges.findIndex(edge => edge.id === edgeId);
      if (index !== -1) {
        const removedEdge = this.edges[index];
        this.edges.splice(index, 1);
        console.log(`[WorkflowStore] 已删除边 id=${edgeId}, source=${removedEdge.source}, target=${removedEdge.target}`);
        console.log(`[WorkflowStore] 当前边数量: ${this.edges.length}`);
      } else {
        console.warn(`[WorkflowStore] 未找到要删除的边 id=${edgeId}`);
      }
    },
    
    // 选择节点 - 增强点击节点时的信息输出
    selectNode(nodeId: string | null): void {
      const oldNodeId = this.selectedNodeId;
      this.selectedNodeId = nodeId;
      
      if (nodeId) {
        const selectedNode = this.nodes.find(n => n.id === nodeId);
        if (selectedNode) {
          console.log(`[WorkflowStore] 已选择节点:`, {
            id: selectedNode.id,
            type: selectedNode.type,
            name: selectedNode.name,
            position: { x: selectedNode.x, y: selectedNode.y },
            config: selectedNode.config,
            inputs: selectedNode.inputs,
            outputs: selectedNode.outputs
          });
        } else {
          console.warn(`[WorkflowStore] 选择的节点不存在 id=${nodeId}`);
        }
      } else if (oldNodeId) {
        console.log(`[WorkflowStore] 已清除节点选择，之前选中的节点 id=${oldNodeId}`);
      }
    },
    
    // 设置工作流位置 - 完全禁用移动节点时的日志输出
    updateNodePosition(nodeId: string, x: number, y: number): void {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        // 更新位置，不输出任何日志
        node.x = x;
        node.y = y;
      }
    },
    
    // 准备运行工作流
    prepareRun(): void {
      console.log(`[WorkflowStore] 准备运行工作流`);
      this.isRunning = false;
      this.result = '';
      this.details = [];
      this.traces = [];
    },
    
    // 执行工作流
    executeRun(inputValues: Record<string, any>): void {
      this.isRunning = true;
      
      console.log(`[WorkflowStore] 开始运行工作流，输入变量:`, inputValues);
      
      // 清空之前的结果
      this.result = '';
      this.details = [];
      this.traces = [];
      
      // 将输入的变量值应用到所有 LLM 节点
      this.nodes.forEach(node => {
        if (node.type === 'llm') {
          console.log(`[WorkflowStore] 处理LLM节点 id=${node.id}`);
          
          // 确保节点配置中有系统提示词
          if (node.config && node.config.systemPrompt) {
            // 获取原始系统提示词
            const systemPrompt = node.config.systemPrompt;
            
            // 创建带有变量替换的真实提示词
            const trueSystemPrompt = systemPrompt.replace(/\{([^}]+)\}/g, (match, varName) => {
              if (inputValues[varName] !== undefined) {
                console.log(`[WorkflowStore] 替换变量 ${varName} = ${inputValues[varName]}`);
                return inputValues[varName];
              }
              console.log(`[WorkflowStore] 未找到变量值 ${varName}，保留原始占位符`);
              return match; // 如果没有找到对应变量值，保留原始占位符
            });
            
            // 保存真实提示词到节点配置
            node.config.trueSystemPrompt = trueSystemPrompt;
            
            console.log(`[WorkflowStore] 节点 ${node.id} 的系统提示词已替换变量`);
            console.log(`[WorkflowStore] 原始提示词: ${systemPrompt}`);
            console.log(`[WorkflowStore] 替换后提示词: ${trueSystemPrompt}`);
          }
        }
      });
      
      console.log(`[WorkflowStore] 工作流运行准备完成`);
    },
    
    // 重置工作流
    resetWorkflow(): void {
      console.log(`[WorkflowStore] 重置工作流`);
      this.nodes = [];
      this.edges = [];
      this.selectedNodeId = null;
      this.name = '新工作流';
      this.description = '';
      console.log(`[WorkflowStore] 工作流已重置`);
    },
    
    // 加载工作流
    loadWorkflow(workflow: Workflow): void {
      console.log(`[WorkflowStore] 加载工作流 name=${workflow.name}, nodes=${workflow.nodes.length}, edges=${workflow.edges.length}`);
      this.nodes = workflow.nodes;
      this.edges = workflow.edges;
      this.name = workflow.name;
      this.description = workflow.description || '';
      this.selectedNodeId = null;
      console.log(`[WorkflowStore] 工作流已加载`);
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
      console.log('======== 工作流状态 ========');
      console.log(`名称: ${this.name}`);
      console.log(`描述: ${this.description}`);
      console.log(`节点数量: ${this.nodes.length}`);
      console.log(`连线数量: ${this.edges.length}`);
      console.log(`当前选中节点ID: ${this.selectedNodeId}`);
      console.log('节点列表:');
      this.nodes.forEach(node => {
        // 不打印具体位置信息
        console.log(`  - ID: ${node.id}, 类型: ${node.type}, 名称: ${node.name}`);
      });
      console.log('连线列表:');
      this.edges.forEach(edge => {
        console.log(`  - ID: ${edge.id}, 源: ${edge.source}, 目标: ${edge.target}`);
      });
      console.log('==============================');
    }
  }
});