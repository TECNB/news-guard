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

// Base variables
const message = ref('');
const enableWebSearch = ref(false);
const imageUrl = ref(''); // 存储上传的图片 URL
const pdfUrl = ref('');
const showSuggestions = ref(true); // 控制建议列表显示
const displayedMessages = ref<DisplayMessage[]>([]); // 展示的消息列表
const chatStore = useChatStore();

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

// Mock web search function
const performWebSearch = async (query: string) => {
  // 模拟搜索结果
  if (query.includes("阿里巴巴") && query.includes("京东") && query.includes("1500亿美元")) {
    return [{
      title: "辟谣：阿里巴巴收购京东传闻不实",
      url: "https://example.com/news/1",
      snippet: "记者向阿里巴巴和京东双方求证，均表示该消息不实。相关收购传闻纯属谣言。"
    }, {
      title: "专家分析：阿里巴巴与京东合作可能性探讨",
      url: "https://example.com/analysis/2", 
      snippet: "业内专家表示，虽然两家公司存在合作空间，但收购的可能性较小。"
    }];
  }
  return [];
};

// 回车事件处理函数
const handleEnter = async () => {
  const userContent = message.value.trim();
  if (!userContent) return;

  // Chart handling
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

  // Normal chat handling
  displayedMessages.value.push({ type: 'user', content: userContent });
  message.value = '';
  showSuggestions.value = false;
  
  // Web search handling
  if (enableWebSearch.value) {
    const searchResults = await performWebSearch(userContent);
    if (searchResults.length > 0) {
      displayedMessages.value.push({ type: 'webSearch', content: JSON.stringify(searchResults) });
    }
  }
  
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
