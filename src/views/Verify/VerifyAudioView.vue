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
                <div class="h-full flex flex-col justify-between items-center gap-5 ">
                    <div
                        class="flex-1 w-full h-1/2 flex flex-col justify-between items-center border border-green-200 rounded-xl bg-green-50 p-3 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <p class="w-full text-lg text-gray-600 font-bold text-left">音频内容</p>
                        <p class="text-gray-800 text-sm text-left indent-5 leading-relaxed">
                            大家好，我是雷军。今天我非常激动地和大家分享小米16的最新消息！这款手机将搭载我们自主研发的超快5G芯片，速度比市面上所有5G手机都要快，下载10GB的文件只需几秒钟，简直是颠覆性的体验。同时，还配备了240Hz刷新率的AMOLED显示屏，带来前所未有的流畅游戏和视频体验。我们相信，这款手机将会成为首款同时支持超快5G和超高刷新率显示的设备，必将引领市场的潮流
                        </p>
                    </div>
                    <div
                        class="flex-1 w-full h-1/2 flex flex-col justify-center items-center border border-green-200 rounded-xl bg-green-50 p-3 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <!-- 将音频文件传递给子组件 -->
                        <p class="w-full text-lg text-gray-600 font-bold text-left">音频播放</p>
                        <AudioWaveform :audioFile="audioFile" v-if="audioFile" />
                        <p v-else>暂无上传音频</p>
                    </div>
                </div>


                <div class="h-full flex-1">
                    <div class="h-[15%] border rounded-xl bg-green-50 flex justify-center items-center">
                        <p class="text-green-400 text-3xl font-bold">存在部分伪造</p>
                    </div>
                    <div class="mt-2 h-[15%] flex justify-between items-center gap-2">
                        <div class="flex-1 h-full border rounded-xl  bg-green-50">
                            <el-progress type="dashboard" :percentage="80" :striped-flow="true" :width="90"
                                :stroke-width="10" color="#4ade80">
                                <template #default="{ percentage }">
                                    <span class="block text-gray-500">质量</span>
                                    <span class="block text-lg font-bold text-green-400">{{ percentage }}%</span>
                                </template>
                            </el-progress>
                        </div>
                        <div class="flex-1 h-full border rounded-xl  bg-green-50">
                            <el-progress type="dashboard" :percentage="60" :striped-flow="true" :width="90"
                                :stroke-width="10" color="#4ade80">
                                <template #default="{ percentage }">
                                    <span class="block text-gray-500">健康度</span>
                                    <span class="block text-lg font-bold text-green-400">{{ percentage }}%</span>
                                </template>
                            </el-progress>
                        </div>
                    </div>
                    <div class="mt-2 h-[25%] flex justify-between items-center gap-2">
                        <div class="flex-1 h-full flex justify-center items-center border rounded-xl  bg-green-50">
                            <el-progress type="circle" :percentage="60" :striped-flow="true" :width="130"
                                :stroke-width="10" color="#4ade80">
                                <template #default="{ percentage }">
                                    <span class="block text-lg font-bold text-gray-500">AI</span>
                                    <span class="block text-lg font-bold text-green-400">{{ percentage }}%</span>
                                </template>
                            </el-progress>
                        </div>
                        <div class="flex-1 h-full flex justify-center items-center border rounded-xl  bg-green-50">
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

import AudioWaveform from '../../components/AudioWaveform.vue';


// 定义上传文件列表
const fileList = ref<UploadFile[]>([]) // 上传文件列表
const audioFile = ref<string | null>(null);

// 成功上传后的处理方法
const handleUploadSuccess = (response: any, file: UploadFile) => {
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
