<template>
  <div class="run-panel fixed top-0 right-0 w-96 h-full bg-white border-l border-gray-200 shadow-lg z-20 flex flex-col">
    <!-- 面板头部 -->
    <div class="flex justify-between items-center p-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold">运行面板</h2>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>

    <!-- 标签栏 -->
    <div class="tabs border-b border-gray-200">
      <div class="flex">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value" 
          :class="['px-4 py-2 text-sm font-medium', activeTab === tab.value ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600']"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 p-4 overflow-hidden">
      <!-- 使用动态组件切换不同的面板 -->
      <component 
        :is="currentPanel" 
        :inputVariables="inputVariables"
        :inputValues="inputValues"
        :isApiLoading="isApiLoading"
        :resultText="resultText"
        :details="details"
        :traces="traces"
        :hasEmptyInputs="hasEmptyInputs"
        @startRun="startRun"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineEmits, defineProps, watch, markRaw } from 'vue';
import { streamDeepSeekResponse, type DeepSeekRequestParams } from '../../utils/deepseekApi';

// 导入子组件
import InputPanel from '../Panel/InputPanel.vue';
import ResultPanel from '../Panel/ResultPanel.vue';
import DetailPanel from '../Panel/DetailPanel.vue';
import TracePanel from '../Panel/TracePanel.vue';

const props = defineProps<{
  inputVariables: Record<string, any>;
  isRunning?: boolean;
  result?: string;
  details?: Array<{name: string, description: string, value: any}>;
  traces?: Array<{node: string, timestamp: string, message: string}>;
}>();

const emit = defineEmits(['close', 'run']);

// 标签定义
const tabs = [
  { label: '输入', value: 'input' },
  { label: '结果', value: 'result' },
  { label: '详情', value: 'detail' },
  { label: '追踪', value: 'trace' }
];

// 默认激活输入选项卡
const activeTab = ref('input');

// 标签页对应的组件映射
const panelComponents = {
  'input': markRaw(InputPanel),
  'result': markRaw(ResultPanel),
  'detail': markRaw(DetailPanel),
  'trace': markRaw(TracePanel)
};

// 当前应显示的面板组件
const currentPanel = computed(() => {
  return panelComponents[activeTab.value];
});

// 提供默认值
const details = ref(props.details || []);
const traces = ref(props.traces || []);

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
  console.log('运行面板：开始运行工作流，变量值:', inputValues);
  
  // 检查所有变量是否都有输入
  if (hasEmptyInputs.value) {
    console.log('存在未填写的输入变量，无法开始运行');
    return;
  }
  
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
          content: '你是一个有帮助的AI助手。'
        },
        {
          role: 'user',
          content: inputValues['content'] || '请提供一个简短的回复，以测试流式响应功能。'
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    
    console.log('DeepSeek API请求参数:', apiParams);
    
    // 向DeepSeek API发送流式请求
    await streamDeepSeekResponse(
      apiParams,
      // 每收到一个块就更新结果
      async (chunk: string) => {
        // 如果是第一个数据块，把loading状态关闭
        if (resultText.value === '') {
          console.log('收到第一个数据块，结束loading状态');
          isApiLoading.value = false;
        }
        
        resultText.value += chunk;
      },
      // 完成处理
      (fullText: string) => {
        console.log('DeepSeek API调用完成，完整响应:', fullText);
        
        // 更新测试详情和追踪信息
        details.value.push({
          name: 'API调用',
          description: 'DeepSeek API请求',
          value: '成功'
        });
        
        traces.value.push({
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
        details.value.push({
          name: 'API调用',
          description: 'DeepSeek API请求',
          value: '失败'
        });
        
        traces.value.push({
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
.run-panel {
  /* 保留原有样式 */
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}
</style> 