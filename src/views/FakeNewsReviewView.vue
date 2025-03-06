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
        <el-icon color="#B4B4B4">
          <Link />
        </el-icon>
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
            <el-icon color="#B4B4B4">
              <Top />
            </el-icon>
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
            <el-icon>
              <Document />
            </el-icon>
          </el-upload>

          <textarea v-model="message" @input="autoResize" @keydown.enter.prevent="handleEnter" placeholder="输入消息"
            class="bg-transparent outline-none flex-1 placeholder:text-text-200 placeholder:font-bold text-black ml-2 resize-none overflow-hidden"
            rows="1"></textarea>

          <el-icon size="18" class="ml-2">
            <Microphone />
          </el-icon>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { ElMessage } from 'element-plus';
import { suggestions } from '../constants/suggestions';
import { Chat } from '../utils/AIChat';
import { generateChart } from '../api/fakeNewsReview';
import { getSession, chat } from '../api/fakeNewsReview';
import { useChatStore } from '../stores/ChatStore';
import defaultImageUrl from '../assets/images/CloudPic.jpg';
import defaultPdfUrl from '../assets/pdf/2023中国生态环境状况公报.pdf';

// Base variables
const message = ref('');
const imageUrl = ref(''); // 存储上传的图片 URL
const pdfUrl = ref('');
const showSuggestions = ref(true); // 控制建议列表显示
const displayedMessages = ref<{ type: string; content: string }[]>([]); // 展示的消息列表

//获取对话的store
const chatStore = useChatStore();

import KnowledgeSelector from '../components/KnowledgeSelector.vue';

// Knowledge base state
const selectedKnowledges = ref<string[]>([]);

// Handle knowledge update
const handleKnowledgeUpdate = (values: string[]) => {
  selectedKnowledges.value = values;
};

// 上传失败处理函数
const handleUploadSuccess = (response: any) => {
  const uploadedFile = response.raw; // 获取上传的文件
  imageUrl.value = URL.createObjectURL(uploadedFile); // 创建本地 URL
  ElMessage.success('图片上传成功！');
};

const handleUploadError = (error: any, uploadedFile: File) => {
  console.error('Upload Error:', error);

  const fileName = uploadedFile.name;

  // 判断文件名后缀
  if (fileName.endsWith('.pdf')) {
    // 上传失败时展示默认 PDF
    pdfUrl.value = defaultPdfUrl;

    ElMessage.success('PDF 上传成功！');
  } else if (fileName.endsWith('.jpg') || fileName.endsWith('.png') || fileName.endsWith('.jpeg')) {
    // 上传失败时展示默认图片
    imageUrl.value = defaultImageUrl;

    ElMessage.success('图片上传成功！');
  } else {
    // 其他类型的文件
    ElMessage.error('上传失败！不支持的文件类型');
  }
};

// 打字机效果函数
const typeEffect = (text: string, speed: number) => {
  return new Promise<void>((resolve) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        displayedMessages.value[displayedMessages.value.length - 1].content += text[index++];
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
};

onMounted(async () => {
  // 从当前活跃的对话中获取消息
  if (chatStore.getCurrentMessages().length > 0) {
    displayedMessages.value = chatStore.getCurrentMessages();
    showSuggestions.value = false;
    console.log("message", displayedMessages.value);
  }

  // 监听聊天消息的变化，自动更新 displayedMessages
  watch(() => chatStore.getCurrentMessages(), (newValue) => {
    console.log('Messages updated:', newValue);
    if (newValue.length !== 0) {
      showSuggestions.value = false;
    } else {
      showSuggestions.value = true;
    }

    displayedMessages.value = newValue;
  });

  // 监听 message 的变化并调整 textarea 大小
  watch(message, (newValue) => {
    if (!newValue.trim()) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto'; // 恢复到初始状态
      }
    }
  });
});

const autoResize = (event: any) => {
  const textarea = event.target;
  textarea.style.height = `${textarea.scrollHeight}px`;
  if (textarea.value.trim() === '') {
    textarea.style.height = 'auto';
  }
};

// 回车事件处理函数
const handleEnter = async () => {
  const userContent = message.value;

  // 如果message.value包含折线图
  if (message.value.includes('折线图')) {
    displayedMessages.value.push({ type: 'user', content: userContent });
    chatStore.saveMessages(displayedMessages.value);
    message.value = '';
    let aiContent = '';

    showSuggestions.value = false;

    displayedMessages.value.push({ type: 'loading', content: '' });
    try {
      const data = await generateChart(userContent, 'line').then((res: any) => res.data);
      console.log("data", data);
      const jsonResult = data.replace(/^```json\s*|\s*```$/g, '').trim();
      aiContent = jsonResult;
    } catch (error) {
      console.log("message.value", message.value);
      console.error('请求失败:', error);
      displayedMessages.value.pop();
      displayedMessages.value.push({ type: 'ai', content: '发生错误，请稍后再试。' });
    }

    if (chatStore.currentConversationId === null) {
      chatStore.startNewConversation();
    }

    displayedMessages.value.pop();
    displayedMessages.value.push({ type: 'ai', content: '' });
    chatStore.saveMessages(displayedMessages.value);

    await typeEffect("以下是根据新闻内容分析平台输出的结果。", 50);

    displayedMessages.value.push({ type: 'LineContainer', content: aiContent });
    chatStore.saveMessages(displayedMessages.value);
    return;
  }

  if (message.value.includes('柱状图')) {
    displayedMessages.value.push({ type: 'user', content: userContent });
    chatStore.saveMessages(displayedMessages.value);
    message.value = '';
    let aiContent = '';

    showSuggestions.value = false;

    displayedMessages.value.push({ type: 'loading', content: '' });
    try {
      const data = await generateChart(userContent, 'bar').then((res: any) => res.data);
      console.log("data", data);
      const jsonResult = data.replace(/^```json\s*|\s*```$/g, '').trim();
      aiContent = jsonResult;
    } catch (error) {
      console.log("message.value", message.value);
      console.error('请求失败:', error);
      displayedMessages.value.pop();
      displayedMessages.value.push({ type: 'ai', content: '发生错误，请稍后再试。' });
    }

    if (chatStore.currentConversationId === null) {
      chatStore.startNewConversation();
    }

    displayedMessages.value.pop();
    displayedMessages.value.push({ type: 'ai', content: '' });
    chatStore.saveMessages(displayedMessages.value);

    await typeEffect("以下是根据新闻内容分析平台输出的结果。", 50);

    displayedMessages.value.push({ type: 'BarContainer', content: aiContent });
    chatStore.saveMessages(displayedMessages.value);
    return;
  }

  if (message.value.includes('饼图')) {
    displayedMessages.value.push({ type: 'user', content: userContent });
    chatStore.saveMessages(displayedMessages.value);
    message.value = '';
    let aiContent = '';

    showSuggestions.value = false;

    displayedMessages.value.push({ type: 'loading', content: '' });
    try {
      const data = await generateChart(userContent, 'pie').then((res: any) => res.data);
      console.log("data", data);
      const jsonResult = data.replace(/^```json\s*|\s*```$/g, '').trim();
      aiContent = jsonResult;
    } catch (error) {
      console.log("message.value", message.value);
      console.error('请求失败:', error);
      displayedMessages.value.pop();
      displayedMessages.value.push({ type: 'ai', content: '发生错误，请稍后再试。' });
    }

    if (chatStore.currentConversationId === null) {
      chatStore.startNewConversation();
    }

    displayedMessages.value.pop();
    displayedMessages.value.push({ type: 'ai', content: '' });
    chatStore.saveMessages(displayedMessages.value);

    await typeEffect("以下是根据新闻内容分析平台输出的结果。", 50);

    displayedMessages.value.push({ type: 'PieContainer', content: aiContent });
    chatStore.saveMessages(displayedMessages.value);
    return;
  }

  if (message.value.trim()) {
    displayedMessages.value.push({ type: 'user', content: userContent });
    message.value = '';

    showSuggestions.value = false;

    displayedMessages.value.push({ type: 'loading', content: '' });

    try {
      const response = await chat(userContent);
      const completeMessage = response.data.answer;

      console.log("ChatResponse", completeMessage);

      if (displayedMessages.value[displayedMessages.value.length - 1].type === 'loading') {
        displayedMessages.value.pop();
      }

      displayedMessages.value.push({ type: 'ai', content: '' });
      typeEffect(completeMessage, 50);

    } catch (error) {
      console.log("message.value", message.value);
      console.error('请求失败:', error);

      if (displayedMessages.value[displayedMessages.value.length - 1].type === 'loading') {
        displayedMessages.value.pop();
      }

      displayedMessages.value.push({ type: 'ai', content: '发生错误，请稍后再试。' });
    }
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
