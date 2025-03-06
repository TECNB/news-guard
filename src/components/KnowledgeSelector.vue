<template>
    <div class="relative" @mouseleave="showDropdown = false">
        <div class="flex items-center gap-2 cursor-pointer mt-5 mx-10" @mouseenter="showDropdown = true">
            <div class="flex items-center gap-2">
                <el-icon class="text-gray-400">
                    <Document />
                </el-icon>
                <div class="flex items-center flex-wrap gap-2">
                    <template v-if="selectedKnowledges.length > 0">
                        <span v-for="knowledge in selectedKnowledges" :key="knowledge" class="text-xl font-bold">
                            {{ knowledge }}<span v-if="selectedKnowledges.indexOf(knowledge) !== selectedKnowledges.length - 1">, </span>
                        </span>
                    </template>
                    <p v-else class="text-xl text-gray-400">选择知识库</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <i class="fa-solid fa-chevron-down"></i>
                <RouterLink to="/knowledge" class="hover:text-gray-600">
                    <i class="fa-solid fa-plus"></i>
                </RouterLink>
            </div>
        </div>

        <!-- Dropdown Menu -->
        <div v-show="showDropdown" 
            class="absolute top-full left-10 mt-0 w-80 bg-white rounded-lg shadow-lg z-50 py-2"
        >
            <!-- Search Box -->
            <div class="px-4">
                <div class="flex items-center gap-2 mb-1">
                    <el-icon class="text-gray-400 text-lg">
                        <Search />
                    </el-icon>
                    <input 
                        v-model="searchQuery" 
                        type="text" 
                        placeholder="搜索知识库..." 
                        class="w-full outline-none text-sm py-3"
                    >
                </div>
                <div class="h-[1px] bg-gray-200"></div>
            </div>

            <!-- Options List -->
            <el-scrollbar height="240px">
                <div class="px-3 py-2">
                    <div
                        v-for="option in filteredOptions"
                        :key="option.id"
                        @click="toggleKnowledge(option.value)"
                        class="flex items-center justify-between rounded-md mt-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        :class="{'bg-gray-100': selectedKnowledges.includes(option.value)}"
                    >
                        <div class="flex items-center gap-2">
                            <el-icon class="text-gray-400">
                                <Document />
                            </el-icon>
                            <span class="text-sm">{{ option.value }}</span>
                        </div>
                        <i v-if="selectedKnowledges.includes(option.value)" class="fa-solid fa-check text-black"></i>
                    </div>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterLink } from 'vue-router';
import { Search, Document } from '@element-plus/icons-vue';
import { getKnowledge } from "../api/knowledge";

// Knowledge base options
const knowledgeOptions = ref<Array<{id: number, value: string}>>([]);

// Fetch knowledge data
const fetchKnowledgeData = async () => {
    try {
        const response = await getKnowledge();
        knowledgeOptions.value = response.data.map((item: any) => ({
            id: item.id,
            value: item.name
        }));
    } catch (error) {
        console.error('Failed to fetch knowledge data:', error);
    }
};

// Fetch data when component mounts
onMounted(fetchKnowledgeData);

// Dropdown state
const showDropdown = ref(false);
const searchQuery = ref('');
const selectedKnowledges = ref<string[]>([]);

// Filter options based on search
const filteredOptions = computed(() => {
    return knowledgeOptions.value.filter(option =>
        option.value.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// Toggle knowledge selection
const toggleKnowledge = (value: string) => {
    const index = selectedKnowledges.value.indexOf(value);
    if (index === -1) {
        selectedKnowledges.value.push(value);
    } else {
        selectedKnowledges.value.splice(index, 1);
    }
    emit('update', selectedKnowledges.value);
};

const emit = defineEmits(['update']);

defineProps<{
    modelValue?: string[];
}>();
</script>
