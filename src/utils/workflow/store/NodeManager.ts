import { Node, createNode, NodeRunStatus } from '@/types/workflow';
import { WorkflowLogger } from './WorkflowLogger';

/**
 * 节点管理工具类
 * 用于处理工作流节点的增删改查操作
 */
export class NodeManager {
    private logger: WorkflowLogger;

    /**
     * 创建节点管理工具实例
     * @param logger 日志工具实例
     */
    constructor(logger?: WorkflowLogger) {
        this.logger = logger || new WorkflowLogger('[NodeManager]');
    }

    /**
     * 添加节点
     * @param nodes 节点数组
     * @param type 节点类型
     * @param x 横坐标
     * @param y 纵坐标
     * @returns 新节点ID
     */
    addNode(nodes: Node[], type: string, x: number, y: number): string {
        this.logger.log(`添加节点 type=${type}, x=${x}, y=${y}`);

        // 使用 createNode 函数创建节点并应用默认配置
        const newNode = createNode(type, x, y);

        nodes.push(newNode);
        this.logger.log(`节点已添加 id=${newNode.id}`);
        this.logger.log(`当前节点数量: ${nodes.length}`);
        return newNode.id;
    }

    /**
     * 更新节点
     * @param nodes 节点数组
     * @param updatedNode 更新后的节点
     * @returns 是否更新成功
     */
    updateNode(nodes: Node[], updatedNode: Node): boolean {
        this.logger.log(`更新节点 id=${updatedNode.id}, type=${updatedNode.type}`);

        const index = nodes.findIndex(n => n.id === updatedNode.id);
        if (index !== -1) {
            // 更新节点，保持位置不变
            const position = { x: nodes[index].x, y: nodes[index].y };
            nodes[index] = { ...updatedNode, ...position };

            this.logger.log(`节点已更新 id=${updatedNode.id}`);
            this.logger.log(`更新后的节点:`, nodes[index]);
            return true;
        } else {
            this.logger.warn(`未找到要更新的节点 id=${updatedNode.id}`);
            return false;
        }
    }

    /**
     * 更新节点位置
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param x 横坐标
     * @param y 纵坐标
     * @returns 是否更新成功
     */
    updateNodePosition(nodes: Node[], nodeId: string, x: number, y: number): boolean {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            node.x = x;
            node.y = y;
            return true;
        }
        return false;
    }

    /**
     * 删除节点
     * @param nodes 节点数组
     * @param edges 边数组
     * @param nodeId 节点ID
     * @param selectedNodeId 当前选中的节点ID
     * @returns 更新后的选中节点ID
     */
    deleteNode(
        nodes: Node[],
        edges: any[],
        nodeId: string,
        selectedNodeId: string | null
    ): string | null {
        this.logger.log(`删除节点 id=${nodeId}`);

        // 找到要删除的节点索引
        const nodeIndex = nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex !== -1) {
            // 删除与该节点相关的所有边
            const relatedEdges = edges.filter(edge =>
                edge.source === nodeId || edge.target === nodeId
            );

            this.logger.log(`将删除与节点相关的 ${relatedEdges.length} 条边`);

            relatedEdges.forEach(edge => {
                const edgeIndex = edges.findIndex(e => e.id === edge.id);
                if (edgeIndex !== -1) {
                    edges.splice(edgeIndex, 1);
                    this.logger.log(`已删除边 id=${edge.id}`);
                }
            });

            // 删除节点
            const deletedNode = nodes[nodeIndex];
            nodes.splice(nodeIndex, 1);

            this.logger.log(`已删除节点 id=${nodeId}, type=${deletedNode.type}`);
            this.logger.log(`当前节点数量: ${nodes.length}`);

            // 如果删除的是当前选中的节点，清除选中状态
            if (selectedNodeId === nodeId) {
                this.logger.log(`已清除选中状态，因为选中的节点被删除`);
                return null;
            }

            return selectedNodeId;
        } else {
            this.logger.warn(`未找到要删除的节点 id=${nodeId}`);
            return selectedNodeId;
        }
    }

    /**
     * 选择节点
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param currentSelectedNodeId 当前选中的节点ID
     * @returns 节点选择结果
     */
    selectNode(
        nodes: Node[],
        nodeId: string | null,
        currentSelectedNodeId: string | null
    ): { selectedNodeId: string | null, node?: Node } {
        const oldNodeId = currentSelectedNodeId;

        if (nodeId) {
            const selectedNode = nodes.find(n => n.id === nodeId);
            if (selectedNode) {
                this.logger.log(`已选择节点:`, {
                    id: selectedNode.id,
                    type: selectedNode.type,
                    name: selectedNode.name,
                    position: { x: selectedNode.x, y: selectedNode.y },
                    config: selectedNode.config,
                    inputs: selectedNode.inputs,
                    outputs: selectedNode.outputs,
                    outputValues: selectedNode.outputValues,
                    runInfo: selectedNode.runInfo
                });

                return { selectedNodeId: nodeId, node: selectedNode };
            } else {
                this.logger.warn(`选择的节点不存在 id=${nodeId}`);
                return { selectedNodeId: nodeId };
            }
        } else if (oldNodeId) {
            this.logger.log(`已清除节点选择，之前选中的节点 id=${oldNodeId}`);
            return { selectedNodeId: null };
        }

        return { selectedNodeId: null };
    }

    /**
     * 设置节点的输出值
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param outputName 输出名称
     * @param value 输出值
     */
    setNodeOutputValue(
        nodes: Node[],
        nodeId: string,
        outputName: string,
        value: any
    ): void {
        this.logger.log(`设置节点 ${nodeId} 的输出 ${outputName} 为:`, value);

        // 找到对应的节点
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
            // 确保节点有outputValues属性
            if (!node.outputValues) {
                node.outputValues = {};
            }

            // 设置节点的输出值
            node.outputValues[outputName] = value;
            this.logger.log(`节点 ${nodeId} 的输出值已设置`);
        } else {
            this.logger.warn(`未找到节点 ${nodeId}`);
        }
    }

    /**
     * 获取节点的输出值
     * @param nodes 节点数组
     * @param nodeId 节点ID
     * @param outputName 输出名称
     * @returns 节点输出值
     */
    getNodeOutputValue(
        nodes: Node[],
        nodeId: string,
        outputName: string
    ): any {
        // 从节点获取输出值
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.outputValues && node.outputValues[outputName] !== undefined) {
            return node.outputValues[outputName];
        }
        
        return undefined;
    }

    /**
     * 清除所有节点的运行状态和输出值
     * @param nodes 节点数组
     */
    clearNodeRunStatus(nodes: Node[]): void {
        nodes.forEach(node => {
            node.outputValues = {};
            node.runInfo = {
                status: NodeRunStatus.IDLE
            };
        });
    }

    /**
     * 获取特定类型的节点
     * @param nodes 节点数组
     * @param type 节点类型
     * @returns 符合类型的节点
     */
    getNodesByType(nodes: Node[], type: string): Node[] {
        return nodes.filter(node => node.type === type);
    }

    /**
     * 获取开始节点
     * @param nodes 节点数组
     * @returns 开始节点
     */
    getStartNode(nodes: Node[]): Node | undefined {
        return nodes.find(node => node.type === 'start');
    }

    /**
     * 获取结束节点
     * @param nodes 节点数组
     * @returns 结束节点
     */
    getEndNode(nodes: Node[]): Node | undefined {
        return nodes.find(node => node.type === 'end');
    }
} 