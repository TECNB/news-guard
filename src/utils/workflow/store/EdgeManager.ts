import { Edge, createEdge } from '@/types/workflow';
import { WorkflowLogger } from './WorkflowLogger';

/**
 * 边管理工具类
 * 用于处理工作流边的增删改操作
 */
export class EdgeManager {
    private logger: WorkflowLogger;

    /**
     * 创建边管理工具实例
     * @param logger 日志工具实例
     */
    constructor(logger?: WorkflowLogger) {
        this.logger = logger || new WorkflowLogger('[EdgeManager]');
    }

    /**
     * 添加边
     * @param edges 边数组
     * @param source 源节点ID
     * @param target 目标节点ID
     * @returns 新边ID，如果已存在则返回null
     */
    addEdge(edges: Edge[], source: string, target: string): string | null {
        this.logger.log(`添加边 source=${source}, target=${target}`);

        const newEdge = createEdge(source, target);

        // 检查是否已存在相同的连线
        const edgeExists = edges.some(
            edge => edge.source === newEdge.source && edge.target === newEdge.target
        );

        if (!edgeExists) {
            edges.push(newEdge);
            this.logger.log(`边已添加 id=${newEdge.id}`);
            this.logger.log(`当前边数量: ${edges.length}`);
            return newEdge.id;
        } else {
            this.logger.warn(`边已存在，未添加 source=${source}, target=${target}`);
            return null;
        }
    }

    /**
     * 删除边
     * @param edges 边数组
     * @param edgeId 边ID
     * @returns 是否删除成功
     */
    removeEdge(edges: Edge[], edgeId: string): boolean {
        this.logger.log(`删除边 id=${edgeId}`);

        const index = edges.findIndex(edge => edge.id === edgeId);
        if (index !== -1) {
            const removedEdge = edges[index];
            edges.splice(index, 1);

            this.logger.log(`已删除边 id=${edgeId}, source=${removedEdge.source}, target=${removedEdge.target}`);
            this.logger.log(`当前边数量: ${edges.length}`);
            return true;
        } else {
            this.logger.warn(`未找到要删除的边 id=${edgeId}`);
            return false;
        }
    }

    /**
     * 获取节点的入边
     * @param edges 边数组
     * @param nodeId 节点ID
     * @returns 入边数组
     */
    getIncomingEdges(edges: Edge[], nodeId: string): Edge[] {
        return edges.filter(edge => edge.target === nodeId);
    }

    /**
     * 获取节点的出边
     * @param edges 边数组
     * @param nodeId 节点ID
     * @returns 出边数组
     */
    getOutgoingEdges(edges: Edge[], nodeId: string): Edge[] {
        return edges.filter(edge => edge.source === nodeId);
    }

    /**
     * 获取边的源节点ID列表
     * @param edges 边数组
     * @param targetNodeId 目标节点ID
     * @returns 源节点ID数组
     */
    getSourceNodeIds(edges: Edge[], targetNodeId: string): string[] {
        return this.getIncomingEdges(edges, targetNodeId)
            .map(edge => edge.source);
    }

    /**
     * 获取边的目标节点ID列表
     * @param edges 边数组
     * @param sourceNodeId 源节点ID
     * @returns 目标节点ID数组
     */
    getTargetNodeIds(edges: Edge[], sourceNodeId: string): string[] {
        return this.getOutgoingEdges(edges, sourceNodeId)
            .map(edge => edge.target);
    }

    /**
     * 检查从起点到终点的路径
     * @param edges 边数组
     * @param startNodeId 起始节点ID
     * @param endNodeId 目标节点ID
     * @returns 是否存在路径
     */
    hasPath(edges: Edge[], startNodeId: string, endNodeId: string): boolean {
        this.logger.log(`检查从节点 ${startNodeId} 到节点 ${endNodeId} 的路径`);

        // 使用深度优先搜索检查路径
        const visitedNodes = new Set<string>();

        const findPath = (nodeId: string): boolean => {
            // 如果当前节点就是结束节点，返回true
            if (nodeId === endNodeId) return true;

            // 如果已经访问过该节点，避免循环，返回false
            if (visitedNodes.has(nodeId)) return false;

            // 标记节点为已访问
            visitedNodes.add(nodeId);

            // 获取所有从当前节点出发的边
            const outgoingEdges = edges.filter(edge => edge.source === nodeId);

            // 检查每条边的目标节点是否能到达结束节点
            for (const edge of outgoingEdges) {
                if (findPath(edge.target)) return true;
            }

            // 如果所有路径都检查完毕，没有找到路径，返回false
            return false;
        };

        // 从起始节点开始检查
        const hasPath = findPath(startNodeId);
        this.logger.log(`从节点 ${startNodeId} 到节点 ${endNodeId} ${hasPath ? '有' : '没有'}路径`);

        return hasPath;
    }
} 