<template>
    <div class="search-properties">
        <h4 class="text-sm font-medium text-gray-700 mb-2">搜索设置</h4>

        <!-- 搜索引擎选择 -->
        <div class="mb-4">
            <label class="block text-xs font-medium text-gray-600 mb-1">搜索引擎</label>
            <select v-model="config.searchEngine"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                <option value="google">谷歌搜索</option>
                <option value="bing">必应搜索</option>
                <option value="baidu">百度搜索</option>
                <option value="sogou">搜狗搜索</option>
                <option value="default">默认搜索</option>
            </select>
            <div class="text-xs text-gray-500 mt-1">选择搜索请求使用的搜索引擎</div>
        </div>

        <!-- 最大结果数 -->
        <div class="mb-4">
            <label class="block text-xs font-medium text-gray-600 mb-1">最大结果数</label>
            <div class="flex items-center">
                <input type="number" v-model.number="config.maxResults" min="1" max="20"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                <span class="ml-2 text-gray-500 text-xs">条</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">返回的搜索结果最大数量 (1-20)</div>
        </div>

        <!-- 查询内容 -->
        <div class="relative mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">查询内容</label>

            <!-- 使用编辑器组件 -->
            <LLMPromptEditor v-model="config.queryPrompt" :suggestionsEnabled="true"
                @variable-input="handleVariableInput" placeholder="输入搜索查询内容，可以使用变量，例如：{variable}" />

            <!-- 变量建议下拉框 -->
            <variable-suggestions v-if="showVariableSuggestions" :position="suggestionsPosition"
                :filter="currentVariableInput" @select="insertVariable" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { SearchConfig } from '../../../types/workflow';
import LLMPromptEditor from './LLMPromptEditor.vue';
import VariableSuggestions from './VariableSuggestions.vue';
import { useCursorPosition } from '@/utils/workflow/cursorUtils';

// 使用 defineModel() 宏实现双向绑定
const config = defineModel<SearchConfig>({
    default: () => ({
        searchEngine: 'google',
        maxResults: 5,
        queryPrompt: ''
    })
});

// 变量建议相关
const showVariableSuggestions = ref(false);
const suggestionsPosition = ref({
    left: '0px',
    top: '0px'
});
const { cursorPosition, getCursorPosition, updateCursorPosition } = useCursorPosition();
const currentVariableInput = ref('');

// 处理变量输入
const handleVariableInput = (data: { text: string, position: number }) => {
    // 获取用户已经输入的部分变量名
    currentVariableInput.value = data.text;

    // 计算建议框位置
    const textareaElement = document.querySelector('textarea.prompt-container');
    if (textareaElement) {
        // 先更新光标位置
        updateCursorPosition(textareaElement as HTMLTextAreaElement);
        const pos = getCursorPosition(textareaElement as HTMLTextAreaElement);

        // 设置菜单显示在光标上方
        suggestionsPosition.value = {
            left: `${pos.left}px`,
            top: `${pos.top}px`
        };

        showVariableSuggestions.value = true;
    } else {
        showVariableSuggestions.value = false;
    }
};

// 插入变量到查询内容
const insertVariable = (variable: string) => {
    const textareaElement = document.querySelector('textarea.prompt-container');
    if (!textareaElement) {
        showVariableSuggestions.value = false;
        return;
    }

    const textarea = textareaElement as HTMLTextAreaElement;

    // 先更新光标位置
    updateCursorPosition(textarea);
    const { start, end } = cursorPosition.value;
    const text = textarea.value;

    // 检查光标位置是否合法 - 允许从位置0开始
    if (start === undefined || start < 0) {
        console.warn(`[SearchProperties] 无效的光标位置: ${start}`);
        showVariableSuggestions.value = false;
        return;
    }

    // 确保是在输入变量名的上下文中
    const lastOpenBrace = text.lastIndexOf('{', start - 1);
    const lastCloseBrace = text.lastIndexOf('}', start - 1);

    let newText: string;
    if (lastOpenBrace < 0 || lastOpenBrace < lastCloseBrace) {
        // 直接插入完整变量
        newText =
            text.substring(0, start) +
            `{${variable}}` +
            text.substring(end || start);
    } else {
        // 替换已经开始输入的变量
        newText =
            text.substring(0, lastOpenBrace) +
            `{${variable}}` +
            text.substring(end || start);
    }

    // 更新查询内容
    config.value = {
        ...config.value,
        queryPrompt: newText
    };

    // 立即隐藏建议框
    showVariableSuggestions.value = false;
};

// 点击外部关闭变量建议框
const handleClickOutside = (event: MouseEvent) => {
    if (showVariableSuggestions.value) {
        const target = event.target as HTMLElement;
        const suggestionsElement = document.querySelector('.variable-suggestions');
        const textareaElement = document.querySelector('textarea.prompt-container');

        if (suggestionsElement && !suggestionsElement.contains(target) &&
            textareaElement && !textareaElement.contains(target)) {
            showVariableSuggestions.value = false;
        }
    }
};

// 更新光标位置的事件处理函数
const handleSelectionChange = () => {
    const textareaElement = document.querySelector('textarea.prompt-container');
    if (textareaElement) {
        updateCursorPosition(textareaElement as HTMLTextAreaElement);
    }
};

onMounted(() => {
    // 添加全局点击事件监听
    document.addEventListener('click', handleClickOutside);

    // 监听文本区域的选择变化
    const textareaElement = document.querySelector('textarea.prompt-container');
    if (textareaElement) {
        textareaElement.addEventListener('click', handleSelectionChange);
        textareaElement.addEventListener('keyup', handleSelectionChange);
        textareaElement.addEventListener('select', handleSelectionChange);
    }
});

onUnmounted(() => {
    // 移除事件监听
    document.removeEventListener('click', handleClickOutside);

    // 移除文本区域事件监听
    const textareaElement = document.querySelector('textarea.prompt-container');
    if (textareaElement) {
        textareaElement.removeEventListener('click', handleSelectionChange);
        textareaElement.removeEventListener('keyup', handleSelectionChange);
        textareaElement.removeEventListener('select', handleSelectionChange);
    }
});
</script>

<style lang="scss" scoped>
// 自定义样式可以在这里添加</style>