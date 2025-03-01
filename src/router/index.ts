import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

// 2. 配置路由
const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        component: () => import("../views/IndexView.vue"),
        children: [
            {
                path: "/",
                component: () => import("../views/StatisticView.vue"),
            },
            {
                path: "/verify-text",
                component: () => import("../views/Verify/VerifyTextView.vue"),
            },
            {
                path: "/verify-image",
                component: () => import("../views/Verify/VerifyImageView.vue"),
            },
            {
                path: "/verify-audio",
                component: () => import("../views/Verify/VerifyAudioView.vue"),
            },
            {
                path: "/verify-video",
                component: () => import("../views/Verify/VerifyVideoView.vue"),
            },
            {
                path: '/review',
                component: () => import("../views/FakeNewsReviewView.vue"),
            },
            {
                path: '/prediction',
                component: () => import("../views/FakeNewsPredictionView.vue"),
            },
            {
                path: '/restore',
                component: () => import("../views/FakeNewsRestoreView.vue"),
            },
            {
                path: '/knowledge',
                component: () => import("../views/KnowledgeView.vue"),
            },
            {
                path: '/create-knowledge/:id',
                component: () => import("../views/CreateKnowledgeView.vue"),
            }
        ],
    },
];
// 1.返回一个 router 实列，为函数，里面有配置项（对象） history
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// 3导出路由   然后去 main.ts 注册 router.ts
export default router