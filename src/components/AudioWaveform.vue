<template>
    <div class="w-full h-full">
        <div class="w-full h-full flex flex-col justify-center items-center gap-8">
            <div ref="waveform" class="waveform w-full"></div>

            <!-- 播放控制按钮 -->
            <div class="flex flex-col items-center space-y-4">
                <div class="flex items-center space-x-4">
                    <!-- 向左快进1秒按钮 -->
                    <button @click="skipBackward"
                        class="px-4 py-1 bg-gray-500 text-white rounded-md text-lg hover:bg-gray-600 focus:outline-none transition">
                        <i class="fas fa-backward"></i> <!-- FontAwesome icon -->
                    </button>

                    <!-- 播放/暂停按钮 -->
                    <button @click="togglePlayback"
                        class="px-4 py-1 bg-green-500 text-white rounded-md text-lg hover:bg-green-600 focus:outline-none transition">
                        <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i> <!-- FontAwesome icon -->
                    </button>

                    <!-- 向右快进1秒按钮 -->
                    <button @click="skipForward"
                        class="px-4 py-1 bg-gray-500 text-white rounded-md text-lg hover:bg-gray-600 focus:outline-none transition">
                        <i class="fas fa-forward"></i> <!-- FontAwesome icon -->
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, defineProps } from 'vue';
import WaveSurfer from 'wavesurfer.js';

const props = defineProps({
    audioFile: {
        type: String,
        required: true,
    },
});

const waveform = ref<HTMLDivElement | null>(null);
let waveSurfer: WaveSurfer | null = null;

const isPlaying = ref(false);
const currentTime = ref(0);  // 当前播放时间
const duration = ref(0);  // 音频时长

onMounted(() => {
    if (waveform.value && props.audioFile) {
        // 初始化 WaveSurfer 实例
        waveSurfer = WaveSurfer.create({
            container: waveform.value,
            waveColor: '#ddd',
            progressColor: '#22c55e',
            height: 140,  // 可根据需要调整高度
            // responsive: true,  // 响应式适配
            cursorColor: '#22c55e',
        });

        // 加载音频文件
        waveSurfer.load(props.audioFile);

        // 设置音量
        waveSurfer.on('ready', () => {
            duration.value = waveSurfer?.getDuration() || 0;
        });

        // 更新当前播放时间
        waveSurfer.on('audioprocess', () => {
            currentTime.value = waveSurfer?.getCurrentTime() || 0;
        });

        // 播放或暂停时，更新按钮状态
        waveSurfer.on('play', () => {
            isPlaying.value = true;
        });

        waveSurfer.on('pause', () => {
            isPlaying.value = false;
        });
    }
});

// 监听 audioFile 变化
watch(() => props.audioFile, (newFile) => {
    if (waveSurfer) {
        waveSurfer.load(newFile);  // 如果文件路径改变，重新加载
    }
});

// 播放或暂停音频
const togglePlayback = () => {
    if (waveSurfer) {
        if (isPlaying.value) {
            waveSurfer.pause();
        } else {
            waveSurfer.play();
        }
    }
};

// 向左快进1秒
const skipBackward = () => {
    if (waveSurfer) {
        const newTime = Math.max(0, currentTime.value - 1);
        waveSurfer.seekTo(newTime / duration.value);
        currentTime.value = newTime;
    }
};

// 向右快进1秒
const skipForward = () => {
    if (waveSurfer) {
        const newTime = Math.min(duration.value, currentTime.value + 1);
        waveSurfer.seekTo(newTime / duration.value);
        currentTime.value = newTime;
    }
};
</script>

<style scoped>
</style>