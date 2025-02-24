<template>
    <div class="VerifyAudioView h-full flex justify-center items-center gap-8 p-12">
        <div class="flex-1 h-full shadow-xl  border rounded-xl p-5">
            <div class="flex justify-between items-center border-b pb-5">
                <p class="text-xl font-bold">音频上传</p>
            </div>
            <div class="h-[85%] flex justify-center items-center">
                <el-upload class="w-full" drag action="http://localhost:8000/upload/" multiple accept=".mp3,.wav"
                    :file-list="fileList" :on-success="handleUploadSuccess">
                    <el-icon class="el-icon--upload">
                        <upload-filled />
                    </el-icon>
                    <div class="el-upload__text">
                        将文件拖拽在这里或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            支持 mp3, wav 格式文件
                        </div>
                    </template>
                </el-upload>
            </div>
        </div>
        <div class="flex-[1.5] h-full shadow-xl  border rounded-xl p-5">
            <div class="flex justify-start items-center border-b pb-5">
                <p class="text-xl font-bold">伪造情况报告</p>
            </div>
            <div class="h-[85%] flex justify-between items-center gap-5 mt-10">
                <div class="h-full flex flex-1 flex-col justify-between items-center gap-5 ">
                    <div
                        class="flex-1 w-full h-1/2 flex flex-col justify-between items-center border border-green-200 rounded-xl bg-green-50 p-3 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <p class="w-full text-lg text-gray-600 font-bold text-left">音频内容</p>
                        <p v-if="audioContent" class="text-gray-800 text-sm text-left indent-5 leading-relaxed">
                            {{ audioContent }}
                        </p>

                        <p class="h-full flex justify-center items-center text-lg font-bold" v-else>暂无上传音频</p>
                    </div>
                    <div
                        class="flex-1 w-full h-1/2 flex flex-col justify-start items-center border border-green-200 rounded-xl bg-green-50 p-3 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <!-- 将音频文件传递给子组件 -->
                        <p class="w-full text-lg text-gray-600 font-bold text-left">音频播放</p>
                        <AudioWaveform :audioFile="audioFile" v-if="audioFile" />
                        <p class="h-full flex justify-center items-center text-lg font-bold" v-else>暂无上传音频</p>
                    </div>
                </div>


                <div class="h-full flex-1">
                    <div class="h-[15%] border rounded-xl bg-green-50 flex justify-center items-center">
                        <p class="text-green-400 text-3xl font-bold">{{ audioResult.summary }}</p>
                    </div>
                    <div class="mt-2 h-[15%] flex justify-between items-center gap-2">
                        <div class="flex-1 h-full border rounded-xl bg-green-50">
                            <el-progress type="dashboard" :percentage="audioResult.ai_probability" :striped-flow="true"
                                :width="90" :stroke-width="10" :color="getProgressColor(audioResult.ai_probability)">
                                <template #default="{ percentage }">
                                    <span class="block text-gray-500">AI</span>
                                    <span v-if="percentage > 0"
                                        :class="['block', 'text-lg', 'font-bold', getProgressColorClass(audioResult.ai_probability)]">
                                        {{ percentage }}%
                                    </span>
                                    <span v-else class="block text-lg font-bold text-green-400">
                                        暂无
                                    </span>
                                </template>
                            </el-progress>
                        </div>
                        <div class="flex-1 h-full border rounded-xl bg-green-50">
                            <el-progress type="dashboard" :percentage="audioResult.safety_level" :striped-flow="true"
                                :width="90" :stroke-width="10" :color="getProgressColor(audioResult.safety_level)">
                                <template #default="{ percentage }">
                                    <span class="block text-gray-500">健康度</span>
                                    <span v-if="percentage > 0"
                                        :class="['block', 'text-lg', 'font-bold', getProgressColorClass(audioResult.safety_level)]">
                                        {{ percentage }}%
                                    </span>
                                    <span v-else class="block text-lg font-bold text-green-400">
                                        暂无
                                    </span>
                                </template>
                            </el-progress>
                        </div>
                    </div>

                    <div class="mt-2 h-[25%] flex justify-between items-center gap-2">
                        <div class="flex-1 h-full flex justify-center items-center border rounded-xl bg-green-50">
                            <el-progress type="circle" :percentage="audioResult.authenticity" :striped-flow="true"
                                :width="130" :stroke-width="10" :color="getProgressColor(audioResult.authenticity)">
                                <template #default="{ percentage }">
                                    <span class="block text-lg font-bold text-gray-500">真实度</span>
                                    <span v-if="percentage > 0"
                                        :class="['block', 'text-lg', 'font-bold', getProgressColorClass(audioResult.authenticity)]">
                                        {{ percentage }}%
                                    </span>
                                    <span v-else class="block text-lg font-bold text-green-400">
                                        暂无
                                    </span>
                                </template>
                            </el-progress>
                        </div>
                        <div class="flex-1 h-full flex justify-center items-center border rounded-xl bg-green-50">
                            <RadarContainer :width="160" :height="160" :data="radarData" :chartOption="radarOptions" />
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-green-500 rounded-t-lg p-2 mt-5">
                        <p class="text-white font-bold">伪造种类相似度</p>
                        <p class="text-white">相似度</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-pink-500 rounded-sm mr-2" />
                            <p class="font-bold">事实错误</p>
                        </div>
                        <p>60%</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-gray-500 rounded-sm mr-2" />
                            <p class="font-bold">音频拼接</p>
                        </div>
                        <p>20%</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-green-500 rounded-sm mr-2" />
                            <p class="font-bold">音频生成</p>
                        </div>
                        <p>10%</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-yellow-500 rounded-sm mr-2" />
                            <p class="font-bold">音色调整</p>
                        </div>
                        <p>5%</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-blue-500 rounded-sm mr-2" />
                            <p class="font-bold">裁剪误导</p>
                        </div>
                        <p>5%</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type { UploadFile } from 'element-plus';
import { radarData } from '../../constants/radarData'
import radarOptions from '../../utils/radarOptions'
import { toText, verifyAudio } from '../../api/verifyAudio'

import AudioWaveform from '../../components/AudioWaveform.vue';


// 定义上传文件列表
const fileList = ref<UploadFile[]>([]) // 上传文件列表
const audioFile = ref<string | null>(null);
const audioContent = ref<string>('')
type AudioResult = {
    authenticity: number;
    ai_probability: number;
    safety_level: number;
    summary: string;
};

const audioResult = ref<AudioResult>({
    authenticity: 0,
    ai_probability: 0,
    safety_level: 0,
    summary: '暂无上传音频'
});

const getProgressColor = (percentage: number) => {
    if (percentage >= 70) {
        return '#4ade80' // green
    } else if (percentage >= 40) {
        return '#facc15' // yellow
    } else {
        return '#f87171' // red
    }
}

const getProgressColorClass = (percentage: number) => {
    if (percentage >= 70) {
        return 'text-green-400'  // green
    } else if (percentage >= 40) {
        return 'text-yellow-400'  // yellow
    } else {
        return 'text-red-400'  // red
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
    // 请求toText，传递音频文件的flie
    const fileBlob = await fetch(audioFile.value).then(r => r.blob());
    const newFile = new File([fileBlob], file.name, { type: fileBlob.type });
    await toText(newFile).then((res) => {
        audioContent.value = res.data.text;
    });

    await verifyAudio(audioContent.value).then((res) => {
        const jsonResult = res.data.replace(/^```json\s*|\s*```$/g, '').trim();
        console.log('verifyAudio:', jsonResult)
        audioResult.value = JSON.parse(jsonResult);
    });



    console.log('handleUploadSuccess fileList:', fileList.value.map((file) => file.url))
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


//下拉框的文本未选中的样式
// .el-select-dropdown__item {

// }
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
</style>
