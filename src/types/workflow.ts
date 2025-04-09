/**
 * 工作流类型定义
 * 此文件包含与工作流编排相关的所有类型定义
 */

/**
 * 开始节点配置接口
 */
export interface StartConfig {
  variables: string[];
}

/**
 * LLM节点配置接口
 */
export interface LLMConfig {
  model: string;
  temperature: number;
  systemPrompt: string;
  trueSystemPrompt?: string;
}

/**
 * 知识库节点配置接口
 */
export interface KnowledgeConfig {
  knowledgeBase: string;
  topK: number;
}

/**
 * 条件节点配置接口
 */
export interface ConditionalConfig {
  conditionType: string;
  expression: string;
}

/**
 * 搜索节点配置接口
 */
export interface SearchConfig {
  searchEngine: string;
  maxResults: number;
  queryPrompt: string;
}

/**
 * 节点配置接口
 * 包含不同类型节点的所有可能配置项
 */
export interface NodeConfig extends Partial<LLMConfig>, 
  Partial<KnowledgeConfig>, 
  Partial<ConditionalConfig>,
  Partial<SearchConfig> {
  variableValues?: Record<string, any>;
  trueSystemPrompt?: string;
  trueExpression?: string;  // 条件节点的实际执行表达式（替换变量后）
  outputAsHtml?: boolean;   // 是否将输出内容渲染为HTML
}

/**
 * 节点运行状态枚举
 */
export enum NodeRunStatus {
  IDLE = 'idle',       // 空闲状态
  WAITING = 'waiting', // 等待执行
  RUNNING = 'running', // 正在执行
  COMPLETED = 'completed', // 执行完成
  ERROR = 'error'      // 执行错误
}

/**
 * 节点运行信息接口
 */
export interface NodeRunInfo {
  status: NodeRunStatus;
  startTime?: number;
  endTime?: number;
  error?: string;
}

/**
 * 节点接口
 * 定义工作流中节点的基本属性
 */
export interface Node {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
  config: NodeConfig;
  outputValues?: Record<string, any>;
  runInfo?: NodeRunInfo;     // 节点运行信息
}

/**
 * 边接口
 * 定义节点之间的连接关系
 */
export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

/**
 * 工作流接口
 * 完整工作流定义，包含节点和边
 */
export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 节点类型
 * 定义工作流中可用的节点类型及其默认配置
 */
export const NODE_TYPES = [
  { 
    type: 'start', 
    name: '开始节点', 
    colorClass: 'bg-green-500',
    defaultConfig: {
      variables: []
    }
  },
  { 
    type: 'llm', 
    name: 'LLM节点', 
    colorClass: 'bg-blue-500',
    defaultConfig: {
      model: 'deepseek-chat',
      temperature: 0.7,
      systemPrompt: '',
      trueSystemPrompt: ''
    }
  },
  { 
    type: 'knowledge', 
    name: '知识检索节点', 
    colorClass: 'bg-purple-500',
    defaultConfig: {
      knowledgeBase: 'news',
      topK: 3
    }
  },
  { 
    type: 'conditional', 
    name: '条件节点', 
    colorClass: 'bg-yellow-500',
    defaultConfig: {
      conditionType: 'content',
      expression: ''
    }
  },
  { 
    type: 'search', 
    name: '联网搜索节点', 
    colorClass: 'bg-blue-400',
    defaultConfig: {
      searchEngine: 'google',
      maxResults: 5,
      queryPrompt: ''
    }
  },
  { 
    type: 'end', 
    name: '输出节点', 
    colorClass: 'bg-red-500',
    defaultConfig: {}
  },
];

/**
 * 创建新节点
 * 工厂函数，用于创建指定类型的新节点
 */
export function createNode(type: string, x: number, y: number): Node {
  console.log(`尝试创建节点类型: ${type}`, NODE_TYPES.map(nt => nt.type));
  const nodeType = NODE_TYPES.find(nt => nt.type === type);
  
  if (!nodeType) {
    console.error(`找不到节点类型: ${type}，可用类型:`, NODE_TYPES.map(nt => nt.type));
    throw new Error(`不支持的节点类型: ${type}`);
  }
  
  // 创建基本节点
  const node: Node = {
    id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: nodeType.name,
    type,
    x,
    y,
    inputs: [],
    outputs: [],
    config: { ...nodeType.defaultConfig }
  };
  
  // 根据节点类型设置默认输入输出
  if (type === 'start') {
    // node.outputs = ['query'];
  } else if (type === 'llm') {
    // node.inputs = ['prompt'];
    node.outputs = ['text'];
  } else if (type === 'knowledge') {
    // node.inputs = ['query'];
    node.outputs = ['knowledge'];
  } else if (type === 'conditional') {
    node.inputs = ['condition'];
    node.outputs = ['true', 'false'];
  } else if (type === 'search') {
    node.inputs = ['query'];
    node.outputs = ['results'];
  }
  
  return node;
}

/**
 * 创建边
 * 工厂函数，用于创建连接两个节点的新边
 */
export function createEdge(source: string, target: string): Edge {
  return {
    id: `edge-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    source,
    target
  };
}
