import BoostrapVue from 'bootstrap-vue'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Notifications from 'vue-notification'
import { DefaultClient } from 'rest-resource/src/client'
import '@/assets/main.scss'

Vue.use(BoostrapVue)
Vue.use(Notifications)

store.commit('addClientAndSelect', new DefaultClient('https://jsonplaceholder.typicode.com'))

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
})

// @todo autorefresh
// @todo filters
