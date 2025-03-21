<template>
  <div class="h-full">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="h-full flex justify-center items-center">
      <div class="text-center">
        <div class="spinner mb-4"></div>
        <p class="text-gray-600">正在运行...</p>
      </div>
    </div>
    
    <!-- 结果展示 -->
    <el-scrollbar v-else-if="resultContent" height="100%">
      <div class="result-container text-left py-1">
        <div v-if="isJsonMode" class="json-wrapper">
          <div class="json-header">
            <span class="json-label">JSON</span>
            <button @click="copyJson" class="copy-button">
              <span v-if="copied">已复制</span>
              <span v-else>复制</span>
            </button>
          </div>
          <pre class="json-block"><code class="hljs language-json" v-html="currentFormatted"></code></pre>
        </div>
        <pre v-else class="text-block">{{ currentContent }}</pre>
      </div>
    </el-scrollbar>
    
    <!-- 无结果状态 -->
    <div v-else class="h-full flex justify-center items-center text-gray-500">
      暂无运行结果
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
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3498db;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.json-wrapper {
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin: 0;
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e1e4e8;
}

.json-label {
  color: #57606a;
  font-size: 12px;
  font-weight: 600;
}

.copy-button {
  background-color: transparent;
  border: none;
  color: #0969da;
  font-size: 12px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background-color: #f0f4f8;
}

.json-block {
  margin: 0;
  padding: 16px;
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: break-all;
}

.json-block code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
}

.text-block {
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin: 0;
  padding: 16px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: break-all;
}

.result-container {
  width: 100%;
}
</style> 