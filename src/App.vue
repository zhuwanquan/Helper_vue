<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="app-container">
    <NavBar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
