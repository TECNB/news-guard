import { Ref } from 'vue';

/**
 * 显示右键菜单
 */
export function showContextMenu(
  event: MouseEvent,
  contextMenuVisible: Ref<boolean>,
  contextMenuX: Ref<number>,
  contextMenuY: Ref<number>,
  nodeLibraryVisible: Ref<boolean>
) {
  contextMenuVisible.value = true;
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  nodeLibraryVisible.value = false;
}

/**
 * 隐藏右键菜单
 */
export function hideContextMenu(contextMenuVisible: Ref<boolean>) {
  contextMenuVisible.value = false;
}

/**
 * 打开节点库
 */
export function openNodeLibrary(
  nodeLibraryVisible: Ref<boolean>,
  nodeLibraryX: Ref<number>,
  nodeLibraryY: Ref<number>,
  contextMenuX: Ref<number>,
  contextMenuY: Ref<number>,
  contextMenuVisible: Ref<boolean>
) {
  nodeLibraryVisible.value = true;
  nodeLibraryX.value = contextMenuX.value;
  nodeLibraryY.value = contextMenuY.value;
  contextMenuVisible.value = false;
}

/**
 * 获取节点图标
 */
export function getNodeIcon(nodeType: string): string {
  switch (nodeType) {
    case 'llm':
      return 'fa-robot';
    case 'knowledge':
      return 'fa-database';
    case 'conditional':
      return 'fa-code-branch';
    case 'end':
      return 'fa-file-export';
    case 'start':
      return 'fa-home';
    case 'search':
      return 'fa-globe';
    default:
      return 'fa-circle-nodes';
  }
} 