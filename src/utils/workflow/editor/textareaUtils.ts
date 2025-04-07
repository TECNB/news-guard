/**
 * 工具类：处理textarea相关的实用函数
 */

/**
 * 自动调整textarea高度，使其适应内容高度
 * @param textarea - 需要调整高度的textarea元素
 */
export const adjustTextareaHeight = (textarea: HTMLTextAreaElement): void => {
  // 保存当前滚动位置
  const scrollPos = textarea.scrollTop;
  
  // 重置高度以获取准确的scrollHeight
  textarea.style.height = 'auto';
  
  // 设置新高度（scrollHeight包含内容的总高度）
  const newHeight = textarea.scrollHeight;
  
  // 应用高度，但遵守min-height和max-height的CSS限制
  textarea.style.height = `${newHeight}px`;
  
  // 恢复滚动位置
  textarea.scrollTop = scrollPos;
};

/**
 * 根据点击位置计算文本位置的函数
 * @param event - 鼠标点击事件
 * @param container - 包含文本的容器元素
 * @param text - 容器中的完整文本
 * @returns 点击位置对应的文本索引
 */
export const getTextPositionFromClick = (
  event: MouseEvent, 
  container: HTMLElement, 
  text: string
): number => {
  try {
    // 获取点击的相对坐标
    const rect = container.getBoundingClientRect();
    // const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 创建一个range来获取点击位置
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    
    if (!range) {
      // 如果无法获取精确位置，返回文本末尾
      return text.length;
    }
    
    // 确定所点击元素的内容和在文本中的位置
    const clickedNode = range.startContainer;
    const startOffset = range.startOffset;
    
    // 获取所有文本节点
    const textNodes: Node[] = [];
    const getTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
      } else {
        node.childNodes.forEach(getTextNodes);
      }
    };
    
    // 从容器开始递归获取所有文本节点
    getTextNodes(container);
    
    // 计算点击位置在整个文本中的索引
    let position = 0;
    let found = false;
    
    for (const node of textNodes) {
      if (node === clickedNode) {
        position += startOffset;
        found = true;
        break;
      } else {
        position += node.textContent?.length || 0;
      }
    }
    
    // 如果找到了位置，返回它
    if (found) {
      return position;
    }
    
    // 回退方案：使用点击位置百分比估算
    const contentHeight = container.scrollHeight;
    const scrollYPercent = y / contentHeight;
    const estimatedPosition = Math.floor(text.length * scrollYPercent);
    
    // 确保位置在有效范围内
    return Math.max(0, Math.min(estimatedPosition, text.length));
  } catch (error) {
    console.error('计算光标位置时出错:', error);
    // 出错时返回文本末尾
    return text.length;
  }
}; 