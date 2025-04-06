<template>
    <div
        class="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-7 mb-5 border-0 animate-fadeIn">
        <!-- 欢迎信息 -->
        <div class="mb-8 text-center">
            <h2
                class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 mb-3">
                欢迎使用区块链取证系统</h2>
            <p class="text-gray-600 max-w-2xl mx-auto leading-relaxed">通过区块链技术快速识别、追溯并验证虚假新闻信息。选择下方任一查询方式开始使用。</p>
        </div>

        <!-- 简洁功能卡片区 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 卡片1: 区块链地址查询 -->
            <div
                class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-xl transition-all duration-300 group">
                <div
                    class="absolute -right-10 -top-10 w-24 h-24 bg-blue-500 opacity-5 rounded-full group-hover:scale-150 transition-all duration-500">
                </div>
                <div class="p-6 relative z-10">
                    <div class="flex items-center mb-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <i class="fa-solid fa-key text-lg"></i>
                        </div>
                        <h3 class="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">区块链地址查询</h3>
                    </div>
                    <p class="text-sm text-gray-600 ml-14 leading-relaxed">输入区块链地址查询相关的新闻验证记录，适用于已知地址的场景。</p>
                </div>
            </div>

            <!-- 卡片2: 文本内容查询 -->
            <div
                class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-xl transition-all duration-300 group">
                <div
                    class="absolute -right-10 -top-10 w-24 h-24 bg-green-500 opacity-5 rounded-full group-hover:scale-150 transition-all duration-500">
                </div>
                <div class="p-6 relative z-10">
                    <div class="flex items-center mb-4">
                        <div
                            class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mr-4 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                            <i class="fa-solid fa-font text-lg"></i>
                        </div>
                        <h3 class="font-semibold text-gray-900 text-lg group-hover:text-green-600 transition-colors duration-300">文本内容查询</h3>
                    </div>
                    <p class="text-sm text-gray-600 ml-14 leading-relaxed">通过新闻内容或关键词反向查找验证记录，验证特定新闻信息真实性。</p>
                </div>
            </div>

            <!-- 卡片3: 多媒体查询 -->
            <div
                class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-teal-50 shadow-md hover:shadow-xl transition-all duration-300 group">
                <div
                    class="absolute -right-10 -top-10 w-24 h-24 bg-teal-500 opacity-5 rounded-full group-hover:scale-150 transition-all duration-500">
                </div>
                <div class="p-6 relative z-10">
                    <div class="flex items-center mb-4">
                        <div
                            class="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mr-4 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                            <i class="fa-solid fa-images text-lg"></i>
                        </div>
                        <h3 class="font-semibold text-gray-900 text-lg group-hover:text-teal-600 transition-colors duration-300">多媒体查询</h3>
                    </div>
                    <p class="text-sm text-gray-600 ml-14 leading-relaxed">上传图片、音频或视频文件，针对多媒体内容进行真实性验证。</p>
                </div>
            </div>
        </div>

        <!-- 简化使用步骤 -->
        <div class="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
            <div class="flex items-center mb-5">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 shadow-sm">
                    <i class="fa-solid fa-lightbulb text-blue-600 text-lg"></i>
                </div>
                <h3 class="font-semibold text-gray-900 text-lg">简易使用步骤</h3>
            </div>

            <div class="flex flex-col md:flex-row gap-5">
                <!-- 步骤1 -->
                <div
                    class="flex-1 bg-white/80 rounded-xl p-5 flex items-start hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300">
                    <div
                        class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold mr-4 flex-shrink-0 shadow-sm">
                        1</div>
                    <div>
                        <h4 class="text-base font-medium text-gray-900 mb-2">选择查询方式</h4>
                        <p class="text-sm text-gray-600 leading-relaxed">在页面上方选择地址查询或内容查询</p>
                    </div>
                </div>

                <!-- 步骤2 -->
                <div
                    class="flex-1 bg-white/80 rounded-xl p-5 flex items-start hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300">
                    <div
                        class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold mr-4 flex-shrink-0 shadow-sm">
                        2</div>
                    <div>
                        <h4 class="text-base font-medium text-gray-900 mb-2">输入查询内容</h4>
                        <p class="text-sm text-gray-600 leading-relaxed">输入区块链地址或新闻内容/上传媒体</p>
                    </div>
                </div>

                <!-- 步骤3 -->
                <div
                    class="flex-1 bg-white/80 rounded-xl p-5 flex items-start hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300">
                    <div
                        class="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold mr-4 flex-shrink-0 shadow-sm">
                        3</div>
                    <div>
                        <h4 class="text-base font-medium text-gray-900 mb-2">查看结果</h4>
                        <p class="text-sm text-gray-600 leading-relaxed">系统将显示所有相关的区块链验证记录</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
// 欢迎和使用指南组件不需要特定的逻辑
</script>