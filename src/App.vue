<script setup>
import { RouterView } from 'vue-router'
import 'primeicons/primeicons.css';
</script>

<template>
  <div id="layout">
    <header>
      <div class="wrapper"></div>
      <nav>
        <!--Routing between main homepage and globe page. placeholders for navigation (for now)-->
        <RouterLink to="/globe">Globe</RouterLink>
      </nav>
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

nav {
  padding: 20px;
  background-color: #9cc2fc6c;
}

nav a {
  font-weight: bold;
  color: #444444;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #007bff;
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

body {
  font-family: 'Nunito', sans-serif;
  background-color: #fef7f8;
  margin: 0;
  color: #333;
}
</style>
