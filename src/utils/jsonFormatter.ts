/**
 * JSON格式化工具类
 * 提供JSON内容的格式化、解析和高亮功能
 */

/**
 * 格式化JSON字符串
 * @param jsonString 原始JSON字符串
 * @param indent 缩进空格数，默认为2
 * @returns 格式化后的JSON字符串，如果解析失败则返回原始字符串
 */
export function formatJsonContent(jsonString: string, indent: number = 2): string {
  try {
    const jsonObj = JSON.parse(jsonString);
    return JSON.stringify(jsonObj, null, indent);
  } catch (e) {
    console.error('JSON解析失败:', e);
    return jsonString;
  }
}

/**
 * 验证字符串是否为有效的JSON
 * @param str 需要验证的字符串
 * @returns 是否是有效的JSON
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 安全的JSON解析，失败时返回默认值
 * @param str 要解析的JSON字符串
 * @param defaultValue 解析失败时的默认返回值
 * @returns 解析结果或默认值
 */
export function safeJsonParse(str: string, defaultValue: any = {}): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('JSON安全解析失败:', e);
    return defaultValue;
  }
} 