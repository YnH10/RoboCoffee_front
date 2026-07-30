// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 🎨 디자인 시스템(CSS) 불러오기 (매우 중요)
import './assets/main.css'

const app = createApp(App)

app.use(router)
app.mount('#app')