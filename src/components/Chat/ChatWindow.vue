<template>
  <el-scrollbar height="100%" wrap-style="width:100%;" class="flex justify-center -mx-5">
    <div id="chat-window" class="flex-1 px-24 py-10">
      <div v-for="(msg, index) in props.displayedMessages" :key="index" class="mb-4 flex items-start">

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

        <div v-if="msg.type === 'ai'" class="flex gap-3 items-start">
          <img src="../../assets/images/logo.png" alt="AI Avatar"
            class="w-6 h-6 rounded-full border border-gray-300 object-cover" />
          <div class="flex flex-col">

            <!-- Static Title -->
            <div class="flex items-center">
              <p class="font-bold mb-0.5">虚假新闻鉴别助手</p>
            </div>

            <!-- Dynamic Content -->
            <div class="flex items-start">
              <p class="text-start">{{ msg.content }}</p>
            </div>

            <!-- Actin Icons -->
            <div class="action-icons flex gap-3 mt-2 text-sm text-gray-500">
              <i class="fas fa-pen"></i>
              <!-- 复制文档图标 -->
              <i class="fas fa-clipboard"></i>
              <!-- 刷新图标 -->
              <i class="fas fa-sync-alt"></i>
              <!-- 添加图标 -->
              <i class="fas fa-headphones"></i>
              <!-- 编辑图标 -->
              <i class="fas fa-circle-info"></i>
              <!-- 消息图标 -->
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

import lineOptions from '../../utils/lineOptions';
import LineContainer from '../../components/Container/LineContainer.vue';

import barOption from '../../utils/barOption';
import BarContainer from '../../components/Container/BarContainer.vue';

import pieOption from '../../utils/pieOption';
import PieContainer from '../../components/Container/PieContainer.vue';

// 控制是否展开 PDF 展示框
const isExpanded = ref(false);

// 点击后展开 PDF 展示框
const expandPdf = () => {
  isExpanded.value = true; // 点击后切换为展示模式
};

// 点击删除按钮后折叠 PDF 展示框，回到默认图标状态
const collapsePdf = () => {
  isExpanded.value = false; // 恢复到 PDF 文件图标状态
};

const props = defineProps<{
  displayedMessages: { type: string; content: string }[];
}>();

let barData: { xAxisData: string[]; seriesData: number[] } = { xAxisData: [], seriesData: [] };
let barYAxisLabel = "";

let lineData: { xAxisData: string[]; seriesData: number[] } = { xAxisData: [], seriesData: [] };
let lineYAxisLabel = "";

let pieData = { seriesData: [] };
let pieSeriesName = "";



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
  /* 设置为打字机风格的字体 */
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid black;
  /* 模拟打字光标 */
  animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
  /* 逐字显示动画 */
  text-align: left;
  /* 确保文本左对齐 */
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