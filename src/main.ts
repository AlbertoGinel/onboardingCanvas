import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import Canvas from './Canvas.vue'
import VueKonva from 'vue-konva';

const app = createApp(Canvas)

app.use(createPinia())
app.use(router)
app.use(VueKonva)


app.mount('#app')
