<template>
    <div class="MaskLayer" v-if="props.ifShow" :style="{ backgroundColor: props.backgroundColor }">

    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
    ifShow: Boolean,
    backgroundColor: {
        type: String,
        default: 'rgba(0, 0, 0, 0.6)'
    }
});
</script>

<style lang="scss" scoped>
.MaskLayer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 99;
}
</style>
