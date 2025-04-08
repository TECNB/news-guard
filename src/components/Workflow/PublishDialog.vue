<template>
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
            <!-- 背景遮罩 -->
            <div class="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" @click="onClose(false)"></div>

            <!-- 对话框内容 -->
            <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform transition-all"
                style="box-shadow: 0 10px 40px rgba(73, 207, 173, 0.2);">
                <!-- 顶部彩色条纹 -->
                <div class="h-1.5 w-full bg-gradient-to-r from-[#49CFAD] to-[#3DBEA3]"></div>

                <!-- 内容 -->
                <div class="p-6">
                    <!-- 加载中状态 -->
                    <div v-if="loading" class="flex flex-col items-center py-10">
                        <div class="w-20 h-20 rounded-full flex items-center justify-center mb-5">
                            <div class="w-12 h-12 border-4 border-[#49CFAD] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h2 class="text-xl font-medium text-gray-800 mb-2">正在发布工作流</h2>
                        <p class="text-gray-500 text-center">请稍候，正在处理您的请求...</p>
                    </div>

                    <!-- 成功状态 -->
                    <div v-else class="flex flex-col items-center">
                        <!-- 成功图标 -->
                        <div
                            class="w-20 h-20 rounded-full bg-[#49CFAD] bg-opacity-10 flex items-center justify-center mb-5">
                            <i class="fa-solid fa-check text-3xl text-[#49CFAD]"></i>
                        </div>

                        <h2 class="text-xl font-medium text-gray-800 mb-1">工作流发布成功</h2>
                        <p class="text-gray-500 text-center mb-6">您的工作流已成功发布，可在前往API调试软件中测试</p>

                        <!-- 信息卡片 -->
                        <div class="bg-gray-50 p-5 rounded-xl w-full mb-6 border border-gray-100">
                            <!-- API-key -->
                            <div class="flex justify-between items-center mb-4 group">
                                <span class="text-sm font-medium text-gray-600">API-Key</span>
                                <div class="flex items-center">
                                    <span
                                        class="text-sm text-gray-800 mr-2 font-mono">sk-49cfad7e8b31f2a590dc6e42b718d245</span>
                                    <div @click="copyText('sk-49cfad7e8b31f2a590dc6e42b718d245')"
                                        class="text-[#49CFAD] transition-colors hover:text-[#3DBEA3]">
                                        <i class="fa-solid fa-copy"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- API 调用地址 -->
                            <div class="flex justify-between items-center mb-4 group">
                                <span class="text-sm font-medium text-gray-600">API 调用地址</span>
                                <div class="flex items-center">
                                    <span
                                        class="text-sm text-gray-800 mr-2 font-mono">http://llm.flyfish.com/chat</span>
                                    <div @click="copyText('http://llm.flyfish.com/chat')"
                                        class="text-[#49CFAD] transition-colors hover:text-[#3DBEA3]">
                                        <i class="fa-solid fa-copy"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- API-Key 验证 -->
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-medium text-gray-600">API-Key 验证</span>
                                <div
                                    class="py-0.5 px-2 rounded-full bg-[#49CFAD] bg-opacity-10 text-[#49CFAD] text-xs font-medium">
                                    已启用
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 按钮区域 -->
                    <div class="flex justify-between items-center mt-4">
                        <div v-if="!loading" @click="onViewDocs"
                            class="flex items-center text-[#49CFAD] hover:text-[#3DBEA3] transition-colors cursor-pointer">
                            <i class="fa-solid fa-book mr-1.5"></i>
                            查看接口文档
                        </div>
                        <div v-else class="invisible">占位</div>

                        <div class="flex space-x-3">
                            <div @click="onClose(false)"
                                class="px-4 py-2 cursor-pointer border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                {{ loading ? '取消' : '关闭' }}
                            </div>

                            <div v-if="!loading" @click="onClose(true)"
                                class="px-4 py-2 cursor-pointer bg-[#49CFAD] hover:bg-[#3DBEA3] rounded-lg text-sm font-medium text-white transition-colors">
                                确认
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

// 定义属性
const props = defineProps<{
    visible: boolean;
}>();

// 定义事件
const emit = defineEmits(['close', 'view-docs']);

// 加载状态
const loading = ref(false);

// 监听visible变化
watch(() => props.visible, (newVisible) => {
    if (newVisible) {
        // 显示对话框时，先显示加载状态
        loading.value = true;
        
        // 2秒后切换到成功状态
        setTimeout(() => {
            loading.value = false;
        }, 2000);
    } else {
        // 隐藏对话框时重置状态
        loading.value = false;
    }
}, { immediate: true });

// 复制文本到剪贴板
const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    // 这里可以添加复制成功的提示，如Toast等
    console.log('已复制:', text);
};

// 关闭对话框
const onClose = (confirmed: boolean) => {
    // 如果还在加载中且不是确认，则直接关闭
    if (loading.value && !confirmed) {
        loading.value = false;
    }
    emit('close', confirmed);
};

// 查看接口文档
const onViewDocs = () => {
    emit('view-docs');
};
</script>