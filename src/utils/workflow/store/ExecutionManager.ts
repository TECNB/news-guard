import { Node, NodeRunStatus } from '@/types/workflow';
import { WorkflowLogger } from './WorkflowLogger';
import { VariableResolver } from './VariableResolver';

/**
 * 执行管理工具类
 * 用于处理工作流节点的执行状态管理
 */
export class ExecutionManager {
    private logger: WorkflowLogger;
    private variableResolver: VariableResolver;

    /**
     * 创建执行管理工具实例
     * @param logger 日志工具实例
     * @param variableResolver 变量解析工具实例
     */
    constructor(logger?: WorkflowLogger, variableResolver?: VariableResolver) {
        this.logger = logger || new WorkflowLogger('[ExecutionManager]');
        this.variableResolver = variableResolver || new VariableResolver(this.logger.createSubLogger('VariableResolver'));
    }

    /**
     * 准备运行工作流
     * @param nodes 节点数组
     * @param result 当前结果
     * @param details 当前详情
     * @param traces 当前执行轨迹
     */
    prepareRun(
        nodes: Node[],
        result: { value: string },
        details: Array<{ name: string, description: string, value: any }>,
        traces: Array<{ node: string, timestamp: string, message: string }>
    ): void {
        this.logger.log(`准备运行工作流`);
        result.value = '';
        details.length = 0;
        traces.length = 0;

        // 清空所有节点的outputValues和运行状态
        nodes.forEach(node => {
            node.outputValues = {};
            node.runInfo = {
                status: NodeRunStatus.IDLE
            };
        });
    }

    /**
     * 执行工作流
     * @param nodes 节点数组
     * @param result 结果对象
     * @param details 详情数组
     * @param traces 执行轨迹数组
     * @param inputValues 输入变量值
     * @returns 是否正在运行
     */
    executeRun(
        nodes: Node[],
        result: { value: string },
        details: Array<{ name: string, description: string, value: any }>,
        traces: Array<{ node: string, timestamp: string, message: string }>,
        inputValues: Record<string, any>
    ): boolean {
        this.logger.log(`开始运行工作流，输入变量:`, inputValues);

        // 清空之前的结果
        result.value = '';
        details.length = 0;
        traces.length = 0;

        // 将输入值设置为开始节点的outputValues
        const startNode = nodes.find(node => node.type === 'start');
        if (startNode) {
            startNode.outputValues = { ...inputValues };
            startNode.runInfo = {
                status: NodeRunStatus.COMPLETED,
                startTime: Date.now(),
                endTime: Date.now()
            };
            this.logger.log(`设置开始节点输出值:`, startNode.outputValues);
        }

        this.logger.log(`工作流运行准备完成`);
        return true;
    }

    /**
     * 准备节点执行
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param inputValues 输入变量值
     */
    prepareNodeExecution(
        nodes: Node[],
        nodeId: string,
        inputValues: Record<string, any>
    ): void {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        this.logger.log(`准备执行节点 id=${nodeId}, type=${node.type}`);

        switch (node.type) {
            case 'llm':
                this.prepareLLMNodeExecution(nodes, nodeId, inputValues);
                break;
            case 'conditional':
                this.prepareConditionalNodeExecution(nodes, nodeId, inputValues);
                break;
            case 'knowledge':
                this.prepareKnowledgeNodeExecution(nodes, nodeId, inputValues);
                break;
            case 'start':
                // 开始节点不需要特殊准备
                break;
            case 'end':
                // 结束节点不需要特殊准备
                break;
            default:
                this.logger.warn(`未知节点类型: ${node.type}`);
        }
    }

    /**
     * 准备LLM节点执行
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param inputValues 输入变量值 
     */
    private prepareLLMNodeExecution(
        nodes: Node[],
        nodeId: string,
        inputValues: Record<string, any>
    ): void {
        const node = nodes.find(n => n.id === nodeId);

        if (node && node.type === 'llm' && node.config && node.config.systemPrompt) {
            this.logger.log(`准备执行LLM节点 id=${nodeId}`);

            // 获取原始系统提示词
            const systemPrompt = node.config.systemPrompt;

            // 在节点执行时替换变量
            const trueSystemPrompt = this.variableResolver.replaceVariables(
                systemPrompt,
                nodeId,
                inputValues,
                nodes
            );

            // 保存真实提示词到节点配置
            node.config.trueSystemPrompt = trueSystemPrompt;

            // 更新节点运行状态
            node.runInfo = {
                status: NodeRunStatus.WAITING,
                startTime: Date.now()
            };
        }
    }

    /**
     * 准备条件节点执行
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param inputValues 输入变量值
     */
    private prepareConditionalNodeExecution(
        nodes: Node[],
        nodeId: string,
        inputValues: Record<string, any>
    ): void {
        const node = nodes.find(n => n.id === nodeId);

        if (node && node.type === 'conditional' && node.config) {
            this.logger.log(`准备执行条件节点 id=${nodeId}`);

            // 获取原始条件表达式
            const expression = node.config.expression || '';

            // 在节点执行时替换变量
            const trueExpression = this.variableResolver.replaceVariables(
                expression,
                nodeId,
                inputValues,
                nodes
            );

            // 保存真实表达式到节点配置
            node.config.trueExpression = trueExpression;

            // 更新节点运行状态
            node.runInfo = {
                status: NodeRunStatus.WAITING,
                startTime: Date.now()
            };
        }
    }

    /**
     * 准备知识库节点执行
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param inputValues 输入变量值
     */
    private prepareKnowledgeNodeExecution(
        nodes: Node[],
        nodeId: string,
        inputValues: Record<string, any>
    ): void {
        const node = nodes.find(n => n.id === nodeId);

        if (node && node.type === 'knowledge' && node.config) {
            this.logger.log(`准备执行知识库节点 id=${nodeId}`);

            // 更新节点运行状态
            node.runInfo = {
                status: NodeRunStatus.WAITING,
                startTime: Date.now()
            };
        }
    }

    /**
     * 开始执行节点
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param traces 执行轨迹数组
     */
    startNodeExecution(
        nodes: Node[],
        nodeId: string,
        traces: Array<{ node: string, timestamp: string, message: string }>
    ): void {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            this.logger.log(`开始执行节点 id=${nodeId}, type=${node.type}`);
            if (node.runInfo) {
                node.runInfo.status = NodeRunStatus.RUNNING;
            } else {
                node.runInfo = {
                    status: NodeRunStatus.RUNNING,
                    startTime: Date.now()
                };
            }

            // 添加节点执行追踪记录
            traces.push({
                node: node.id,
                timestamp: new Date().toISOString(),
                message: `开始执行节点: ${node.name}`
            });
        }
    }

    /**
     * 完成节点执行
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param traces 执行轨迹数组
     * @param success 是否执行成功
     * @param error 错误信息
     */
    completeNodeExecution(
        nodes: Node[],
        nodeId: string,
        traces: Array<{ node: string, timestamp: string, message: string }>,
        success: boolean = true,
        error?: string
    ): void {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            this.logger.log(`${success ? '成功' : '失败'}完成节点 id=${nodeId}, type=${node.type}`);

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
            traces.push({
                node: node.id,
                timestamp: new Date().toISOString(),
                message: success
                    ? `节点执行完成: ${node.name}`
                    : `节点执行失败: ${node.name} - ${error || '未知错误'}`
            });
        }
    }
} 