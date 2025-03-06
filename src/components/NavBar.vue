<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img src="@/assets/logo.jpg" alt="Waldeck-Frankenberger Bank Logo" class="h-10 mr-4" />
        </div>
        
        <div v-if="authStore.isAuthenticated" class="flex items-center">
          <span class="text-neutral-darkgray mr-4">{{ authStore.user?.name || 'User' }}</span>
          <button @click="handleLogout" class="logout-button">
            Abmelden
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  @apply bg-white shadow-sm py-4;
}

.container {
  @apply max-w-6xl mx-auto px-4;
}

.logout-button {
  @apply text-sm text-primary hover:text-primary-dark px-3 py-1 rounded-full border border-primary hover:bg-primary-light transition-colors;
}
</style> 