<template>
  <!-- 连接节点检测层 -->
  <div 
    v-if="visible" 
    class="connection-hitbox-layer absolute inset-0 w-full h-full" 
    style="z-index: 15;"
  >
    <!-- 所有节点的输入连接点检测区域 -->
    <div 
      v-for="node in nodes" 
      :key="`hitbox-${node.id}`"
      :style="{ 
        position: 'absolute', 
        left: `${node.x - 12}px`, 
        top: `${node.y + 28}px`,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        cursor: 'pointer',
        zIndex: 20
      }"
      @mouseup.stop="onHitInput(node.id)"
      v-show="node.id !== sourceNodeId"
      class="connection-hitbox-input opacity-0 transition duration-200 border-2 border-dashed border-transparent hover:opacity-70 hover:scale-110"
    ></div>
    
    <!-- 条件节点的多个输出连接点检测区域 -->
    <template v-for="node in nodes" :key="`conditionals-${node.id}`">
      <template v-if="node.type === 'conditional' && node.id !== sourceNodeId">
        <!-- IF 分支输出连接点 -->
        <div 
          v-if="node.config && node.config.conditions && node.config.conditions.length > 0"
          :style="{ 
            position: 'absolute', 
            left: `${node.x + 240 - 12}px`, 
            top: `${node.y + getIfConnectorPosition(node)}px`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 20
          }"
          @mouseup.stop="onHitOutput(node.id, 'if')"
          class="connection-hitbox-if opacity-0 transition duration-200 border-2 border-dashed border-transparent hover:opacity-70 hover:scale-110 hover:bg-blue-300"
        ></div>
        
        <!-- ELIF 分支输出连接点 -->
        <div 
          v-for="(branch, branchIndex) in node.config?.branches || []"
          :key="`branch-hitbox-${node.id}-${branchIndex}`"
          :style="{ 
            position: 'absolute', 
            left: `${node.x + 240 - 12}px`, 
            top: `${node.y + getElifConnectorPosition(node, branchIndex)}px`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 20
          }"
          @mouseup.stop="onHitOutput(node.id, `elif-${branchIndex}`)"
          class="connection-hitbox-elif opacity-0 transition duration-200 border-2 border-dashed border-transparent hover:opacity-70 hover:scale-110 hover:bg-yellow-300"
        ></div>
        
        <!-- ELSE 分支输出连接点 -->
        <div 
          v-if="hasConditions(node)"
          :style="{ 
            position: 'absolute', 
            left: `${node.x + 240 - 12}px`, 
            top: `${node.y + getElseConnectorPosition(node)}px`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            zIndex: 20
          }"
          @mouseup.stop="onHitOutput(node.id, 'else')"
          class="connection-hitbox-else opacity-0 transition duration-200 border-2 border-dashed border-transparent hover:opacity-70 hover:scale-110 hover:bg-gray-300"
        ></div>
      </template>
    </template>
    
    <!-- 非条件节点的标准输出连接点检测区域 -->
    <div 
      v-for="node in nodes.filter(n => n.type !== 'conditional')" 
      :key="`hitbox-out-${node.id}`"
      :style="{ 
        position: 'absolute', 
        left: `${node.x + 240 - 12}px`, 
        top: `${node.y + 28}px`,
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        cursor: 'pointer',
        zIndex: 20
      }"
      @mouseup.stop="onHitOutput(node.id)"
      v-show="node.id !== sourceNodeId"
      class="connection-hitbox-output opacity-0 transition duration-200 border-2 border-dashed border-transparent hover:opacity-70 hover:scale-110"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { Node } from '../../types/workflow';

// 接收属性
const props = defineProps<{
  nodes: Node[];
  visible: boolean;
  sourceNodeId: string | null;
}>();

// 定义事件
const emit = defineEmits(['hit-input', 'hit-output']);

// 事件处理函数
const onHitInput = (nodeId: string) => {
  emit('hit-input', nodeId);
};

const onHitOutput = (nodeId: string, branchType?: string) => {
  emit('hit-output', nodeId, branchType);
};

// 条件节点连接点位置计算函数
const getIfConnectorPosition = (node: any) => {
  // 基础位置为60px
  return 60;
};

const getElifConnectorPosition = (node: any, branchIndex: number) => {
  // 基础位置
  const basePosition = 35;
  // 计算 IF 分支的空间
  const ifSpace = node.config?.conditions?.length ? 30 + node.config.conditions.length * 20 : 0;
  // 计算之前的 ELIF 分支所占的空间
  const previousElifSpace = branchIndex > 0 ? branchIndex * 50 : 0;
  
  return basePosition + ifSpace + previousElifSpace + 30;
};

const getElseConnectorPosition = (node: any) => {
  // 基础位置
  const basePosition = 40;
  // 计算 IF 分支的空间
  const ifSpace = node.config?.conditions?.length ? 30 + node.config.conditions.length * 20 : 0;
  // 计算所有 ELIF 分支所占的空间
  const elifSpace = node.config?.branches?.length ? node.config.branches.length * 50 : 0;
  
  return basePosition + ifSpace + elifSpace + 30;
};

// 检查节点是否有条件
const hasConditions = (node: any) => {
  return node.type === 'conditional' && 
         node.config && 
         ((node.config.conditions && node.config.conditions.length > 0) ||
          (node.config.branches && node.config.branches.length > 0));
};
</script>

<style scoped>
.connection-hitbox-input:hover {
  background-color: rgba(52, 211, 153, 0.5);
  border-color: rgba(16, 185, 129, 0.8);
}

.connection-hitbox-output:hover {
  background-color: rgba(59, 130, 246, 0.5);
  border-color: rgba(37, 99, 235, 0.8);
}
</style> 