<template>
    <div class="Chat">
      <div v-if="showSuggestions" class="flex flex-1 flex-col justify-center items-start max-w-6xl p-20 mt-10">
        <!-- mt-10 增加了距离 -->
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
            class="w-64 h-36 bg-gray-100 rounded-3xl text-left flex flex-col gap-8 px-5 py-6 hover:bg-gray-200 cursor-pointer transition-bg duration-300"
            @click="showDataSidebar">
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
  
      <div class="flex flex-col gap-2 mt-20 mb-5 mx-5">
        <!-- 包裹图片展示框和输入框的大框架 -->
        <div class="bg-gray-100 bg-opacity-50 rounded-lg p-3 transition-all duration-300">
          <!-- 图片展示框 -->
          <div v-if="imageUrl" class="flex items-start mb-2">
            <div class="relative">
              <img :src="imageUrl" alt="Uploaded Image" class="w-20 h-30 object-cover rounded-lg" />
  
              <!-- 删除按钮 -->
              <div @click="removeImage"
                class="absolute top-0 right-0 bg-white text-black border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <i class="fa-solid fa-times text-xs"></i>
              </div>
            </div>
          </div>
  
          <!-- PDF 文件预览框 -->
          <div v-if="pdfUrl" class="flex items-start mb-2">
            <div class="relative">
              <!-- 模拟 PDF 文件图标的样式 -->
              <div @click="openPdf"
                class="w-30 h-30 flex items-center justify-start rounded-lg bg-gray-200 bg-opacity-50 border cursor-pointer p-2">
                <!-- PDF 文件图标 -->
                <i class="fa-solid fa-file-pdf text-red-600 text-4xl mr-2"></i>
  
                <!-- PDF 文件名称 -->
                <p class="text-sm">2023中国生态环境状况公报.pdf</p>
              </div>
  
              <!-- 删除按钮 -->
              <div @click="removePdf"
                class="absolute top-0 right-0 bg-white text-black border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <i class="fa-solid fa-times text-xs"></i>
              </div>
            </div>
          </div>
  
  
  
          <!-- 上传和输入框 -->
          <div class="flex items-center bg-gray-50 rounded-3xl p-1 relative z-10">
            <el-upload class="upload-demo z-10" :on-success="handleUploadSuccess" :on-error="handleUploadError"
              :show-file-list="false" accept="image/*,application/pdf">
              <i class="fa-solid fa-folder-arrow-up cursor-pointer text-lg"></i>
            </el-upload>
  
            <textarea v-model="message" @input="autoResize"  @keydown.enter.prevent="handleEnter" placeholder="输入消息"
                      class="bg-transparent outline-none flex-1 placeholder:text-text-200 placeholder:font-bold text-black ml-2 resize-none overflow-hidden"
                      rows="1"></textarea>
  
  
            <el-icon size="18" class="ml-2">
              <Microphone />
            </el-icon>
          </div>
  
        </div>
      </div>
  
  
      <Knowledge :ifShow="knowledgeVisible" @updateIfShow="updateKnowledgeVisible" />
      <!-- 遮罩层 -->
      <MaskLayer :ifShow="knowledgeVisible" />
  
      <DataSidebar :ifShow="dataSidebarVisible" @updateIfShow="updateDataSidebarVisible" />
      <!-- 遮罩层 -->
      <MaskLayer :ifShow="dataSidebarVisible" />
  
      <Form :ifShow="formVisible" @updateIfShow="updateFormVisible" />
      <!-- 遮罩层 -->
      <MaskLayer :ifShow="formVisible" />
      <MaskLayer :ifShow="chartVisible" />
      <Chart :ifShow="chartVisible" @updateIfShow="updateChartVisible" />
      <MaskLayer backgroundColor="rgba(0, 0, 0, 0.3)" :ifShow="statement01Visible" />
      <Statement :ifShow="statement01Visible" @updateIfShow="updateStatement01Visible" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, onMounted } from "vue";
  import { ElMessage } from 'element-plus';
  import { suggestions } from '../constants/suggestions'; // 导入建议列表
  import { AIChat } from '../utils/AIChat'; // 导入AIChat
  import chatExample from '../constants/chatExample'; // 导入聊天示例
  import chatExampleTuBiao from "../constants/chatExampleTuBiao.ts";
  import { useSidebarStore, useSideLeftStore, useSideTuBiaoStore, useSideBaoBiaoStore } from '../stores/SidebarStore.ts';
  import { useChatStore } from '../stores/ChatStore.ts';
  //获取对话的stpre
  const chatStore = useChatStore();
  
  let chartVisible = ref(false);
  const updateChartVisible = (value: boolean) => {
    chartVisible.value = value;
  }
  
  const imageUrl = ref(''); // 存储上传的图片 URL
  const pdfUrl = ref('');
  let statementVisible = ref(false);
  const sidebarStore = useSidebarStore();
  const sideLeftStore = useSideLeftStore();
  const sideTuBiaoStore = useSideTuBiaoStore();
  const sideBaoBiaoStore = useSideBaoBiaoStore();
  let knowledgeVisible = ref(false);
  let dataSidebarVisible = ref(false);
  let formVisible = ref(false);
  
  let statement01Visible = ref(false);
  const showStatement01 = () => {
    statement01Visible.value = !statement01Visible.value;
  }
  const updateStatement01Visible = (value: boolean) => {
    statement01Visible.value = value;
  }
  
  
  let statementName = ref('');
  const message = ref('');
  const systemContent = ref('生态环境');
  const relatedData = ref('当前生态环境数据显示：空气质量指数（AQI）为45，空气质量等级为优；PM2.5浓度为15微克/立方米，PM10浓度为30微克/立方米，二氧化硫（SO2）浓度为8微克/立方米，二氧化氮（NO2）浓度为20微克/立方米，一氧化碳（CO）浓度为0.7毫克/立方米，臭氧（O3）浓度为100微克/立方米。​');
  const showSuggestions = ref(true); // 控制建议列表显示
  const displayedMessages = ref<{ type: string; content: string }[]>([]); // 展示的消息列表
  import defaultImageUrl from '../assets/images/CloudPic.jpg'; // 导入本地图片作为上传失败后的默认图
  import defaultPdfUrl from '../assets/pdf/2023中国生态环境状况公报.pdf';
  import chatExampleBaoBiao from "../constants/chatExampleBaoBiao.ts";
  
  // 上传图片成功处理函数
  const saveMessages = () => {
    chatStore.saveMessages(displayedMessages.value);
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
  
  
  const removeImage = () => {
    imageUrl.value = ''; // 清空图片 URL
  };
  const openPdf = () => {
    window.open(pdfUrl.value, '_blank');
  }
  const removePdf = () => {
    pdfUrl.value = '';
  }
  
  // 打字机效果函数
  const typeEffect = (text: string, speed: number) => {
    return new Promise<void>((resolve) => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          displayedMessages.value[displayedMessages.value.length - 1].content += text[index++];
        } else {
          clearInterval(interval);
          resolve(); // 在打字完成后，resolve 这个 Promise
        }
      }, speed); // 控制字符出现速度
    });
  };
  
  
  onMounted(() => {
    // 从当前活跃的对话中获取消息
    if (chatStore.getCurrentMessages().length > 0) {
      displayedMessages.value = chatStore.getCurrentMessages(); // 使用 getCurrentMessages 方法获取消息
      showSuggestions.value = false;
      console.log("message", displayedMessages.value);
    }
  
    // 监听聊天消息的变化，自动更新 displayedMessages
    watch(() => chatStore.getCurrentMessages(), (newValue) => {
      console.log('Messages updated:', newValue);
      displayedMessages.value = newValue;
    });
  
    // watch(()=>chatStore.currentConversationId,()=>{
    //   displayedMessages.value = chatStore.getCurrentMessages()
    //   console.log("重复l")
    // })
  
    // 监听 sideTuBiaoStore 的变化
    watch(() => sideTuBiaoStore.TuBiao, (value) => {
      if (value === 1) {
        sideTuBiaoStore.TuBiao = 0;
        displayedMessages.value.pop();
        displayedMessages.value.push({ type: 'showChart', content: '' });
        chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      }
    });
  
    // 监听 sideBaoBiaoStore 的变化
    watch(() => sideBaoBiaoStore.BaoBiao, (val) => {
      if (val === 1) {
        sideBaoBiaoStore.BaoBiao = 0;
        displayedMessages.value.pop();
        displayedMessages.value.push({ type: 'showChartTu', content: '' });
        chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      }
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
  
  
  const autoResize = (event:any) => {
    const textarea = event.target;
  
    textarea.style.height = `${textarea.scrollHeight}px`;  // 根据内容设置新的高度
    if (textarea.value.trim() === '') {
      textarea.style.height = 'auto';  // Or set it to a fixed initial height like '20px'
    }
  
  };
  
  
  // 回车事件处理函数
  const handleEnter = async () => {
    if (imageUrl.value) {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      displayedMessages.value.push({
        type: 'image',
        content: imageUrl.value
      });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      const userContent = message.value;
  
      if (message.value != '整理文件中空气质量、碳排放来源、森林覆盖率的相关数据给我，其中监测水质的数据要求为化学需氧量'&& message.value !== '根据我的手写报表进行转化') {
        displayedMessages.value.push({ type: 'user', content: userContent });
        chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      }
  
      showSuggestions.value = false; // 隐藏建议列表
  
  
      // Add a loading placeholder
      displayedMessages.value.push({ type: 'loading', content: '' });
      // 移除加载占位符
      displayedMessages.value.pop();
      // displayedMessages.value.push({ type: 'ai', content: '' });
  
  
      // 添加最终的AI消息并应用打字效果
      // await typeEffect(chatExample2.prompt, 50);
      imageUrl.value = ''; // 清空图片 URL
  
    }
    if (pdfUrl.value) {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      displayedMessages.value.push({
        type: 'pdf',
        content: pdfUrl.value
      });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      const userContent = message.value;
      if (message.value != '整理文件中空气质量、碳排放来源、森林覆盖率的相关数据给我，其中监测水质的数据要求为化学需氧量'&& message.value !== '根据我的手写报表进行转化') {
        displayedMessages.value.push({ type: 'user', content: userContent });
        chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      }
      showSuggestions.value = false; // 隐藏建议列表
  
      // Add a loading placeholder
      displayedMessages.value.push({ type: 'loading', content: '' });
      // 移除加载占位符
      displayedMessages.value.pop();
  
      // 添加最终的AI消息并应用打字效果
      displayedMessages.value.push({ type: 'pdfQuestion', content: '以下是为您所转化的PDF报表' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
  
      pdfUrl.value = ''; // 清空 PDF URL
  
  
    }
    if (message.value === '为我生成图表，其中横向柱状图部分采取由大到小的排列方式') {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      const userContent = message.value;
  
      // 添加用户消息
      displayedMessages.value.push({ type: 'user', content: userContent });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      // 清空输入框
      message.value = '';
      showSuggestions.value = false;
  
      // 更新侧边栏状态
      sidebarStore.setActive(1);
      sideLeftStore.setAiTalk(1);
  
      // 添加一个加载占位符
      displayedMessages.value.push({ type: 'loading', content: '' });
  
      // 移除加载占位符
      displayedMessages.value.pop();
  
      // 添加可点击的 AI 消息，使用 v-html 渲染
      displayedMessages.value.push({ type: 'ai', content: '' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      // 模拟打字效果
      await typeEffect(chatExampleTuBiao.prompt, 50)
  
      return;
    }
  
    if (message.value === '为我生成报表，要求年度空气质量统计单独占一行，同时从之前的PDF中，提取空气质量优良天数以及本年度二氧化碳总排放量的具体数字数据，将它们作为一行') {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      const userContent = message.value;
  
      // 添加用户消息
      displayedMessages.value.push({ type: 'user', content: userContent });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      // 清空输入框
      message.value = '';
      showSuggestions.value = false;
      // 更新侧边栏状态
      sidebarStore.setActive(3);
      sideLeftStore.setAiTalk(1);
      // 添加一个加载占位符
      displayedMessages.value.push({ type: 'loading', content: '' });
  
      // 移除加载占位符
      displayedMessages.value.pop();
  
      // 添加可点击的 AI 消息，使用 v-html 渲染
      displayedMessages.value.push({ type: 'ai', content: '' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      await typeEffect(chatExampleBaoBiao.prompt, 50)
  
      return;
    }
  
  
  
    if (message.value === '2023年累计温室气体排放') {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      const userContent = message.value;
      displayedMessages.value.push({ type: 'user', content: "" });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      message.value = '';
  
      showSuggestions.value = false; // 隐藏建议列表
  
      // Add a loading placeholder
      displayedMessages.value.push({ type: 'loading', content: '' });
      // 移除加载占位符
      displayedMessages.value.pop();
      displayedMessages.value.push({ type: 'ai', content: '' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
  
  
      // 添加最终的AI消息并应用打字效果
      await typeEffect(chatExample.prompt, 50);
  
      displayedMessages.value.push({ type: 'numberQuestion', content: '' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      return;
    }
    if (message.value === '预测接下来三个月的温室气体排放') {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      const userContent = message.value;
      displayedMessages.value.push({ type: 'user', content: userContent });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      message.value = '';
  
      showSuggestions.value = false; // 隐藏建议列表
  
      // Add a loading placeholder
      displayedMessages.value.push({ type: 'loading', content: '' });
      // 移除加载占位符
      displayedMessages.value.pop();
      displayedMessages.value.push({ type: 'ai', content: '' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
  
  
      // 添加最终的AI消息并应用打字效果
      await typeEffect(chatExample.prompt, 50);
  
      displayedMessages.value.push({ type: 'predictQuestion', content: '' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      return;
    }
    if (message.value === '为我归因2023年温室气体排放') {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      const userContent = message.value;
      displayedMessages.value.push({ type: 'user', content: userContent });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      message.value = '';
  
      showSuggestions.value = false; // 隐藏建议列表
  
      // Add a loading placeholder
      displayedMessages.value.push({ type: 'loading', content: '' });
  
      // 移除加载占位符
      displayedMessages.value.pop();
      // displayedMessages.value.push({ type: 'ai', content: '' });
  
  
      // 添加最终的AI消息并应用打字效果
      // await typeEffect(chatExample2.prompt, 50);
  
      displayedMessages.value.push({ type: 'attributionQuestion', content: '' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      saveMessages();
      return;
    }
  
    if(message.value ==='根据我的手写报表进行转化')
    {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      const userContent = message.value;
      displayedMessages.value.push({ type: 'user', content: userContent });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      message.value = '';
      showSuggestions.value = false; // 隐藏建议列表
      displayedMessages.value.push({ type: 'ai', content: '请耐心等待，正在读取文件中...' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      setTimeout(() => {
        // 第二步：显示PDF读取完成并显示加载中的弹窗
        displayedMessages.value.pop(); // 移除之前的提示
        displayedMessages.value.push({ type: 'ai', content: 'IMG报表读取完成，正在进行接话数据转化...' });
        chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
  
        // 第三步：等待2秒后显示最终界面
        setTimeout(() => {
          showStatement01()
          // 显示最终界面和相关图表的按钮
          displayedMessages.value.pop(); // 移除之前的提示
          displayedMessages.value.push({ type: 'ai', content: '点击下方按钮生成多个相关图表的节目' });
          chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
          displayedMessages.value.pop(); // 移除之前的提示
          displayedMessages.value.push({ type: 'showIMG', content: '生成图表' });
          chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
  
        }, 2000); // 等待2秒显示图表生成界面
      }, 3000); // 等待3秒显示PDF读取完成的提示
  
  
  
      return;
    }
  
    if (message.value === '整理文件中空气质量、碳排放来源、森林覆盖率的相关数据给我，其中监测水质的数据要求为化学需氧量') {
      if (chatStore.currentConversationId === null) {
        chatStore.startNewConversation();
      }
      const userContent = message.value;
      displayedMessages.value.push({ type: 'user', content: userContent });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
      message.value = '';
  
      showSuggestions.value = false; // 隐藏建议列表
  
  
      // // Add a loading placeholder
      // displayedMessages.value.push({ type: 'loading', content: '' });
      // // 移除加载占位符
      // displayedMessages.value.pop();
      displayedMessages.value.push({ type: 'ai', content: '请耐心等待，正在读取文件中...' });
      chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
  
      setTimeout(() => {
        // 第二步：显示PDF读取完成并显示加载中的弹窗
        displayedMessages.value.pop(); // 移除之前的提示
        displayedMessages.value.push({ type: 'ai', content: 'PDF读取完成，正在进行接话数据转化...' });
        chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
  
  
        // 第三步：等待2秒后显示最终界面
        setTimeout(() => {
          showForm();
          // 显示最终界面和相关图表的按钮
          displayedMessages.value.pop(); // 移除之前的提示
          displayedMessages.value.push({ type: 'ai', content: '点击下方按钮生成多个相关图表的节目' });
          chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
          displayedMessages.value.pop(); // 移除之前的提示
          displayedMessages.value.push({ type: 'showStruct', content: '生成图表' });
          chatStore.saveMessages(displayedMessages.value); // 保存消息到当前对话
  
        }, 2000); // 等待2秒显示图表生成界面
      }, 3000); // 等待3秒显示PDF读取完成的提示
  
      // 添加最终的AI消息并应用打字效果
      // await typeEffect(chatExample.prompt, 50);
      //
      // displayedMessages.value.push({ type: 'predictQuestion', content: '' });
  
      return;
    }
    if (message.value.trim()) {
      const userContent = message.value;
      displayedMessages.value.push({ type: 'user', content: userContent });
      message.value = '';
  
      showSuggestions.value = false; // 隐藏建议列表
  
      // Add a loading placeholder
      displayedMessages.value.push({ type: 'loading', content: '' });
  
      try {
  const response = await AIChat(userContent);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Failed to get reader from response body');

  const textDecoder = new TextDecoder();
  let completeMessage = ''; // 用于累积AI的回复内容

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunkText = textDecoder.decode(value);
    const results = chunkText.split('\n\n').filter(Boolean).map((item) => item.replace(/^data: /, ''));

    for (let i = 0; i < results.length; i++) {
      const chunk = results[i];
      
      // 如果数据中包含 'DONE'，表示流式传输已完成，跳过处理
      if (chunk.indexOf('DONE') === -1) {
        try {
          // 尝试解析为JSON
          const chunkData = JSON.parse(chunk);
          const content = chunkData.choices[0]?.delta?.content;

          if (content) {
            completeMessage += content;
            // 更新显示的最后一条AI消息
            if (displayedMessages.value[displayedMessages.value.length - 1].type === 'loading') {
              displayedMessages.value[displayedMessages.value.length - 1].content = completeMessage;
            } else {
              displayedMessages.value.push({ type: 'ai', content: completeMessage });
            }
          }
        } catch (e) {
          // 如果解析为JSON失败，直接将chunk当作纯文本处理
          console.error('JSON解析出错:', e, chunk);
          completeMessage += chunk; // 直接将非JSON数据拼接到文本中

          // 更新显示的消息
          if (displayedMessages.value[displayedMessages.value.length - 1].type === 'loading') {
            displayedMessages.value[displayedMessages.value.length - 1].content = completeMessage;
          } else {
            displayedMessages.value.push({ type: 'ai', content: completeMessage });
          }
        }
      }
    }
  }

  // 移除加载占位符
  displayedMessages.value.pop();

  // 添加最终的AI消息并应用打字效果
  displayedMessages.value.push({ type: 'ai', content: '' });
  typeEffect(completeMessage, 50);

} catch (error) {
  console.log("message.value", message.value);
  console.error('请求失败:', error);
  displayedMessages.value.pop(); // 移除加载占位符
  displayedMessages.value.push({ type: 'ai', content: '发生错误，请稍后再试。' });
}

  
    }
  };
  
  const showStatement = () => {
    statementVisible.value = !statementVisible.value;
  };
  const showKnowledge = () => {
    knowledgeVisible.value = !knowledgeVisible.value;
  };
  const showDataSidebar = () => {
    dataSidebarVisible.value = !dataSidebarVisible.value;
  };
  const showForm = () => {
    formVisible.value = !formVisible.value;
  };
  
  const updateKnowledgeVisible = (newValue: boolean) => {
    knowledgeVisible.value = newValue;
  };
  const updateDataSidebarVisible = (newValue: boolean) => {
    dataSidebarVisible.value = newValue;
  };
  const updateFormVisible = (newValue: boolean) => {
    formVisible.value = newValue;
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