<template>
    <div class="StatisticView p-6">
        <!-- 有关用户信息 -->
        <div class="w-full flex justify-between items-center shadow-md rounded-xl border p-5">
            <div class="flex justify-between items-center gap-3">
                <img class="w-20 h-20 rounded-full object-cover aspect-square" src="http://10.248.6.72:8181/ExamA.jpeg"
                    alt="">
                <div class="flex flex-col justify-between items-start">
                    <p class="text-xl font-bold">早安，Soybean，欢迎使用伪造检测平台！</p>
                    <p class="text-gray-500">今日热点：伪造新闻传播风险高，请及时关注！</p>
                </div>
            </div>
            <div class="flex justify-between items-center gap-5">
                <div class="flex flex-col justify-between items-start">
                    <p>累计检测新闻数</p>
                    <p class="text-2xl font-bold">12,345</p>
                </div>
                <div class="flex flex-col justify-between items-start">
                    <p>今日检测新闻数</p>
                    <p class="text-2xl font-bold">567</p>
                </div>
                <div class="flex flex-col justify-between items-start">
                    <p>未读消息</p>
                    <p class="text-2xl font-bold">8</p>
                </div>
            </div>
        </div>

        <!-- 纯数字展示数据 -->
        <div class="w-full flex justify-between items-center gap-5 shadow-md rounded-xl border p-5 mt-5">
            <div class="flex-1 bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-3">
                <p class="text-white text-left">总检测新闻数</p>
                <div class="flex justify-between items-center mt-2">
                    <el-icon size="30" color="#FFF">
                        <ChatDotRound />
                    </el-icon>
                    <p class="text-white text-3xl font-bold">12,345</p>
                </div>
            </div>
            <div class="flex-1 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-3">
                <p class="text-white text-left">真实新闻数量</p>
                <div class="flex justify-between items-center mt-2">
                    <el-icon size="30" color="#FFF">
                        <ChatDotRound />
                    </el-icon>
                    <p class="text-white text-3xl font-bold">8,765</p>
                </div>
            </div>
            <div class="flex-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-3">
                <p class="text-white text-left">伪造新闻数量</p>
                <div class="flex justify-between items-center mt-2">
                    <el-icon size="30" color="#FFF">
                        <ChatDotRound />
                    </el-icon>
                    <p class="text-white text-3xl font-bold">3,580</p>
                </div>
            </div>
            <div class="flex-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-3">
                <p class="text-white text-left">伪造率</p>
                <div class="flex justify-between items-center mt-2">
                    <el-icon size="30" color="#FFF">
                        <ChatDotRound />
                    </el-icon>
                    <p class="text-white text-3xl font-bold">29%</p>
                </div>
            </div>
        </div>

        <div class="w-full flex justify-between items-center gap-5">
            <!-- 假新闻热度柱状图 -->
            <div class="flex-[2] flex justify-between items-center shadow-md rounded-xl border p-5 mt-5">
                <BarContainer class="border rounded-xl" width="100%" :height="200" :data="hotBarData"
                    :chartOption="barOption" />
            </div>
            <!-- 假新闻类别占比饼图 -->
            <div class="flex-1 flex justify-between items-center shadow-md rounded-xl border p-5 mt-5">
                <PieContainer class="border rounded-xl" width="100%" :height="200" :data="typePieData"
                    :chartOption="pieOption" />
            </div>
        </div>

        <div class="w-full flex justify-between items-center gap-5">
            <!-- 假新闻鉴别数量折线图 -->
            <div class="flex-[2] flex justify-between items-center shadow-md rounded-xl border p-5 mt-5">
                <LineContainer class="border rounded-xl" width="100%" :height="200" :data="countLineData"
                    :chartOption="countLineOptions" />
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

<style lang="scss" scoped></style>
