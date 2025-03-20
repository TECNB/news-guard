<template>
  <div class="test-run-panel fixed top-0 right-0 w-96 h-full bg-white border-l border-gray-200 shadow-lg z-20 flex flex-col">
    <div class="flex justify-between items-center p-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold">Test Run</h2>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>

    <div class="tabs border-b border-gray-200">
      <div class="flex">
        <button 
          @click="activeTab = 'input'" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === 'input' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          输入
        </button>
        <button 
          @click="activeTab = 'result'" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === 'result' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          结果
        </button>
        <button 
          @click="activeTab = 'detail'" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === 'detail' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          详情
        </button>
        <button 
          @click="activeTab = 'trace'" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === 'trace' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          追踪
        </button>
      </div>
    </div>

    <div class="flex-1 p-4 overflow-hidden">
      <!-- 输入选项卡 -->
      <div v-if="activeTab === 'input'" class="h-full flex flex-col">
        <div v-for="(value, key) in inputVariables" :key="key" class="mb-4">
          <div class="font-medium text-gray-700 mb-1">{{ key }}</div>
          <textarea 
            v-model="inputValues[key]" 
            class="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 placeholder-gray-400"
            placeholder="请输入"
            rows="4"
          ></textarea>
        </div>
        
        <div class="mt-auto pt-4">
          <button 
            @click="startRun" 
            class="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            :disabled="hasEmptyInputs"
          >
            开始运行
          </button>
          <div v-if="hasEmptyInputs" class="text-red-500 text-sm mt-2">
            请填写所有必填输入变量
          </div>
        </div>
      </div>

      <!-- 结果选项卡 -->
      <div v-else-if="activeTab === 'result'" class="h-full">
        <div v-if="isApiLoading" class="h-full flex justify-center items-center">
          <div class="text-center">
            <div class="spinner mb-4"></div>
            <p class="text-gray-600">正在运行...</p>
          </div>
        </div>
        <el-scrollbar v-else-if="resultText" height="100%">
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
        <div v-else class="h-full flex justify-center items-center text-gray-500">
          暂无运行结果
        </div>
      </div>

      <!-- 详情选项卡 -->
      <div v-else-if="activeTab === 'detail'" class="h-full overflow-auto">
        <div v-if="details.length" class="space-y-4">
          <div v-for="(detail, index) in details" :key="index" class="border rounded-md p-3">
            <div class="font-medium">{{ detail.name }}</div>
            <div class="text-sm text-gray-600">{{ detail.description }}</div>
            <div class="mt-2 text-xs bg-gray-50 p-2 rounded">{{ detail.value }}</div>
          </div>
        </div>
        <div v-else class="h-full flex justify-center items-center text-gray-500">
          暂无详细信息
        </div>
      </div>

      <!-- 追踪选项卡 -->
      <div v-else-if="activeTab === 'trace'" class="h-full overflow-auto">
        <div v-if="traces.length" class="space-y-3">
          <div v-for="(trace, index) in traces" :key="index" class="border-l-2 border-blue-500 pl-3 py-1">
            <div class="font-medium">{{ trace.node }}</div>
            <div class="text-xs text-gray-500">{{ trace.timestamp }}</div>
            <div class="text-sm mt-1">{{ trace.message }}</div>
          </div>
        </div>
        <div v-else class="h-full flex justify-center items-center text-gray-500">
          暂无追踪信息
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineEmits, defineProps, watch, nextTick } from 'vue';
import { streamDeepSeekResponse, type DeepSeekRequestParams } from '../../utils/deepseekApi';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 复制状态
const copied = ref(false);

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

// 检查是否处于JSON模式
const isJsonMode = computed(() => {
  return resultText.value.startsWith('```json');
});

// 提取当前内容
const currentContent = computed(() => {
  if (isJsonMode.value) {
    // 去除 ```json 和 ``` 标记
    const match = resultText.value.match(/```json\n?([\s\S]*?)(\n?```)?$/);
    return match ? match[1] : '';
  }
  return resultText.value;
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

const props = defineProps<{
  inputVariables: Record<string, any>;
  isRunning?: boolean;
  result?: string;
  details?: Array<{name: string, description: string, value: any}>;
  traces?: Array<{node: string, timestamp: string, message: string}>;
}>();

const emit = defineEmits(['close', 'run']);

// 默认激活输入选项卡
const activeTab = ref('input');

// 提供默认值，修复linter错误
const details = props.details || [];
const traces = props.traces || [];

// 用户输入的值
const inputValues = reactive<Record<string, any>>({...props.inputVariables});

// 内部状态：是否正在向DeepSeek API发送请求
const isApiLoading = ref(false);
// 存储从DeepSeek API返回的结果
const resultText = ref(props.result || '');

// 监听props.result的变化，更新resultText
watch(() => props.result, (newResult) => {
  if (newResult) {
    resultText.value = newResult;
  }
}, { immediate: true });

// 监听props.isRunning的变化，同步isApiLoading状态
watch(() => props.isRunning, (newIsRunning) => {
  if (newIsRunning !== undefined) {
    isApiLoading.value = !!newIsRunning;
    console.log('isApiLoading状态更新为:', isApiLoading.value);
  }
}, { immediate: true });

// 当activeTab为result时，但尚未有结果且没有开始请求，则自动开始请求
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'result' && !resultText.value && !isApiLoading.value && !hasEmptyInputs.value) {
    console.log('自动开始API请求，当切换到结果选项卡时');
    callDeepSeekApi();
  }
});

// 计算属性：检查是否有空的输入值
const hasEmptyInputs = computed(() => {
  return Object.values(inputValues).some(value => value === '');
});

// 开始运行工作流
const startRun = async () => {
  console.log('测试运行面板：开始运行工作流，变量值:', inputValues);
  
  // 检查所有变量是否都有输入
  if (hasEmptyInputs.value) {
    console.log('存在未填写的输入变量，无法开始运行');
    return;
  }
  
  // 打印变量值到控制台，方便检查
  Object.entries(inputValues).forEach(([key, value]) => {
    console.log(`变量 ${key}: ${value}`);
  });
  
  // 触发run事件，并将所有输入变量的值传递给父组件
  emit('run', inputValues);
  
  // 切换到结果选项卡
  activeTab.value = 'result';
  
  // 开始调用DeepSeek API
  await callDeepSeekApi();
};

// 调用DeepSeek API
const callDeepSeekApi = async () => {
  try {
    console.log('========== 开始调用DeepSeek API ==========');
    
    // 重置结果
    resultText.value = '';
    // 设置加载状态
    isApiLoading.value = true;
    
    // 构建请求参数
    const apiParams: DeepSeekRequestParams = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个有帮助的AI助手。' // 使用默认系统提示词
        },
        {
          role: 'user',
          content: inputValues['content'] || '请提供一个简短的回复，以测试流式响应功能。' // 使用content变量作为用户输入
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    
    // 打印请求参数
    console.log('DeepSeek API请求参数:', apiParams);
    
    // 向DeepSeek API发送流式请求
    await streamDeepSeekResponse(
      apiParams,
      // 每收到一个块就更新结果并强制刷新视图
      async (chunk: string) => {
        // 如果是第一个数据块，把loading状态关闭
        if (resultText.value === '') {
          console.log('收到第一个数据块，结束loading状态');
          isApiLoading.value = false;
        }
        
        resultText.value += chunk;
        // 使用nextTick确保DOM更新
        await nextTick();
      },
      // 完成处理
      (fullText: string) => {
        console.log('DeepSeek API调用完成，完整响应:', fullText);
        // 可以在这里添加额外的处理逻辑
        
        // 更新测试详情和追踪信息
        details.push({
          name: 'API调用',
          description: 'DeepSeek API请求',
          value: '成功'
        });
        
        traces.push({
          node: 'DeepSeek API',
          timestamp: new Date().toLocaleTimeString(),
          message: '请求完成'
        });
        
        // 确保加载状态结束
        isApiLoading.value = false;
        console.log('========== DeepSeek API调用成功完成 ==========');
      },
      // 错误处理
      (error: any) => {
        console.error('DeepSeek API调用失败:', error);
        resultText.value = `请求失败: ${error.message || '未知错误'}`;
        
        // 更新测试详情和追踪信息
        details.push({
          name: 'API调用',
          description: 'DeepSeek API请求',
          value: '失败'
        });
        
        traces.push({
          node: 'DeepSeek API',
          timestamp: new Date().toLocaleTimeString(),
          message: `请求失败: ${error.message || '未知错误'}`
        });
        
        // 确保加载状态结束
        isApiLoading.value = false;
        console.log('========== DeepSeek API调用失败完成 ==========');
      }
    );
  } catch (error) {
    console.error('调用DeepSeek API时发生错误:', error);
    resultText.value = `请求失败: ${error instanceof Error ? error.message : '未知错误'}`;
    // 确保加载状态结束
    isApiLoading.value = false;
    console.log('========== DeepSeek API调用发生未处理的异常 ==========');
  }
};
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

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.result-container {
  width: 100%;
}
</style>
