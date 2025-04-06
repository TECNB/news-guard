<template>
    <div>
        <!-- 数据展示区域 -->
        <div v-if="records.length > 0"
            class="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-md p-4 mb-3 animate-fadeIn border border-gray-100">
            <div class="flex items-center mb-3">
                <i class="fa-solid fa-file-lines text-blue-600 mr-2" style="width: 18px; height: 18px;"></i>
                <h2 class="text-lg font-bold text-gray-800">查询结果</h2>
            </div>

            <div class="overflow-x-auto rounded-lg border border-gray-100">
                <table class="min-w-full divide-y divide-gray-200 text-sm table-fixed">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th scope="col" class="w-2/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                标题
                            </th>
                            <th scope="col" class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                时间
                            </th>
                            <th scope="col" class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                类型
                            </th>
                            <th scope="col" class="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(record, index) in records" :key="index"
                            class="transition-all duration-200 hover:bg-gray-50">
                            <td class="w-1/6 px-6 py-3 text-xs font-medium text-gray-900 text-left">
                                {{ record.id }}
                            </td>
                            <td class="w-2/6 px-6 py-3 text-xs text-gray-800">
                                <div class="line-clamp-1 font-medium hover:text-blue-600 transition-colors text-left">
                                    {{ record.title }}
                                </div>
                            </td>
                            <td class="w-1/6 px-6 py-3 text-xs text-gray-500 text-left">
                                {{ formatDate(record.verificationDate) }}
                            </td>
                            <td class="w-1/6 px-6 py-3 text-xs text-left">
                                <span :class="getTypeClass(record.type)">{{ record.type }}</span>
                            </td>
                            <td class="w-1/6 px-6 py-3 text-xs text-left">
                                <button @click="handleViewDetails(record)"
                                    class="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#49CFAD] hover:bg-[#3db89a] shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49CFAD]">
                                    <i class="fa-solid fa-eye mr-1.5" style="width: 12px; height: 12px;"></i>
                                    查看
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 无数据状态 -->
        <div v-else-if="hasSearched && !isLoading"
            class="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl shadow-md p-6 text-center animate-fadeIn flex flex-col items-center border border-gray-100">
            <i class="fa-regular fa-face-smile text-blue-400 mb-3" style="font-size: 36px;"></i>
            <h3 class="text-lg font-bold text-gray-800 mb-2">未找到记录</h3>
            <p class="text-gray-500 max-w-md mx-auto text-sm">该区块链地址未存储任何虚假新闻记录</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';

// 定义新闻记录接口
interface NewsRecord {
    id: string;
    title: string;
    verificationDate: string;
    type: string;
    [key: string]: any; // 允许其他属性
}

const props = defineProps({
    records: {
        type: Array as () => NewsRecord[],
        required: true,
        default: () => []
    },
    hasSearched: {
        type: Boolean,
        default: false
    },
    isLoading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['view-details']);

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
    const baseClass = 'inline-block px-2 py-1 text-xs font-medium rounded-full';

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

// 处理查看详情
const handleViewDetails = (record: NewsRecord) => {
    emit('view-details', record);
};
</script>