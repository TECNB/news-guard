<template>
    <div class="VerifyTextView h-full flex justify-center items-center gap-8 p-12">
        <div class="flex-[1.5] h-full shadow-xl border rounded-xl p-5">
            <div class="flex justify-between items-center border-b pb-5">
                <div class="w-52">
                    <el-select v-model="category" placeholder="请点击选择语言" size="large" clearable :teleported="false">
                        <el-option v-for="item in allType" :key="item.objectId" :label="item.name" :value="item.name" />
                    </el-select>
                </div>
                <div class="flex justify-start items-center gap-3">
                    <div class="flex justify-start items-center gap-2 border p-2 rounded-xl">
                        <el-icon size="22">
                            <Link />
                        </el-icon>
                        <p>上传文件</p>
                    </div>
                    <div class="flex justify-start items-center border p-2 rounded-xl">
                        <el-icon size="20">
                            <Download />
                        </el-icon>
                    </div>
                    <div class="border p-2 rounded-xl">
                        <el-icon size="20">
                            <Delete />
                        </el-icon>
                    </div>
                </div>
            </div>
            <div class="mt-5">
                <el-input v-model="text" placeholder="请输入需要判断的文字" :rows="22" type="textarea" />
            </div>
            <div class="flex justify-between items-center mt-5">
                <div class="">
                    <p class="text-[#777777]">518/5000 字数</p>
                </div>
                <div class="bg-[#49CFAD] w-fit rounded-lg px-2 py-3">
                    <p class="text-white font-bold">检测文字</p>
                </div>
            </div>
        </div>
        <div class="flex-1 h-full shadow-xl border rounded-xl p-5">
            <div class="flex justify-center items-center border-b ">
                <div class="flex-1 border-b-4 border-b-[#49CFAD] pb-3">
                    <p class="text-[#49CFAD]">概述</p>
                </div>
                <div class="flex-1 border-b-4 border-b-white pb-3">
                    <p class="text-[#49CFAD]">句子分析</p>
                </div>
                <div class="flex-1 border-b-4 border-b-white pb-3">
                    <p class="text-[#49CFAD]">短语分析</p>
                </div>
            </div>
            <div class="mt-10">
                <el-progress status="success"  :stroke-width="10" :width="180" :percentage="10" type="circle" />
                <div class="flex justify-center items-center gap-2 border-b pb-8 mt-5 mx-10">
                    <div class="">
                        <p class="text-[#49CFAD] text-2xl font-bold">10% </p>
                    </div>
                    <div class="flex flex-col justify-center items-start">
                        <p class="text-[#777777] text-sm">概率</p>
                        <p class="text-[#777777] text-sm">人工智能生成</p>
                    </div>
                </div>
            </div>
            <div class="mt-8">
                <p class="text-[#49CFAD] text-xl font-bold">简要分析</p>
                <p class="text-[#63a393] font-bold mt-8">我认为这篇文本由人类而非人工智能撰写的可能性为 90%，因为它混合了创造性的语言、幽默和叙事结构，同时还显示出一些类似模板的模式，以及人工智能生成文本所特有的不同寻常的连贯性和一致性。</p>
            </div>
            <div class="mt-8">
                <p class="text-[#777777]">您觉得结果如何？</p>
                <div class="flex justify-center items-center gap-5 mt-5">
                    <el-icon size="20" color="#49CFAD"><CircleCheck /></el-icon>
                    <el-icon size="20" color="red"><CircleClose /></el-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
// allType中为各国语言
const allType = ref([
    { name: "简体中文", objectId: "1" },
    { name: "英文", objectId: "2" },
    { name: "日文", objectId: "3" },
    { name: "韩文", objectId: "4" },
    { name: "法文", objectId: "5" },
    { name: "德文", objectId: "6" },
    { name: "俄文", objectId: "7" },
    { name: "西班牙文", objectId: "8" },
    { name: "葡萄牙文", objectId: "9" },
    { name: "意大利文", objectId: "10" },
    { name: "荷兰文", objectId: "11" },
    { name: "瑞典文", objectId: "12" },
    { name: "丹麦文", objectId: "13" },
    { name: "芬兰文", objectId: "14" },
])

const category = ref<string>("简体中文")

const text = ref<string>("")
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
