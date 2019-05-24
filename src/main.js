import Vue from 'vue'
import Vuetify from 'vuetify'
Vue.use(Vuetify)
import VueFire from 'vuefire'
Vue.use(VueFire)
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
