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
        traces: Array<{ 
            node: string, 
            timestamp: string, 
            message: string,
            data?: {
                inputs: Record<string, any>,
                outputs: Record<string, any>,
                error?: string
            }
        }>
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
        traces: Array<{ 
            node: string, 
            timestamp: string, 
            message: string,
            data?: {
                inputs: Record<string, any>,
                outputs: Record<string, any>,
                error?: string
            }
        }>,
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
        traces: Array<{ 
            node: string, 
            timestamp: string, 
            message: string,
            data?: {
                inputs: Record<string, any>,
                outputs: Record<string, any>,
                error?: string
            },
            status?: string  // 添加状态字段，用于在TracePanel中显示不同状态
        }>
    ): void {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            this.logger.log(`开始执行节点 id=${nodeId}, type=${node.type}`);
            
            // 更新节点运行状态
            if (node.runInfo) {
                node.runInfo.status = NodeRunStatus.RUNNING;
            } else {
                node.runInfo = {
                    status: NodeRunStatus.RUNNING,
                    startTime: Date.now()
                };
            }
            
            // 为非开始节点添加"运行中"的轨迹记录
            if (node.type !== 'start') {
                this.addNodeStartTraceRecord(node, traces);
            }
        }
    }

    /**
     * 添加节点开始执行轨迹记录
     * @param node 节点对象
     * @param traces 执行轨迹数组
     */
    private addNodeStartTraceRecord(
        node: Node,
        traces: Array<{ 
            node: string, 
            timestamp: string, 
            message: string,
            data?: {
                inputs: Record<string, any>,
                outputs: Record<string, any>,
                error?: string
            },
            status?: string
        }>
    ): void {
        // 获取基本信息
        const nodeName = node.name || node.type;
        const timestamp = new Date().toLocaleTimeString();
        const message = '节点执行中';
        
        // 准备输入数据
        const traceData: {
            inputs: Record<string, any>,
            outputs: Record<string, any>
        } = {
            inputs: {},
            outputs: {}
        };
        
        // 根据节点类型获取输入数据
        switch (node.type) {
            case 'llm':
                // LLM节点的输入是提示词
                const prompt = node.config?.trueSystemPrompt || node.config?.systemPrompt || '';
                traceData.inputs = { prompt };
                break;
                
            case 'knowledge':
                // 知识检索节点的输入数据
                if (node.config) {
                    traceData.inputs = { ...node.config };
                }
                break;
                
            case 'conditional':
                // 条件节点的输入是表达式
                const expression = node.config?.trueExpression || node.config?.expression || '';
                traceData.inputs = { expression };
                break;
                
            default:
                // 其他类型节点，尽可能收集输入
                if (node.config) {
                    traceData.inputs = { ...node.config };
                }
        }
        
        // 添加执行轨迹记录，并标记状态为"running"
        traces.push({
            node: nodeName,
            timestamp,
            message,
            data: traceData,
            status: 'running'  // 添加状态标记
        });
        
        this.logger.log(`添加节点开始执行轨迹: ${nodeName}, 状态: ${message}`);
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
        traces: Array<{ 
            node: string, 
            timestamp: string, 
            message: string,
            data?: {
                inputs: Record<string, any>,
                outputs: Record<string, any>,
                error?: string
            }
        }>,
        success: boolean = true,
        error?: string
    ): void {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        this.logger.log(`${success ? '成功' : '失败'}完成节点 id=${nodeId}, type=${node.type}`);

        // 更新节点运行状态
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

        // 根据节点类型和状态添加执行轨迹记录
        this.addNodeTraceRecord(node, traces, success, error);
    }

    /**
     * 添加节点执行轨迹记录
     * @param node 节点对象
     * @param traces 执行轨迹数组
     * @param success 是否执行成功
     * @param error 错误信息
     */
    private addNodeTraceRecord(
        node: Node,
        traces: Array<{ 
            node: string, 
            timestamp: string, 
            message: string,
            data?: {
                inputs: Record<string, any>,
                outputs: Record<string, any>,
                error?: string
            },
            status?: string  // 添加状态字段
        }>,
        success: boolean = true,
        error?: string
    ): void {
        // 获取基本信息
        const nodeName = node.name || node.type;
        const timestamp = new Date().toLocaleTimeString();
        const message = success ? '节点执行' : (error ? '执行失败' : '执行出错');
        
        // 准备输入和输出数据
        const traceData: {
            inputs: Record<string, any>,
            outputs: Record<string, any>,
            error?: string
        } = {
            inputs: {},
            outputs: {}
        };
        
        // 如果执行失败，添加错误信息
        if (!success && error) {
            traceData.error = error;
        }
        
        // 根据节点类型获取特定的输入/输出数据
        switch (node.type) {
            case 'start':
                // 开始节点的输入和输出都是相同的变量
                if (node.outputValues) {
                    traceData.inputs = { ...node.outputValues };
                    traceData.outputs = { ...node.outputValues };
                }
                break;
                
            case 'end':
                // 结束节点的输出是工作流的最终结果
                const resultOutput = node.outputValues?.result || '';
                traceData.inputs = { result: resultOutput };
                traceData.outputs = { result: resultOutput };
                break;
                
            case 'llm':
                // LLM节点的输入是提示词，输出是生成的文本
                const prompt = node.config?.trueSystemPrompt || node.config?.systemPrompt || '';
                traceData.inputs = { prompt };
                
                if (node.outputValues) {
                    traceData.outputs = { ...node.outputValues };
                }
                break;
                
            case 'knowledge':
                // 知识检索节点的输入是查询，输出是检索结果
                if (node.outputValues) {
                    traceData.outputs = { ...node.outputValues };
                }
                break;
                
            case 'conditional':
                // 条件节点的输入是表达式，输出是条件结果
                const expression = node.config?.trueExpression || node.config?.expression || '';
                traceData.inputs = { expression };
                
                if (node.outputValues) {
                    traceData.outputs = { ...node.outputValues };
                }
                break;
                
            default:
                // 其他类型节点，尽可能收集输入和输出
                if (node.config) {
                    traceData.inputs = { ...node.config };
                }
                if (node.outputValues) {
                    traceData.outputs = { ...node.outputValues };
                }
        }
        
        // 检查是否已存在相同节点的"运行中"记录
        const runningIndex = traces.findIndex(t => 
            t.node === nodeName && t.status === 'running'
        );
        
        if (runningIndex !== -1) {
            // 如果存在"运行中"记录，则更新该记录
            traces[runningIndex] = {
                node: nodeName,
                timestamp,
                message,
                data: traceData,
                status: success ? 'completed' : 'error'  // 更新状态为完成或错误
            };
            this.logger.log(`更新节点执行轨迹: ${nodeName}, 状态: ${message}`);
        } else {
            // 添加新的执行轨迹记录
            traces.push({
                node: nodeName,
                timestamp,
                message,
                data: traceData,
                status: success ? 'completed' : 'error'  // 添加状态标记
            });
            this.logger.log(`添加节点执行轨迹: ${nodeName}, 状态: ${message}`);
        }
    }
} 