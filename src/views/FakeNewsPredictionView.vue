<template>
  <div class="FakeNewsPredictionView p-5">
    <div class="flex justify-between items-center pb-3 border-b">
      <p class="text-lg font-bold">虚假新闻预测</p>
      <img class="w-9 h-9 rounded-full object-cover aspect-square" src="../assets/images/avatar.png">
    </div>
    <div class="mt-5 flex justify-between items-center flex-wrap ">
      <div v-for="(category, index) in categories" :key="index"
        :class="['w-fit rounded-lg px-4 py-2 cursor-pointer', { 'bg-green-500': selectedCategory === category, '': selectedCategory !== category }]"
        @click="selectedCategory = category">
        <p
          :class="['font-bold', { 'text-white': selectedCategory === category, 'text-gray-500': selectedCategory !== category }]">
          {{ category }}</p>
      </div>
      <div class="flex justify-center items-center gap-3 rounded-lg bg-green-400 cursor-pointer px-4 py-2">
        <el-icon color="#fff">
          <Document />
        </el-icon>
        <p class="text-nowrap text-white">上传文件</p>
      </div>
    </div>

    <!-- 下面为具体当天的虚假新闻列表 -->
    <div class="Table mt-5">
      <!-- 顶部搜索栏 -->
      <div class="tableBar flex justify-between items-center mb-4">
        <div class="SearchInput flex justify-between items-center">
          <div class="">
            <el-icon :size="16">
              <Search />
            </el-icon>
            <input type="text" class="ml-2" placeholder="请输入文字进行搜索" v-model="input" @keyup.enter="filterData" />
          </div>
          <div class="!block md:!hidden" @click="toggleFilter">
            <el-icon :size="16">
              <Operation />
            </el-icon>
          </div>
        </div>
        <div class="FilterBox md:!flex items-center cursor-pointer !hidden" @click="toggleFilter">
          <el-icon>
            <Operation />
          </el-icon>
          <p class="ml-2">筛选</p>
        </div>
      </div>

      <!-- 筛选选项 -->
      <el-scrollbar>
        <div class="flex justify-start items-center gap-8 mb-5" v-if="filterVisible">
          <p v-for="(option, index) in filterOptions" :key="index" :class="[
            selectedFilter === option.value ? 'text-green-400 p-2 bg-green-50 rounded-md cursor-pointer whitespace-nowrap' : 'text-gray-500 cursor-pointer whitespace-nowrap'
          ]" @click="selectFilter(option.value)">
            {{ option.label }}
          </p>
        </div>
      </el-scrollbar>

      <!-- 表格数据 -->
      <el-scrollbar height="100%">
        <el-table :data="tableData" class="tableBox" table-layout="fixed" @selection-change="handleSelectionChange"
          v-loading="loading" :row-style="{ height: '80px' }">
          <el-table-column prop="createdAt" label="事件日期">
            <template #default="{ row }">
              <span>{{ new Date(row.createdAt).toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="事件主题" />
          <el-table-column prop="category" label="分类" >
            <template #default="{ row }">
              <div class="w-fit bg-gray-100 rounded-md px-2 py-1">
                <p class="font-bold text-gray-500">{{ row.category }}</p>
              </div>
              
            </template>
          </el-table-column>
          <el-table-column prop="prediction" label="虚假新闻预测结果" />


          <el-table-column label="操作" width="200" align="center">
            <template #default="{ row }">
              <el-button text bg type="success" size="small" @click="">
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
          :total="counts" :current-page.sync="page" @size-change="handleSizeChange"
          @current-change="handleCurrentChange"></el-pagination>
      </el-config-provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from "vue"

const categories = ref<string[]>(['最新', '经济', '社会', '文化', '科技', '体育', '健康', '教育', '娱乐', '国际', '政治', '环境', '旅游'])
const selectedCategory = ref<string>('最新')

const searchQuery = ref<string>('')
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
const tableData = ref([
  {
    createdAt: new Date().toISOString(),
    name: '气候变化的经济影响',  // 真实新闻
    prediction: '气候变化背后隐藏的全球经济崩溃危机',  // 转为虚假新闻后的主题
    category: '环境',
  },
  {
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 昨天的时间
    name: '新冠疫苗的最新研究进展',  // 真实新闻
    prediction: '新冠疫苗实际上引发全球大规模死亡事件',  // 转为虚假新闻后的主题
    category: '健康',
  },
  {
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 前天的时间
    name: '科技巨头将在未来五年内实现全自动驾驶',  // 真实新闻
    prediction: '科技巨头隐瞒自动驾驶技术带来的巨大安全隐患',  // 转为虚假新闻后的主题
    category: '科技',
  },
  {
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // 三天前的时间
    name: '全球经济在2025年将出现复苏',  // 真实新闻
    prediction: '2025年全球经济崩溃的警告已被掩盖',  // 转为虚假新闻后的主题
    category: '经济',
  },
  {
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), // 四天前的时间
    name: '某名人捐赠数百万美元支持教育',  // 真实新闻
    prediction: '某名人的捐赠背后隐藏着非法资金转移的真相',  // 转为虚假新闻后的主题
    category: '社会',
  },
]);

const pageSize = ref(10);
const counts = ref(tableData.value.length);
const page = ref(1);
const allData = ref<[]>([]);
const multipleSelection = ref<[]>([])

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

// 通过watch监听props.dateOrder的变化
// watch(() => props.dateOrder, (newVal) => {
//     if (newVal == "日期正序") {
//         tableData.value.sort((a, b) => {
//             return a.createdAt > b.createdAt ? 1 : -1;
//         });
//     } else if (newVal == "日期倒序") {
//         tableData.value.sort((a, b) => {
//             return a.createdAt < b.createdAt ? 1 : -1;
//         });
//     }
// });

onMounted(async () => {
  await fetchTableData();
  updateScreenSize(); // 初始化时检查屏幕大小
  window.addEventListener("resize", updateScreenSize); // 监听窗口变化
});

const fetchTableData = async () => {
  // loading.value = true;
  // const data = {
  //     page: page.value,
  //     size: pageSize.value,
  // };
  // try {
  //     const res = await getAllActivityPlace(data);
  //     loading.value = false;
  //     allData.value = res.data.records;
  //     counts.value = res.data.total;
  //     tableData.value = allData.value;
  // } catch (error) {
  //     loading.value = false;
  //     console.error('获取数据失败:', error);
  // }
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

// 处理每页显示数量变化逻辑
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchTableData();
};

// 处理当前页变化逻辑
const handleCurrentChange = (val: number) => {
  page.value = val;
  if (isSearch) {
    filterData();
  } else {
    fetchTableData();
  }
};

const handleSelectionChange = (selection: any[]) => {
  // 提取选中的 ID
  selectedIds.value = selection.map((item) => item.id);
  emits("selectionChange", selectedIds.value);
};

const toUpdateActivity = (id: string) => {
  console.log('toUpdateActivity')
  router.push('/updatePlace/' + id)
}
</script>

<style lang="scss" scoped>
.el-input {
  border-radius: 12px;
  border: 0.5px solid var(--text-200);
  border: 0;
  background-color: var(--bg-200);

  font-size: 16px;
  font-weight: bold;




  :deep(.el-input__wrapper) {
    border-radius: 12px;
    background-color: #fff;

    padding: 6px;
  }


  :deep(.is-focus) {
    box-shadow: 0 0 0 1px #000
  }
}

:deep(.el-tag) {
  border-radius: 9px;
}

.Table {
  width: auto;
  height: 92%;

  background: #fff;
  border-radius: 16px;

  .tableBar {
    display: flex;
    justify-content: space-between;
    align-content: center;
    gap: 20px;

    /* 输入框样式 */
    .SearchInput {
      flex: 1;

      background-color: rgba(250, 250, 250, 1);
      border-radius: 12px;


      padding: 12px;
      margin-bottom: 10px;

      input {
        outline: none;
        padding-left: 10px;
        font-size: 16px;
        width: 200px;
        /* 调整输入框的宽度 */
        border: 0px;
        color: rgba(160, 174, 192, 1);
        background-color: rgba(250, 250, 250, 1);
      }
    }

    /* 筛选框样式 */
    .FilterBox {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;


      color: rgba(160, 174, 192, 1);
      background-color: rgba(250, 250, 250, 1);
      border-radius: 12px;


      padding: 12px;
      margin-bottom: 10px;
    }
  }
}


.tableBox {
  width: 100%;
  // 表格的外部是否有边框
  // border: solid 2px #f3f4f7;
  border-radius: 2px;
}

.pageList {
  text-align: center;
  margin-top: 30px;
}


:deep(.el-checkbox__inner) {
  width: 19px;
  height: 19px;
  border-radius: 22.5px;
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
</style>
