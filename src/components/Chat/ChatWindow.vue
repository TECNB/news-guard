<template>
  <el-scrollbar height="100%" wrap-style="width:100%;" class="flex justify-center -mx-5">
    <div id="chat-window" class="flex-1 px-24 py-10">
      <div v-for="(msg, index) in safeMessages" :key="index" class="mb-4 flex items-start">

        <div v-if="msg.type === 'image'" class="w-full flex justify-end items-center rounded-lg ">
          <img class="w-40 h-56 rounded-lg bg-gray-200 bg-opacity-50 p-2" :src="msg.content" />
        </div>

        <!-- PDF 文件预览框 -->
        <div v-if="msg.type === 'pdf'" class="w-full flex justify-end items-center rounded-lg">
          <!-- 判断是否已经点击并展开 -->
          <div v-if="isExpanded" class="relative w-full flex justify-end items-center">
            <!-- 外部灰色透明框包裹 -->
            <div class="relative w-[38rem] h-[38rem] bg-gray-300 bg-opacity-40 p-4 rounded-lg border border-gray-400">
              <!-- 点击后展开的 PDF 展示框 -->
              <iframe class="w-full h-full rounded-lg bg-white p-2" :src="msg.content" type="application/pdf">
                您的浏览器不支持 PDF 文件显示，请下载查看。
              </iframe>

              <!-- 删除按钮，点击后恢复到初始状态 -->
              <div @click="collapsePdf"
                class="absolute top-2 right-2 bg-white text-black border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors duration-300">
                <i class="fa-solid fa-times text-xs"></i>
              </div>
            </div>
          </div>

          <!-- 初始状态：PDF 文件图标，点击展开 -->
          <div v-else @click="expandPdf"
            class="w-30 h-30 flex items-center justify-center rounded-lg bg-gray-200 bg-opacity-50 border cursor-pointer">
            <!-- PDF 文件图标 -->
            <div
              class="w-30 h-30 flex items-center justify-start rounded-lg bg-gray-200 bg-opacity-50 border cursor-pointer p-2">
              <!-- PDF 文件图标 -->
              <i class="fa-solid fa-file-pdf text-red-600 text-4xl mr-2"></i>

              <!-- PDF 文件名称 -->
              <p class="text-sm">2023中国生态环境状况公报-保留大气环境版.pdf</p>
            </div>
          </div>
        </div>

        <div v-if="msg.type === 'user'" class="bg-gray-50 rounded-3xl px-5 py-2 ml-auto max-w-md">
          <p class="text-left">{{ msg.content }}</p>
        </div>

        <div v-if="msg.type === 'loading'" class="skeleton-loader w-full">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>

        <div v-if="msg.type === 'ai'" class="flex gap-3 items-start w-full">
          <img src="../../assets/images/logo.png" alt="AI Avatar"
            class="w-6 h-6 rounded-full border border-gray-300 object-cover flex-shrink-0" />
          <div class="flex flex-col w-full max-w-full overflow-hidden">
            <!-- Static Title -->
            <div class="flex items-center">
              <p class="font-bold mb-0.5">虚假新闻鉴别助手</p>
            </div>

            <!-- Web Search Results (if available) -->
            <div v-if="msg.webSearchContent" class="w-full mb-2">
              <WebSearchResult :searchResults="JSON.parse(msg.webSearchContent)" />
            </div>

            <!-- Dynamic Content -->
            <div class="markdown-body text-start w-full">
              <div v-html="msg.safeContent" class="prose max-w-full" />
            </div>

            <!-- Action Icons -->
            <div class="action-icons flex gap-3 mt-2 text-sm text-gray-500">
              <i class="fas fa-pen"></i>
              <i class="fas fa-clipboard"></i>
              <i class="fas fa-sync-alt"></i>
              <i class="fas fa-headphones"></i>
              <i class="fas fa-circle-info"></i>
              <i class="fas fa-star"></i>
            </div>
          </div>
        </div>

        <LineContainer v-if="msg.type === 'LineContainer'" width="100%" :height="320" :data="lineData"
          :chartOption="lineOptions" :yAxisLabel="lineYAxisLabel" />
        <BarContainer v-if="msg.type === 'BarContainer'" width="100%" :height="320" :data="barData"
          :chartOption="barOption" :yAxisLabel="barYAxisLabel" />
        <PieContainer v-if="msg.type === 'PieContainer'" width="100%" :height="320" :data="pieData"
          :chartOption="pieOption" :seriesName="pieSeriesName" />

      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { computed } from 'vue';
import { marked } from 'marked';
import WebSearchResult from '../WebSearchResult.vue';

import lineOptions from '../../utils/lineOptions';
import LineContainer from '../../components/Container/LineContainer.vue';

import barOption from '../../utils/barOption';
import BarContainer from '../../components/Container/BarContainer.vue';

import pieOption from '../../utils/pieOption';
import PieContainer from '../../components/Container/PieContainer.vue';

// 增强的预处理函数（同时处理非法标记和空内容）
const preprocessContent = (content: string) => {
  // 步骤1：删除所有##...$$标记
  const cleanContent = content.replace(/##.*?\$\$/g, '');
  
  // 步骤2：处理空内容情况
  return cleanContent.trim() || '[空内容]';
};

// 配置基础Markdown解析规则
marked.setOptions({
  breaks: true,
  gfm: true
});

// 控制是否展开 PDF 展示框
const isExpanded = ref(false);

// 点击后展开 PDF 展示框
const expandPdf = () => {
  isExpanded.value = true;
};

// 点击删除按钮后折叠 PDF 展示框，回到默认图标状态
const collapsePdf = () => {
  isExpanded.value = false;
};

const props = defineProps<{
  displayedMessages: { type: string; content: string }[];
}>();

// 定义扩展的消息类型
type SafeMessage = {
  type: string;
  content: string;
  safeContent: string;
  webSearchContent?: string | null;
};

let barData: { xAxisData: string[]; seriesData: number[] } = { xAxisData: [], seriesData: [] };
let barYAxisLabel = "";

let lineData: { xAxisData: string[]; seriesData: number[] } = { xAxisData: [], seriesData: [] };
let lineYAxisLabel = "";

let pieData = { seriesData: [] };
let pieSeriesName = "";

// 安全渲染管道（简化版，不使用DOMPurify）
const safeMessages = computed<SafeMessage[]>(() => {
  // 首先将所有webSearch类型的消息提取出来
  const webSearchMessages = props.displayedMessages.filter(msg => msg.type === 'webSearch');
  
  // 然后处理所有消息
  return props.displayedMessages.filter(msg => msg.type !== 'webSearch').map(msg => {
    // 普通AI消息处理
    if (msg.type === 'ai') {
      // 查找是否有对应的webSearch消息可以合并
      const webSearchContent = webSearchMessages.length > 0 ? webSearchMessages[0].content : null;
      
      return {
        ...msg,
        webSearchContent, // 将搜索结果添加到AI消息中
        safeContent: String(marked.parse(preprocessContent(msg.content)))
      };
    }
    
    // 其他类型消息处理
    return {
      ...msg,
      safeContent: msg.type === 'ai' ? String(marked.parse(preprocessContent(msg.content))) : ''
    };
  });
});

watch(
  () => props.displayedMessages,
  (newMessages) => {
    if (newMessages.length > 0 && newMessages[newMessages.length - 1].type === 'BarContainer') {
      const content = JSON.parse(newMessages[newMessages.length - 1].content);
      barData = {
        xAxisData: content.xAxisData,
        seriesData: content.seriesData
      };
      barYAxisLabel = content.yAxisLabel;
    } else if (newMessages.length > 0 && newMessages[newMessages.length - 1].type === 'LineContainer') {
      const content = JSON.parse(newMessages[newMessages.length - 1].content);
      lineData = {
        xAxisData: content.xAxisData,
        seriesData: content.seriesData
      };
      lineYAxisLabel = content.yAxisLabel;
    } else if (newMessages.length > 0 && newMessages[newMessages.length - 1].type === 'PieContainer') {
      const content = JSON.parse(newMessages[newMessages.length - 1].content);
      pieData = {
        seriesData: content.seriesData
      };
      pieSeriesName = content.seriesName;
    }
  },
  { deep: true }
);

onMounted(() => {
});
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

.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
}

.typing-effect {
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid black;
  animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
  text-align: left;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-caret {
  from,
  to {
    border-color: transparent;
  }
  50% {
    border-color: black;
  }
}
</style>
