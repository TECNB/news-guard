<template>
  <div class="Chat">
    <KnowledgeSelector @update="handleKnowledgeUpdate" />
    <div v-if="showSuggestions" class="flex flex-1 flex-col justify-center items-start max-w-6xl p-20">
      <div class="flex flex-col justify-center items-start gap-2">
        <img class="w-11 h-11 rounded-full border border-gray-300 object-cover aspect-square"
          src="../assets/images/logo.png" alt="">
        <p class="text-3xl font-bold">您好,TEC</p>
        <p class="text-3xl font-bold text-text-400">有什么我能帮您的吗？</p>
      </div>
      <div class="flex justify-center items-center gap-2 mt-3">
        <i class="fa-solid fa-link text-[#B4B4B4]"></i>
        <p class="font-bold text-text-400">建议</p>
      </div>
      <div class="flex justify-center items-center gap-2 mt-1">
        <div v-for="(suggestion, index) in suggestions" :key="index"
          class="w-64 h-40 bg-gray-100 rounded-3xl text-left flex flex-col gap-8 px-5 py-6 hover:bg-gray-200 cursor-pointer transition-bg duration-300">
          <div class="flex flex-col justify-center items-start">
            <p class="text-text-100 font-bold">{{ suggestion.title }}</p>
            <p class="text-text-200 text-sm">{{ suggestion.description }}</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-text-200 text-sm">提示词</p>
            <i class="fa-solid fa-arrow-up text-[#B4B4B4]"></i>
          </div>
        </div>
      </div>
    </div>

    <ChatWindow :displayedMessages="displayedMessages" v-else />

    <div class="flex flex-col gap-2 mb-5 mx-5">
      <!-- 包裹图片展示框和输入框的大框架 -->
      <div class="bg-gray-100 bg-opacity-50 rounded-2xl p-3 transition-all duration-300">

        <!-- 上传和输入框 -->
        <div class="flex items-center bg-gray-50 rounded-3xl p-1 relative z-10">
          <el-upload class="upload-demo z-10" :on-success="handleUploadSuccess" :on-error="handleUploadError"
            :show-file-list="false" accept="image/*,application/pdf">
            <i class="fa-regular fa-file text-gray-500"></i>
          </el-upload>

          <textarea v-model="message" @input="autoResize" @keydown.enter.prevent="handleEnter" placeholder="输入消息"
            class="bg-transparent outline-none flex-1 placeholder:text-text-200 placeholder:font-bold text-black ml-2 resize-none overflow-hidden"
            rows="1"></textarea>

          <i class="fa-solid fa-microphone text-gray-500 ml-2 text-lg"></i>
        </div>

        <!-- Web Search Toggle -->
        <div 
          class="flex items-center gap-2 mt-2 px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity border rounded-lg w-fit"
          :class="{'border-green-400': enableWebSearch, 'border-gray-300': !enableWebSearch}"
          @click="enableWebSearch = !enableWebSearch"
        >
          <i class="fa-solid fa-globe"
            :class="{'text-green-400': enableWebSearch, 'text-gray-500': !enableWebSearch}"
          ></i>
          <span 
            class="text-sm"
            :class="{'text-green-400': enableWebSearch, 'text-gray-600': !enableWebSearch}"
          >
            联网搜索
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { suggestions } from '../constants/suggestions';
import { Chat } from '../utils/AIChat';
import { chat } from '../api/fakeNewsReview';
import { useChatStore } from '../stores/ChatStore';
import defaultImageUrl from '../assets/images/CloudPic.jpg';
import defaultPdfUrl from '../assets/pdf/2023中国生态环境状况公报.pdf';
import { handleChartGeneration, handleFileUpload, typeEffect, autoResizeTextarea, DisplayMessage } from '../utils/chatViewUtils';
import KnowledgeSelector from '../components/KnowledgeSelector.vue';
import { ApiService } from '../utils/apiService';
import { pythonStringToJson } from '@/utils/pythonJsonConverter';

// Base variables
const message = ref('');
const enableWebSearch = ref(false);
const imageUrl = ref(''); // 存储上传的图片 URL
const pdfUrl = ref('');
const showSuggestions = ref(true); // 控制建议列表显示
const displayedMessages = ref<DisplayMessage[]>([]); // 展示的消息列表
const chatStore = useChatStore();
// 存储当前会话ID
const sessionId = ref<string | null>(null);

// Knowledge base state
const selectedKnowledges = ref<string[]>([]);

// Handle knowledge update
const handleKnowledgeUpdate = (values: string[]) => {
  selectedKnowledges.value = values;
};

// 上传处理函数
const handleUploadSuccess = (response: any) => {
  const uploadedFile = response.raw;
  imageUrl.value = URL.createObjectURL(uploadedFile);
};

const handleUploadError = (_: any, uploadedFile: File) => {
  handleFileUpload(uploadedFile, imageUrl, pdfUrl, defaultImageUrl, defaultPdfUrl);
};

onMounted(async () => {
  // 从当前活跃的对话中获取消息
  if (chatStore.getCurrentMessages().length > 0) {
    displayedMessages.value = chatStore.getCurrentMessages();
    showSuggestions.value = false;
  }

  // 监听聊天消息的变化，自动更新 displayedMessages
  watch(() => chatStore.getCurrentMessages(), (newValue) => {
    showSuggestions.value = newValue.length === 0;
    displayedMessages.value = newValue;
  });

  // 监听 message 的变化并调整 textarea 大小
  watch(message, (newValue) => {
    if (!newValue.trim()) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  });
});

const autoResize = (event: any) => {
  autoResizeTextarea(event.target);
};

// 将web搜索函数修改为使用 ApiService
const performWebSearch = async (query: string, updateUI: (type: string, content: string) => void) => {
  console.log('开始执行网络搜索:', query);
  
  try {
    // 用于存储完整的LLM响应，以便检测增量内容
    let fullLlmResponse = '';
    
    // 使用 ApiService.chatWithLLM 代替 fetch('/search')
    await ApiService.chatWithLLM(
      query,
      (tag, content) => {
        // 处理不同类型的标签内容
        if (tag === 'session_id') {
          sessionId.value = content;
          console.log('获取到会话ID:', content);
        } else if (tag === 'search_output') {
          console.log('原始搜索结果字符串:', content);
          
          try {
            // 将Python风格的列表转换为标准JSON
            const jsonString = pythonStringToJson(content);
            const searchData = JSON.parse(jsonString);
            
            // 提取搜索结果数组
            if (searchData && Array.isArray(searchData)) {
              // 格式化搜索结果为更易读的格式
              const formattedResults = searchData.map((item: any) => ({
                title: item.title || '无标题',
                url: item.link || '#',
                snippet: item.snippet || '无摘要'
              }));
              
              console.log('格式化后的搜索结果:', formattedResults);
              
              // 将格式化的搜索结果发送到UI
              updateUI('searchResult', JSON.stringify(formattedResults));
            } else if (searchData && searchData.output && Array.isArray(searchData.output)) {
              // 处理可能的嵌套格式
              const formattedResults = searchData.output.map((item: any) => ({
                title: item.title || '无标题',
                url: item.link || '#',
                snippet: item.snippet || '无摘要'
              }));
              
              console.log('格式化后的搜索结果:', formattedResults);
              
              // 将格式化的搜索结果发送到UI
              updateUI('searchResult', JSON.stringify(formattedResults));
            } else {
              // 如果无法提取结构化数据，直接发送原始文本
              updateUI('searchResult', content);
            }
          } catch (e) {
            console.error('解析搜索结果时出错:', e);
            // 解析失败时，直接发送原始文本
            updateUI('searchResult', content);
          }
        } else if (tag === 'llm') {
          // 处理LLM流式内容
          // 首先计算增量部分：新收到的内容是完整内容的哪些部分是新的
          const newContent = content.length > fullLlmResponse.length ? 
                            content.substring(fullLlmResponse.length) : 
                            content;
          
          if (newContent) {
            // 只发送增量部分到UI
            updateUI('llm', newContent);
            console.log('发送LLM增量片段到UI:', newContent);
          }
          
          // 更新完整响应
          fullLlmResponse = content;
        }
      },
      sessionId.value || undefined,  // 如果有会话ID则传入，否则创建新会话
      2 // 使用默认能力级别
    );
    
    return true;
  } catch (error) {
    console.error('聊天请求失败:', error);
    updateUI('error', '发生错误，请稍后再试。');
    return false;
  }
};

// 修改handleEnter函数来支持流式UI更新
const handleEnter = async () => {
  const userContent = message.value.trim();
  if (!userContent) return;

  // 图表处理逻辑保持不变
  if (message.value.includes('折线图')) {
    message.value = '';
    showSuggestions.value = false;
    await handleChartGeneration('line', userContent, displayedMessages, chatStore);
    return;
  }

  if (message.value.includes('柱状图')) {
    message.value = '';
    showSuggestions.value = false;
    await handleChartGeneration('bar', userContent, displayedMessages, chatStore);
    return;
  }

  if (message.value.includes('饼图')) {
    message.value = '';
    showSuggestions.value = false;
    await handleChartGeneration('pie', userContent, displayedMessages, chatStore);
    return;
  }

  // 常规聊天处理
  displayedMessages.value.push({ type: 'user', content: userContent });
  message.value = '';
  showSuggestions.value = false;
  
  // 网络搜索处理
  if (enableWebSearch.value) {
    displayedMessages.value.push({ type: 'loading', content: '' });
    
    // 创建一个临时变量来保存LLM回答的内容
    let llmContent = '';
    let searchResults: any[] = [];
    
    // 定义UI更新函数
    const updateUI = (type: string, content: string) => {
      // 移除loading消息（如果还存在）
      if (displayedMessages.value[displayedMessages.value.length - 1]?.type === 'loading') {
        displayedMessages.value.pop();
      }
      
      if (type === 'searchResult') {
        // 检查内容是否已经是JSON字符串
        try {
          // 尝试解析内容，如果成功则表示它已经是JSON格式
          searchResults = JSON.parse(content);
        } catch (e) {
          // 如果解析失败，则把它作为普通文本处理
          searchResults = [{
            title: "搜索结果",
            url: "https://example.com/search",
            snippet: content.trim()
          }];
        }
        
        displayedMessages.value.push({ 
          type: 'webSearch', 
          content: JSON.stringify(searchResults)
        });
      } else if (type === 'llm') {
        // LLM回答
        if (llmContent === '') {
          // 第一次添加AI消息
          displayedMessages.value.push({ type: 'ai', content: content });
          llmContent = content;
        } else {
          // 更新现有AI消息
          llmContent += content;
          const lastMessage = displayedMessages.value[displayedMessages.value.length - 1];
          if (lastMessage && lastMessage.type === 'ai') {
            lastMessage.content = llmContent;
          }
        }
      } else if (type === 'error') {
        // 错误消息
        displayedMessages.value.push({ type: 'ai', content: content });
      }
    };
    
    // 执行网络搜索，传入UI更新回调
    await performWebSearch(userContent, updateUI);
    
    // 确保loading状态已被移除
    if (displayedMessages.value[displayedMessages.value.length - 1]?.type === 'loading') {
      displayedMessages.value.pop();
    }
    
    return; // 搜索处理完毕，不再调用常规聊天API
  }
  
  // 常规聊天API调用逻辑保持不变
  displayedMessages.value.push({ type: 'loading', content: '' });

  try {
    const response = await chat(userContent);
    const completeMessage = response.data.answer;

    displayedMessages.value.pop(); // Remove loading
    displayedMessages.value.push({ type: 'ai', content: '' });
    await typeEffect(displayedMessages, completeMessage, 50);
  } catch (error) {
    console.error('Chat request failed:', error);
    displayedMessages.value.pop();
    displayedMessages.value.push({ type: 'ai', content: '发生错误，请稍后再试。' });
  }
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.Chat {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  .el-input {
    height: 50px;
    border-radius: 12px;
    border: 0.5px solid var(--text-200);
    border: 0;
    background-color: var(--bg-200);
    font-size: 18px;
    font-weight: bold;

    :deep(.el-input__wrapper) {
      border-radius: 12px;
      background-color: var(--bg-200);
    }

    :deep(.is-focus) {
      box-shadow: 0 0 0 1px var(--accent-200)
    }
  }
}
</style>
