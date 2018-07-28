import Vue from 'vue'

// Pega todos os componentes da pasta 'components' e os registra globalmente
const files = require.context('@/components', true)
files.keys().forEach(key => {
  const name = key.replace(/^\.\//, '').replace(/\.\w+$/, '')
  if(name.indexOf('/') === -1) {
    Vue.component(name, files(key).default)
  }
})
