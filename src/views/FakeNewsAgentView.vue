<template>
    <div class="fake-news-agent-view h-screen flex flex-col">
        <!-- 工具栏 -->
        <WorkflowToolbar 
            :scale="scale"
            @zoom-in="handleZoomIn"
            @zoom-out="handleZoomOut"
            @reset-zoom="handleResetZoom"
            @save="saveWorkflow"
            @run="runWorkflow"
            @debug="debugWorkflow"
            @publish="publishWorkflow"
        />
        
        <!-- 主要内容区域 -->
        <div class="flex-1 flex overflow-hidden">
            <!-- 工作流画布 -->
            <div class="flex-1 overflow-hidden">
                <WorkflowCanvas 
                    ref="canvasRef"
                    @node-selected="handleNodeSelected"
                    @node-deselected="handleNodeDeselected"
                    @scale-change="handleScaleChange"
                />
            </div>
            
            <!-- 属性编辑器 -->
            <div class="w-80 h-full" v-if="selectedNode">
                <PropertyEditor 
                    :node="selectedNode"
                    @update:node="updateNode"
                    @save="handlePropertySave"
                    @close="handleNodeDeselected"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import WorkflowToolbar from '../components/Workflow/WorkflowToolbar.vue';
import WorkflowCanvas from '../components/Workflow/WorkflowCanvas.vue';
import PropertyEditor from '../components/Workflow/PropertyEditor.vue';
import { Node, Edge, Workflow } from '../types/workflow';

// 定义Canvas组件引用类型
interface CanvasRef {
  scale: number;
  setScale: (scale: number) => void;
  getScale: () => number;
  updateNode: (node: Node) => void;
  getWorkflow: () => {nodes: Node[], edges: Edge[]};
}

// 画布引用
const canvasRef = ref<CanvasRef | null>(null);

// 状态
const scale = ref(1);
const selectedNode = ref<Node | null>(null);

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

// 节点选择处理
const handleNodeSelected = (node: Node) => {
    selectedNode.value = node;
};

const handleNodeDeselected = () => {
    selectedNode.value = null;
};

// 更新节点
const updateNode = (node: Node) => {
    selectedNode.value = node;
    if (canvasRef.value) {
        canvasRef.value.updateNode(node);
    }
};

// 属性保存处理
const handlePropertySave = (node: Node) => {
    if (canvasRef.value) {
        canvasRef.value.updateNode(node);
    }
    // 可能需要保存到后端或本地存储
};

// 工作流操作
const saveWorkflow = () => {
    if (canvasRef.value) {
        const workflow = canvasRef.value.getWorkflow();
        console.log('保存工作流:', workflow);
        // TODO: 实现保存工作流的逻辑
    }
};

const runWorkflow = () => {
    console.log('运行工作流');
    // TODO: 实现运行工作流的逻辑
};

const debugWorkflow = () => {
    console.log('调试工作流');
    // TODO: 实现调试工作流的逻辑
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