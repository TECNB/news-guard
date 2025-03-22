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
        @startRun="startRun"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue';
import { streamDeepSeekResponse } from '../../utils/deepseekApi';
import { useWorkflowStore } from '../../stores/workflowStore';

// 导入子组件
import InputPanel from '../Panel/InputPanel.vue';
import ResultPanel from '../Panel/ResultPanel.vue';
import DetailPanel from '../Panel/DetailPanel.vue';
import TracePanel from '../Panel/TracePanel.vue';

const emit = defineEmits(['close']);

// 获取工作流 store
const workflowStore = useWorkflowStore();

// 使用computed获取store中的数据
const isRunning = computed(() => workflowStore.isRunning);
const result = computed(() => workflowStore.result);
const details = computed(() => workflowStore.details);
const traces = computed(() => workflowStore.traces);

// 本地状态
const activeTab = ref('input');
const isApiLoading = ref(false);
const resultText = ref('');

// 标签定义
const tabs = [
  { label: '输入', value: 'input' },
  { label: '结果', value: 'result' },
  { label: '详情', value: 'detail' },
  { label: '追踪', value: 'trace' }
];

// 面板组件
const panelComponents = {
  'input': markRaw(InputPanel),
  'result': markRaw(ResultPanel),
  'detail': markRaw(DetailPanel),
  'trace': markRaw(TracePanel)
};

// 当前应显示的面板组件
const currentPanel = computed(() => {
  return panelComponents[activeTab.value as keyof typeof panelComponents];
});

// 开始运行
const startRun = (values: Record<string, any>) => {
  console.log('[RunPanel] 开始运行工作流，输入值:', values);
  
  // 更新store中的状态
  workflowStore.isRunning = true; // 明确设置运行状态
  workflowStore.executeRun(values);
  
  // 切换到结果标签
  activeTab.value = 'result';
  
  // 调用API示例
  callDeepSeekAPI(values);
};

// 调用DeepSeek API示例
const callDeepSeekAPI = async (values: Record<string, any>) => {
  isApiLoading.value = true;
  resultText.value = '';
  workflowStore.result = ''; // 清空store中的结果
  
  console.log('[RunPanel] 调用DeepSeek API，输入参数:', values);
  
  try {
    // 查找第一个LLM节点，获取其替换变量后的提示词
    const llmNode = workflowStore.nodes.find(node => node.type === 'llm');
    let prompt = '分析以下内容并回复';
    
    if (llmNode && llmNode.config && llmNode.config.trueSystemPrompt) {
      prompt = llmNode.config.trueSystemPrompt;
      console.log('[RunPanel] 使用LLM节点提示词:', prompt);
    } else {
      // 如果没有找到LLM节点或提示词，使用默认提示词并添加输入变量
      prompt = `分析以下新闻是否为假新闻，并给出详细理由：\n\n${values.news || '未提供新闻内容'}`;
      console.log('[RunPanel] 使用默认提示词:', prompt);
    }
    
    await streamDeepSeekResponse(
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
        stream: true
      },
      // 流式处理
      async (chunk: string) => {
        // 如果是第一个数据块，把loading状态关闭
        if (resultText.value === '') {
          console.log('[RunPanel] 收到第一个数据块，结束loading状态');
          isApiLoading.value = false;
          workflowStore.isRunning = false;
        }
        
        resultText.value += chunk;
        
        // 更新store中的结果
        workflowStore.result = resultText.value;
      },
      // 完成处理
      (fullText: string) => {
        console.log('[RunPanel] DeepSeek API调用完成');
        
        // 更新详情和追踪信息
        workflowStore.details.push({
          name: 'API调用',
          description: 'DeepSeek API请求',
          value: '成功'
        });
        
        workflowStore.traces.push({
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
        workflowStore.details.push({
          name: 'API调用',
          description: 'DeepSeek API请求',
          value: '失败'
        });
        
        workflowStore.traces.push({
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