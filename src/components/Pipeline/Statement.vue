<template>
    <div class="Statement" v-if="props.ifShow">
        <div class="p-6 bg-blue-800 text-white rounded-lg shadow-xl mb-6 relative">
            <!-- 关闭按钮 -->
            <div class="absolute top-3 right-3 cursor-pointer">
                <i class="fa-solid fa-xl fa-times" @click="toggleVisibility"></i>
            </div>

            <!-- 下载按钮 -->
            <div class="absolute top-3 right-16">
                <el-select v-model="selectedDownload" placeholder="导出" size="mini" @change="handleDownload"
                    class="w-full" clearable :teleported="false">
                    <template #prefix>
                        <span class="mr-2">导出</span>
                    </template>
                    <el-option label="导出 PDF" value="pdf"></el-option>
                    <el-option label="导出 图片" value="image"></el-option>
                </el-select>
            </div>

            <p class="text-4xl font-bold">虚假新闻检测报告</p>
            <p class="text-lg mt-2">报告生成时间：{{ new Date().toLocaleString() }}</p>
        </div>

        <el-scrollbar height="73vh" wrap-style="width:100%; padding: 10px 0;" class="flex justify-center"
            @scroll="onScroll">
            <div class="space-y-6 w-full max-w-3xl">
                <!-- 虚假新闻概率评分 -->
                <div class="p-6 bg-white border-l-4 border-red-600 rounded-lg shadow-md">
                    <p class="text-xl font-semibold text-gray-800">虚假新闻概率评分</p>
                    <p class="text-4xl font-bold text-red-600">{{ props.fakeNewsData?.fake_news_probability_score }}%</p>
                </div>
                <!-- 虚假新闻类型 -->
                <div class="p-6 bg-white border-l-4 border-blue-600 rounded-lg shadow-md">
                    <p class="text-xl font-semibold text-gray-800">虚假新闻类型</p>
                    <ul class="list-disc ml-6 space-y-2 text-gray-700">
                        <li v-for="type in props.fakeNewsData?.fake_news_type" :key="type">{{ type }}</li>
                    </ul>
                </div>

                <!-- 原始新闻 -->
                <div class="p-6 bg-white border-l-4 border-red-600 rounded-lg shadow-md">
                    <p class="text-xl font-semibold text-gray-800">原始新闻</p>
                    <p class="text-xl font-bold text-blue-600 mt-2">{{ props.fakeNewsData?.original_fake_news.title }}
                    </p>
                    <p class="text-gray-700 mt-4">{{ props.fakeNewsData?.original_fake_news.content }}</p>
                </div>

                <!-- 重制后的新闻 -->
                <div class="p-6 bg-white border-l-4 border-green-600 rounded-lg shadow-md">
                    <p class="text-xl font-semibold text-gray-800">重制后的新闻</p>
                    <p class="text-xl font-bold text-blue-600 mt-2">{{ props.fakeNewsData?.restored_news.title }}</p>
                    <p class="text-gray-700 mt-4">{{ props.fakeNewsData?.restored_news.content }}</p>
                </div>

                <!-- 重制依据 -->
                <div class="p-6 bg-white border-l-4 border-yellow-600 rounded-lg shadow-md">
                    <p class="text-xl font-semibold text-gray-800">重制依据</p>
                    <p><strong class="text-gray-700">来源修正：</strong> {{
                        props.fakeNewsData?.restoration_basis.source_correction }}
                    </p>
                    <p><strong class="text-gray-700">证据：</strong> {{ props.fakeNewsData?.restoration_basis.evidence }}
                    </p>
                </div>
            </div>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 接收父组件传递的 props
const props = defineProps({
    ifShow: Boolean,
    fakeNewsData: Object
});

const emit = defineEmits();

const toggleVisibility = () => {
    emit('updateIfShow', false);
};

// 处理下载功能
const selectedDownload = ref<string>('');
const handleDownload = (value: string) => {
    console.log(`Download option selected: ${value}`);
    // 在这里处理导出逻辑
};
</script>

<style lang="scss" scoped>
.Statement {
    width: 50%;
    height: 94%;
    position: fixed;
    z-index: 99999;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ffffff;
    border-radius: 20px;
    text-align: left;
    padding: 20px;
    overflow-x: visible !important;
}
</style>
