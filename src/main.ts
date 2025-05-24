import { createApp } from 'vue'
import './assets/styles/global.css'  // Move global CSS first
import './style.css'
import App from './App.vue'
import router from "./router/index"
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElIcons from '@element-plus/icons-vue'

// ① 引入createPinia方法从pinia
import { createPinia } from 'pinia'
// ② 拿到pinia实例
const pinia = createPinia()

// import * as echarts from "echarts";            // 全局引入echarts

import '@fortawesome/fontawesome-free/css/all.min.css';

// 1 引入数据持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// 2 pinia使用数据持久化插件
pinia.use(piniaPluginPersistedstate)

import 'element-plus/dist/index.css'

const app = createApp(App)
for (const name in ElIcons) {
    app.component(name, (ElIcons as any)[name])
}

// app.config.globalProperties.$echarts = echarts
app
    .use(ElementPlus, {
        locale: zhCn,
    })
    .use(router)
    .use(pinia) // 启用 Pinia

    .mount('#app')
