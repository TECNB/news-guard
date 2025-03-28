<template>
  <div class="BlockchainForensics min-h-screen bg-gradient-to-br from-gray-50 to-green-50 px-6">
    <el-scrollbar height="100vh">
      <div class="max-w-7xl mx-auto mb-2">
        <!-- 页面标题区域 -->
        <div class="mb-10 text-center sm:text-left">
          <h1
            class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-700 mb-3">
            区块链取证系统
          </h1>
          <p class="text-gray-600 text-lg max-w-2xl">通过区块链技术追溯并验证已记录的虚假新闻信息，保障数据真实性与不可篡改性</p>
        </div>

        <!-- 搜索区域 -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-8 transform transition-all duration-300 hover:shadow-xl">
          <!-- 查询模式切换 -->
          <div class="mb-5">
            <div class="bg-gray-100 rounded-lg p-1 flex w-full md:w-auto">
              <button @click="queryMode = 'address'" :class="[
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200',
                queryMode === 'address'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              ]">
                通过区块链地址查询
              </button>
              <button @click="queryMode = 'content'" :class="[
                'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200',
                queryMode === 'content'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              ]">
                通过新闻内容查询
              </button>
            </div>
          </div>

          <!-- 按地址查询模式 -->
          <div v-if="queryMode === 'address'" class="flex flex-col md:flex-row gap-5">
            <div class="flex-grow">
              <label for="blockchainAddress" class="block text-sm font-medium text-gray-700 mb-2">区块链地址</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <i class="fa-solid fa-key text-gray-500" style="width: 20px; height: 20px;"></i>
                </span>
                <input v-model="blockchainAddress" id="blockchainAddress" type="text"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="请输入区块链地址 (0x...)" />
              </div>
            </div>
            <div class="flex items-end">
              <button @click="fetchBlockchainData"
                class="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                :disabled="isLoading">
                <span v-if="isLoading" class="mr-2">
                  <i class="fa-solid fa-spinner fa-spin" style="width: 20px; height: 20px; display: inline-block;"></i>
                </span>
                <span>{{ isLoading ? '查询中...' : '查询区块链数据' }}</span>
              </button>
            </div>
          </div>

          <!-- 按内容查询模式 -->
          <div v-else class="flex flex-col gap-5">
            <div class="flex-grow">
              <label for="newsContent" class="block text-sm font-medium text-gray-700 mb-2">新闻内容或关键词</label>
              <div class="relative">
                <span class="absolute top-3 left-0 pl-3 flex items-center text-gray-500">
                  <i class="fa-solid fa-magnifying-glass" style="width: 20px; height: 20px;"></i>
                </span>
                <textarea 
                  v-model="newsContent" 
                  id="newsContent" 
                  rows="3"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="请输入要查询的新闻内容或关键词..." 
                ></textarea>
              </div>
            </div>

            <!-- 多媒体上传区域 -->
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 class="font-medium text-gray-700 mb-3 flex items-center">
                <i class="fa-solid fa-images text-green-600 mr-2" style="width: 20px; height: 20px;"></i>
                多媒体内容查询
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <!-- 图片上传 -->
                <div class="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer" @click="triggerFileInput('image')">
                  <i class="fa-solid fa-image text-green-500 mb-2" style="font-size: 32px;"></i>
                  <p class="text-sm text-gray-600">上传图片</p>
                  <p class="text-xs text-gray-500 mt-1">支持 JPG, PNG, GIF</p>
                  <input type="file" ref="imageInput" accept="image/*" class="hidden" @change="handleFileUpload('image', $event)" />
                </div>
                
                <!-- 音频上传 -->
                <div class="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer" @click="triggerFileInput('audio')">
                  <i class="fa-solid fa-music text-green-500 mb-2" style="font-size: 32px;"></i>
                  <p class="text-sm text-gray-600">上传音频</p>
                  <p class="text-xs text-gray-500 mt-1">支持 MP3, WAV, OGG</p>
                  <input type="file" ref="audioInput" accept="audio/*" class="hidden" @change="handleFileUpload('audio', $event)" />
                </div>
                
                <!-- 视频上传 -->
                <div class="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer" @click="triggerFileInput('video')">
                  <i class="fa-solid fa-video text-green-500 mb-2" style="font-size: 32px;"></i>
                  <p class="text-sm text-gray-600">上传视频</p>
                  <p class="text-xs text-gray-500 mt-1">支持 MP4, WebM, MOV</p>
                  <input type="file" ref="videoInput" accept="video/*" class="hidden" @change="handleFileUpload('video', $event)" />
                </div>
              </div>

              <!-- 已上传文件预览 -->
              <div v-if="uploadedFiles.length > 0" class="mt-4">
                <h5 class="text-sm font-medium text-gray-600 mb-2">已上传的文件</h5>
                <div class="flex flex-wrap gap-3">
                  <div v-for="(file, index) in uploadedFiles" :key="index" class="relative group">
                    <!-- 图片预览 -->
                    <div v-if="file.type.startsWith('image/')" class="h-20 w-20 border rounded-md overflow-hidden bg-gray-100">
                      <img :src="file.preview" class="h-full w-full object-cover" alt="上传图片" />
                    </div>
                    
                    <!-- 音频预览 -->
                    <div v-else-if="file.type.startsWith('audio/')" class="h-20 w-20 border rounded-md flex items-center justify-center bg-gray-100">
                      <i class="fa-solid fa-music text-green-500" style="font-size: 40px;"></i>
                    </div>
                    
                    <!-- 视频预览 -->
                    <div v-else-if="file.type.startsWith('video/')" class="h-20 w-20 border rounded-md overflow-hidden bg-gray-100">
                      <video :src="file.preview" class="h-full w-full object-cover"></video>
                    </div>
                    
                    <!-- 删除按钮 -->
                    <button 
                      @click="removeFile(index)" 
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style="width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;"
                    >
                      <i class="fa-solid fa-xmark" style="font-size: 12px;"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            
            
            <div class="flex justify-end">
              <button 
                @click="searchByContent" 
                class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="mr-2">
                  <i class="fa-solid fa-spinner fa-spin" style="width: 20px; height: 20px; display: inline-block;"></i>
                </span>
                <span>{{ isLoading ? '查询中...' : '反向查询区块链记录' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="errorMessage"
          class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-8 shadow-md animate-fadeIn"
          role="alert">
          <div class="flex items-center">
            <i class="fa-solid fa-triangle-exclamation mr-2" style="width: 24px; height: 24px;"></i>
            <p>{{ errorMessage }}</p>
          </div>
        </div>

        <!-- 数据展示区域 -->
        <div v-if="newsRecords.length > 0" class="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fadeIn">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <i class="fa-solid fa-file-lines text-green-600 mr-2" style="width: 24px; height: 24px;"></i>
            查询结果
          </h2>

          <div class="overflow-x-auto rounded-xl">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-xl">
                    ID</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">鉴别时间</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-xl">
                    操作</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(record, index) in newsRecords" :key="index"
                  class="transition-colors duration-200 hover:bg-green-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ record.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <div class="line-clamp-1 max-w-xs">{{ record.title }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(record.verificationDate)
                    }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getTypeClass(record.type)">{{ record.type }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button @click="viewDetails(record)"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                      <i class="fa-solid fa-eye mr-1" style="width: 16px; height: 16px;"></i>
                      查看详情
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 无数据状态 -->
        <div v-else-if="hasSearched && !isLoading"
          class="bg-white rounded-2xl shadow-lg p-10 text-center animate-fadeIn flex flex-col items-center">
          <div class="w-24 h-24 mb-6 bg-green-50 rounded-full flex items-center justify-center">
            <i class="fa-regular fa-face-smile text-green-400" style="font-size: 48px;"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">未找到记录</h3>
          <p class="text-gray-500 max-w-md mx-auto">该区块链地址未存储任何虚假新闻记录，请尝试使用其他地址搜索</p>
          <button @click="blockchainAddress = '0x123456789abcdef'; fetchBlockchainData()"
            class="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            尝试示例地址
          </button>
        </div>

        <!-- 初始状态提示 -->
        <div v-if="!hasSearched && !isLoading"
          class="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-inner text-center my-10">
          <div class="flex flex-col items-center justify-center space-y-4">
            <i class="fa-solid fa-circle-info text-green-400" style="font-size: 64px;"></i>
            <h3 class="text-xl font-medium text-gray-800">如何使用区块链取证系统</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              <!-- 通过区块链地址查询 -->
              <div class="bg-white rounded-xl p-5 shadow-sm">
                <h4 class="text-lg font-medium text-green-700 mb-3 flex items-center">
                  <i class="fa-solid fa-key mr-2" style="width: 20px; height: 20px;"></i>
                  通过区块链地址查询
                </h4>
                <ol class="text-gray-600 text-left space-y-2 pl-6 list-decimal">
                  <li>切换到"通过区块链地址查询"模式</li>
                  <li>在输入框中填入区块链地址</li>
                  <li>点击"查询区块链数据"按钮</li>
                  <li>系统将返回与该地址关联的所有虚假新闻记录</li>
                </ol>
                <div class="mt-3 text-sm text-gray-500 italic">
                  示例地址: 0x123456789abcdef
                </div>
              </div>

              <!-- 通过新闻内容查询 -->
              <div class="bg-white rounded-xl p-5 shadow-sm">
                <h4 class="text-lg font-medium text-green-700 mb-3 flex items-center">
                  <i class="fa-solid fa-magnifying-glass mr-2" style="width: 20px; height: 20px;"></i>
                  通过新闻内容反向查询
                </h4>
                <ol class="text-gray-600 text-left space-y-2 pl-6 list-decimal">
                  <li>切换到"通过新闻内容查询"模式</li>
                  <li>输入新闻内容或相关关键词</li>
                  <li>上传相关媒体文件（支持图片、音频和视频）</li>
                  <li>选择可选的筛选条件（新闻类型、时间范围）</li>
                  <li>点击"反向查询区块链记录"按钮</li>
                  <li>系统将匹配内容并返回相关的区块链记录</li>
                </ol>
                <div class="mt-3 text-sm text-gray-500 italic">
                  示例关键词: 外星、疫苗<br>
                  支持的媒体格式: JPG, PNG, GIF, MP3, WAV, MP4, WebM
                </div>
              </div>
            </div>

            <p class="text-gray-600 text-sm mt-4">
              本系统利用区块链技术记录和验证已鉴别的虚假新闻，确保数据可追溯且不可篡改
            </p>
          </div>
        </div>
      </div>

      <!-- 详情弹窗 -->
      <div v-if="showDetailModal"
        class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fadeIn"
        @click.self="showDetailModal = false">
        <div
          class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 class="text-2xl font-bold text-gray-900 flex items-center">
                <i class="fa-solid fa-file-lines text-green-600 mr-2" style="width: 24px; height: 24px;"></i>
                新闻详情
              </h3>
              <button @click="showDetailModal = false"
                class="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100">
                <i class="fa-solid fa-xmark" style="width: 24px; height: 24px;"></i>
              </button>
            </div>

            <div v-if="selectedRecord" class="space-y-6">
              <div class="bg-gray-50 rounded-xl p-5">
                <h4 class="text-sm font-medium uppercase text-gray-500 mb-1">标题</h4>
                <p class="text-2xl font-semibold text-gray-900">{{ selectedRecord.title }}</p>
              </div>

              <div>
                <h4 class="text-sm font-medium uppercase text-gray-500 mb-2">内容</h4>
                <div class="bg-gray-50 rounded-xl p-5">
                  <p class="text-gray-700 whitespace-pre-line">{{ selectedRecord.content }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="bg-gray-50 rounded-xl p-4">
                  <h4 class="text-sm font-medium uppercase text-gray-500 mb-1">类型</h4>
                  <div class="flex items-center">
                    <span :class="getDetailTypeClass(selectedRecord.type)">{{ selectedRecord.type }}</span>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-xl p-4">
                  <h4 class="text-sm font-medium uppercase text-gray-500 mb-1">鉴别时间</h4>
                  <p class="text-gray-800 font-medium">{{ formatDate(selectedRecord.verificationDate) }}</p>
                </div>

                <div class="bg-gray-50 rounded-xl p-4">
                  <h4 class="text-sm font-medium uppercase text-gray-500 mb-1">区块链交易哈希</h4>
                  <div class="flex items-center">
                    <p class="text-gray-800 font-mono text-sm truncate">{{ selectedRecord.transactionHash }}</p>
                    <button class="ml-2 text-green-600 hover:text-green-800"
                      @click="copyToClipboard(selectedRecord.transactionHash)">
                      <i class="fa-solid fa-clipboard" style="width: 20px; height: 20px;"></i>
                    </button>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-xl p-4">
                  <h4 class="text-sm font-medium uppercase text-gray-500 mb-1">区块高度</h4>
                  <p class="text-gray-800 font-medium">{{ selectedRecord.blockNumber }}</p>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium uppercase text-gray-500 mb-2">鉴别结果</h4>
                <div class="bg-red-50 rounded-xl p-5 border-l-4 border-red-500">
                  <p class="font-bold text-red-800 text-lg mb-2">{{ selectedRecord.verificationResult }}</p>
                  <p class="text-red-700">{{ selectedRecord.reasonDetail }}</p>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-sm font-medium uppercase text-gray-500">区块链证明</h4>
                  <button @click="toggleBlockchainProof"
                    class="text-sm text-green-600 hover:text-green-800 flex items-center">
                    {{ showBlockchainProof ? '隐藏' : '显示' }} 证明
                    <i class="fa-solid fa-chevron-down ml-1" 
                      :class="{ 'transform rotate-180': !showBlockchainProof }" 
                      style="width: 16px; height: 16px;"></i>
                  </button>
                </div>
                <div v-if="showBlockchainProof"
                  class="bg-gray-800 p-4 rounded-xl text-xs font-mono text-gray-200 overflow-x-auto transition-all duration-300">
                  <pre>{{ JSON.stringify(selectedRecord.blockchainProof, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 flex justify-end rounded-b-2xl">
            <button @click="showDetailModal = false"
              class="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl shadow-sm hover:shadow transition-all duration-200">
              关闭
            </button>
          </div>
        </div>
      </div>

      <!-- 复制成功提示 -->
      <div v-if="showCopySuccess"
        class="fixed bottom-10 right-10 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn z-50">
        已复制到剪贴板
      </div>
    </el-scrollbar>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

// 状态变量
const blockchainAddress = ref('');
const newsRecords = ref<any[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');
const hasSearched = ref(false);
const showDetailModal = ref(false);
const selectedRecord = ref<any>(null);
const showBlockchainProof = ref(false);
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
    if (blockchainAddress.value.toLowerCase() === '0x123456789abcdef') {
      // 模拟有数据的情况
      newsRecords.value = [
        {
          id: 'FN-2023-001',
          title: '某国宣布发现外星人基地',
          content: '据报道，某国科学家在沙漠地区发现了疑似外星人基地的遗迹，引发全球关注。经过专家鉴定，该消息纯属虚构，目的是为了吸引旅游和媒体关注。',
          type: '文本新闻',
          verificationDate: '2023-11-15T09:30:00',
          transactionHash: '0x7b5e832f5746e7884b5f9c6e23aee1f18b23f8b4c8c8e9f9b8f7e6d5c4b3a2c1',
          blockNumber: 15689742,
          verificationResult: '虚假新闻',
          reasonDetail: '内容与官方发布的信息不符，且无法提供可靠的证据来源',
          blockchainProof: {
            timestamp: '2023-11-15T10:05:23',
            networkId: 1,
            contractAddress: '0x9876543210abcdef',
            eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
          }
        },
        {
          id: 'FN-2023-002',
          title: '虚假疫苗报道',
          content: '一则关于新型疫苗导致严重副作用的消息在社交媒体上广泛传播。经过专业医疗机构核实，该消息是基于断章取义的数据制造的虚假新闻。',
          type: '图文结合',
          verificationDate: '2023-12-03T14:15:00',
          transactionHash: '0x8c7d6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5',
          blockNumber: 15782931,
          verificationResult: '误导性信息',
          reasonDetail: '篡改了原始研究数据，夸大了极少数个案的情况，忽略了统计学意义',
          blockchainProof: {
            timestamp: '2023-12-03T14:55:12',
            networkId: 1,
            contractAddress: '0x9876543210abcdef',
            eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
          }
        }
      ];
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

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 根据新闻类型获取样式类
const getTypeClass = (type: string) => {
  const baseClass = 'px-2 py-1 text-xs font-medium rounded-full';

  switch (type) {
    case '文本新闻':
      return `${baseClass} bg-green-100 text-green-800`;
    case '图文结合':
      return `${baseClass} bg-emerald-100 text-emerald-800`;
    case '视频新闻':
      return `${baseClass} bg-teal-100 text-teal-800`;
    case '音频新闻':
      return `${baseClass} bg-lime-100 text-lime-800`;
    default:
      return `${baseClass} bg-gray-100 text-gray-800`;
  }
};

// 详情页中的类型标签样式
const getDetailTypeClass = (type: string) => {
  const baseClass = 'px-3 py-1.5 text-sm font-medium rounded-full';

  switch (type) {
    case '文本新闻':
      return `${baseClass} bg-green-100 text-green-800`;
    case '图文结合':
      return `${baseClass} bg-emerald-100 text-emerald-800`;
    case '视频新闻':
      return `${baseClass} bg-teal-100 text-teal-800`;
    case '音频新闻':
      return `${baseClass} bg-lime-100 text-lime-800`;
    default:
      return `${baseClass} bg-gray-100 text-gray-800`;
  }
};

// 查看详情
const viewDetails = (record: any) => {
  selectedRecord.value = record;
  showDetailModal.value = true;
  showBlockchainProof.value = false; // 默认隐藏区块链证明
};

// 切换区块链证明显示状态
const toggleBlockchainProof = () => {
  showBlockchainProof.value = !showBlockchainProof.value;
};

// 复制到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    showCopySuccess.value = true;
    setTimeout(() => {
      showCopySuccess.value = false;
    }, 2000);
  }).catch(err => {
    console.error('复制失败:', err);
  });
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
    if (newsContent.value.includes('外星') || newsContent.value.includes('疫苗')) {
      hasMatch = true;
    }
    
    // 检查媒体文件匹配
    // 这里模拟：如果上传了任何图片、音频或视频文件，就视为有匹配
    if (uploadedFiles.value.length > 0) {
      hasMatch = true;
    }
    
    if (hasMatch) {
      // 模拟匹配到内容的情况
      newsRecords.value = [
        {
          id: 'FN-2023-001',
          title: '某国宣布发现外星人基地',
          content: '据报道，某国科学家在沙漠地区发现了疑似外星人基地的遗迹，引发全球关注。经过专家鉴定，该消息纯属虚构，目的是为了吸引旅游和媒体关注。',
          type: '文本新闻',
          verificationDate: '2023-11-15T09:30:00',
          transactionHash: '0x7b5e832f5746e7884b5f9c6e23aee1f18b23f8b4c8c8e9f9b8f7e6d5c4b3a2c1',
          blockNumber: 15689742,
          verificationResult: '虚假新闻',
          reasonDetail: '内容与官方发布的信息不符，且无法提供可靠的证据来源',
          blockchainProof: {
            timestamp: '2023-11-15T10:05:23',
            networkId: 1,
            contractAddress: '0x9876543210abcdef',
            eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
          }
        },
        {
          id: 'FN-2023-002',
          title: '虚假疫苗报道',
          content: '一则关于新型疫苗导致严重副作用的消息在社交媒体上广泛传播。经过专业医疗机构核实，该消息是基于断章取义的数据制造的虚假新闻。',
          type: '图文结合',
          verificationDate: '2023-12-03T14:15:00',
          transactionHash: '0x8c7d6e5f4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5',
          blockNumber: 15782931,
          verificationResult: '误导性信息',
          reasonDetail: '篡改了原始研究数据，夸大了极少数个案的情况，忽略了统计学意义',
          blockchainProof: {
            timestamp: '2023-12-03T14:55:12',
            networkId: 1,
            contractAddress: '0x9876543210abcdef',
            eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
          }
        }
      ];
      
      // 如果上传了图片，添加图片相关的虚假新闻记录
      if (uploadedFiles.value.some(file => file.type.startsWith('image/'))) {
        newsRecords.value.push({
          id: 'FN-2023-003',
          title: '篡改的灾难现场照片',
          content: '社交媒体流传的一组灾难现场照片经过AI技术合成和篡改，夸大了实际灾情程度，引发公众恐慌。',
          type: '图文结合',
          verificationDate: '2023-10-25T11:20:00',
          transactionHash: '0x3a2c1b4e5d6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
          blockNumber: 15620031,
          verificationResult: '图像篡改',
          reasonDetail: '通过图像分析发现使用了AI生成和编辑技术，与真实灾情现场不符',
          blockchainProof: {
            timestamp: '2023-10-25T12:05:18',
            networkId: 1,
            contractAddress: '0x9876543210abcdef',
            eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
          }
        });
      }
      
      // 如果上传了音频，添加音频相关的虚假新闻记录
      if (uploadedFiles.value.some(file => file.type.startsWith('audio/'))) {
        newsRecords.value.push({
          id: 'FN-2023-004',
          title: '伪造的政府官员讲话',
          content: '一段声称为政府高官发表的讲话音频在网络传播，经过专业比对确认为AI合成音频，内容与官方立场严重不符。',
          type: '音频新闻',
          verificationDate: '2023-09-18T16:45:00',
          transactionHash: '0x5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7',
          blockNumber: 15520974,
          verificationResult: '音频伪造',
          reasonDetail: '通过声纹分析确认为AI生成音频，非真实官员声音，且内容与官方政策相矛盾',
          blockchainProof: {
            timestamp: '2023-09-18T17:12:45',
            networkId: 1,
            contractAddress: '0x9876543210abcdef',
            eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
          }
        });
      }
      
      // 如果上传了视频，添加视频相关的虚假新闻记录
      if (uploadedFiles.value.some(file => file.type.startsWith('video/'))) {
        newsRecords.value.push({
          id: 'FN-2023-005',
          title: '深度伪造的名人视频',
          content: '一则由深度伪造技术制作的名人视频在社交平台广泛传播，视频中的言论导致公众误解和市场波动。',
          type: '视频新闻',
          verificationDate: '2023-11-30T08:15:00',
          transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
          blockNumber: 15770526,
          verificationResult: '深度伪造',
          reasonDetail: '通过面部动作分析和视频取证技术确认为深度伪造视频，非真实拍摄内容',
          blockchainProof: {
            timestamp: '2023-11-30T09:22:30',
            networkId: 1,
            contractAddress: '0x9876543210abcdef',
            eventSignature: 'FakeNewsVerified(bytes32,string,uint256)'
          }
        });
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
  }

  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
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
</style>