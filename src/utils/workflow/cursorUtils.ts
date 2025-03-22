import { ref } from 'vue';

interface CursorPosition {
  start: number;
  end: number;
}

interface Position {
  left: number;
  top: number;
}

export function useCursorPosition() {
  const cursorPosition = ref<CursorPosition>({ start: 0, end: 0 });

  // 更新光标位置的辅助函数
  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    if (textarea) {
      cursorPosition.value = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      };
    }
  };

  const getCursorPosition = (textarea: HTMLTextAreaElement): Position => {
    const { selectionStart } = textarea;
    
    // 更新cursorPosition值
    updateCursorPosition(textarea);
    
    // 获取textarea的位置和尺寸
    const textareaRect = textarea.getBoundingClientRect();
    
    // 默认值，确保始终返回一个有效位置
    let left = 0;
    let top = 0;
    
    // 创建一个隐藏的复制元素
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.overflow = 'hidden';
    div.style.top = '0';
    div.style.left = '0';
    
    // 复制textarea的关键样式
    const style = window.getComputedStyle(textarea);
    
    [
      'width', 'height', 'font-size', 'font-family', 'font-weight',
      'line-height', 'padding-left', 'padding-top', 'padding-right',
      'padding-bottom', 'box-sizing', 'border-width', 'text-indent'
    ].forEach(prop => {
      div.style.setProperty(prop, style.getPropertyValue(prop));
    });
    
    // 设置文本内容
    const textBeforeCursor = textarea.value.substring(0, selectionStart);
    const span = document.createElement('span');
    
    div.textContent = textBeforeCursor;
    div.appendChild(span);
    
    document.body.appendChild(div);
    
    // 测量光标位置
    const spanRect = span.getBoundingClientRect();
    left = spanRect.left - textareaRect.left + textarea.scrollLeft;
    top = spanRect.top - textareaRect.top + textarea.scrollTop;
    
    // 清理
    document.body.removeChild(div);
    
    // 确保返回有效值
    return { 
      left: Math.max(0, left),
      top: Math.max(0, top)
    };
  };

  return {
    cursorPosition,
    getCursorPosition,
    updateCursorPosition
  };
}
