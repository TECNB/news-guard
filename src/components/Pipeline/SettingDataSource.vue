<template>
    <div class="SettingDataSource" v-if="props.ifShow">
        <div class="flex justify-between items-center border-b -mx-5 px-5 pb-2 ">
            <p class="text-2xl font-bold">编辑数据源</p>
            <div class="Close" @click="toggleVisibility">
                <el-icon size="20" class="cursor-pointer">
                    <Close />
                </el-icon>
            </div>
        </div>
        <el-scrollbar height="86%" wrap-style="width:100%;" class="flex justify-start">
            <div class="flex flex-col justify-center items-start gap-4 px-2 py-5">
                <p class="text-text-200">来源</p>
                <div class="flex justify-start items-center gap-5">
                    <div
                        class="w-24 h-24 relative flex flex-col justify-center items-center gap-9 rounded-md shadow-[0_2px_6px_0_rgba(37,43,58,0.12)] pt-2 cursor-pointer">
                        <i class="fa-regular fa-table-cells fa-xl"></i>
                        <p class="text-sm">现有数据</p>
                        <div class="absolute top-0 right-1">
                            <i class="fa-regular fa-circle-check"></i>
                        </div>
                    </div>

                    <div
                        class="w-24 h-24 flex flex-col justify-center items-center gap-9 rounded-md shadow-[0_2px_6px_0_rgba(37,43,58,0.12)] pt-2 cursor-pointer">
                        <i class="fas fa-database fa-xl" style="color: #666;"></i>
                        <p class="text-sm text-text-200">数据库</p>
                    </div>
                    <div
                        class="w-24 h-24 flex flex-col justify-center items-center gap-9 rounded-md shadow-[0_2px_6px_0_rgba(37,43,58,0.12)] pt-2 cursor-pointer">
                        <i class="fa-regular fa-file-pdf fa-xl" style="color: #666;"></i>
                        <p class="text-sm text-text-200">PDF</p>
                    </div>
                    <div
                        class="w-24 h-24 flex flex-col justify-center items-center gap-9 rounded-md shadow-[0_2px_6px_0_rgba(37,43,58,0.12)] pt-2 cursor-pointer">
                        <i class="fa-regular fa-file-xls fa-xl" style="color: #666;"></i>
                        <p class="text-sm text-text-200">Excel表格</p>
                    </div>
                    <div
                        class="w-24 h-24 flex flex-col justify-center items-center gap-9 rounded-md shadow-[0_2px_6px_0_rgba(37,43,58,0.12)] pt-2 cursor-pointer">
                        <i class="fa-regular fa-file-excel fa-xl" style="color: #666;"></i>
                        <p class="text-sm text-text-200">暂不添加</p>
                    </div>
                </div>

                <p class="text-text-200">选择现有数据</p>
                <el-select v-model="formName1" placeholder="请点击选择分类" size="large" clearable :teleported="false"
                    style="width: 360px;">
                    <el-option v-for="(text, index) in allTexts" :key="index" :label="text" :value="text" />
                </el-select>
                <p class="text-text-200">连接数据库</p>

                <el-select v-model="formName2" placeholder="请点击选择分类" size="large" clearable :teleported="false"
                    style="width: 360px;">
                    <el-option v-for="(text, index) in allTexts" :key="index" :label="text" :value="text" />
                </el-select>

                <p class="text-text-200">连接方式</p>

                <el-select v-model="selectedConnectionMethod" placeholder="请点击选择连接方式" size="large" clearable
                    :teleported="false" style="width: 360px;">
                    <el-option v-for="(method, index) in connectionMethods" :key="index" :label="method"
                        :value="method" />
                </el-select>

            </div>

        </el-scrollbar>
        <div class="w-full flex justify-between items-center absolute bottom-3 border-t pt-3 -mx-5 px-5">
            <div class="flex flex-1 justify-start items-center gap-3">
                <p class="text-text-300 text-sm">新数据源会稍后加入您的表格</p>
            </div>
            <div class="">
                <div class="bg-text-100 rounded-xl cursor-pointer py-3 px-8" @click="toggleVisibility">
                    <p class="text-white font-bold">确认配置</p>
                </div>
            </div>

            <div class="flex flex-1 justify-end items-center">
                <div
                    class="flex justify-between items-center gap-3 cursor-pointer rounded-xl hover:bg-gray-200 transition p-2">
                    <i class="fa-regular fa-arrow-rotate-right" style="color: #999;"></i>
                    <p class="text-text-300">恢复默认值</p>
                </div>
                <div class="">
                </div>
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { formContant } from '../../constants/formContant';

const props = defineProps(['ifShow']);
const emit = defineEmits();

let formName1 = ref('')
let formName2 = ref('')

// 自定义连接方式数组
const connectionMethods = [
    '外连接',
    '内连接',
    '全连接',
];

// 选择的连接方式
const selectedConnectionMethod = ref<string>('');

const toggleVisibility = () => {
    emit('updateIfShow', false);
};

// 计算属性，获取所有 text 字段
const allTexts = computed(() => {
    return formContant.flatMap(category => category.items.map(item => item.text));
});
</script>

<style lang="scss" scoped>
.SettingDataSource {
    width: 45%;
    height: 100%;
    position: absolute;
    z-index: 99999;
    // 居中对齐
    top: 0px;
    right: 0px;
    background: #ffffff;
    border-radius: 10px;
    text-align: left;
    padding: 20px;
}


// 下面为el-select部分
@mixin select_radius {
    border-radius: 12px;
}


// 控制el-select的长度以及圆角
:deep(.el-select__wrapper) {
    width: 565px;
    height: 48px;
    @include select_radius;
}

// 控制el-select中文字的样式
:deep(.el-select__placeholder) {
    color: var(--text-200);
    font-size: 16px;
    font-weight: bold;
}

// 控制点击后的边框颜色
:deep(.el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 1px var(--text-200);
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
    color: var(--text-200);
}
</style>
