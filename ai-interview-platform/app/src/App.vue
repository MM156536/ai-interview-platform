<template>
  <!-- ✅ 路由出口：Vue 会根据 URL 自动渲染对应组件 -->
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}

</script>

<style>
/* 全局样式可以保留，不影响功能 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>