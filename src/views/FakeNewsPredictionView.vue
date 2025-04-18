<template>
  <div class="main-container h-[100%] p-6">
    <!-- 标题栏 -->
    <div class="header-section flex justify-between items-center pb-4 border-b mb-6">
      <div class="flex items-center">
        <div class="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
        <p class="text-xl font-bold text-gray-800">虚假新闻预测</p>
      </div>
      <div class="avatar-container">
        <img class="w-10 h-10 rounded-full object-cover aspect-square shadow-sm border-2 border-green-100"
          src="../assets/images/avatar.png">
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-section mt-5 flex items-center flex-wrap gap-3 mb-6">
      <div v-for="(category, index) in categories" :key="index"
        :class="['category-item w-fit rounded-full px-5 py-2 cursor-pointer transition-all duration-300 ease-in-out', 
          { 'bg-gradient-to-r from-green-400 to-green-500 shadow-md': selectedCategory === category, 
            'bg-gray-100 hover:bg-gray-200': selectedCategory !== category }]"
        @click="handleCategoryChange(category)">
        <p :class="['font-medium text-sm', 
          { 'text-white': selectedCategory === category, 
            'text-gray-600': selectedCategory !== category }]">
          {{ category }}
        </p>
      </div>
      
      <!-- 排序切换按钮 -->
      <div class="sort-dropdown ml-auto">
        <el-dropdown @command="handleSortChange">
          <div class="sort-btn flex justify-center items-center gap-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 cursor-pointer px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
            <el-icon color="#fff">
              <Sort />
            </el-icon>
            <p class="text-nowrap text-white text-sm font-medium">{{ currentSort.label }}</p>
            <el-icon color="#fff">
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="option in sortOptions" :key="option.value" :command="option.value">
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 虚假新闻列表 -->
    <div class="news-content h-[83%] bg-white rounded-xl shadow-sm p-5">
      <div class="Table h-[76%]">
        <!-- 顶部搜索栏 -->
        <div class="tableBar flex justify-between items-center mb-5">
          <div
            class="SearchInput flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center w-full">
              <el-icon :size="18" class="text-gray-400 ml-2">
                <Search />
              </el-icon>
              <input type="text" class="search-input ml-2" placeholder="请输入文字进行搜索" v-model="input"
                @keyup.enter="filterData" />
            </div>
            <div class="!block md:!hidden mr-2" @click="toggleFilter">
              <el-icon :size="18" class="text-gray-500">
                <Operation />
              </el-icon>
            </div>
          </div>
          <div
            class="FilterBox md:!flex items-center cursor-pointer !hidden hover:bg-gray-200 transition-all duration-300"
            @click="toggleFilter">
            <el-icon class="text-gray-500">
              <Operation />
            </el-icon>
            <p class="ml-2 text-gray-600 font-medium">筛选</p>
          </div>
        </div>

        <!-- 筛选选项 -->
        <div class="filter-options flex justify-start items-center gap-8 mb-5 overflow-x-auto pb-2"
          v-if="filterVisible">
          <p v-for="(option, index) in filterOptions" :key="index" :class="[
            'transition-all duration-300 py-2 px-4',
            selectedFilter === option.value
              ? 'text-green-500 bg-green-50 rounded-full shadow-sm cursor-pointer whitespace-nowrap font-medium'
              : 'text-gray-500 cursor-pointer whitespace-nowrap hover:text-green-400'
          ]" @click="selectFilter(option.value)">
            {{ option.label }}
          </p>
        </div>

        <!-- 表格数据 -->
        <el-scrollbar class="custom-scrollbar">
          <el-table :data="tableData" class="tableBox rounded-lg" table-layout="fixed"
            @selection-change="handleSelectionChange" v-loading="loading" :row-style="{ height: '70px' }"
            :header-cell-style="{ backgroundColor: '#f9fafb', color: '#4b5563', fontWeight: 'bold' }">
            <el-table-column prop="date" label="事件日期" min-width="140">
              <template #default="{ row }">
                <span class="text-gray-700">{{ formatDate(row.date) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="headline" label="事件主题" min-width="200">
              <template #default="{ row }">
                <span class="text-gray-800 font-medium">{{ row.headline }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="field" label="分类" min-width="120">
              <template #default="{ row }">
                <div class="w-fit bg-gray-100 rounded-full px-3 py-1.5">
                  <p class="font-medium text-sm text-gray-600">{{ row.field }}</p>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="predicted_fake_headline" label="虚假新闻预测结果" min-width="200">
              <template #default="{ row }">
                <div class="flex items-center">
                  <div class="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <span class="text-gray-700">{{ row.predicted_fake_headline }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button class="view-btn" text type="success" size="small" @click="viewNewsDetail(row.link)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>

        <!-- 分页 -->
        <el-config-provider :locale="zhCn">
          <el-pagination class="pageList" :page-sizes="[10, 20, 30]" :page-size="pageSize"
            :layout="isMediumScreen ? 'total, sizes, prev, pager, next, jumper' : 'sizes, prev, pager, next'"
            :total="counts" v-model:current-page="page" @size-change="handleSizeChange"
            @current-change="handleCurrentChange">
          </el-pagination>
        </el-config-provider>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from "vue"
import { showHotNews } from '../api/fakeNewsPrediction';
import { ArrowDown, Sort } from '@element-plus/icons-vue';

// 定义数据类型接口
interface NewsItem {
  date: string;
  headline: string;
  field: string;
  predicted_fake_headline: string;
  link: string;
  [key: string]: any; // 允许其他可能的属性
}

const categories = ref<string[]>(['最新', '政治', '财经', '社会', '文化', '科技', '体育', '健康', '教育', '娱乐', '国际', '环境', '旅游'])
const selectedCategory = ref<string>('最新')

// ElConfigProvider 组件
import { ElConfigProvider } from 'element-plus';
// 引入中文包
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import router from '../router/index';

const props = defineProps(['dateOrder', 'typeOrder']);
const emits = defineEmits(["selectionChange"]);

const selectedIds = ref<string[]>([]);
const filterOptions = [
  { label: '活动地点名称', value: 'name' },
  { label: '创建时间', value: 'createdAt' },
];
const selectedFilter = ref('name');  // 默认筛选条件
const filterVisible = ref(false);

const input = ref('');
// 明确指定tableData和allData的类型
const tableData = ref<NewsItem[]>([]);
const allData = ref<NewsItem[]>([]);

const pageSize = ref(10);
const counts = ref(0);
const page = ref(1);

// 是否搜索
const isSearch = ref(false)

let loading = ref(false);

// 定义是否处于中等屏幕以上的状态
const isMediumScreen = ref(false);

// 更新屏幕宽度的响应式逻辑
const updateScreenSize = () => {
  isMediumScreen.value = window.innerWidth >= 768;
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenSize); // 组件卸载时移除监听器
});

onMounted(async () => {
  await fetchTableData();
  updateScreenSize(); // 初始化时检查屏幕大小
  window.addEventListener("resize", updateScreenSize); // 监听窗口变化
});

const fetchTableData = async () => {
  loading.value = true;
  console.log('page', page.value)
  const data = {
    page: page.value,
    size: pageSize.value,
  };
  try {
    const res = await showHotNews(data);
    loading.value = false;
    allData.value = res.data.records;
    counts.value = res.data.total;

    console.log('allData', allData.value)
    
    // 获取数据后根据当前选中的分类筛选
    filterDataByCategory();
    
    console.log('tableData', tableData.value)
  } catch (error) {
    loading.value = false;
    console.error('获取数据失败:', error);
  }
};

const toggleFilter = () => {
  filterVisible.value = !filterVisible.value;
};

// 选择筛选项
const selectFilter = (value: string) => {
  selectedFilter.value = value;
};

// 搜索并筛选数据
const filterData = async () => {
  // if (!selectedFilter.value || !input.value.trim()) {
  //     await fetchTableData();
  //     return;
  // }

  // loading.value = true;
  // try {
  //     const res = await searchActivityPlace({
  //         filterField: selectedFilter.value,
  //         filterValue: input.value.trim(),
  //         page: page.value,
  //         size: pageSize.value
  //     });
  //     loading.value = false;
  //     tableData.value = res.data.records;
  //     counts.value = res.data.total;
  //     isSearch.value = true;
  // } catch (error) {
  //     loading.value = false;
  //     console.error('搜索数据失败:', error);
  // }
};

const deletion = async (id: number) => {
  // try {
  //     await ElMessageBox.confirm('确定删除该活动吗？', '提示', {
  //         confirmButtonText: '确定',
  //         cancelButtonText: '取消',
  //         type: 'warning',
  //     });

  //     await deleteActivityPlace({ id });
  //     ElMessage.success('删除成功');
  //     await fetchTableData(); // 刷新数据
  // } catch (error) {
  //     console.error(error);
  //     ElMessage.error('删除失败');
  // }
};

// 根据分类筛选数据
const filterDataByCategory = () => {
  let filteredData = [];
  
  if (selectedCategory.value === '最新') {
    // 对于"最新"分类，直接使用后端返回的当前页数据
    tableData.value = [...allData.value];
    // 总条数已经在fetchTableData中设置，不需要修改
  } else {
    // 否则按照所选分类筛选数据
    filteredData = [...allData.value].filter(item => item.field === selectedCategory.value);
    // 更新总条数
    counts.value = filteredData.length;
    
    // 手动进行分页计算
    const startIndex = (page.value - 1) * pageSize.value;
    const endIndex = Math.min(startIndex + pageSize.value, filteredData.length);
    
    // 应用分页
    tableData.value = filteredData.slice(startIndex, endIndex);
  }
  
  // 应用当前排序
  applySorting();
};

// 处理每页显示数量变化逻辑
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  
  if (selectedCategory.value === '最新') {
    // 对于"最新"分类，使用后端分页
    page.value = 1; // 改变页面大小时重置为第一页
    fetchTableData();
  } else {
    // 对于其他分类，使用前端分页
    filterDataByCategory();
  }
};

// 处理当前页变化逻辑
const handleCurrentChange = (val: number) => {
  page.value = val;
  
  if (selectedCategory.value === '最新') {
    // 对于"最新"分类，使用后端分页
    fetchTableData();
  } else {
    // 对于其他分类，使用前端分页
    // 判断是否需要加载更多数据
    const totalItems = page.value * pageSize.value;
    
    if (totalItems > allData.value.length && !isAllDataLoaded) {
      // 需要加载更多数据
      loadAllCategoryData();
    } else {
      // 使用现有数据进行前端分页
      filterDataByCategory();
    }
  }
};

// 添加新的变量跟踪是否已加载所有数据
const isAllDataLoaded = ref(false);

// 加载特定分类的所有数据
const loadAllCategoryData = async () => {
  loading.value = true;
  
  try {
    // 这里假设你有一个API可以一次性获取所有数据
    // 如果没有，可能需要循环请求多页数据并合并
    const data = {
      page: 1,
      size: 1000, // 使用一个很大的数字来获取所有数据
    };
    
    const res = await showHotNews(data);
    loading.value = false;
    
    // 存储所有数据
    allData.value = res.data.records;
    isAllDataLoaded.value = true;
    
    // 应用分类筛选和分页
    filterDataByCategory();
  } catch (error) {
    loading.value = false;
    console.error('获取所有数据失败:', error);
  }
};

// 处理分类变化
const handleCategoryChange = (category: string) => {
  selectedCategory.value = category;
  // 切换分类时重置到第一页
  page.value = 1;
  
  if (category === '最新') {
    // 如果切换到"最新"分类，使用后端分页
    fetchTableData();
  } else {
    // 如果切换到其他分类，检查是否需要加载所有数据
    if (!isAllDataLoaded) {
      loadAllCategoryData();
    } else {
      // 使用现有数据进行筛选
      filterDataByCategory();
    }
  }
};

// 排序选项
const sortOptions = [
  { label: '最新优先', value: 'newest' },
  { label: '最早优先', value: 'oldest' }
];
const currentSort = ref(sortOptions[0]);

// 处理排序变化
const handleSortChange = (command: string) => {
  const selected = sortOptions.find(option => option.value === command);
  if (selected) {
    currentSort.value = selected;
    applySorting();
  }
};

// 应用排序逻辑
const applySorting = () => {
  if (currentSort.value.value === 'newest') {
    tableData.value.sort((a, b) => parseNewsDate(b.date) - parseNewsDate(a.date));
  } else {
    tableData.value.sort((a, b) => parseNewsDate(a.date) - parseNewsDate(b.date));
  }
};

// 修改查看新闻详情的函数
const viewNewsDetail = (link: string) => {
  // 外部链接，使用window.open在新标签打开
  window.open(link, '_blank');
}

// 格式化日期，将日期显示为2025年格式
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';

  // 假设row.date格式为"04-07 07:05"
  const [datePart, timePart] = dateStr.split(' ');
  const [month, day] = datePart.split('-');

  // 使用2025年和原始的月日时间
  return `2025/${month}/${day} ${timePart}:00`;
};

// 解析新闻日期为可比较的时间戳
const parseNewsDate = (dateStr: string): number => {
  if (!dateStr) return 0;
  
  // 假设row.date格式为"04-07 07:05"
  const [datePart, timePart] = dateStr.split(' ');
  const [month, day] = datePart.split('-');
  
  // 使用2025年作为基准年份
  const date = new Date(2025, parseInt(month) - 1, parseInt(day));
  
  if (timePart) {
    const [hour, minute] = timePart.split(':');
    date.setHours(parseInt(hour), parseInt(minute), 0, 0);
  }
  
  return date.getTime();
};

const handleSelectionChange = (selection: any[]) => {
  // 提取选中的 ID
  selectedIds.value = selection.map((item) => item.id);
  emits("selectionChange", selectedIds.value);
};
</script>

<style lang="scss" scoped>
.main-container {
  background-color: #f9fafb;
  border-radius: 12px;
}

.category-item {
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-2px);
  }
}

.SearchInput {
  flex: 1;
  background-color: rgba(250, 250, 250, 1);
  border: 1px solid #f0f0f0;
  border-radius: 40px;
  padding: 10px 16px;
  margin-bottom: 10px;

  input.search-input {
    outline: none;
    padding-left: 10px;
    font-size: 15px;
    width: 100%;
    border: 0px;
    color: #4b5563;
    background-color: transparent;

    &::placeholder {
      color: #9ca3af;
    }
  }
}

.FilterBox {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  color: #6b7280;
  background-color: rgba(250, 250, 250, 1);
  border: 1px solid #f0f0f0;
  border-radius: 40px;
  padding: 10px 16px;
  margin-bottom: 10px;
}

.tableBox {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;

  // 添加表格行悬停效果
  :deep(.el-table__row) {
    transition: all 0.2s;

    &:hover {
      background-color: #f0fdf4 !important;
    }
  }

  // 调整表格内边距
  :deep(.el-table__cell) {
    padding: 12px 16px;
  }
}

.view-btn {
  &:deep(.el-button) {
    background: linear-gradient(to right, #10b981, #059669);
    color: white;
    border-radius: 20px;
    font-weight: 500;
    padding: 6px 16px;
    transition: all 0.3s;

    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  }
}

.pageList {
  text-align: center;
  margin-top: 30px;

  :deep(.el-pagination__sizes) {
    margin-right: 15px;
  }

  :deep(.el-pagination button) {
    background-color: white;
    border-radius: 8px;
    margin: 0 3px;
  }

  :deep(.el-pager li) {
    border-radius: 8px;
    margin: 0 3px;

    &.is-active {
      background: linear-gradient(to right, #10b981, #059669);
      color: white;
    }
  }
}

.custom-scrollbar {
  :deep(.el-scrollbar__bar) {
    opacity: 0.4;

    &:hover {
      opacity: 0.8;
    }
  }
}

:deep(.el-checkbox__inner) {
  width: 19px;
  height: 19px;
  border-radius: 22.5px;
  border-color: #d1d5db;
  transition: all 0.3s;

  &:hover {
    border-color: #10b981;
  }
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: linear-gradient(to right, #10b981, #059669);
  border-color: #10b981;
}

:deep(.el-checkbox__inner::after) {
  border: 1px solid #fff;
  border-left: 0;
  border-top: 0;
  left: 7px;
  top: 4px;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  transform: rotate(50deg) scaleY(1.5);
}

.filter-options {
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #10b981;
  }
}

.sort-btn {
  &:hover {
    transform: translateY(-2px);
    border: none !important;
    outline: none !important;
  }
}

:deep(.el-dropdown-menu__item) {
  &:hover, &:focus {
    color: #49CFAD !important;
    background-color: rgba(73, 207, 173, 0.1) !important;
  }
  
  &.is-active {
    color: #49CFAD !important;
  }
}

:deep(.el-dropdown) {
  .sort-btn {
    border: none !important;
    outline: none !important;
    
    &:hover, &:focus, &:active {
      border: none !important;
      outline: none !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
