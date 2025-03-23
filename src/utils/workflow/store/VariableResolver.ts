import { Node } from '@/types/workflow';
import { WorkflowLogger } from './WorkflowLogger';

/**
 * 变量解析工具类
 * 用于处理工作流中的变量替换操作
 */
export class VariableResolver {
    private logger: WorkflowLogger;

    /**
     * 创建变量解析工具实例
     * @param logger 日志工具实例
     */
    constructor(logger?: WorkflowLogger) {
        this.logger = logger || new WorkflowLogger('[VariableResolver]');
    }

    /**
     * 替换提示词中的变量
     * @param prompt 提示词
     * @param nodeId 当前节点ID
     * @param inputValues 输入变量值
     * @param nodes 节点数组
     * @returns 替换变量后的提示词
     */
    replaceVariablesInPrompt(
        prompt: string,
        nodeId: string,
        inputValues: Record<string, any>,
        nodes: Node[]
    ): string {
        return this.replaceVariables(prompt, nodeId, inputValues, nodes);
    }

    /**
     * 通用的变量替换方法
     * @param text 待替换的文本
     * @param currentNodeId 当前节点ID
     * @param inputValues 输入变量值
     * @param nodes 节点数组
     * @returns 替换变量后的文本
     */
    replaceVariables(
        text: string,
        currentNodeId: string,
        inputValues: Record<string, any>,
        nodes: Node[]
    ): string {
        if (!text) return text;

        this.logger.log(`为节点 ${currentNodeId} 替换变量`);
        this.logger.log(`原始文本: ${text}`);

        // 替换变量占位符 {variable} 或 {outputName_nodeId}
        const replacedText = text.replace(/\{([^}]+)\}/g, (match, varName) => {
            // 检查是否是带节点ID的变量格式（例如：text_node-1742706227604-946）
            const varParts = varName.split('_');
            if (varParts.length === 2) {
                const [outputName, nodeId] = varParts;
                const sourceNode = nodes.find(n => n.id === nodeId);

                if (sourceNode && sourceNode.outputValues && sourceNode.outputValues[outputName] !== undefined) {
                    this.logger.log(`替换节点变量 ${varName} = ${sourceNode.outputValues[outputName]}`);
                    return sourceNode.outputValues[outputName];
                }
            }
            // 尝试从输入变量或普通变量中获取
            else if (inputValues[varName] !== undefined) {
                this.logger.log(`替换输入变量 ${varName} = ${inputValues[varName]}`);
                return inputValues[varName];
            }

            this.logger.log(`未找到变量值 ${varName}，保留原始占位符`);
            return match; // 如果没有找到对应变量值，保留原始占位符
        });

        this.logger.log(`替换后文本: ${replacedText}`);
        return replacedText;
    }

    /**
     * 获取节点可用的所有变量
     * @param nodeId 节点ID
     * @param nodes 节点数组
     * @param edges 边数组
     * @returns 可用变量列表
     */
    getNodeAvailableVariables(
        nodeId: string | null,
        nodes: Node[],
        edges: any[]
    ): any[] {
        if (!nodeId) return [];

        const result = [];

        // 添加开始节点变量
        const startNode = nodes.find(node => node.type === 'start');
        if (startNode) {
            // 获取开始节点的输入变量
            const variables = (startNode.inputs || [])
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
        const incomingEdges = edges.filter(edge => edge.target === nodeId);
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
            const node = nodes.find(n => n.id === currentNodeId);
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
            const nodeIncomingEdges = edges.filter(edge => edge.target === currentNodeId);
            const nodePredecessorIds = nodeIncomingEdges.map(edge => edge.source);
            queue.push(...nodePredecessorIds);
        }

        return result;
    }

    /**
     * 获取开始节点的输入变量
     * @param nodes 节点数组
     * @returns 输入变量对象
     */
    getInputVariables(nodes: Node[]): Record<string, any> {
        const startNode = nodes.find(node => node.type === 'start');
        const variables: Record<string, any> = {};

        if (startNode && startNode.inputs && startNode.inputs.length > 0) {
            startNode.inputs.forEach(variable => {
                if (variable.trim() !== '') {
                    variables[variable] = '';
                }
            });
        }

        return variables;
    }
} 