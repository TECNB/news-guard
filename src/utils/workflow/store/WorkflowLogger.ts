/**
 * 工作流日志工具类
 * 用于统一管理工作流相关的日志输出
 */
export class WorkflowLogger {
    private readonly prefix: string;
    private readonly isEnabled: boolean;

    /**
     * 创建工作流日志工具实例
     * @param prefix 日志前缀
     * @param isEnabled 是否启用日志
     */
    constructor(prefix: string = '[WorkflowStore]', isEnabled: boolean = true) {
        this.prefix = prefix;
        this.isEnabled = isEnabled;
    }

    /**
     * 输出信息日志
     * @param message 日志消息
     * @param data 可选的日志数据
     */
    log(message: string, data?: any): void {
        if (!this.isEnabled) return;

        if (data !== undefined) {
            console.log(`${this.prefix} ${message}`, data);
        } else {
            console.log(`${this.prefix} ${message}`);
        }
    }

    /**
     * 输出警告日志
     * @param message 日志消息
     * @param data 可选的日志数据
     */
    warn(message: string, data?: any): void {
        if (!this.isEnabled) return;

        if (data !== undefined) {
            console.warn(`${this.prefix} ${message}`, data);
        } else {
            console.warn(`${this.prefix} ${message}`);
        }
    }

    /**
     * 输出错误日志
     * @param message 日志消息
     * @param data 可选的日志数据
     */
    error(message: string, data?: any): void {
        if (!this.isEnabled) return;

        if (data !== undefined) {
            console.error(`${this.prefix} ${message}`, data);
        } else {
            console.error(`${this.prefix} ${message}`);
        }
    }

    /**
     * 创建一个继承当前配置的子日志记录器
     * @param subPrefix 子日志记录器前缀
     */
    createSubLogger(subPrefix: string): WorkflowLogger {
        return new WorkflowLogger(`${this.prefix}:${subPrefix}`, this.isEnabled);
    }

    /**
     * 打印分隔线，用于日志分组
     * @param title 分组标题
     */
    group(title: string): void {
        if (!this.isEnabled) return;

        console.log('======== ' + title + ' ========');
    }

    /**
     * 结束分组
     */
    groupEnd(): void {
        if (!this.isEnabled) return;

        console.log('==============================');
    }
} 