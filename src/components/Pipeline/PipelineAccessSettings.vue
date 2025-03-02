<template>
    <div class="PipelineAccessSettings">
        <!-- 准入设置按钮 -->
        <el-popover :visible="accessSettingsVisible" placement="bottom" :width="400">
            <div class="flex justify-between items-center border-b -mx-5 px-5 pb-2 ">
                <p class="text-lg text-black font-bold">准入设置</p>
                <div class="Close" @click="accessSettingsVisible = false">
                    <el-icon size="20" class="cursor-pointer">
                        <Close />
                    </el-icon>
                </div>
            </div>

            <div class="flex justify-start items-center gap-3 mt-5">
                <p>设置帮助</p>
                <el-popover :visible="accessSettingsHelpVisible" placement="right" :width="650">
                    <p>自动：流水线执行时自动进入该阶段继续运行。</p>
                    <p>手动：流水线执行时需手动确认后才能进入该阶段继续运行。</p>
                    <p>时间窗：流水线阶段任务在执行窗口内时可以运行，若未在执行窗口内则无法运行该阶段任务。</p>
                    <template #reference>
                        <i class="fa-light fa-circle-question"
                            @click="accessSettingsHelpVisible = !accessSettingsHelpVisible"></i>
                    </template>
                </el-popover>

            </div>
            <div class="mt-5">
                <el-checkbox v-model="accessSettings" label="自动" class="el-checkbox-class" />
                <el-checkbox v-model="accessSettings" label="手动" class="el-checkbox-class" />
                <el-checkbox v-model="accessSettings" label="时间窗" class="el-checkbox-class" />
            </div>


            <div class="flex justify-center items-center gap-5 mt-10">
                <div class="bg-black cursor-pointer rounded-lg px-10 py-2" @click="accessSettingsVisible = false">
                    <p class=" text-white">确定</p>
                </div>

                <div class="bg-white cursor-pointer rounded-lg border px-10 py-2"
                    @click="accessSettingsVisible = false">
                    <p class=" text-black">取消</p>
                </div>
            </div>
            <template #reference>
                <div class="w-7 h-7 absolute -left-14 top-8 bg-black rounded-full z-50 flex justify-center items-center"
                    @click="showAccessSettings">
                    <i class="fa-light fa-up-to-bracket fa-rotate-90 " style="color: white;"></i>
                </div>
            </template>
        </el-popover>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const accessSettingsVisible = ref(false)
const accessSettingsHelpVisible = ref(false)
const accessSettings = ref([])

const showAccessSettings = () => {
    accessSettingsVisible.value = !accessSettingsVisible.value
    console.log(accessSettings.value)
}
</script>

<style lang="scss" scoped>
:deep(.el-checkbox__inner) {
    border-radius: 50%;
    zoom: 100%;
}

:deep(.el-checkbox__inner) {
    width: 19px;
    height: 19px;
    border-radius: 22.5px;
}

:deep(.el-checkbox__inner::after) {
    border: 1px solid #fff;
    border-left: 0;
    border-top: 0;
    left: 7px;
    top: 4px;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
    transform: rotate(50deg) scaleY(1.5);
}

:deep(.el-checkbox__inner:hover) {
    border-color: var(--text-100);
}

.el-checkbox-class {
    --el-checkbox-checked-bg-color: #000;
    --el-checkbox-checked-input-border-color: #000;
    --el-checkbox-checked-text-color: #000
}
</style>
