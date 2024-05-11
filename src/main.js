import './assets/main.css'

// Import our custom CSS
import './scss/styles.scss'

// Import all of Bootstrap's JS
// eslint-disable-next-line no-unused-vars
// import * as bootstrap from 'bootstrap'
import 'bootstrap'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
