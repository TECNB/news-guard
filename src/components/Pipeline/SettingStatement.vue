<template>
    <div class="SettingStatement" v-if="props.ifShow">
        <div class="flex justify-between items-center border-b -mx-5 px-5 pb-2 ">
            <p class="text-2xl font-bold">新建任务</p>
            <div class="Close" @click="toggleVisibility">
                <el-icon size="20" class="cursor-pointer">
                    <Close />
                </el-icon>
            </div>
        </div>
        <el-scrollbar height="86%" wrap-style="width:100%;" class="flex justify-start">
            <div class="flex flex-col justify-center items-start gap-4 px-2 py-5">
                <p class="text-text-200">类型</p>
                <div class="w-full flex justify-start items-center gap-5">
                    <div v-for="(item, index) in steps" :key="index" :class="[
                        'w-24 h-24 relative flex-1 flex flex-col justify-center items-center gap-9 rounded-md shadow-[0_2px_6px_0_rgba(37,43,58,0.12)] pt-2 cursor-pointer',
                        activeIndex === index ? 'bg-active' : 'bg-inactive'
                    ]" @click="setActiveIndex(index)">
                        <i :class="[item.icon, 'fa-xl']" :style="activeIndex === index ? '' : 'color: #666;'"></i>
                        <p :class="['text-sm', activeIndex === index ? '' : 'text-text-200']">{{ item.label }}</p>
                        <div v-if="activeIndex === index" class="absolute top-0 right-1">
                            <i class="fa-regular fa-circle-check"></i>
                        </div>
                    </div>
                </div>


                <div class="flex flex-col gap-4 mt-4" v-if="activeIndex == 0">
                    <p class="text-text-200">日期范围设置</p>
                    <el-select v-model="formName1" placeholder="请点击选择一种图表" size="large" clearable :teleported="false"
                        style="width: 360px;">
                        <el-option v-for="(text, index) in timeMethods" :key="index" :label="text" :value="text" />
                    </el-select>
                    <p class="text-text-200">动态参数字段自定义</p>

                    <el-select v-model="formName2" placeholder="请点击选择一种图表" size="large" clearable :teleported="false"
                        style="width: 360px;">
                        <el-option v-for="(text, index) in repeatMethods" :key="index" :label="text" :value="text" />
                    </el-select>

                    <p class="text-text-200">报表尺寸大小</p>

                    <el-select v-model="selectedConnectionMethod" placeholder="请点击选择一种图表" size="large" clearable
                        :teleported="false" style="width: 360px;">
                        <el-option v-for="(method, index) in sizeMethods" :key="index" :label="method"
                            :value="method" />
                    </el-select>

                    <p class="text-text-200">报表语言</p>

                    <el-select v-model="selectedConnectionMethod" placeholder="请点击选择一种图表" size="large" clearable
                        :teleported="false" style="width: 360px;">
                        <el-option v-for="(method, index) in languageMethods" :key="index" :label="method"
                            :value="method" />
                    </el-select>
                </div>
                <div class="flex flex-col gap-4 mt-4" v-if="activeIndex == 1">
                    <p class="text-text-200">输出类型选择</p>
                    <el-select v-model="formName1" placeholder="请点击选择一种类型" size="large" clearable :teleported="false"
                        style="width: 360px;">
                        <el-option v-for="(text, index) in outputMethods" :key="index" :label="text" :value="text" />
                    </el-select>
                    <p class="text-text-200">水印与标志设置</p>

                    <el-select v-model="formName2" placeholder="请点击选择字段" size="large" clearable :teleported="false"
                        style="width: 360px;">
                        <el-option v-for="(text, index) in logoMethods" :key="index" :label="text" :value="text" />
                    </el-select>

                    <p class="text-text-200">安全与权限设置</p>

                    <el-select v-model="selectedConnectionMethod" placeholder="请点击选择字段" size="large" clearable
                        :teleported="false" style="width: 360px;">
                        <el-option v-for="(method, index) in securityMethods" :key="index" :label="method"
                            :value="method" />
                    </el-select>

                </div>
                <div class="flex flex-col gap-4 mt-4" v-if="activeIndex == 2">
                    <p class="text-text-200">文件分发</p>
                    <el-select v-model="formName1" placeholder="请点击选择类型" size="large" clearable :teleported="false"
                        style="width: 360px;">
                        <el-option v-for="(text, index) in afterOutputMethods" :key="index" :label="text"
                            :value="text" />
                    </el-select>
                    <p class="text-text-200">API 集成</p>

                    <el-select v-model="formName2" placeholder="请点击选择类型" size="large" clearable :teleported="false"
                        style="width: 360px;">
                        <el-option v-for="(text, index) in repeatMethods" :key="index" :label="text" :value="text" />
                    </el-select>

                    <p class="text-text-200">定制脚本</p>

                    <el-select v-model="selectedConnectionMethod" placeholder="请点击选择类型" size="large" clearable
                        :teleported="false" style="width: 360px;">
                        <el-option v-for="(method, index) in unusualnMethods" :key="index" :label="method"
                            :value="method" />
                    </el-select>
                </div>


            </div>

        </el-scrollbar>
        <div class="w-full flex justify-between items-center absolute bottom-3 border-t pt-3 -mx-5 px-5">
            <div class="flex flex-1 justify-start items-center">
                <div
                    class="flex justify-between items-center gap-3 cursor-pointer rounded-xl hover:bg-gray-200 transition p-2">
                    <i class="fa-regular fa-arrow-rotate-right" style="color: #999;"></i>
                    <p class="text-text-300">恢复默认值</p>
                </div>
            </div>

            <div class="bg-black rounded-xl cursor-pointer py-3 px-8" @click="toggleVisibility">
                <p class="text-white font-bold">确认配置</p>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps(['ifShow']);
const emit = defineEmits();

let formName1 = ref('')
let formName2 = ref('')

// 数据项
const steps = [
    { label: '报表类型', icon: 'fa-regular fa-file-chart-pie' },
    { label: '报表配置', icon: 'fa-regular fa-sliders' },
    { label: '生成后处理', icon: 'fa-regular fa-arrow-progress' },

];

// 选中项的 index
const activeIndex = ref<number | null>(0);

// 设置选中项
const setActiveIndex = (index: number) => {
    activeIndex.value = index;
};

// 自定义连接方式数组
// const missingMethods = [
//     '填充',
//     '删除',
//     '平均值填充',
// ];

const repeatMethods = [
    '删除',
    '合并',
];

const unusualnMethods = [
    '删除异常值',
    '标准差法',
    '阈值法',
    '箱线图法'
];

const outputMethods = [
    'PDF',
    '图片',
];

const afterOutputMethods = [
    '发送邮箱',
    '通知用户',
    '保存至云盘',
    '保存至本地'
];
const logoMethods = [
    '文字水印',
    '自定义Logo',
];
const securityMethods = [
    '加密',
    '权限设置',
    '密码保护',
    '防盗链'
];
const timeMethods = [
    '日报',
    '周报',
    '月报',
    '季报',
    '年报'
];
const sizeMethods = [
    '小',
    '中',
    '大',
    '自定义'
];
const languageMethods = [
    '中文',
    '英文',
    '日文',
    '韩文',
]

// 选择的连接方式
const selectedConnectionMethod = ref<string>('');

const toggleVisibility = () => {
    emit('updateIfShow', false);
};

</script>

<style lang="scss" scoped>
.SettingStatement {
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
