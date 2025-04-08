<template>
    <div class="VerifyAudioView h-full flex justify-center items-center gap-8 p-12">
        <div class="flex-1 h-full shadow-xl border rounded-xl p-5 flex flex-col">
            <div class="flex justify-between items-center border-b pb-5 mb-5">
                <p class="text-xl font-bold">音频上传与播放</p>
            </div>
            
            <div class="flex-1 flex flex-col gap-6 overflow-hidden">
                <!-- 音频上传/播放区域 (根据是否有音频文件切换显示) -->
                <div class="flex-1 flex flex-col">
                    <p class="text-gray-700 font-bold mb-3">
                        {{ audioFile ? '音频播放' : '音频上传' }}
                    </p>
                    
                    <!-- 未上传文件时显示上传组件 -->
                    <div v-if="!audioFile" class="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 h-full flex items-center">
                        <el-upload class="w-full" drag action="http://localhost:8000/upload/" multiple accept=".mp3,.wav"
                            :file-list="fileList" :on-success="handleUploadSuccess">
                            <el-icon class="el-icon--upload text-gray-400">
                                <upload-filled />
                            </el-icon>
                            <div class="el-upload__text text-gray-500">
                                将文件拖拽在这里或<em class="text-blue-500">点击上传</em>
                            </div>
                            <template #tip>
                                <div class="el-upload__tip text-xs text-gray-400">
                                    支持 mp3, wav 格式文件
                                </div>
                            </template>
                        </el-upload>
                    </div>
                    
                    <!-- 上传文件后显示播放器 -->
                    <div v-else class="bg-gray-50 border border-gray-200 rounded-xl p-4 h-full flex flex-col">
                        <!-- 显示当前文件 -->
                        <div class="mb-3 flex justify-between items-center">
                            <p class="text-sm font-medium text-gray-600 truncate flex-1">
                                {{ fileList.length > 0 ? fileList[fileList.length - 1].name : '未知文件' }}
                            </p>
                            <el-button type="primary" size="small" text @click="resetAudio">
                                重新上传
                            </el-button>
                        </div>
                        
                        <!-- 音频播放器 -->
                        <div class="flex-1 flex items-center justify-center">
                            <AudioWaveform :audioFile="audioFile" />
                        </div>
                    </div>
                </div>
                
                <!-- 音频内容区域 -->
                <div class="flex-1 flex flex-col">
                    <p class="text-gray-700 font-bold mb-3">音频内容</p>
                    <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 h-full">
                        <el-scrollbar height="100%">
                            <p v-if="audioContent" class="text-gray-800 text-sm leading-relaxed">{{ audioContent }}</p>
                            <p v-else class="text-gray-400 h-full flex items-center justify-center">暂无音频内容</p>
                        </el-scrollbar>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="flex-[1.5] h-full shadow-xl border rounded-xl p-5 relative">
            <div class="flex justify-start items-center border-b pb-5">
                <p class="text-xl font-bold">伪造情况报告</p>
            </div>
            
            <!-- 加载状态覆盖层 -->
            <div v-if="isAnalyzing" class="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-xl">
                <div class="text-center">
                    <el-icon class="is-loading text-4xl text-blue-500 mb-4"><loading /></el-icon>
                    <p class="text-gray-700 font-medium">正在分析音频，请稍候...</p>
                </div>
            </div>
            
            <el-scrollbar height="calc(100% - 60px)" class="mt-5">
                <div class="flex flex-col gap-5 pr-2">
                    <!-- 结论和真实度分析 (合并区域) -->
                    <div class="border border-gray-200 rounded-xl bg-gray-50 p-4 shadow-sm">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="md:col-span-2">
                                <!-- 分析结论部分 -->
                                <div class="flex justify-center items-center p-4 rounded-xl bg-gradient-to-r mb-4" 
                                    :class="getClassificationGradient(audioResult.classification)">
                                    <div class="text-center">
                                        <p class="text-white text-sm">分析结论</p>
                                        <p class="text-white text-3xl font-bold">
                                            {{ audioResult.classification || '等待分析' }}
                                        </p>
                                    </div>
                                </div>
                                
                                <!-- AI分析结论部分 -->
                                <div class="bg-white rounded-lg p-3 h-40">
                                    <p class="text-gray-700 font-bold mb-2">AI分析结论</p>
                                    <el-scrollbar height="calc(100% - 30px)">
                                        <p v-if="audioResult.ai_analysis" class="text-gray-800 text-sm leading-relaxed px-1">
                                            {{ audioResult.ai_analysis }}
                                        </p>
                                        <p v-else class="text-gray-400 h-full flex items-center justify-center">暂无分析结果</p>
                                    </el-scrollbar>
                                </div>
                            </div>
                            
                            <!-- 真实度指标 -->
                            <div class="flex flex-col justify-center items-center">
                                <p class="text-gray-700 font-bold mb-3">真实度评分</p>
                                <el-progress type="circle" :percentage="audioResult.authenticity" :striped-flow="true"
                                    :width="150" :stroke-width="15" :color="getProgressColor(audioResult.authenticity)">
                                    <template #default="{ percentage }">
                                        <span v-if="percentage > 0" class="text-2xl font-bold" :class="getProgressColorClass(percentage)">
                                            {{ percentage.toFixed(1) }}%
                                        </span>
                                        <span v-else class="text-2xl font-bold text-gray-400">-</span>
                                    </template>
                                </el-progress>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 特征评分区域 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="border border-gray-200 rounded-xl bg-gray-50 p-4 shadow-sm">
                            <p class="text-gray-700 font-bold mb-3">特征评分雷达图</p>
                            <div class="h-60 flex justify-center items-center overflow-hidden">
                                <RadarContainer class="radar-chart" :width="265" :height="240" :data="radarData" :chartOption="radarOptions" />
                            </div>
                        </div>
                        
                        <!-- 特征分数详情 -->
                        <div class="border border-gray-200 rounded-xl bg-gray-50 p-4 shadow-sm">
                            <p class="text-gray-700 font-bold mb-3">特征分数详情</p>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-white rounded-lg p-3 flex flex-col items-center">
                                    <div class="w-4 h-4 rounded-full bg-pink-500 mb-2"></div>
                                    <p class="text-sm font-medium text-gray-700 mb-1">MFCC分数</p>
                                    <p class="text-lg font-bold" :class="getProgressColorClass(audioResult.feature_scores.mfcc_score)">
                                        {{ audioResult.feature_scores.mfcc_score || 0 }}
                                    </p>
                                </div>
                                <div class="bg-white rounded-lg p-3 flex flex-col items-center">
                                    <div class="w-4 h-4 rounded-full bg-blue-500 mb-2"></div>
                                    <p class="text-sm font-medium text-gray-700 mb-1">频谱图分数</p>
                                    <p class="text-lg font-bold" :class="getProgressColorClass(audioResult.feature_scores.spectrogram_score)">
                                        {{ audioResult.feature_scores.spectrogram_score || 0 }}
                                    </p>
                                </div>
                                <div class="bg-white rounded-lg p-3 flex flex-col items-center">
                                    <div class="w-4 h-4 rounded-full bg-green-500 mb-2"></div>
                                    <p class="text-sm font-medium text-gray-700 mb-1">韵律分数</p>
                                    <p class="text-lg font-bold" :class="getProgressColorClass(audioResult.feature_scores.prosody_score)">
                                        {{ audioResult.feature_scores.prosody_score || 0 }}
                                    </p>
                                </div>
                                <div class="bg-white rounded-lg p-3 flex flex-col items-center">
                                    <div class="w-4 h-4 rounded-full bg-yellow-500 mb-2"></div>
                                    <p class="text-sm font-medium text-gray-700 mb-1">过零率分数</p>
                                    <p class="text-lg font-bold" :class="getProgressColorClass(audioResult.feature_scores.zcr_score)">
                                        {{ audioResult.feature_scores.zcr_score || 0 }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 音频属性数据 -->
                    <div class="border border-gray-200 rounded-xl bg-gray-50 p-4 shadow-sm">
                        <p class="text-gray-700 font-bold mb-3">音频属性数据</p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-white rounded-lg p-3">
                                <p class="text-xs font-medium text-gray-500 mb-1">MFCC均值</p>
                                <p class="text-sm font-bold text-gray-800">{{ audioResult.audio_properties.mfcc_mean.toFixed(2) }}</p>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <p class="text-xs font-medium text-gray-500 mb-1">MFCC标准差</p>
                                <p class="text-sm font-bold text-gray-800">{{ audioResult.audio_properties.mfcc_std.toFixed(2) }}</p>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <p class="text-xs font-medium text-gray-500 mb-1">频谱复杂度</p>
                                <p class="text-sm font-bold text-gray-800">{{ audioResult.audio_properties.spectrogram_complexity.toFixed(2) }}</p>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <p class="text-xs font-medium text-gray-500 mb-1">基频均值</p>
                                <p class="text-sm font-bold text-gray-800">{{ audioResult.audio_properties.f0_mean.toFixed(2) }}</p>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <p class="text-xs font-medium text-gray-500 mb-1">基频范围</p>
                                <p class="text-sm font-bold text-gray-800">{{ audioResult.audio_properties.f0_range.toFixed(2) }}</p>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <p class="text-xs font-medium text-gray-500 mb-1">能量变化</p>
                                <p class="text-sm font-bold text-gray-800">{{ audioResult.audio_properties.energy_variation.toFixed(4) }}</p>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <p class="text-xs font-medium text-gray-500 mb-1">过零率均值</p>
                                <p class="text-sm font-bold text-gray-800">{{ audioResult.audio_properties.zcr_mean.toFixed(4) }}</p>
                            </div>
                            <div class="bg-white rounded-lg p-3">
                                <p class="text-xs font-medium text-gray-500 mb-1">过零率标准差</p>
                                <p class="text-sm font-bold text-gray-800">{{ audioResult.audio_properties.zcr_std.toFixed(4) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { UploadFile } from 'element-plus';
import radarOptions from '../../utils/radarOptions'
import { toText, verifyAudio } from '../../api/verifyAudio'
import { UploadFilled, Loading } from '@element-plus/icons-vue'
import AudioWaveform from '../../components/AudioWaveform.vue';
import RadarContainer from '../../components/Container/RadarContainer.vue';
import { ElMessage } from 'element-plus'
import { radarData } from '../../constants/radarData'

// 定义上传文件列表
const fileList = ref<UploadFile[]>([]) // 上传文件列表
const audioFile = ref<string | null>(null);
const audioContent = ref<string>('')
// 添加加载状态变量
const isAnalyzing = ref(false);

// 重置音频和相关数据
const resetAudio = () => {
    audioFile.value = null;
    audioContent.value = '';
    fileList.value = [];
    // 重置分析结果
    audioResult.value = {
        authenticity: 0,
        feature_scores: {
            mfcc_score: 0,
            spectrogram_score: 0,
            prosody_score: 0,
            zcr_score: 0
        },
        final_score: 0,
        classification: '暂无结果',
        confidence: 0,
        ai_analysis: '',
        audio_properties: {
            mfcc_mean: 0,
            mfcc_std: 0,
            spectrogram_complexity: 0,
            f0_mean: 0,
            f0_range: 0,
            energy_variation: 0,
            zcr_mean: 0,
            zcr_std: 0
        }
    };
    // 重置雷达图数据
    radarData.value.seriesData = [0, 0, 0, 0];
}

// 定义音频分析结果类型
type AudioResult = {
    authenticity: number;
    feature_scores: {
        mfcc_score: number;
        spectrogram_score: number;
        prosody_score: number;
        zcr_score: number;
    };
    final_score: number;
    classification: string;
    confidence: number;
    ai_analysis: string;
    audio_properties: {
        mfcc_mean: number;
        mfcc_std: number;
        spectrogram_complexity: number;
        f0_mean: number;
        f0_range: number;
        energy_variation: number;
        zcr_mean: number;
        zcr_std: number;
    };
};

const audioResult = ref<AudioResult>({
    authenticity: 0,
    feature_scores: {
        mfcc_score: 0,
        spectrogram_score: 0,
        prosody_score: 0,
        zcr_score: 0
    },
    final_score: 0,
    classification: '暂无结果',
    confidence: 0,
    ai_analysis: '',
    audio_properties: {
        mfcc_mean: 0,
        mfcc_std: 0,
        spectrogram_complexity: 0,
        f0_mean: 0,
        f0_range: 0,
        energy_variation: 0,
        zcr_mean: 0,
        zcr_std: 0
    }
});

const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return '#f56c6c'
    if (percentage <= 80) return '#e6a23c'
    return '#67c23a'
}

const getProgressColorClass = (percentage: number) => {
    if (percentage <= 50) return 'text-red-500'
    if (percentage <= 80) return 'text-yellow-500'
    return 'text-green-500'
}

const getClassificationGradient = (classification: string) => {
    if (!classification) return 'from-gray-400 to-gray-500'
    
    switch (classification) {
        case '真实':
            return 'from-green-400 to-green-600'
        case '可能伪造':
            return 'from-yellow-400 to-yellow-600'
        case '高度伪造':
            return 'from-red-400 to-red-600'
        default:
            return 'from-green-400 to-green-600'
    }
}

// 成功上传后的处理方法
const handleUploadSuccess = async (response: any, file: UploadFile) => {
    if (!fileList.value.find(f => f.uid === file.uid)) {
        fileList.value.push({
            name: file.name,
            url: response.data,
            uid: file.uid,
            status: 'success' // 添加status属性
        })
    }
    // 假设返回的 response 中包含了音频文件的 URL
    audioFile.value = "http://localhost:8000" + response.data;
    console.log('audioFile.value:', audioFile.value)
    
    // 设置分析状态为加载中（立即显示加载状态）
    isAnalyzing.value = true;
    
    // 请求toText，传递音频文件的file
    const fileBlob = await fetch(audioFile.value).then(r => r.blob());
    const newFile = new File([fileBlob], file.name, { type: fileBlob.type });
    
    try {
        // 获取音频文本内容
        const textResponse = await toText(newFile);
        audioContent.value = textResponse.data.text;
        
        // 分析音频真实性
        const verifyResponse = await verifyAudio(newFile);
        console.log('verifyAudio response:', verifyResponse.data);
        
        // 更新音频分析结果
        audioResult.value = verifyResponse.data;
        
        // 更新雷达图数据
        radarData.value.seriesData = [
            audioResult.value.feature_scores.mfcc_score || 0,
            audioResult.value.feature_scores.spectrogram_score || 0,
            audioResult.value.feature_scores.prosody_score || 0,
            audioResult.value.feature_scores.zcr_score || 0
        ];
        
        ElMessage.success('音频分析完成')
    } catch (error) {
        console.error('处理音频时出错:', error);
        ElMessage.error('音频分析失败，请重试')
    } finally {
        // 无论成功或失败，都将分析状态设为完成
        isAnalyzing.value = false;
    }
};
</script>

<style lang="scss" scoped>
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
    --el-input-focus-border-color: var(--accent-200);
}

// 雷达图样式
.radar-chart {
    :deep(.echarts-tooltip) {
        background: rgba(255, 255, 255, 0.9) !important;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        border: 1px solid #ebeef5;
        padding: 12px;
    }
}
</style>
