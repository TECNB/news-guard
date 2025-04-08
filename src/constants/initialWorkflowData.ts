/**
 * 工作流初始数据
 * 包含默认工作流的节点和边的定义
 */

// 创建节点
const startNode = {
    id: 'node-start',
    name: '开始节点',
    type: 'start',
    x: 10, 
    y: 150,
    inputs: ['news', 'ability_level'],
    outputs: [],
    config: { variables: [] },
    outputValues: {},
    runInfo: { status: 'idle' }
};

const conditionalNode = {
    id: 'node-conditional',
    name: '条件节点',
    type: 'conditional',
    x: 300,
    y: 150,
    inputs: ['condition'],
    outputs: ['true', 'false'],
    config: {
        conditionType: 'content',
        expression: '',
        conditions: [{
            field: 'ability_level',
            operator: 'eq',
            value: 'case1'
        }],
        branches: [{
            field: 'ability_level',
            operator: 'eq',
            value: 'case2'
        }],
        elseAction: ''
    },
    outputValues: {},
    runInfo: { status: 'idle' }
};

// 联网节点 - L2前置
const networkNode1 = {
    id: 'node-network-1',
    name: '基础联网搜索',
    type: 'search',
    x: 600,
    y: 250,
    inputs: ['query'],
    outputs: ['results'],
    config: {
        searchEngine: 'google',
        maxResults: 5,
        queryPrompt: ''
    },
    outputValues: {},
    runInfo: { status: 'idle' }
};

// 联网节点 - L3前置
const networkNode2 = {
    id: 'node-network-2',
    name: '深度联网搜索',
    type: 'search',
    x: 600,
    y: 450,
    inputs: ['query'],
    outputs: ['results'],
    config: {
        searchEngine: 'google',
        maxResults: 5,
        queryPrompt: ''
    },
    outputValues: {},
    runInfo: { status: 'idle' }
};

// LLM节点 L1
const llmNode1 = {
    id: 'node-llm-1',
    name: 'L1',
    type: 'llm',
    x: 600,
    y: 50,
    inputs: [],
    outputs: ['text'],
    config: {
        model: 'deepseek-chat',
        temperature: 0.7,
        systemPrompt: '',
        trueSystemPrompt: ''
    },
    outputValues: {},
    runInfo: { status: 'idle' }
};

// LLM节点 L2
const llmNode2 = {
    id: 'node-llm-2',
    name: 'L2',
    type: 'llm',
    x: 900,
    y: 250,
    inputs: [],
    outputs: ['text'],
    config: {
        model: 'deepseek-chat',
        temperature: 0.7,
        systemPrompt: '',
        trueSystemPrompt: ''
    },
    outputValues: {},
    runInfo: { status: 'idle' }
};

// LLM节点 L3
const llmNode3 = {
    id: 'node-llm-3',
    name: 'L3',
    type: 'llm',
    x: 900,
    y: 450,
    inputs: [],
    outputs: ['text'],
    config: {
        model: 'deepseek-chat',
        temperature: 0.7,
        systemPrompt: '',
        trueSystemPrompt: ''
    },
    outputValues: {},
    runInfo: { status: 'idle' }
};

// 结束节点 1 (L1后)
const endNode1 = {
    id: 'node-end-1',
    name: '输出节点1',
    type: 'end',
    x: 900,
    y: 50,
    inputs: [],
    outputs: [],
    config: {},
    outputValues: {},
    runInfo: { status: 'idle' }
};

// 结束节点 2 (L2后)
const endNode2 = {
    id: 'node-end-2',
    name: '输出节点2',
    type: 'end',
    x: 1200,
    y: 250,
    inputs: [],
    outputs: [],
    config: {},
    outputValues: {},
    runInfo: { status: 'idle' }
};

// 结束节点 3 (L3后)
const endNode3 = {
    id: 'node-end-3',
    name: '输出节点3',
    type: 'end',
    x: 1200,
    y: 450,
    inputs: [],
    outputs: [],
    config: {},
    outputValues: {},
    runInfo: { status: 'idle' }
};

// 所有节点
export const initialNodes = [
    startNode,
    conditionalNode,
    networkNode1,
    networkNode2,
    llmNode1,
    llmNode2,
    llmNode3,
    endNode1,
    endNode2,
    endNode3
];

// 所有边
export const initialEdges = [
    // 开始节点到条件节点
    {
        id: 'edge-start-conditional',
        source: startNode.id,
        target: conditionalNode.id
    },
    // 条件节点 CASE 1 到 L1
    {
        id: 'edge-conditional-llm1',
        source: conditionalNode.id,
        target: llmNode1.id,
        // 这条边将被视为条件节点的第一个输出边（IF分支）
    },
    // 条件节点 CASE 2 到 网络节点1
    {
        id: 'edge-conditional-network1',
        source: conditionalNode.id,
        target: networkNode1.id,
        // 这条边将被视为条件节点的第二个输出边（ELIF分支）
    },
    // 条件节点 ELSE 到 网络节点2
    {
        id: 'edge-conditional-network2',
        source: conditionalNode.id,
        target: networkNode2.id,
        // 这条边将被视为条件节点的最后一个输出边（ELSE分支）
    },
    // 网络节点1 到 L2
    {
        id: 'edge-network1-llm2',
        source: networkNode1.id,
        target: llmNode2.id
    },
    // 网络节点2 到 L3
    {
        id: 'edge-network2-llm3',
        source: networkNode2.id,
        target: llmNode3.id
    },
    // L1 到 结束节点1
    {
        id: 'edge-llm1-end1',
        source: llmNode1.id,
        target: endNode1.id
    },
    // L2 到 结束节点2
    {
        id: 'edge-llm2-end2',
        source: llmNode2.id,
        target: endNode2.id
    },
    // L3 到 结束节点3
    {
        id: 'edge-llm3-end3',
        source: llmNode3.id,
        target: endNode3.id
    }
];

// 为方便使用，导出完整的初始工作流数据
export const initialWorkflowData = {
    nodes: initialNodes,
    edges: initialEdges
}; 