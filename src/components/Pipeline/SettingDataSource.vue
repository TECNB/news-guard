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
                        <p class="text-sm">文本数据</p>
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

                <!-- 文本输入 -->
                <div class="w-full mt-5">
                    <el-input v-model="text" placeholder="请输入需要判断的文字" :rows="19" type="textarea" />
                </div>

            </div>

        </el-scrollbar>
        <div class="w-full flex justify-between items-center absolute bottom-3 border-t pt-3 -mx-5 px-5">
            <!-- 检测按钮与字数 -->
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-[#777777]">{{ text.length }}/5000 字数</p>
                </div>
                <div
                    class="flex justify-between items-center gap-3 cursor-pointer rounded-xl hover:bg-gray-200 transition p-2">
                    <i class="fa-regular fa-arrow-rotate-right" style="color: #999;"></i>
                    <p class="text-text-300">恢复默认值</p>
                </div>
            </div>



            <div class="flex justify-end items-center">

                <div class="bg-[#49CFAD] w-fit rounded-lg px-2 py-3 cursor-pointer" @click="detectText">
                    <p class="text-white font-bold">检测文字</p>
                </div>


            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps(['ifShow']);
const emit = defineEmits(['updateIfShow', 'textDetected','addParallelTask']);

const text = ref('');

const toggleVisibility = () => {
    emit('updateIfShow', false);
};

// 当点击 "检测文字" 按钮时，调用这个函数
const detectText = () => {
    // 通过 emit 将 text 传递给父组件
    emit('textDetected', text.value);
    emit('updateIfShow', false);
    console.log('添加串行任务');
    const newParallelTask = {
        title: '文本数据',  // 这里可以根据需求动态设置标题
        type: 'parallel'
    };

    // 触发事件并将新任务传递给父组件
    emit('addParallelTask', newParallelTask);
};
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

// 下面是textarea组件的自定义样式
.el-textarea {
    font-size: 16px;
    font-weight: bold;

    --el-input-focus-border-color: var(--accent-200);
}
</style>
