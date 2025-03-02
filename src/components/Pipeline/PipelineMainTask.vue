<template>
  <div class="PipelineMainTask -translate-x-5 relative">
    <!-- 串行任务部分 -->
    <div v-if="serialTasks.length > 0" class="container relative flex flex-col">
      <!-- 遍历串行任务并渲染 -->
      <div v-for="(task, taskIndex) in serialTasks" :key="taskIndex" :class="[
        'relative flex flex-col bg-white p-3 border-4 border-transparent cursor-pointer rounded-xl shadow-lg',
        taskIndex !== serialTasks.length - 1 ? 'mb-5' : ''
      ]">
        <div class="text-left">
          <p class="font-bold">{{ task.title }}</p>
        </div>
        <!-- 串行任务连线 -->
        <div class="h-5 absolute left-5 -bottom-6 border border-gray-400 border-l-[3px]"
          v-if="taskIndex !== serialTasks.length - 1">
        </div>
      </div>

      <!-- 串行任务到并行任务的连线 -->
      <template v-if="parallelTasks.length > 0">
        <div
          class="h-14 w-4 absolute -right-[29px] top-7 border-gray-400 border-l-[3px] border-t-[3px] rounded-tl-2xl -z-10">
        </div>
        <div
          class="h-14 w-4 absolute -left-[29px] top-7 border-gray-400 border-r-[3px] border-t-[3px] rounded-tr-2xl -z-10">
        </div>
        <!-- 并行任务右侧连线 -->
        <div :class="[
          'w-4 absolute -right-4 border-gray-400 border-r-[3px] border-b-[3px] rounded-br-2xl -z-10',

        ]" :style="{
          top: `${56 + (serialTasks.length - 1) * 14}px`,
          height: `${68 + (serialTasks.length - 1) * 60}px`
        }">
        </div>

        <!-- 并行任务左侧连线 -->
        <div :class="[
          'w-4 absolute -left-4 border-gray-400 border-l-[3px] border-b-[3px] rounded-bl-2xl -z-10'
        ]" :style="{
          top: `${56 + (serialTasks.length - 1) * 14}px`,
          height: `${68 + (serialTasks.length - 1) * 60}px`
        }">
        </div>
      </template>

      <!-- 添加串行任务按钮（位于最后一个串行任务下方） -->
      <div v-if="serialTasks.length > 0"
        class="w-4 h-4 absolute left-28 -bottom-3 flex justify-center items-center rounded-xl bg-white shadow-[0_2px_6px_0_rgba(37,43,58,0.4)] cursor-pointer"
        @click="handleSerialTaskAdd">
        <i class="fa-regular fa-plus fa-2xs"></i>
      </div>
    </div>

    <!-- 并行任务部分 -->
    <div v-if="parallelTasks.length > 0" class="relative" :class="{ 'mt-10': serialTasks.length > 0 }">
      <!-- 并行任务圆角连接线 - 只有在没有串行任务且并行任务大于1个时才显示 -->
      <template v-if="parallelTasks.length >= 2 && serialTasks.length === 0">
        <div
          class="h-14 w-4 absolute -right-[29px] top-7 border-gray-400 border-l-[3px] border-t-[3px] rounded-tl-2xl -z-10">
        </div>
        <div
          class="h-14 w-4 absolute -left-[29px] top-7 border-gray-400 border-r-[3px] border-t-[3px] rounded-tr-2xl -z-10">
        </div>
      </template>

      <div v-for="(task, taskIndex) in parallelTasks" :key="taskIndex"
        class="relative flex flex-col bg-white p-3 border-4 border-transparent cursor-pointer rounded-xl shadow-lg mb-5">
        <div class="text-left">
          <p class="font-bold">{{ task.title }}</p>
        </div>

        <!-- 并行任务右侧连线 -->
        <div v-if="taskIndex !== parallelTasks.length - 1 && serialTasks==0" :class="[
          'w-4 absolute -right-5 border-gray-400 border-r-[3px] border-b-[3px] rounded-br-2xl -z-10',
          taskIndex === 0 ? 'h-[68px] top-10' : `h-[85px] bottom-${24 + (parallelTasks.length - taskIndex - 2) * 85}px`
        ]">
        </div>
        <!-- 并行任务左侧连线 -->
        <div v-if="taskIndex !== parallelTasks.length - 1 && serialTasks!=0" :class="[
          'w-4 absolute -right-5 border-gray-400 border-r-[3px] border-b-[3px] rounded-br-2xl -z-10',
          taskIndex === 0 ? 'h-[95px] top-[5px]' : `h-[85px] bottom-${24 + (parallelTasks.length - taskIndex - 2) * 85}px`
        ]">
        </div>

        <!-- 并行任务左侧连线 -->
        <div v-if="taskIndex !== parallelTasks.length - 1 && serialTasks==0" :class="[
          'w-4 absolute -left-5 border-gray-400 border-l-[3px] border-b-[3px] rounded-bl-2xl -z-10',
          taskIndex === 0 ? 'h-[68px] top-10' : `h-[85px] bottom-${24 + (parallelTasks.length - taskIndex - 2) * 85}px`
        ]">
        </div>
        <!-- 并行任务左侧连线 -->
        <div v-if="taskIndex !== parallelTasks.length - 1 && serialTasks!=0" :class="[
          'w-4 absolute -left-5 border-gray-400 border-l-[3px] border-b-[3px] rounded-bl-2xl -z-10',
          taskIndex === 0 ? 'h-[95px] top-[5px]' : `h-[85px] bottom-${24 + (parallelTasks.length - taskIndex - 2) * 85}px`
        ]">
        </div>
        
      </div>
    </div>

    <!-- 并行任务添加按钮（始终位于最后） -->
    <div
      class="relative flex flex-col bg-white p-2 border-4 border-transparent cursor-pointer rounded-xl shadow-md mt-5 hover:shadow-lg"
      @click="handleParallelTaskAdd">
      <!-- 并行任务的左并行连线 -->
      <div
        class="h-[120px] w-6 absolute -left-5 bottom-5 border-gray-400 border-l-[3px] border-b-[3px] border-dashed rounded-bl-2xl -z-10">
      </div>
      <!-- 并行任务的右并行连线 -->
      <div
        class="h-[120px] w-6 absolute -right-5 bottom-5 border-gray-400 border-r-[3px] border-b-[3px] border-dashed rounded-br-2xl -z-10">
      </div>

      <div class="flex justify-center items-center gap-2">
        <i class="fa-regular fa-plus"></i>
        <p class="font-bold opacity-100">并行任务</p>
      </div>
    </div>

    <!-- 过程连线 -->
    <div class="w-11 absolute -left-11 top-6 border border-gray-400 border-b-[3px]"></div>
    <div class="w-11 absolute -right-11 top-6 border border-gray-400 border-b-[3px]"></div>
  </div>
</template>

<script setup lang="ts">
import { } from "vue"

const props = defineProps(['tasks']);
const emit = defineEmits(['show', 'taskType']); // 添加 addSerialTask 事件
const show = (index: number) => {
  console.log(index)
  emit('show', index)
}
// 判断任务是否为串行任务（即是否全部子任务为串行）
const serialTasks = props.tasks.subTasks.filter((task: any) => task.type === 'serial');
const parallelTasks = props.tasks.subTasks.filter((task: any) => task.type === 'parallel');

// 方法：根据外层的 title 设置动态参数
const handleParallelTaskAdd = () => {
  let taskId;
  switch (props.tasks.title) {
    case '新闻预处理':
      taskId = 2;
      break;
    case '虚假新闻检测':
      taskId = 3;
      break;
    case '报告生成':
      taskId = 4;
      break;
    default:
      taskId = 1; // 默认值，可以根据需要调整
  }
  show(taskId);

  // 触发事件并将新任务传递给父组件
  emit('taskType', "parallel");
};

// 方法：处理串行任务添加按钮点击事件
const handleSerialTaskAdd = () => {
  console.log('添加串行任务');
  let taskId;
  switch (props.tasks.title) {
    case '新闻预处理':
      taskId = 2;
      break;
    case '虚假新闻检测':
      taskId = 3;
      break;
    case '报告生成':
      taskId = 4;
      break;
    default:
      taskId = 1; // 默认值，可以根据需要调整
  }
  show(taskId);

  // 触发事件并将新任务传递给父组件
  emit('taskType', "serial");
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  margin-bottom: 20px;
}

.container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  /* 保持与外层 div 一样的圆角 */
  background-color: gray;
  opacity: 0.15;
  /* 外层背景颜色 */
  z-index: -1;
  /* 确保不影响内部内容 */
  transform: translate(-10px, -10px);
  /* 移动伪元素的大小 */
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  border-radius: 12px;
}
</style>
