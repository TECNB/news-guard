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
      </div>

      <!-- 添加串行任务按钮（位于最后一个串行任务下方） -->
      <div v-if="serialTasks.length > 0"
        class="w-4 h-4 absolute left-28 -bottom-3 flex justify-center items-center rounded-xl bg-white shadow-[0_2px_6px_0_rgba(37,43,58,0.4)] cursor-pointer"
        @click="handleSerialTaskAdd">
        <i class="fa-regular fa-plus fa-2xs"></i>
      </div>
    </div>

    <!-- 并行任务部分 -->
    <div v-if="parallelTasks.length > 0">
      <div v-for="(task, taskIndex) in parallelTasks" :key="taskIndex"
        class="relative flex flex-col bg-white p-3 border-4 border-transparent cursor-pointer rounded-xl shadow-lg mb-5">
        <div class="text-left">
          <p class="font-bold">{{ task.title }}</p>
        </div>
      </div>

      <!-- 并行任务添加按钮（始终位于最后） -->
      <div
        class="flex flex-col bg-white p-2 border-4 border-transparent cursor-pointer rounded-xl shadow-md mt-5 hover:shadow-lg"
        @click="handleClick">
        <div class="flex justify-center items-center gap-2">
          <i class="fa-regular fa-plus"></i>
          <p class="font-bold opacity-100">并行任务</p>
        </div>
      </div>
    </div>

    <!-- 过程连线 -->
    <div class="w-11 absolute -left-11 top-6 border border-gray-400 border-b-[3px]">
    </div>
    <div class="w-11 absolute -right-11 top-6 border border-gray-400 border-b-[3px]">
    </div>
  </div>
</template>

<script setup lang="ts">
import { } from "vue"

const props = defineProps(['tasks']);
const emit = defineEmits(['show', 'addSerialTask']); // 添加 addSerialTask 事件
const show = (index: number) => {
  console.log(index)
  emit('show', index)
}
// 判断任务是否为串行任务（即是否全部子任务为串行）
const serialTasks = props.tasks.subTasks.filter((task: any) => task.type === 'serial');
const parallelTasks = props.tasks.subTasks.filter((task: any) => task.type === 'parallel');

// 方法：根据外层的 title 设置动态参数
const handleClick = () => {
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
};

// 方法：处理串行任务添加按钮点击事件
const handleSerialTaskAdd = () => {
  console.log('添加串行任务');
  const newSerialTask = {
    title: '新串行任务',  // 这里可以根据需求动态设置标题
    type: 'serial'
  };

  // 触发事件并将新任务传递给父组件
  emit('addSerialTask', newSerialTask);
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