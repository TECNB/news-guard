<template>
    <div class="fake-news-agent-view h-screen flex flex-col">
        <!-- 工具栏 -->
        <WorkflowToolbar :scale="scale" @zoom-in="handleZoomIn" @zoom-out="handleZoomOut" @reset-zoom="handleResetZoom"
            @save="saveWorkflow" @run="runWorkflow" @reset="resetWorkflow" @publish="publishWorkflow" />

        <!-- 主要内容区域 -->
        <div class="flex-1 flex overflow-hidden">
            <!-- 工作流画布 -->
            <div class="flex-1 overflow-hidden">
                <WorkflowCanvas ref="canvasRef" @scale-change="handleScaleChange" />
            </div>

            <!-- 属性编辑器 - 直接条件渲染，无需传递props -->
            <div class="w-96 h-full" v-if="selectedNodeId !== null">
                <PropertyEditor />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import WorkflowToolbar from '../components/Workflow/WorkflowToolbar.vue';
import WorkflowCanvas from '../components/Workflow/WorkflowCanvas.vue';
import PropertyEditor from '../components/Workflow/PropertyEditor.vue';
import { useWorkflowStore } from '../stores/workflowStore';

// 定义Canvas组件引用类型
interface CanvasRef {
    scale: number;
    setScale: (scale: number) => void;
    getScale: () => number;
    openRunPanel: () => void;
}

// 画布引用
const canvasRef = ref<CanvasRef | null>(null);

// 状态
const scale = ref(1);

// 获取工作流 store
const workflowStore = useWorkflowStore();

// 直接从store获取选中的节点ID用于条件渲染
const selectedNodeId = computed(() => workflowStore.selectedNodeId);

// 缩放处理
const handleZoomIn = () => {
    if (canvasRef.value) {
        canvasRef.value.setScale(Math.min(2, scale.value + 0.1));
        scale.value = canvasRef.value.getScale();
    }
};

const handleZoomOut = () => {
    if (canvasRef.value) {
        canvasRef.value.setScale(Math.max(0.5, scale.value - 0.1));
        scale.value = canvasRef.value.getScale();
    }
};

const handleResetZoom = () => {
    if (canvasRef.value) {
        canvasRef.value.setScale(1);
        scale.value = 1;
    }
};

// 处理画布缩放变化
const handleScaleChange = (newScale: number) => {
    scale.value = newScale;
};

// 工作流操作
const saveWorkflow = () => {
    // 直接使用store中的数据
    const workflowData = workflowStore.workflow;
    console.log('保存工作流:', workflowData);
    // 保存逻辑...
};

// 运行工作流
const runWorkflow = () => {
    console.log('运行工作流');
    // 调用子组件方法打开运行面板
    canvasRef.value?.openRunPanel();
};

const resetWorkflow = () => {
    console.log('重置工作流');
    // 调用workflowStore的resetWorkflow方法
    workflowStore.resetWorkflow();
};

const publishWorkflow = () => {
    console.log('发布工作流');
    // TODO: 实现发布工作流的逻辑
};

// 生命周期钩子
onMounted(() => {
    // 可能需要从后端或本地存储加载工作流
});
</script>

<style lang="scss" scoped>
.fake-news-agent-view {
    /* Tailwind已经提供了大部分样式，这里可以添加自定义样式 */
}
</style>