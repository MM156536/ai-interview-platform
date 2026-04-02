const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  // 关闭 ESLint 检查
  lintOnSave: false,
  transpileDependencies: true,

  // 接口代理配置（你原来的，保留）
  devServer: {
    proxy: {
      '/admin': {
        target: 'http://127.0.0.1:4523/m1/7900134-7650835-default',
        changeOrigin: true
      },
      '/api': {
        target: 'http://127.0.0.1:4523/m1/7900134-7650835-default',
        changeOrigin: true
      }
    }
  }
})