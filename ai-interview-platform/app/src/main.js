// 全局抑制 ResizeObserver 循环警告
const observer = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends observer {
  constructor(callback) {
    super((entries, observer) => {
      // 用 requestAnimationFrame 包裹，避免同步循环
      requestAnimationFrame(() => callback(entries, observer));
    });
  }
};

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'

// 导入 Element Plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// 导入 mock
import "./mock/index.js";

// 🔥 关键：必须 .use(ElementPlus)
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus) // 这行你之前没有！！！
app.mount('#app')