<template>
  <HeaderForm></HeaderForm>
  <div id="app">
    <router-view></router-view>
  </div>
  <div class="app"></div>
</template>

<script>
import HeaderForm from "./components/layout/Header.vue";
export default {
  components: {
    HeaderForm,
  },
};
</script>
>

<style>
#app {
  background-color: #afd3e2;
  min-height: 100vh;
}
</style>
