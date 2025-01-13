// src/stores/tabStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSidebarStore = defineStore('tabStore', () => {

    // 当前激活的 index
    const activeIndex = ref(0);

    // 设置激活的 tab
    const setActive = (index: number) => {
        activeIndex.value = index;
    };
    return {
        activeIndex,
        setActive,
    };
});
export const useSideLeftStore = defineStore('sideLeftStore',()=>{
    const AiTalk = ref(0);
    const setAiTalk = (index:number)=>{
        AiTalk.value = index;
    }
    return {
        AiTalk,
        setAiTalk
    }
})
export const useSideTuBiaoStore = defineStore('sideTuBiaoStore',()=>{
    const TuBiao = ref(0);
    const setTuBiao = (index:number)=>{
        TuBiao.value = index;
    }
    return {
        TuBiao,
        setTuBiao
    }
})
export const useSideBaoBiaoStore = defineStore('sideBaoBiaoStore',()=>{
    const BaoBiao = ref(0);
    const setBaoBiao = (index:number)=>{
        BaoBiao.value = index;
    }
    return {
        BaoBiao,
        setBaoBiao
    }
})