<template>
    <div class="VerifyImageView h-full flex justify-center items-center gap-8 p-12">
        <div class="flex-1 h-full shadow-xl  border rounded-xl p-5">
            <div class="flex justify-between items-center border-b pb-5">
                <p class="text-xl font-bold">图片上传</p>
            </div>
            <div class="h-[85%] flex justify-center items-center">
                <el-upload class="w-full " drag action="http://10.248.6.72:81/api/activity/file" multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" :file-list="fileList"
                    :on-success="handleUploadSuccess">
                    <el-icon class="el-icon--upload">
                        <upload-filled />
                    </el-icon>
                    <div class="el-upload__text">
                        将文件拖拽在这里或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            支持 jpeg, png, webp, gif, tiff, bmp 格式文件
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
                <div class="h-full flex-1 flex justify-between items-center border rounded-xl  bg-green-50">
                    <img class="" src="/Users/tec/Desktop/dingzhen 3.png" alt="">
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
                            <radarContainer :width="160" :height="160" :data="radarData"
                                :chartOption="radarOptions" />
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-green-500 rounded-t-lg p-2 mt-5">
                        <p class="text-white font-bold">伪造种类相似度</p>
                        <p class="text-white">相似度</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-pink-500 rounded-sm mr-2" />
                            <p class="font-bold">内容篡改</p>
                        </div>
                        <p>60%</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-gray-500 rounded-sm mr-2" />
                            <p class="font-bold">图像拼接</p>
                        </div>
                        <p>20%</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-green-500 rounded-sm mr-2" />
                            <p class="font-bold">图像生成</p>
                        </div>
                        <p>10%</p>
                    </div>
                    <div class="flex justify-between items-center p-2">
                        <div class="flex justify-start items-center">
                            <div class="w-3 h-3 bg-yellow-500 rounded-sm mr-2" />
                            <p class="font-bold">色彩调整</p>
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

// 定义上传文件列表
const fileList = ref<UploadFile[]>([]) // 上传文件列表

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
