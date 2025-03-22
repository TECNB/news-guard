/**
 * 工具类：处理文本中变量的高亮显示
 */

/**
 * 文本部分的类型
 */
export interface TextPart {
  type: 'text' | 'variable';
  text: string;
  name?: string;
}

/**
 * 变量结构
 */
export interface Variable {
  name: string;
  type?: string;
  color?: string;
}

/**
 * 节点变量结构
 */
export interface NodeVariables {
  nodeId: string;
  nodeName: string;
  variables: Variable[];
}

/**
 * 解析文本中的变量，用于高亮显示
 * @param text - 需要解析的文本
 * @param variables - 有效变量列表
 * @returns 解析后的文本部分数组
 */
export const parseTextVariables = (
  text: string, 
  variables: string[] | NodeVariables[] | undefined
): TextPart[] => {
  if (!text) return [{ type: 'text', text: '' }];
  
  const parts: TextPart[] = [];
  let lastIndex = 0;
  
  // 获取所有有效变量名称的列表
  const validVariableNames = getAllValidVariableNames(variables);
  
  // 正则表达式匹配 {...} 格式的变量
  const regex = /\{([^}]+)\}/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // 提取变量名（不含大括号）
    const variableName = match[1];
    
    // 添加变量前的文本
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: text.substring(lastIndex, match.index)
      });
    }
    
    // 判断是否为有效变量
    const isValidVariable = validVariableNames.includes(variableName);
    
    // 添加变量文本（包括大括号）
    parts.push({
      type: isValidVariable ? 'variable' : 'text',
      text: match[0],
      name: variableName
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // 添加剩余文本
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      text: text.substring(lastIndex)
    });
  }
  
  return parts;
};

/**
 * 获取所有有效的变量名称
 * @param variables - 变量列表
 * @returns 有效变量名称数组
 */
export const getAllValidVariableNames = (
  variables: string[] | NodeVariables[] | undefined
): string[] => {
  if (!variables || !Array.isArray(variables) || variables.length === 0) return [];
  
  // 如果是字符串数组格式
  if (typeof variables[0] === 'string') {
    return variables as string[];
  }
  
  // 如果是NodeVariables数组格式
  const nodeVariables = variables as NodeVariables[];
  const allVariables: string[] = [];
  
  // 从每个节点中收集变量
  nodeVariables.forEach(nodeVar => {
    if (nodeVar && nodeVar.variables && Array.isArray(nodeVar.variables) && nodeVar.variables.length > 0) {
      nodeVar.variables.forEach(variable => {
        if (variable && typeof variable.name === 'string') {
          allVariables.push(variable.name);
        }
      });
    }
  });
  
  return allVariables;
};

/**
 * 插值处理函数，将提示词中的变量替换为实际值
 * @param prompt - 原始提示词
 * @param values - 变量值映射
 * @returns 替换变量后的提示词
 */
export const interpolatePrompt = (prompt: string, values: Record<string, any>): string => {
  return prompt.replace(/\{([^}]+)\}/g, (match, varName) => {
    return values[varName] !== undefined ? values[varName] : match;
  });
}; 