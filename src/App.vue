<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
</script>

<template>
  <el-config-provider :z-index="3000">
    <router-view></router-view>
  </el-config-provider>
</template>

<style lang="scss" scoped></style>
