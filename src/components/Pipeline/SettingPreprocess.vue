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


        <div class="flex flex-col gap-4 mt-4" v-if="activeIndex == 0">
          <p class="text-text-200">缺失值处理</p>
          <el-select v-model="formName1" placeholder="请点击选择处理方式" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in missingMethods" :key="index" :label="text" :value="text" />
          </el-select>
          <p class="text-text-200">重复数据处理</p>

          <el-select v-model="formName2" placeholder="请点击选择处理方式" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in repeatMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <p class="text-text-200">异常值处理</p>

          <el-select v-model="selectedConnectionMethod" placeholder="请点击选择处理方式" size="large" clearable
            :teleported="false" style="width: 360px;">
            <el-option v-for="(method, index) in unusualnMethods" :key="index" :label="method" :value="method" />
          </el-select>
        </div>
        <div class="flex flex-col gap-4 mt-4" v-if="activeIndex == 1">
          <p class="text-text-200">字段类型转换</p>
          <el-select v-model="formName1" placeholder="请点击选择字段" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in missingMethods" :key="index" :label="text" :value="text" />
          </el-select>
          <p class="text-text-200">字段格式化</p>

          <el-select v-model="formName2" placeholder="请点击选择字段" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(text, index) in repeatMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <p class="text-text-200">字段重命名</p>

          <el-select v-model="selectedConnectionMethod" placeholder="请点击选择字段" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(method, index) in unusualnMethods" :key="index" :label="method" :value="method" />
          </el-select>

          <p class="text-text-200">计算衍生字段</p>

          <el-select v-model="selectedConnectionMethod" placeholder="请点击选择字段" size="large" clearable :teleported="false"
            style="width: 360px;">
            <el-option v-for="(method, index) in unusualnMethods" :key="index" :label="method" :value="method" />
          </el-select>
        </div>
        <div class="flex flex-col gap-4 " v-if="activeIndex == 4">
          <div class="code-container">
            <el-scrollbar height="100%" wrap-style="width:100%;" class="scrollbar-container">
              <pre class="code-block fixed-size rounded-l-2xl  bg-write">
          <code v-html="highlightedCode"></code>
        </pre>
            </el-scrollbar>
          </div>
          <!-- <p class="text-text-200">缺失值处理</p>
          <el-select v-model="formName1" placeholder="请点击选择处理方式" size="large" clearable :teleported="false"
              style="width: 360px;">
              <el-option v-for="(text, index) in missingMethods" :key="index" :label="text" :value="text" />
          </el-select>
          <p class="text-text-200">重复数据处理</p>

          <el-select v-model="formName2" placeholder="请点击选择分类" size="large" clearable :teleported="false"
              style="width: 360px;">
              <el-option v-for="(text, index) in repeatMethods" :key="index" :label="text" :value="text" />
          </el-select>

          <p class="text-text-200">异常值处理</p>

          <el-select v-model="selectedConnectionMethod" placeholder="请点击选择连接方式" size="large" clearable
              :teleported="false" style="width: 360px;">
              <el-option v-for="(method, index) in unusualnMethods" :key="index" :label="method"
                  :value="method" />
          </el-select> -->
        </div>


      </div>

    </el-scrollbar>
    <div class="w-full flex justify-between items-center absolute bottom-3 border-t pt-3 -mx-5 px-5">
      <div class="flex flex-1 justify-start items-center gap-3">
        <p class="text-text-300 text-sm">新数据源会稍后加入您的表格</p>
      </div>
      <div class="">
        <div class="bg-text-100 rounded-xl cursor-pointer py-3 px-8" @click="toggleVisibility">
          <p class="text-white font-bold">确认配置</p>
        </div>
      </div>

      <div class="flex flex-1 justify-end items-center">
        <div class="flex justify-between items-center gap-3 cursor-pointer rounded-xl hover:bg-gray-200 transition p-2">
          <i class="fa-regular fa-arrow-rotate-right" style="color: #999;"></i>
          <p class="text-text-300">恢复默认值</p>
        </div>
        <div class="">
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElScrollbar } from "element-plus";
// import {getHighlighter} from 'shiki';

// import chatPreprocess from "../constant/chatPreprocess.ts";
const props = defineProps(['ifShow']);
const emit = defineEmits();

let formName1 = ref('')
let formName2 = ref('')
const highlightedCode = ref('');
onMounted(async () => {
  // try {
  //   // 加载高亮器并确认是否支持 SQL
  //   const highlighter = await getHighlighter({
  //     themes: ['light-plus'], // 使用 light-plus 主题
  //     langs: ['sql'],   // 确认 SQL 支持
  //   });

  //   // 使用高亮器进行基础高亮
  //   let highlightedHtml = highlighter.codeToHtml(chatPreprocess, { lang: 'sql', theme: 'light-plus' });

  //   // 处理行号的生成与显示
  //   const lines = highlightedHtml.split('\n');
  //   const numberedHtml = lines.map((line, index) => {
  //     return `<span class="line-number text-gray-400">${index + 1}</span> ${line}`;
  //   }).join('\n');

  //   // 将高亮和带行号的代码嵌入到页面
  //   highlightedCode.value = `<pre>${numberedHtml}</pre>`;

  // } catch (error) {
  //   // 捕获错误并显示日志
  //   console.error('高亮失败:', error);
  //   highlightedCode.value = `<pre>代码高亮失败，请检查配置。</pre>`;
  // }
});



// 数据项
const steps = [
  { label: '数据清洗', icon: 'fa-regular fa-broom' },
  { label: '数据转换', icon: 'fa-regular fa-reflect-horizontal' },
  { label: '数据筛选', icon: 'fa-regular fa-filters' },
  { label: '排序与汇总', icon: 'fa-regular fa-bars-sort' },
  { label: '自定义', icon: 'fa-regular fa-wrench' }
];

// 选中项的 index
const activeIndex = ref<number | null>(0);

// 设置选中项
const setActiveIndex = (index: number) => {
  activeIndex.value = index;
};

// 自定义连接方式数组
const missingMethods = [
  '填充',
  '删除',
  '平均值填充',
];

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

// 选择的连接方式
const selectedConnectionMethod = ref<string>('');

const toggleVisibility = () => {
  emit('updateIfShow', false);
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
