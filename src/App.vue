<script setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { computed } from 'vue'

const route = useRoute()

// Check if the current route is the login page
const isLoginPage = computed(() => route.name === 'login')
</script>

<template>
  <div :class="{ 'min-h-screen bg-neutral-light': !isLoginPage }">
    <!-- Show NavBar on all pages except login -->
    <NavBar v-if="!isLoginPage" />
    <RouterView />
  </div>
</template>

<style>
@import './style.css';

/* Only apply these styles to non-login pages */
.app-container {
  @apply min-h-screen bg-neutral-light;
}
</style>
