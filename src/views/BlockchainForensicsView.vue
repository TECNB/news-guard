<template>
  <div class="BlockchainForensics min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 px-3">
    <el-scrollbar height="100vh">
      <div class="max-w-7xl mx-auto">
        <!-- 页面标题区域 - 减小尺寸 -->
        <div class="mb-3 py-3 text-center sm:text-left">
          <h1
            class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-emerald-600 mb-1 tracking-tight">
            区块链取证
          </h1>
          <p class="text-gray-600 text-sm max-w-2xl font-light">通过区块链技术追溯并验证已记录的虚假新闻信息</p>
        </div>

        <!-- 搜索区域 - 减小间距 -->
        <div class="bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl shadow-md p-4 mb-3 border border-gray-100">
          <!-- 查询模式切换 -->
          <div class="mb-3">
            <div class="bg-gray-50 rounded-xl p-0.5 flex w-full md:w-auto shadow-sm border border-gray-100">
              <div @click="queryMode = 'address'" :class="[
                'flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden cursor-pointer',
                queryMode === 'address'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-100 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-blue-500 after:to-green-500'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
              ]">
                <span class="relative z-10 flex items-center justify-center">
                  <i class="fa-solid fa-key mr-1.5 text-xs" v-if="queryMode === 'address'"></i>
                  通过区块链地址查询
                </span>
              </div>
              <div @click="queryMode = 'content'" :class="[
                'flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden cursor-pointer',
                queryMode === 'content'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-100 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-blue-500 after:to-green-500'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
              ]">
                <span class="relative z-10 flex items-center justify-center">
                  <i class="fa-solid fa-magnifying-glass mr-1.5 text-xs" v-if="queryMode === 'content'"></i>
                  通过新闻内容查询
                </span>
              </div>
            </div>
          </div>

          <!-- 按地址查询模式 - 更紧凑 -->
          <div v-if="queryMode === 'address'" class="flex flex-col md:flex-row gap-2">
            <div class="flex-grow">
              <label for="blockchainAddress" class="block text-xs font-medium text-gray-700 mb-1">区块链地址</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-2 flex items-center text-blue-500">
                  <i class="fa-solid fa-key" style="width: 16px; height: 16px;"></i>
                </span>
                <input v-model="blockchainAddress" id="blockchainAddress" type="text"
                  class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 shadow-sm text-sm"
                  placeholder="请输入区块链地址 (0x...)" />
              </div>
            </div>
            <div class="flex items-end">
              <button @click="fetchBlockchainData"
                class="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-lg shadow-md text-sm font-medium flex items-center justify-center"
                :disabled="isLoading">
                <span v-if="isLoading" class="mr-1">
                  <i class="fa-solid fa-spinner fa-spin" style="width: 16px; height: 16px;"></i>
                </span>
                <span>{{ isLoading ? '查询中...' : '查询区块链数据' }}</span>
              </button>
            </div>
          </div>

          <!-- 按内容查询模式 - 更紧凑和统一 -->
          <div v-else class="flex flex-col gap-2">
            <!-- 统一的查询区域 -->
            <div class="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl p-4 border border-gray-100 shadow-sm">
              <!-- 文字查询模式 -->
              <div v-if="contentQueryMode === 'text'" class="mb-4">
                <div class="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-gray-200">
                  <label for="newsContent" class="block text-xs font-medium text-gray-700 mb-1">新闻内容或关键词</label>
                  <div class="relative">
                    <span class="absolute top-2 left-0 pl-2 flex items-center text-blue-500">
                      <i class="fa-solid fa-magnifying-glass" style="width: 16px; height: 16px;"></i>
                    </span>
                    <textarea 
                      v-model="newsContent" 
                      id="newsContent" 
                      rows="3"
                      class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 shadow-sm text-sm bg-white"
                      placeholder="请输入要查询的新闻内容或关键词..." 
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- 多媒体查询模式 -->
              <div v-else class="mb-4">
                <div class="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-gray-200">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-medium text-gray-800 text-xs flex items-center">
                      <i class="fa-solid fa-upload text-blue-600 mr-1.5" style="width: 16px; height: 16px;"></i>
                      上传多媒体文件
                    </h4>
                    <div class="flex space-x-1.5">
                      <!-- 媒体类型按钮 -->
                      <button @click="triggerFileInput('image')" 
                        class="p-2 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors flex items-center shadow-sm">
                        <i class="fa-solid fa-image text-blue-600 mr-1.5" style="width: 14px; height: 14px;"></i>
                        <span class="text-xs text-blue-700">图片</span>
                      </button>
                      <button @click="triggerFileInput('audio')" 
                        class="p-2 bg-green-100 rounded-md hover:bg-green-200 transition-colors flex items-center shadow-sm">
                        <i class="fa-solid fa-music text-green-600 mr-1.5" style="width: 14px; height: 14px;"></i>
                        <span class="text-xs text-green-700">音频</span>
                      </button>
                      <button @click="triggerFileInput('video')" 
                        class="p-2 bg-emerald-100 rounded-md hover:bg-emerald-200 transition-colors flex items-center shadow-sm">
                        <i class="fa-solid fa-video text-emerald-600 mr-1.5" style="width: 14px; height: 14px;"></i>
                        <span class="text-xs text-emerald-700">视频</span>
                      </button>
                    </div>
                  </div>
                  
                  <!-- 已上传文件预览 -->
                  <div v-if="uploadedFiles.length > 0" class="mb-2">
                    <h4 class="text-xs font-medium text-gray-700 mb-2">已上传文件</h4>
                    <div class="flex flex-wrap gap-3 bg-white bg-opacity-50 p-3 rounded-lg border border-gray-200">
                      <div v-for="(file, index) in uploadedFiles" :key="index" class="relative group">
                        <!-- 图片预览 -->
                        <div v-if="file.type.startsWith('image/')" class="h-20 w-20 border rounded-md overflow-hidden bg-gray-100 shadow-sm">
                          <img :src="file.preview" class="h-full w-full object-cover" alt="上传图片" />
                        </div>
                        
                        <!-- 音频预览 -->
                        <div v-else-if="file.type.startsWith('audio/')" class="h-20 w-20 border rounded-md flex items-center justify-center bg-green-50 shadow-sm">
                          <i class="fa-solid fa-music text-green-500" style="font-size: 24px;"></i>
                        </div>
                        
                        <!-- 视频预览 -->
                        <div v-else-if="file.type.startsWith('video/')" class="h-20 w-20 border rounded-md overflow-hidden bg-gray-100 shadow-sm">
                          <video :src="file.preview" class="h-full w-full object-cover"></video>
                        </div>
                        
                        <!-- 文件名称 -->
                        <div class="text-center text-xs truncate mt-1 max-w-[80px] text-gray-600">
                          {{ file.file.name }}
                        </div>
                        
                        <!-- 删除按钮 -->
                        <button 
                          @click="removeFile(index)" 
                          class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                          style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;"
                        >
                          <i class="fa-solid fa-xmark" style="font-size: 10px;"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="flex items-center justify-center bg-white bg-opacity-70 rounded-lg p-6 border border-dashed border-gray-300">
                    <div class="text-center">
                      <i class="fa-solid fa-cloud-arrow-up text-blue-400 mb-2 text-2xl"></i>
                      <p class="text-sm text-gray-500">点击上方按钮上传多媒体文件</p>
                      <p class="text-xs text-gray-400 mt-1">支持图片、音频和视频</p>
                    </div>
                  </div>
                </div>
              </div>
                
              <input type="file" ref="imageInput" accept="image/*" class="hidden" @change="handleFileUpload('image', $event)" />
              <input type="file" ref="audioInput" accept="audio/*" class="hidden" @change="handleFileUpload('audio', $event)" />
              <input type="file" ref="videoInput" accept="video/*" class="hidden" @change="handleFileUpload('video', $event)" />
              
              <!-- 查询按钮和下拉框在同一行 -->
              <div class="flex justify-between items-center">
                <!-- 内容查询子模式切换 - 使用下拉框设计 -->
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-700 mr-2 text-nowrap">查询方式:</span>
                  <el-select 
                    v-model="contentQueryMode" 
                    size="default" 
                    class="w-48 min-w-[180px]"
                    popper-class="text-sm">
                    <el-option 
                      key="text" 
                      label="文字查询" 
                      value="text">
                      <div class="flex items-center">
                        <i class="fa-solid fa-font mr-2 text-blue-600"></i>
                        <span>文字查询</span>
                      </div>
                    </el-option>
                    <el-option 
                      key="media" 
                      label="多媒体查询" 
                      value="media">
                      <div class="flex items-center">
                        <i class="fa-solid fa-images mr-2 text-green-600"></i>
                        <span>多媒体查询</span>
                      </div>
                    </el-option>
                  </el-select>
                </div>
                
                <!-- 查询按钮 -->
                <button 
                  @click="searchByContent" 
                  class="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-lg shadow-md text-sm font-medium flex items-center justify-center transition-all duration-300"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="mr-1">
                    <i class="fa-solid fa-spinner fa-spin" style="width: 16px; height: 16px;"></i>
                  </span>
                  <i class="fa-solid fa-search mr-1.5" v-if="!isLoading"></i>
                  <span>{{ isLoading ? '查询中...' : '反向查询区块链记录' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 欢迎和使用指南区域 - 使用独立组件 -->
        <WelcomeGuide v-if="!newsRecords.length && !hasSearched" />

        <!-- 错误信息 - 更紧凑 -->
        <div v-if="errorMessage"
          class="bg-red-50 border-l-4 border-red-500 text-red-700 p-2 rounded-lg mb-3 shadow-md animate-fadeIn"
          role="alert">
          <div class="flex items-center">
            <i class="fa-solid fa-triangle-exclamation text-red-500 mr-2" style="width: 16px; height: 16px;"></i>
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- 使用结果展示组件 -->
        <ResultsDisplay 
          :records="newsRecords" 
          :has-searched="hasSearched" 
          :is-loading="isLoading" 
          @view-details="viewDetails"
        />

      </div>

      <!-- 使用独立的详情弹窗组件 -->
      <NewsDetailModal 
        v-model:show="showDetailModal" 
        :record="selectedRecord"
        @copy="handleCopySuccess" 
      />

      <!-- 复制成功提示 -->
      <div v-if="showCopySuccess"
        class="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-green-500 text-white px-3 py-1.5 rounded-lg shadow-lg animate-fadeIn z-50 flex items-center text-sm">
        <i class="fa-solid fa-check mr-1"></i> 已复制到剪贴板
      </div>
    </el-scrollbar>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { fakeNewsRecords, mediaTypeNewsRecords, keywordMapping, EXAMPLE_BLOCKCHAIN_ADDRESS } from '@/constants/blockchainForensicsData';
// 导入新创建的组件
import WelcomeGuide from '@/components/BlockchainForensics/WelcomeGuide.vue';
import NewsDetailModal from '@/components/BlockchainForensics/NewsDetailModal.vue';
import ResultsDisplay from '@/components/BlockchainForensics/ResultsDisplay.vue';

// 状态变量
const blockchainAddress = ref('');
const newsRecords = ref<any[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');
const hasSearched = ref(false);
const showDetailModal = ref(false);
const selectedRecord = ref<any>(null);
const showCopySuccess = ref(false);
const queryMode = ref('address');
const newsContent = ref('');
const newsType = ref('');
const startDate = ref('');
const endDate = ref('');
const uploadedFiles = ref<Array<{file: File, preview: string, type: string}>>([]);
const imageInput = ref<HTMLInputElement | null>(null);
const audioInput = ref<HTMLInputElement | null>(null);
const videoInput = ref<HTMLInputElement | null>(null);
const contentQueryMode = ref('text');

// 监听查询模式切换
watch(queryMode, (newMode) => {
  // 重置查询结果和状态
  newsRecords.value = [];
  hasSearched.value = false;
  errorMessage.value = '';
  
  // 根据新的查询模式重置相关输入
  if (newMode === 'address') {
    // 重置内容查询相关数据
    newsContent.value = '';
    uploadedFiles.value.forEach(file => URL.revokeObjectURL(file.preview));
    uploadedFiles.value = [];
  } else {
    // 重置地址查询相关数据
    blockchainAddress.value = '';
  }
});

// 监听内容查询子模式切换
watch(contentQueryMode, () => {
  // 如果在内容查询模式下，重置查询结果和状态
  if (queryMode.value === 'content') {
    newsRecords.value = [];
    hasSearched.value = false;
    errorMessage.value = '';
  }
});

// 模拟数据获取函数
const fetchBlockchainData = async () => {
  if (!blockchainAddress.value) {
    errorMessage.value = '请输入区块链地址';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    // 这里应该是实际从API获取数据的逻辑
    // const response = await fetch(`/api/blockchain-forensics?address=${blockchainAddress.value}`);
    // const data = await response.json();

    // 模拟API响应延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 模拟数据 - 实际项目中应替换为真实API调用
    if (blockchainAddress.value.toLowerCase() === EXAMPLE_BLOCKCHAIN_ADDRESS) {
      // 使用导入的假数据
      newsRecords.value = [...fakeNewsRecords];
    } else {
      // 模拟无数据的情况
      newsRecords.value = [];
    }

    hasSearched.value = true;
  } catch (error) {
    console.error('获取区块链数据失败:', error);
    errorMessage.value = '获取区块链数据失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

// 处理复制成功事件
const handleCopySuccess = () => {
  showCopySuccess.value = true;
  setTimeout(() => {
    showCopySuccess.value = false;
  }, 2000);
};

// 查看详情
const viewDetails = (record: any) => {
  selectedRecord.value = record;
  showDetailModal.value = true;
};

// 反向查询
const searchByContent = async () => {
  if (!newsContent.value.trim() && uploadedFiles.value.length === 0) {
    errorMessage.value = '请输入要查询的新闻内容或上传媒体文件';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // 模拟API响应延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 构造查询参数对象
    const searchParams = {
      content: newsContent.value,
      type: newsType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      files: uploadedFiles.value.map(f => ({
        name: f.file.name,
        type: f.file.type,
        size: f.file.size
      }))
    };
    
    console.log('反向查询参数:', searchParams);
    
    // 实际项目中，这里应该是将文件和其他参数一起发送到服务器
    // 可以使用FormData进行构建
    /*
    const formData = new FormData();
    formData.append('content', newsContent.value);
    formData.append('type', newsType.value);
    formData.append('startDate', startDate.value);
    formData.append('endDate', endDate.value);
    
    // 添加所有文件
    uploadedFiles.value.forEach(fileObj => {
      formData.append('files', fileObj.file);
    });
    
    // 发送请求
    const response = await fetch('/api/blockchain-forensics/search', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    newsRecords.value = data.records;
    */
    
    // 模拟数据 - 实际项目中应替换为真实API调用
    let hasMatch = false;
    
    // 检查文本内容关键词匹配
    const contentKeywords = Object.keys(keywordMapping);
    const matchedKeywords = contentKeywords.filter(keyword => 
      newsContent.value.includes(keyword)
    );
    
    hasMatch = matchedKeywords.length > 0;
    
    // 检查媒体文件匹配
    const hasImageFiles = uploadedFiles.value.some(file => file.type.startsWith('image/'));
    const hasAudioFiles = uploadedFiles.value.some(file => file.type.startsWith('audio/'));
    const hasVideoFiles = uploadedFiles.value.some(file => file.type.startsWith('video/'));
    
    if (hasMatch || hasImageFiles || hasAudioFiles || hasVideoFiles) {
      // 初始化搜索结果为空数组
      newsRecords.value = [];
      
      // 如果有关键词匹配，添加对应的新闻记录
      if (matchedKeywords.length > 0) {
        // 获取匹配关键词对应的新闻ID集合
        const matchedNewsIds = new Set(matchedKeywords.map(keyword => {
          return keywordMapping[keyword as keyof typeof keywordMapping];
        }));
        
        // 只添加ID匹配的新闻记录
        fakeNewsRecords.forEach(record => {
          if (matchedNewsIds.has(record.id)) {
            newsRecords.value.push(record);
          }
        });
      }
      
      // 如果上传了图片，添加图片相关的虚假新闻记录
      if (hasImageFiles) {
        newsRecords.value.push(mediaTypeNewsRecords.image);
      }
      
      // 如果上传了音频，添加音频相关的虚假新闻记录
      if (hasAudioFiles) {
        newsRecords.value.push(mediaTypeNewsRecords.audio);
      }
      
      // 如果上传了视频，添加视频相关的虚假新闻记录
      if (hasVideoFiles) {
        newsRecords.value.push(mediaTypeNewsRecords.video);
      }
      
      // 如果有类型筛选，进行过滤
      if (newsType.value) {
        newsRecords.value = newsRecords.value.filter(record => record.type === newsType.value);
      }
      
      // 如果有日期筛选，进行过滤
      if (startDate.value) {
        const startTimestamp = new Date(startDate.value).getTime();
        newsRecords.value = newsRecords.value.filter(record => {
          const recordDate = new Date(record.verificationDate).getTime();
          return recordDate >= startTimestamp;
        });
      }
      
      if (endDate.value) {
        const endTimestamp = new Date(endDate.value).getTime() + 86400000; // 加一天的毫秒数
        newsRecords.value = newsRecords.value.filter(record => {
          const recordDate = new Date(record.verificationDate).getTime();
          return recordDate <= endTimestamp;
        });
      }
    } else {
      // 模拟无匹配数据的情况
      newsRecords.value = [];
    }
    
    hasSearched.value = true;
  } catch (error) {
    console.error('反向查询区块链数据失败:', error);
    errorMessage.value = '查询失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

// 触发文件选择器
const triggerFileInput = (type: string) => {
  if (type === 'image' && imageInput.value) {
    imageInput.value.click();
  } else if (type === 'audio' && audioInput.value) {
    audioInput.value.click();
  } else if (type === 'video' && videoInput.value) {
    videoInput.value.click();
  }
};

// 处理文件上传
const handleFileUpload = (type: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    
    // 创建预览URL
    const fileURL = URL.createObjectURL(file);
    
    // 添加到上传文件列表
    uploadedFiles.value.push({
      file,
      preview: fileURL,
      type: file.type
    });
    
    // 重置input，允许再次选择相同文件
    target.value = '';
  }
};

// 移除文件
const removeFile = (index: number) => {
  // 释放预览URL内存
  URL.revokeObjectURL(uploadedFiles.value[index].preview);
  // 从列表移除
  uploadedFiles.value.splice(index, 1);
};
</script>

<style>
/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}

/* 元素淡入动画 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* FontAwesome图标样式调整 */
.fa-solid, .fa-regular {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 添加极小文本尺寸 */
.text-xxs {
  font-size: 0.65rem;
  line-height: 1rem;
}

/* 添加更现代的过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加页面滚动平滑效果 */
html {
  scroll-behavior: smooth;
}

/* 图标脉动动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95);
  }
}

.fa-circle-info, .fa-spinner {
  animation: pulse 2s infinite ease-in-out;
}
</style>