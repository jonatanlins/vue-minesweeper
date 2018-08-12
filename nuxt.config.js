module.exports = {
  head: {
    title: 'minesweeper',
    htmlAttrs: { lang: 'pt-br' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Réplica do jogo campo minado' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  plugins: [
    { src: '@/plugins/scripts.js' },
    { src: '@/plugins/icons.js' }
  ],
  css: [
    '@/assets/style/main.scss'
  ],
  mode: 'spa',
  loading: { color: '#3B8070' },
  modules: [
    '@nuxtjs/pwa'
  ],
  build: {
    vendor: [
    ],
    extractCSS: true,
    extend (config, { isDev, isClient }) {
      config.node = {
        fs: 'empty'
      }

      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
