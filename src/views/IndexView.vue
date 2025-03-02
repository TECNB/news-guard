<template>
    <div class="IndexView flex">
        <!-- 仅在大屏幕上显示 sidebar (大于md) -->
        <div class="min-w-52 hidden md:block">
            <Sidebar />
        </div>
        <div class="w-[86%] bg-white rounded-l-3xl">
            <router-view></router-view> 
        </div>
    </div>
</template>

<script setup lang="ts">
import { } from "vue"
import Sidebar from "../components/Sidebar.vue"
</script>

<style lang="scss" scoped>
.IndexView {
    height: 100vh;
    background: #F4F4F6;
}
</style>
