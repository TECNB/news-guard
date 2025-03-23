import { defineStore } from 'pinia';
import { Node, Edge, NODE_TYPES, createNode, createEdge, Workflow, NodeRunStatus, NodeRunInfo } from '../types/workflow';

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
    // 存储节点输出值
    nodeOutputValues: {} as Record<string, any>,
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
          // 获取开始节点的输入变量
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
        
        // 使用BFS广度优先搜索算法来查找当前节点的所有前置节点
        const visited = new Set<string>(); // 记录已访问过的节点
        const queue: string[] = []; // BFS队列
        
        // 初始化队列，添加当前节点的直接前置节点
        const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
        const predecessorIds = incomingEdges.map(edge => edge.source);
        queue.push(...predecessorIds);
        
        // BFS遍历所有前置节点
        while (queue.length > 0) {
          const currentNodeId = queue.shift()!;
          
          // 如果已经访问过，跳过
          if (visited.has(currentNodeId)) continue;
          
          // 标记为已访问
          visited.add(currentNodeId);
          
          // 获取当前节点
          const node = this.nodes.find(n => n.id === currentNodeId);
          if (!node || !node.outputs || node.outputs.length === 0) continue;
          
          // 根据节点类型设置不同的颜色
          let color = 'blue';
          if (node.type === 'knowledge') color = 'purple';
          else if (node.type === 'llm') color = 'blue';
          else if (node.type === 'conditional') color = 'yellow';
          
          // 为节点添加输出变量，并附加节点ID
          const variables = node.outputs.map(output => {
            // 添加节点ID作为后缀，创建唯一变量名
            const variableName = `${output}_${node.id}`;
            return { 
              name: variableName,
              displayName: output,  // 用于界面显示的名称
              nodeId: node.id,      // 节点ID 
              type: 'String',       // 变量类型
              color 
            };
          });
          
          if (variables.length > 0) {
            result.push({
              nodeId: node.id,
              nodeName: `${node.name} (${node.type})`,
              variables
            });
          }
          
          // 将当前节点的所有前置节点加入队列
          const nodeIncomingEdges = this.edges.filter(edge => edge.target === currentNodeId);
          const nodePredecessorIds = nodeIncomingEdges.map(edge => edge.source);
          queue.push(...nodePredecessorIds);
        }
        
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
            outputs: selectedNode.outputs,
            outputValues: selectedNode.outputValues
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
    
    // 设置节点的输出值
    setNodeOutputValue(nodeId: string, outputName: string, value: any): void {
      console.log(`[WorkflowStore] 设置节点 ${nodeId} 的输出 ${outputName} 为:`, value);
      
      // 找到对应的节点
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        // 确保节点有outputValues属性
        if (!node.outputValues) {
          node.outputValues = {};
        }
        
        // 设置节点的输出值
        node.outputValues[outputName] = value;
        console.log(`[WorkflowStore] 节点 ${nodeId} 的输出值已设置`);
      }
      
      // 创建输出变量的唯一标识符
      const outputKey = `${outputName}_${nodeId}`;
      
      // 设置到nodeOutputValues中
      this.nodeOutputValues[outputKey] = value;
      
      // 全局文本变量也设置一下，用于向后兼容
      if (outputName === 'text') {
        this.nodeOutputValues['text'] = value;
      }
      
      console.log(`[WorkflowStore] 节点输出已保存到全局 ${outputKey}`);
    },
    
    // 获取节点的输出值
    getNodeOutputValue(nodeId: string, outputName: string): any {
      // 先尝试从节点自身获取
      const node = this.nodes.find(n => n.id === nodeId);
      if (node && node.outputValues && node.outputValues[outputName] !== undefined) {
        return node.outputValues[outputName];
      }
      
      // 再尝试从全局中获取
      const outputKey = `${outputName}_${nodeId}`;
      return this.nodeOutputValues[outputKey];
    },
    
    // 获取所有节点的输出值
    getAllNodeOutputValues(): Record<string, any> {
      return this.nodeOutputValues;
    },
    
    // 获取最终输出结果
    getFinalResult(): string {
      // 检查是否有结束节点
      const endNode = this.nodes.find(node => node.type === 'end');
      if (!endNode) {
        return '抱歉没有连接到结束节点，请转到详细信息面板查看它';
      }
      
      // 检查结束节点是否有连入边
      const hasIncomingEdges = this.edges.some(edge => edge.target === endNode.id);
      if (!hasIncomingEdges) {
        return '抱歉没有连接到结束节点，请转到详细信息面板查看它';
      }
      
      // 寻找输入到结束节点的前一个节点
      const incomingEdges = this.edges.filter(edge => edge.target === endNode.id);
      
      // 如果有输入边，获取源节点的输出
      if (incomingEdges.length > 0) {
        const sourceNodeIds = incomingEdges.map(edge => edge.source);
        
        // 构建输出结果
        let finalResult = '';
        
        for (const sourceNodeId of sourceNodeIds) {
          const sourceNode = this.nodes.find(node => node.id === sourceNodeId);
          if (sourceNode) {
            // 对于每一个源节点，优先从节点的outputValues获取输出结果
            if (sourceNode.outputValues && Object.keys(sourceNode.outputValues).length > 0) {
              // 如果节点有自己的outputValues，直接使用
              Object.values(sourceNode.outputValues).forEach(value => {
                if (value !== undefined) {
                  if (finalResult) finalResult += '\n\n';
                  finalResult += value;
                }
              });
            } else {
              // 否则从全局nodeOutputValues获取
              sourceNode.outputs.forEach(outputName => {
                const outputKey = `${outputName}_${sourceNodeId}`;
                const outputValue = this.nodeOutputValues[outputKey];
                
                if (outputValue !== undefined) {
                  if (finalResult) finalResult += '\n\n';
                  finalResult += outputValue;
                }
              });
            }
          }
        }
        
        return finalResult || '工作流执行完成，但没有产生输出结果';
      } else {
        return '工作流执行完成，但没有产生输出结果';
      }
    },
    
    // 准备运行工作流
    prepareRun(): void {
      console.log(`[WorkflowStore] 准备运行工作流`);
      this.isRunning = false;
      this.result = '';
      this.details = [];
      this.traces = [];
      this.nodeOutputValues = {}; // 清空节点输出值
      
      // 清空所有节点的outputValues和运行状态
      this.nodes.forEach(node => {
        node.outputValues = {};
        node.runStatus = NodeRunStatus.IDLE;
        node.runInfo = {
          status: NodeRunStatus.IDLE
        };
      });
    },
    
    // 执行工作流
    executeRun(inputValues: Record<string, any>): void {
      this.isRunning = true;
      
      console.log(`[WorkflowStore] 开始运行工作流，输入变量:`, inputValues);
      
      // 清空之前的结果
      this.result = '';
      this.details = [];
      this.traces = [];
      
      // 将输入值设置为开始节点的outputValues
      const startNode = this.nodes.find(node => node.type === 'start');
      if (startNode) {
        startNode.outputValues = { ...inputValues };
        startNode.runStatus = NodeRunStatus.COMPLETED;
        startNode.runInfo = {
          status: NodeRunStatus.COMPLETED,
          startTime: Date.now(),
          endTime: Date.now()
        };
        console.log(`[WorkflowStore] 设置开始节点输出值:`, startNode.outputValues);
      }
      
      console.log(`[WorkflowStore] 工作流运行准备完成`);
    },
    
    // 替换提示词中的变量
    replaceVariablesInPrompt(prompt: string, nodeId: string, inputValues: Record<string, any>): string {
      return this.replaceVariables(prompt, nodeId, inputValues);
    },
    
    // 通用的变量替换方法 - 用于替换任何字符串中的变量
    replaceVariables(text: string, currentNodeId: string, inputValues: Record<string, any>): string {
      if (!text) return text;
      
      console.log(`[WorkflowStore] 为节点 ${currentNodeId} 替换变量`);
      console.log(`[WorkflowStore] 原始文本: ${text}`);
      
      // 替换变量占位符 {variable} 或 {outputName_nodeId}
      const replacedText = text.replace(/\{([^}]+)\}/g, (match, varName) => {
        // 检查是否是带节点ID的变量格式（例如：text_node-1742706227604-946）
        const varParts = varName.split('_');
        if (varParts.length === 2) {
          const [outputName, nodeId] = varParts;
          const sourceNode = this.nodes.find(n => n.id === nodeId);
          
          if (sourceNode && sourceNode.outputValues && sourceNode.outputValues[outputName] !== undefined) {
            console.log(`[WorkflowStore] 替换节点变量 ${varName} = ${sourceNode.outputValues[outputName]}`);
            return sourceNode.outputValues[outputName];
          }
          
          // 检查全局节点输出值
          const outputValue = this.nodeOutputValues[varName];
          if (outputValue !== undefined) {
            console.log(`[WorkflowStore] 替换全局变量 ${varName} = ${outputValue}`);
            return outputValue;
          }
        } 
        // 尝试从输入变量或普通变量中获取
        else if (inputValues[varName] !== undefined) {
          console.log(`[WorkflowStore] 替换输入变量 ${varName} = ${inputValues[varName]}`);
          return inputValues[varName];
        }
        
        console.log(`[WorkflowStore] 未找到变量值 ${varName}，保留原始占位符`);
        return match; // 如果没有找到对应变量值，保留原始占位符
      });
      
      console.log(`[WorkflowStore] 替换后文本: ${replacedText}`);
      return replacedText;
    },
    
    // 准备LLM节点执行
    prepareLLMNodeExecution(nodeId: string, inputValues: Record<string, any>): void {
      const node = this.nodes.find(n => n.id === nodeId);
      
      if (node && node.type === 'llm' && node.config && node.config.systemPrompt) {
        console.log(`[WorkflowStore] 准备执行LLM节点 id=${nodeId}`);
        
        // 获取原始系统提示词
        const systemPrompt = node.config.systemPrompt;
        
        // 在节点执行时替换变量
        const trueSystemPrompt = this.replaceVariables(systemPrompt, nodeId, inputValues);
        
        // 保存真实提示词到节点配置
        node.config.trueSystemPrompt = trueSystemPrompt;
        
        // 更新节点运行状态
        node.runStatus = NodeRunStatus.WAITING;
        node.runInfo = {
          status: NodeRunStatus.WAITING,
          startTime: Date.now()
        };
      }
    },
    
    // 准备条件节点执行
    prepareConditionalNodeExecution(nodeId: string, inputValues: Record<string, any>): void {
      const node = this.nodes.find(n => n.id === nodeId);
      
      if (node && node.type === 'conditional' && node.config) {
        console.log(`[WorkflowStore] 准备执行条件节点 id=${nodeId}`);
        
        // 获取原始条件表达式
        const expression = node.config.expression || '';
        
        // 在节点执行时替换变量
        const trueExpression = this.replaceVariables(expression, nodeId, inputValues);
        
        // 保存真实表达式到节点配置
        node.config.trueExpression = trueExpression;
        
        // 更新节点运行状态
        node.runStatus = NodeRunStatus.WAITING;
        node.runInfo = {
          status: NodeRunStatus.WAITING,
          startTime: Date.now()
        };
      }
    },
    
    // 准备知识库节点执行
    prepareKnowledgeNodeExecution(nodeId: string, inputValues: Record<string, any>): void {
      const node = this.nodes.find(n => n.id === nodeId);
      
      if (node && node.type === 'knowledge' && node.config) {
        console.log(`[WorkflowStore] 准备执行知识库节点 id=${nodeId}`);
        
        // 更新节点运行状态
        node.runStatus = NodeRunStatus.WAITING;
        node.runInfo = {
          status: NodeRunStatus.WAITING,
          startTime: Date.now()
        };
      }
    },
    
    // 准备节点执行 - 根据节点类型调用对应的准备方法
    prepareNodeExecution(nodeId: string, inputValues: Record<string, any>): void {
      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      console.log(`[WorkflowStore] 准备执行节点 id=${nodeId}, type=${node.type}`);
      
      switch (node.type) {
        case 'llm':
          this.prepareLLMNodeExecution(nodeId, inputValues);
          break;
        case 'conditional':
          this.prepareConditionalNodeExecution(nodeId, inputValues);
          break;
        case 'knowledge':
          this.prepareKnowledgeNodeExecution(nodeId, inputValues);
          break;
        case 'start':
          // 开始节点不需要特殊准备
          break;
        case 'end':
          // 结束节点不需要特殊准备
          break;
        default:
          console.warn(`[WorkflowStore] 未知节点类型: ${node.type}`);
      }
    },
    
    // 开始执行节点
    startNodeExecution(nodeId: string): void {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        console.log(`[WorkflowStore] 开始执行节点 id=${nodeId}, type=${node.type}`);
        node.runStatus = NodeRunStatus.RUNNING;
        if (node.runInfo) {
          node.runInfo.status = NodeRunStatus.RUNNING;
        } else {
          node.runInfo = {
            status: NodeRunStatus.RUNNING,
            startTime: Date.now()
          };
        }
        
        // 添加节点执行追踪记录
        this.traces.push({
          node: node.id,
          timestamp: new Date().toISOString(),
          message: `开始执行节点: ${node.name}`
        });
      }
    },
    
    // 完成节点执行
    completeNodeExecution(nodeId: string, success: boolean = true, error?: string): void {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        console.log(`[WorkflowStore] ${success ? '成功' : '失败'}完成节点 id=${nodeId}, type=${node.type}`);
        
        node.runStatus = success ? NodeRunStatus.COMPLETED : NodeRunStatus.ERROR;
        if (node.runInfo) {
          node.runInfo.status = success ? NodeRunStatus.COMPLETED : NodeRunStatus.ERROR;
          node.runInfo.endTime = Date.now();
          if (!success && error) {
            node.runInfo.error = error;
          }
        } else {
          node.runInfo = {
            status: success ? NodeRunStatus.COMPLETED : NodeRunStatus.ERROR,
            startTime: Date.now(),
            endTime: Date.now(),
            error: !success ? error : undefined
          };
        }
        
        // 添加节点执行追踪记录
        this.traces.push({
          node: node.id,
          timestamp: new Date().toISOString(),
          message: success 
            ? `节点执行完成: ${node.name}` 
            : `节点执行失败: ${node.name} - ${error || '未知错误'}`
        });
      }
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