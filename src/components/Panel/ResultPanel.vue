<template>
  <div 
    class="h-full"
    v-loading="isLoading"
    element-loading-text="正在运行..."
    element-loading-background="rgba(255, 255, 255, 0.9)"
  >
    <!-- 结果展示 -->
    <div class="h-full" v-if="!isLoading">
      <el-scrollbar v-if="resultContent" height="100%">
        <div class="text-left py-1 w-full">
          <div v-if="isJsonMode" class="bg-gray-50 border border-gray-200 rounded-md m-0">
            <div class="flex justify-between items-center px-4 py-2 border-b border-gray-200">
              <span class="text-gray-500 text-xs font-semibold">JSON</span>
              <button @click="copyJson" class="bg-transparent border-none text-blue-600 text-xs cursor-pointer px-1.5 py-0.5 rounded transition-colors duration-200 hover:bg-blue-50">
                <span v-if="copied">已复制</span>
                <span v-else>复制</span>
              </button>
            </div>
            <pre class="m-0 p-4 break-words break-all whitespace-pre-wrap"><code class="hljs language-json font-mono text-xs leading-relaxed" v-html="currentFormatted"></code></pre>
          </div>
          <pre v-else class="bg-gray-50 border border-gray-200 rounded-md m-0 p-4 font-mono text-xs leading-relaxed break-words break-all whitespace-pre-wrap">{{ currentContent }}</pre>
        </div>
      </el-scrollbar>
      
      <!-- 无结果状态 -->
      <div v-else class="h-full flex justify-center items-center text-gray-500">
        暂无运行结果
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { formatJsonContent } from '../../utils/jsonFormatter';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { useWorkflowStore } from '../../stores/workflowStore';

// 使用store获取状态
const workflowStore = useWorkflowStore();

// 从store中获取数据
const isLoading = ref(false); // 我们将使用本地状态跟踪加载状态
const resultContent = computed(() => workflowStore.result);

// 复制状态
const copied = ref(false);

// 检查是否处于JSON模式
const isJsonMode = computed(() => {
  return resultContent.value && resultContent.value.startsWith('```json');
});

// 提取当前内容
const currentContent = computed(() => {
  if (isJsonMode.value) {
    // 去除 ```json 和 ``` 标记
    const match = resultContent.value.match(/```json\n?([\s\S]*?)(\n?```)?$/);
    return match ? match[1] : '';
  }
  return resultContent.value || '';  // 确保返回有效的字符串
});

// 格式化和高亮处理后的内容
const currentFormatted = computed(() => {
  if (!isJsonMode.value) return currentContent.value;
  try {
    // 尝试格式化和高亮JSON
    const jsonObj = JSON.parse(currentContent.value);
    const formatted = JSON.stringify(jsonObj, null, 2);
    return hljs.highlight(formatted, { language: 'json' }).value;
  } catch (e) {
    // 如果解析失败，返回原始内容
    return currentContent.value;
  }
});

// 复制JSON内容
const copyJson = async () => {
  try {
    const jsonContent = currentContent.value;
    await navigator.clipboard.writeText(jsonContent);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

// 监听store中的isRunning状态
watch(() => workflowStore.isRunning, (running) => {
  isLoading.value = running;
});

// 初始化时同步状态
isLoading.value = workflowStore.isRunning;
</script>

<style scoped>
.break-all {
  word-wrap: break-word;
  word-break: break-all;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style> 