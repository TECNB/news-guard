<template>
    <div class="statistic-view bg-gradient-to-br from-gray-50 to-slate-100 h-auto p-5 overflow-auto">
        <!-- 用户信息区域 - 更紧凑的设计 -->
        <div class="user-info-card w-full flex justify-between items-center bg-white rounded-2xl shadow-lg border-0 p-4 transition-all duration-300 hover:shadow-xl">
            <div class="flex justify-between items-center gap-4">
                <div class="relative">
                    <img class="w-16 h-16 rounded-2xl object-cover aspect-square border-4 border-white shadow-md" 
                        src="../assets/images/avatar.png" alt="用户头像">
                    <div class="absolute -bottom-1 -right-1 bg-[#49CFAD] h-4 w-4 rounded-full border-2 border-white"></div>
                </div>
                <div class="flex flex-col justify-between items-start">
                    <p class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#49CFAD] to-indigo-600">早安，TEC，欢迎使用DeppNews！</p>
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                        <p class="text-gray-600 text-sm">今日热点：雄安集团大规模招聘数万人，请及时关注！</p>
                    </div>
                </div>
            </div>
            <div class="flex justify-between items-center gap-5">
                <div class="flex flex-col justify-between items-center bg-[#49CFAD]/10 rounded-xl p-3 transition-all duration-300 hover:bg-[#49CFAD]/20">
                    <p class="text-gray-600 text-xs">累计检测新闻数</p>
                    <p class="text-2xl font-bold text-[#49CFAD]">203</p>
                </div>
                <div class="flex flex-col justify-between items-center bg-indigo-50 rounded-xl p-3 transition-all duration-300 hover:bg-indigo-100">
                    <p class="text-gray-600 text-xs">今日检测新闻数</p>
                    <p class="text-2xl font-bold text-indigo-600">7</p>
                </div>
            </div>
        </div>

        <!-- 数据概览 - 调整为两行布局，更紧凑 -->
        <div class="mt-4">
            <div class="section-title flex items-center mb-3">
                <div class="w-1.5 h-6 bg-gradient-to-b from-[#49CFAD] to-blue-600 rounded-full mr-2"></div>
                <h2 class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#49CFAD] to-blue-600">数据概览</h2>
                <div class="h-px flex-grow bg-gradient-to-r from-[#49CFAD]/30 to-transparent ml-3 opacity-50"></div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="stat-card bg-white rounded-xl p-4 shadow-md border-0 overflow-hidden relative group">
                    <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div class="pl-2">
                        <p class="text-gray-500 text-xs mb-1">总检测新闻数</p>
                        <p class="text-2xl font-bold text-gray-800 mb-1">203</p>
                        <div class="flex items-center gap-1">
                            <el-icon class="text-red-500" :size="18">
                                <ChatDotRound />
                            </el-icon>
                            <span class="text-xs text-gray-500">全部鉴别结果</span>
                        </div>
                    </div>
                    <div class="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-red-100 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                </div>
                
                <div class="stat-card bg-white rounded-xl p-4 shadow-md border-0 overflow-hidden relative group">
                    <div class="absolute top-0 left-0 w-1 h-full bg-[#49CFAD]"></div>
                    <div class="pl-2">
                        <p class="text-gray-500 text-xs mb-1">真实新闻数量</p>
                        <p class="text-2xl font-bold text-gray-800 mb-1">155</p>
                        <div class="flex items-center gap-1">
                            <el-icon class="text-[#49CFAD]" :size="18">
                                <ChatDotRound />
                            </el-icon>
                            <span class="text-xs text-gray-500">真实可信内容</span>
                        </div>
                    </div>
                    <div class="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-[#49CFAD]/20 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                </div>
                
                <div class="stat-card bg-white rounded-xl p-4 shadow-md border-0 overflow-hidden relative group">
                    <div class="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div class="pl-2">
                        <p class="text-gray-500 text-xs mb-1">伪造新闻数量</p>
                        <p class="text-2xl font-bold text-gray-800 mb-1">48</p>
                        <div class="flex items-center gap-1">
                            <el-icon class="text-purple-500" :size="18">
                                <ChatDotRound />
                            </el-icon>
                            <span class="text-xs text-gray-500">虚假信息警告</span>
                        </div>
                    </div>
                    <div class="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-purple-100 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                </div>
                
                <div class="stat-card bg-white rounded-xl p-4 shadow-md border-0 overflow-hidden relative group">
                    <div class="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                    <div class="pl-2">
                        <p class="text-gray-500 text-xs mb-1">伪造率</p>
                        <p class="text-2xl font-bold text-gray-800 mb-1">23.6%</p>
                        <div class="flex items-center gap-1">
                            <el-icon class="text-yellow-500" :size="18">
                                <ChatDotRound />
                            </el-icon>
                            <span class="text-xs text-gray-500">需重点关注</span>
                        </div>
                    </div>
                    <div class="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-yellow-100 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                </div>
            </div>
        </div>

        <!-- 图表区域 - 高度更小，更紧凑的布局 -->
        <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="section-title flex items-center mb-2 md:col-span-3">
                <div class="w-1.5 h-6 bg-gradient-to-b from-[#49CFAD] to-purple-600 rounded-full mr-2"></div>
                <h2 class="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#49CFAD] to-purple-600">数据分析</h2>
                <div class="h-px flex-grow bg-gradient-to-r from-[#49CFAD]/30 to-transparent ml-3 opacity-50"></div>
            </div>
            
            <!-- 假新闻热度柱状图 -->
            <div class="md:col-span-2 bg-white rounded-xl shadow-md p-2 border-0">
                <h3 class="text-base font-semibold text-[#49CFAD]">热门鉴别新闻</h3>
                <BarContainer width="100%" :height="180" :data="hotBarData" yAxisLabel="新闻数量"
                    :chartOption="barOption" class="rounded-xl" />
            </div>
            
            <!-- 假新闻类别占比饼图 -->
            <div class="bg-white rounded-xl shadow-md p-2 border-0">
                <h3 class="text-base font-semibold text-[#49CFAD]">假新闻鉴别类别</h3>
                <PieContainer width="100%" :height="180" :data="typePieData" seriesName="假新闻鉴别类别"
                    :chartOption="pieOption" class="rounded-xl" />
            </div>
            
            <!-- 假新闻鉴别数量折线图 -->
            <div class="md:col-span-3 bg-white rounded-xl shadow-md p-2 border-0">
                <h3 class="text-base font-semibold text-[#49CFAD]">假新闻鉴别趋势</h3>
                <LineContainer width="100%" :height="180" :data="countLineData" yAxisLabel="鉴别数量"
                    :chartOption="countLineOptions" class="rounded-xl" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { } from "vue"
import { typePieData } from "../constants/typePieData";
import pieOption from "../utils/pieOption";

import { hotBarData } from "../constants/hotBarData";
import barOption from "../utils/barOption";

import { countLineData } from "../constants/countLineData";
import countLineOptions from "../utils/lineOptions";
</script>

<style lang="scss" scoped>
.statistic-view {
    animation: fadeIn 0.5s ease-in-out;
}

.user-info-card, .stat-card {
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 15px rgba(73, 207, 173, 0.1);
    }
}

.section-title {
    position: relative;
    
    h2 {
        position: relative;
        letter-spacing: 0.05em;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 媒体查询，在大屏幕上应用不同的样式 */
@media (min-width: 1280px) {
    .statistic-view {
        padding: 1.5rem;
    }

    .stat-card {
        padding: 1.5rem;
    }
}
</style>
