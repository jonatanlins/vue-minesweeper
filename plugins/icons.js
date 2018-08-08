import Vue from 'vue'
import IconComponent from 'vue-awesome/components/Icon'

const icons = [
  'flag'
]

for (const icon of icons) {
  require('vue-awesome/icons/' + icon)
}

Vue.component('icon', IconComponent)
