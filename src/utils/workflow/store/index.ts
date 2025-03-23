/**
 * 工作流工具类索引文件
 * 导出所有工作流相关的工具类
 */

export * from './WorkflowLogger';
export * from './NodeManager';
export * from './EdgeManager';
export * from './VariableResolver';
export * from './ExecutionManager';

import { WorkflowLogger } from './WorkflowLogger';
import { NodeManager } from './NodeManager';
import { EdgeManager } from './EdgeManager';
import { VariableResolver } from './VariableResolver';
import { ExecutionManager } from './ExecutionManager';

/**
 * 创建工作流工具集
 * @returns 包含所有工作流工具类的对象
 */
export function createWorkflowUtils() {
    const logger = new WorkflowLogger();
    const nodeManager = new NodeManager(logger);
    const edgeManager = new EdgeManager(logger);
    const variableResolver = new VariableResolver(logger);
    const executionManager = new ExecutionManager(logger, variableResolver);

    return {
        logger,
        nodeManager,
        edgeManager,
        variableResolver,
        executionManager
    };
} 