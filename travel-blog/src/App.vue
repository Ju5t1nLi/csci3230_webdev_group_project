<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="layout">
    <header>
      <div class="wrapper"></div>
    </header>
  </div>
  <RouterView />
</template>

<style>
#layout {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #444444;
}
h1 {
  font-size: 48px;
  color: #444444;
  text-align: center;
  margin-bottom: 20px;
}

h3 {
  color: #444444;
  text-align: center;
  margin-bottom: 20px;
}
</style>
