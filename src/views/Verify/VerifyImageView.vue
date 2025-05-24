<template>
    <div class="VerifyImageView h-full flex justify-center items-center gap-8 p-8 bg-gray-50">
        <div
            class="flex-[2] h-full shadow-lg border border-gray-100 rounded-2xl p-6 bg-white transition-all duration-300">
            <div class="flex justify-between items-center border-b border-gray-100 pb-5 mb-4">
                <p class="text-xl font-bold text-gray-800">图片分析</p>
                <span class="text-sm text-gray-500">像素克隆情况分析</span>
            </div>

            <!-- 图片上传区域 -->
            <div v-if="!originalImage" class="h-[55%] flex justify-center items-center">
                <el-upload class="w-full" drag action="http://10.248.6.72:81/api/activity/file" multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" :file-list="fileList"
                    :on-success="handleUploadSuccess">
                    <el-icon class="el-icon--upload" style="color: #49CFAD;">
                        <upload-filled />
                    </el-icon>
                    <div class="el-upload__text text-gray-600">
                        将文件拖拽在这里或<em style="color: #49CFAD; font-weight: 500;">点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip text-gray-500">
                            支持 jpeg, png, webp, gif, tiff, bmp 格式文件
                        </div>
                    </template>
                </el-upload>
            </div>

            <!-- 图片预览/检测结果区域 -->
            <div v-if="originalImage" class="h-[55%] flex justify-center items-center">
                <div
                    class="h-full w-full flex justify-center items-center border border-gray-200 rounded-2xl overflow-hidden shadow-inner bg-gray-50 p-2 relative group">
                    <div
                        class="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs py-1 px-3 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {{ verificationResult ? '鉴别结果' : '原始图片' }}
                    </div>
                    <img class="w-full h-full object-contain transition-all duration-500" :src="displayImage"
                        alt="图片预览">
                </div>
            </div>

            <!-- 参数调整区域 -->
            <div class="h-[20%] p-4 border-t border-gray-100 mt-4">
                <div class="mb-4">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-700">最小相似度 (Quantization)</span>
                        <span class="text-sm font-medium" style="color: #49CFAD;">{{ quantization.toFixed(2) }}</span>
                    </div>
                    <el-slider v-model="quantization" :min="0" :max="1" :step="0.01" />
                </div>

                <div>
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-700">高频最小阈值 (Min High Frequency RMS)</span>
                        <span class="text-sm font-medium" style="color: #49CFAD;">{{ minHighFrequencyRms }}</span>
                    </div>
                    <el-slider v-model="minHighFrequencyRms" :min="0" :max="1" :step="0.01" />
                </div>
            </div>

            <div class="h-[10%] flex justify-center items-center">
                <el-button type="success" :disabled="!hasUploadedFiles" @click="verifyImage" :loading="isVerifying"
                    class="verify-button px-10 py-3 text-base font-semibold">
                    <span class="flex items-center justify-center">
                        <el-icon v-if="!isVerifying" class="mr-2"><check /></el-icon>
                        <span>{{ isVerifying ? '正在鉴别中...' : '开始鉴别' }}</span>
                    </span>
                </el-button>
            </div>
        </div>
        <div
            class="flex-1 h-full shadow-lg border border-gray-100 rounded-2xl p-6 bg-white transition-all duration-300">
            <div class="flex justify-start items-center border-b border-gray-100 pb-5 mb-4">
                <p class="text-xl font-bold text-gray-800">伪造情况报告</p>
            </div>
            <div v-if="!verificationResult" class="h-[85%] flex flex-col justify-center items-center">
                <div class="w-20 h-20 rounded-full bg-gray-100 flex justify-center items-center mb-4">
                    <el-icon class="text-gray-400 text-3xl">
                        <search />
                    </el-icon>
                </div>
                <p class="text-gray-400 text-lg">请上传图片并点击鉴别按钮</p>
                <p class="text-gray-400 text-sm mt-2">上传后即可获取图片真实性分析报告</p>
            </div>
            <div v-else class="h-[85%] flex flex-col gap-6 mt-4">
                <div class="h-[15%] border border-gray-200 rounded-xl shadow-sm" :class="getPredictionClass"
                    style="transition: all 0.5s ease">
                    <div class="h-full flex justify-center items-center">
                        <p class="text-3xl font-bold" :class="getPredictionTextClass">
                            {{ getPredictionText }}
                        </p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div
                        class="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center bg-white hover:shadow-md transition-shadow duration-300 aspect-square">
                        <el-progress type="dashboard" :percentage="getPredictionPercentage" :striped-flow="true"
                            :width="100" :stroke-width="10" :color="getProgressColor" class="progress-dashboard">
                            <template #default="{ percentage }">
                                <span class="block text-gray-500 text-[10px] font-medium leading-tight">真实度</span>
                                <span class="block text-lg font-bold mt-0.5" :style="{ color: getProgressColor }">
                                    {{ percentage }}%
                                </span>
                            </template>
                        </el-progress>
                    </div>
                    <div
                        class="border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center bg-white hover:shadow-md transition-shadow duration-300 aspect-square">
                        <el-progress type="dashboard" :percentage="getFakePercentage" :striped-flow="true" :width="100"
                            :stroke-width="10" :color="getFakeColor" class="progress-dashboard">
                            <template #default="{ percentage }">
                                <span class="block text-gray-500 text-[10px] font-medium leading-tight">伪造度</span>
                                <span class="block text-lg font-bold mt-0.5" :style="{ color: getFakeColor }">
                                    {{ percentage }}%
                                </span>
                            </template>
                        </el-progress>
                    </div>
                </div>
                <div
                    class="flex-1 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <el-icon class="mr-2"><info-filled /></el-icon>
                        检测结果说明
                    </h3>
                    <div class="bg-white p-4 rounded-lg mb-3 shadow-sm">
                        <p class="text-gray-700 font-medium">
                            伪造概率: <span style="color: #49CFAD;">{{ (verificationResult.prediction * 100).toFixed(2)
                                }}%</span>
                        </p>
                    </div>
                    <p class="text-gray-700 mb-3 bg-white p-3 rounded-lg shadow-sm">
                        左侧图像显示了可能被篡改的区域。颜色越亮表示该区域篡改可能性越高。
                    </p>
                    <div class="text-gray-600 text-sm mt-2 bg-white p-3 rounded-lg shadow-sm">
                        <p class="flex justify-between items-center">
                            <span>最小相似度:</span>
                            <span class="font-medium">{{ quantization.toFixed(2) }}</span>
                        </p>
                        <p class="flex justify-between items-center mt-1">
                            <span>高频阈值:</span>
                            <span class="font-medium">{{ minHighFrequencyRms }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import type { UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { UploadFilled, Search, InfoFilled, Check } from '@element-plus/icons-vue';

// 定义上传文件列表
const fileList = ref<UploadFile[]>([]) // 上传文件列表
const isVerifying = ref(false)
const originalImage = ref<string | null>(null) // 存储原始图片URL
const verificationResult = ref<{
    prediction: number;
    cloneImage: string;
} | null>(null)

// 计算属性，用于确定显示哪张图片
const displayImage = computed(() => {
    if (verificationResult.value) {
        return verificationResult.value.cloneImage;
    }
    return originalImage.value || '';
});

// 定义参数滑块的值
const quantization = ref(0.5) // 默认值0.5
const minHighFrequencyRms = ref(0.1) // 默认值0.1

// 计算属性检查是否有上传的文件
const hasUploadedFiles = computed(() => {
    return fileList.value.length > 0;
});

// 计算属性获取预测文本
const getPredictionText = computed(() => {
    if (!verificationResult.value) return '';

    const prediction = verificationResult.value.prediction;
    if (prediction < 0.3) return '真实图像';
    if (prediction < 0.7) return '存在部分伪造';
    return '高度伪造图像';
});

// 计算属性获取预测文本的类名
const getPredictionTextClass = computed(() => {
    if (!verificationResult.value) return '';

    const prediction = verificationResult.value.prediction;
    if (prediction < 0.3) return 'custom-green';
    if (prediction < 0.7) return 'text-yellow-500';
    return 'text-red-500';
});

// 计算属性获取预测背景类名
const getPredictionClass = computed(() => {
    if (!verificationResult.value) return '';

    const prediction = verificationResult.value.prediction;
    if (prediction < 0.3) return 'custom-bg-green';
    if (prediction < 0.7) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
});

// 计算属性获取真实度百分比
const getPredictionPercentage = computed(() => {
    if (!verificationResult.value) return 0;
    return Math.round((1 - verificationResult.value.prediction) * 100);
});

// 计算属性获取伪造度百分比
const getFakePercentage = computed(() => {
    if (!verificationResult.value) return 0;
    return Math.round(verificationResult.value.prediction * 100);
});

// 计算属性获取进度条颜色
const getProgressColor = computed(() => {
    if (!verificationResult.value) return '#49CFAD';

    const prediction = verificationResult.value.prediction;
    if (prediction < 0.3) return '#49CFAD'; // 绿色
    if (prediction < 0.7) return '#f59e0b'; // 黄色
    return '#ef4444'; // 红色
});

// 计算属性获取伪造进度条颜色
const getFakeColor = computed(() => {
    if (!verificationResult.value) return '#ef4444';

    const prediction = verificationResult.value.prediction;
    if (prediction < 0.3) return '#9ca3af'; // 灰色
    if (prediction < 0.7) return '#f59e0b'; // 黄色
    return '#ef4444'; // 红色
});

// 成功上传后的处理方法
const handleUploadSuccess = (response: any, file: UploadFile) => {
    if (!fileList.value.find(f => f.uid === file.uid)) {
        fileList.value.push({
            name: file.name,
            url: response.data,
            uid: file.uid,
            status: 'success' // 添加status属性
        })

        // 设置原始图片URL
        originalImage.value = response.data;

        // 显示成功消息
        ElMessage({
            message: '图片上传成功',
            type: 'success',
            duration: 2000
        });
    }
    console.log('handleUploadSuccess fileList:', fileList.value.map((file) => file.url))
};

// 鉴别图片方法
const verifyImage = async () => {
    if (fileList.value.length === 0) {
        ElMessage.warning('请先上传图片');
        return;
    }

    try {
        isVerifying.value = true;
        // 获取最近上传的文件
        const lastFile = fileList.value[fileList.value.length - 1];
        const fileUrl = lastFile.url;

        // 检查文件URL是否存在
        if (!fileUrl) {
            ElMessage.error('文件URL不存在，请重新上传');
            isVerifying.value = false;
            return;
        }

        // 创建FormData对象
        const formData = new FormData();

        try {
            // 从URL获取文件
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            // 根据原始文件名创建文件对象
            const file = new File([blob], lastFile.name, {
                type: blob.type
            });

            // 将文件添加到FormData，参数名为file
            formData.append('file', file);

            // 添加额外参数
            formData.append('quantization', quantization.value.toString());
            formData.append('minHighFrequencyRms', minHighFrequencyRms.value.toString());

            // 发送请求到鉴别API
            const verifyResponse = await axios.post('/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('验证结果:', verifyResponse.data);

            // 更新验证结果
            verificationResult.value = {
                prediction: verifyResponse.data.prediction,
                cloneImage: `data:image/jpeg;base64,${verifyResponse.data.clone_detection}`
            };

            ElMessage({
                message: '图片鉴别完成',
                type: 'success',
                duration: 2000
            });
        } catch (fetchError) {
            console.error('获取文件失败:', fetchError);
            ElMessage.error('获取文件失败，请重新上传');
        }
    } catch (error) {
        console.error('图片鉴别失败:', error);
        ElMessage.error('图片鉴别失败，请重试');
    } finally {
        isVerifying.value = false;
    }
};
</script>

<style lang="scss">
/* 全局样式，不使用 scoped */
.el-message {
  z-index: 9999 !important;
  min-width: 300px;
  padding: 12px 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  border-width: 1px;
  
  &.el-message--success {
    background-color: #f0f9eb;
    border-color: #e1f3d8;
  }
  
  &.el-message--warning {
    background-color: #fdf6ec;
    border-color: #faecd8;
  }
  
  &.el-message--error {
    background-color: #fef0f0;
    border-color: #fde2e2;
  }
}
</style>

<style lang="scss" scoped>
// 自定义颜色类
.custom-green {
    color: #49CFAD;
}

.custom-bg-green {
    background-color: rgba(73, 207, 173, 0.1);
    border-color: rgba(73, 207, 173, 0.3);
}

// 下面为el-select部分
@mixin select_radius {
    border-radius: 12px;
}

// 控制el-select的长度以及圆角
:deep(.el-select__wrapper) {
    height: 50px;
    @include select_radius;
}

// 控制el-select中文字的样式
:deep(.el-select__placeholder) {
    font-size: 16px;
    font-weight: bold;
}

// 控制点击后的边框颜色
:deep(.el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 1px #49CFAD;
}

// 下面为下拉框部分
// 下面用于控制整体的下拉框圆角
:deep(.el-select__popper.el-popper) {
    @include select_radius;
}

//下拉框的文本颜色选中之后的样式
.el-select-dropdown__item.is-selected {
    color: #49CFAD;
}

// 下面是textarea组件的自定义样式
.el-textarea {
    font-size: 16px;
    font-weight: bold;
    --el-input-focus-border-color: #49CFAD;
}

// 滑块样式
:deep(.el-slider__runway.disabled) {
    background-color: #e4e7ed;
}

:deep(.el-slider__bar) {
    background-color: #49CFAD;
}

:deep(.el-slider__button) {
    border-color: #49CFAD;
}

// 美化上传组件
:deep(.el-upload-dragger) {
    padding: 40px 0;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    background-color: #f9fafb;
    transition: all 0.3s;

    &:hover {
        border-color: #49CFAD;
        background-color: rgba(73, 207, 173, 0.05);
    }

    .el-icon--upload {
        font-size: 48px;
        margin-bottom: 16px;
    }
}

// 美化按钮
.verify-button {
    background: linear-gradient(135deg, #4fd1b5 0%, #49CFAD 50%, #3db89a 100%) !important;
    border: none !important;
    border-radius: 12px;
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    height: auto;
    position: relative;
    overflow: hidden;
    box-shadow: 0 6px 15px -5px rgba(73, 207, 173, 0.4);
    letter-spacing: 0.5px;
    padding: 12px 32px !important;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 50%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px -7px rgba(73, 207, 173, 0.5);

        &::before {
            opacity: 1;
        }
    }

    &:disabled {
        background: linear-gradient(135deg, #a8e5d7 0%, #98dfcf 100%) !important;
        opacity: 0.8;
        box-shadow: none;
    }

    &:active:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 10px -5px rgba(73, 207, 173, 0.5);
    }
}

.verify-button :deep(.is-loading) {
    position: relative;
    pointer-events: none;
}

.verify-button :deep(.el-loading-spinner) {
    display: flex;
    align-items: center;
    justify-content: center;
}

// 进度仪表盘样式
.progress-dashboard {
    :deep(.el-progress__text) {
        font-weight: bold;
        font-size: 1.25rem;
    }

    :deep(.el-progress-dashboard__inner) {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    }
}
</style>

