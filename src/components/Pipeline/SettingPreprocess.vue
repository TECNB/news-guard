<template>
  <div class="SettingPreprocess" v-if="props.ifShow">
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
        <div class="flex justify-start items-center gap-5">
          <div v-for="(item, index) in steps" :key="index" :class="[
            'w-24 h-24 relative flex flex-col justify-center items-center gap-9 rounded-md shadow-[0_2px_6px_0_rgba(37,43,58,0.12)] pt-2 cursor-pointer',
            activeIndex === index ? 'bg-active' : 'bg-inactive'
          ]" @click="setActiveIndex(index)">
            <i :class="[item.icon, 'fa-xl']" :style="activeIndex === index ? '' : 'color: #666;'"></i>
            <p :class="['text-sm', activeIndex === index ? '' : 'text-text-200']">{{ item.label }}</p>
            <div v-if="activeIndex === index" class="absolute top-0 right-1">
              <i class="fa-regular fa-circle-check"></i>
            </div>
          </div>
        </div>

        <!-- 第一个大选项 -->
        <div class="flex flex-col gap-4 mt-4" v-if="activeIndex == 0">
          <p class="text-text-200">特殊字符清理</p>
          <el-select v-model="formNameSpecialChar" placeholder="选择是否去除特殊字符" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in specialCharMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <!-- 停用词处理 -->
          <p class="text-text-200">停用词处理</p>
          <el-select v-model="formNameStopWord" placeholder="选择是否去除停用词" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in stopWordMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <!-- 文本标准化 -->
          <p class="text-text-200">文本标准化</p>
          <el-select v-model="formNameNormalize" placeholder="选择文本标准化处理方式" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in normalizeMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <!-- 数据去重 -->
          <p class="text-text-200">去重处理</p>
          <el-select v-model="formNameDeduplication" placeholder="选择是否去除重复数据" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in deduplicationMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <!-- 文本简化 -->
          <p class="text-text-200">文本简化</p>
          <el-select v-model="formNameSimplification" placeholder="选择是否简化文本" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in simplificationMethods" :key="index" :label="text" :value="text" />
          </el-select>
        </div>

        <!-- 第二个大选项 -->
        <div class="flex flex-col gap-4 mt-4" v-if="activeIndex == 1">
          <!-- 语言转换 -->
          <p class="text-text-200">语言检测与转换</p>
          <el-select v-model="formNameLanguages" placeholder="选择转化方式" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(lang, index) in languages" :key="index" :label="lang" :value="lang" />
          </el-select>

          <!-- 数据格式转换 -->
          <p class="text-text-200">数据格式转换</p>
          <el-select v-model="formNameDataFormat" placeholder="选择数据格式" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(format, index) in dataFormats" :key="index" :label="format" :value="format" />
          </el-select>
        </div>

        <!-- 第三个大选项 -->
        <div class="flex flex-col gap-4 mt-4" v-if="activeIndex == 2">
          <!-- 新闻主题分类 -->
          <p class="text-text-200">新闻主题分类</p>
          <el-select v-model="formNameClassificationModel" placeholder="选择分类模型" size="large" clearable
            :teleported="false" style="width: 360px;">
            <el-option v-for="(model, index) in classificationModels" :key="index" :label="model" :value="model" />
          </el-select>

          <!-- 情感分析 -->
          <p class="text-text-200">情感分析</p>
          <el-select v-model="formNameSentimentAnalysis" placeholder="选择是否启用情感分析" size="large" clearable
            :teleported="false" style="width: 360px;">
            <el-option v-for="(text, index) in sentimentAnalysisMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <!-- 标签生成 -->
          <p class="text-text-200">自动标签生成</p>
          <el-select v-model="formNameLabelGeneration" placeholder="选择是否启用标签生成" size="large" clearable
            :teleported="false" style="width: 360px;">
            <el-option v-for="(text, index) in labelGenerationMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <!-- 人工干预与审查 -->
          <p class="text-text-200">人工干预与审查</p>
          <el-select v-model="formNameManualReview" placeholder="选择是否启用人工审查" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in manualReviewMethods" :key="index" :label="text" :value="text" />
          </el-select>
        </div>

      </div>

    </el-scrollbar>
    <div class="w-full flex justify-between items-center absolute bottom-3 border-t pt-3 -mx-5 px-5">
      <div class="flex flex-1 justify-start items-center">
        <div class="flex justify-between items-center gap-3 cursor-pointer rounded-xl hover:bg-gray-200 transition p-2">
          <i class="fa-regular fa-arrow-rotate-right" style="color: #999;"></i>
          <p class="text-text-300">恢复默认值</p>
        </div>
      </div>

      <div class="bg-black rounded-xl cursor-pointer py-3 px-8" @click="comfirm">
        <p class="text-white font-bold">确认配置</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElScrollbar } from "element-plus";

const props = defineProps(['ifShow', 'taskType']);
const emit = defineEmits(['updateIfShow', 'addTask']);

// 特殊字符去除选项
const formNameSpecialChar = ref<string>('');
// 停用词去除选项
const formNameStopWord = ref<string>('');
// 文本标准化选项
const formNameNormalize = ref<string>('');
// 去重处理选项
const formNameDeduplication = ref<string>('');
// 文本简化选项
const formNameSimplification = ref<string>('');
// 支持的语言列表
const formNameLanguages = ref<string>('');
// 数据格式转换选项
const formNameDataFormat = ref<string>('');
// 新闻分类模型选择
const formNameClassificationModel = ref<string>('');
// 情感分析方法
const formNameSentimentAnalysis = ref<string>('');
// 标签生成方法
const formNameLabelGeneration = ref<string>('');
// 人工审查与干预
const formNameManualReview = ref<string>('');


// 数据项
const steps = [
  { label: '文本清洗', icon: 'fa-regular fa-broom' },
  { label: '数据转换', icon: 'fa-regular fa-reflect-horizontal' },
  { label: '新闻分类', icon: 'fa-regular fa-filters' },
  { label: '排序与汇总', icon: 'fa-regular fa-bars-sort' },
  { label: '自定义', icon: 'fa-regular fa-wrench' }
];

// 选中项的 index
const activeIndex = ref<number | null>(0);

// 设置选中项
const setActiveIndex = (index: number) => {
  activeIndex.value = index;
};

// 特殊字符去除选项
const specialCharMethods = ref<string[]>(['启用无意义特殊字符清理', '保留无意义特殊字符']);

// 停用词去除选项
const stopWordMethods = ref<string[]>(['启用停用词去除', '禁用特停用词清理']);

// 文本标准化选项
const normalizeMethods = ref<string[]>(['统一大小写', '数字格式统一', '日期格式统一']);

// 去重处理选项
const deduplicationMethods = ref<string[]>(['启用去重处理', '禁用去重处理']);

// 文本简化选项
const simplificationMethods = ref<string[]>(['文本简化为标题', '文本提取核心段落']);


// 支持的语言列表（这里只列出部分语言示例）
const languages = ref<string[]>(['中文转英文', '英文转中文']);

// 数据格式转换选项
const dataFormats = ref<string[]>(['JSON', 'CSV', 'XML', 'YAML']);

// 新闻分类模型选择
const classificationModels = ref<string[]>(['启用主题分类', '禁用主题分类']);

// 情感分析方法
const sentimentAnalysisMethods = ref<string[]>(['启用情感分析', '禁用情感分析']);

// 标签生成方法
const labelGenerationMethods = ref<string[]>(['启用标签生成', '禁用标签生成']);

// 人工审查与干预
const manualReviewMethods = ref<string[]>(['启用人工审查', '禁用人工审查']);



const toggleVisibility = () => {
  emit('updateIfShow', false);
};

// 当点击 "检测文字" 按钮时，调用这个函数
const comfirm = () => {
  // 通过 emit 将 text 传递给父组件
  emit('updateIfShow', false);
  console.log('添加串行任务');
  let taskTitle = '';
  if (activeIndex.value === 0) {
    taskTitle = '文本清洗';
  } else if (activeIndex.value === 1) {
    taskTitle = '数据转换';
  } else if (activeIndex.value === 2) {
    taskTitle = '新闻分类';
  } else if (activeIndex.value === 3) {
    taskTitle = '排序与汇总';
  } else {
    taskTitle = '自定义';
  }
  const newTask = {
    title: taskTitle,  // 这里可以根据需求动态设置标题
    type: props.taskType,
    description: formNameSpecialChar.value + ' ' + formNameStopWord.value + ' ' + formNameNormalize.value + ' ' + formNameDeduplication.value + ' ' + formNameSimplification.value + ' ' + formNameLanguages.value + ' ' + formNameDataFormat.value + ' ' + formNameClassificationModel.value + ' ' + formNameSentimentAnalysis.value + ' ' + formNameLabelGeneration.value + ' ' + formNameManualReview.value
  };

  // 触发事件并将新任务传递给父组件
  emit('addTask', newTask);
};

</script>

<style lang="scss" scoped>
.SettingPreprocess {
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

.code-container {
  width: 90%;
  height: 72%;
  margin: 0 10px;
  overflow: hidden;
}

.scrollbar-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
