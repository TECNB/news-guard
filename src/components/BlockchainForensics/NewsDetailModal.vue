<template>
    <div v-if="show"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300"
        @click.self="closeModal">
        <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 animate-fadeIn">
            <div class="flex flex-col h-full">
                <!-- 头部区域 -->
                <div class="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 class="text-lg font-bold text-gray-800 flex items-center">
                        <i class="fa-solid fa-newspaper text-blue-500 mr-2"></i>
                        新闻详情
                    </h3>
                    <button @click="closeModal"
                        class="text-gray-400 hover:text-gray-600 transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- 内容区域 -->
                <el-scrollbar height="calc(85vh - 120px)" class="flex-1">
                    <div v-if="record" class="p-5 space-y-4">
                        <!-- 标题 -->
                        <div class="mb-4">
                            <h2 class="text-xl font-bold text-gray-900 leading-tight">{{ record.title }}</h2>
                            <div class="flex items-center mt-2 space-x-2">
                                <span :class="getTypeClass(record.type)">{{ record.type }}</span>
                                <span class="text-xs text-gray-500">{{ formatDate(record.verificationDate) }}</span>
                            </div>
                        </div>

                        <!-- 内容 -->
                        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p class="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{{ record.content }}</p>
                        </div>

                        <!-- 鉴别结果 -->
                        <div class="bg-white rounded-xl p-4 border border-red-100 border-l-4 border-l-red-500 shadow-sm">
                            <h4 class="text-sm font-medium text-gray-700 mb-1">鉴别结果</h4>
                            <div class="flex justify-center items-center space-x-3 mb-1">
                                <p class="font-bold text-red-700 text-sm">{{ record.verificationResult }}</p>
                                <div class="flex items-center">
                                    <div class="bg-red-100 px-3 py-0.5 rounded-full flex items-center">
                                        <span class="text-xs font-semibold text-red-700 mr-1">得分:</span>
                                        <span class="text-sm font-bold text-red-700">{{ record.score }}</span>
                                    </div>
                                </div>
                            </div>
                            <p class="text-xs text-red-600/80">{{ record.reasonDetail }}</p>
                        </div>

                        <!-- 区块链信息 -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <h4 class="text-xs font-medium text-gray-500 mb-2">区块链交易哈希</h4>
                                <div class="flex items-center">
                                    <p class="text-xs text-gray-700 font-mono truncate">{{ record.transactionHash }}</p>
                                    <button
                                        class="ml-2 text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                        @click="copyToClipboard(record.transactionHash)" title="复制到剪贴板">
                                        <i class="fa-solid fa-clipboard" style="width: 12px; height: 12px;"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <h4 class="text-xs font-medium text-gray-500 mb-2">区块高度</h4>
                                <p class="text-sm text-gray-700 font-mono">{{ record.blockNumber }}</p>
                            </div>
                        </div>

                        <!-- 区块链证明 -->
                        <div class="mt-4 border-t border-gray-100 pt-4">
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="text-sm font-medium text-gray-700">区块链证明</h4>
                                <div @click="toggleBlockchainProof"
                                    class="text-xs bg-blue-500 hover:bg-blue-600 text-white flex items-center px-3 py-1.5 rounded-full shadow-sm transition-all">
                                    {{ showBlockchainProof ? '隐藏' : '显示' }} 证明
                                    <i class="fa-solid fa-chevron-down ml-1.5"
                                        :class="{ 'transform rotate-180': showBlockchainProof }"
                                        style="width: 12px; height: 12px;"></i>
                                </div>
                            </div>
                            <div v-if="showBlockchainProof"
                                class="bg-gray-50 border border-gray-200 rounded-md m-0 transition-all duration-300 animate-fadeIn">
                                <div class="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                                    <span class="text-gray-500 text-xs font-semibold">JSON</span>
                                    <button @click="copyJsonProof" class="bg-transparent border-none text-blue-600 text-xs cursor-pointer px-1.5 py-0.5 rounded transition-colors duration-200 hover:bg-blue-50">
                                        <span v-if="copied">已复制</span>
                                        <span v-else>复制</span>
                                    </button>
                                </div>
                                <pre class="m-0 p-4 break-words break-all whitespace-pre-wrap text-left"><code ref="codeBlock" class="hljs language-json font-mono text-xs leading-relaxed"></code></pre>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>

                <!-- 底部按钮 -->
                <div class="px-5 py-4 bg-gray-50 flex justify-end sticky bottom-0 border-t border-gray-100">
                    <button @click="closeModal"
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm text-sm font-medium transition-colors">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, watch, onMounted, nextTick } from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    record: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:show', 'copy']);

const showBlockchainProof = ref(false);
const codeBlock = ref<HTMLElement | null>(null);
const copied = ref(false);

// 格式化日期
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// 根据新闻类型获取样式类
const getTypeClass = (type: string) => {
    const baseClass = 'px-2.5 py-1 text-xs font-medium rounded-full';

    switch (type) {
        case '文本新闻':
            return `${baseClass} bg-green-100 text-green-800`;
        case '图文结合':
            return `${baseClass} bg-emerald-100 text-emerald-800`;
        case '视频新闻':
            return `${baseClass} bg-teal-100 text-teal-800`;
        case '音频新闻':
            return `${baseClass} bg-lime-100 text-lime-800`;
        default:
            return `${baseClass} bg-gray-100 text-gray-800`;
    }
};

// 关闭模态框
const closeModal = () => {
    emit('update:show', false);
};

// 切换区块链证明显示状态
const toggleBlockchainProof = () => {
    showBlockchainProof.value = !showBlockchainProof.value;
    if (showBlockchainProof.value) {
        nextTick(() => {
            renderCodeHighlight();
        });
    }
};

// 复制到剪贴板
const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        emit('copy', true);
    }).catch(err => {
        console.error('复制失败:', err);
    });
};

// 复制区块链证明JSON
const copyJsonProof = async () => {
    try {
        if (props.record?.blockchainProof) {
            const jsonContent = JSON.stringify(props.record.blockchainProof, null, 2);
            await navigator.clipboard.writeText(jsonContent);
            copied.value = true;
            setTimeout(() => {
                copied.value = false;
            }, 2000);
        }
    } catch (err) {
        console.error('复制失败: ', err);
    }
};

// 高亮代码块
const renderCodeHighlight = () => {
    if (codeBlock.value && props.record?.blockchainProof) {
        const codeContent = JSON.stringify(props.record.blockchainProof, null, 2);
        codeBlock.value.innerHTML = hljs.highlight(codeContent, { language: 'json' }).value;
    }
};

// 监听区块链证明显示状态变化
watch(() => showBlockchainProof.value, (newVal) => {
    if (newVal) {
        nextTick(() => {
            renderCodeHighlight();
        });
    }
});

// 监听数据变化
watch(() => props.record, (newVal) => {
    if (newVal && showBlockchainProof.value) {
        nextTick(() => {
            renderCodeHighlight();
        });
    }
}, { deep: true });
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

/* 滚动条样式 */
.el-scrollbar {
  --el-scrollbar-opacity: 0.8;
  --el-scrollbar-hover-opacity: 0.8;
  --el-scrollbar-bg-color: transparent;
}

.break-all {
  word-wrap: break-word;
  word-break: break-all;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>