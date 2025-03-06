<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const loginError = ref('');
const isLoading = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  if (!username.value || !password.value) {
    loginError.value = 'Bitte geben Sie Ihren Nutzernamen und Ihr Passwort ein.';
    return;
  }

  try {
    isLoading.value = true;
    loginError.value = '';
    await authStore.login(username.value, password.value);
    router.push('/');
  } catch (error) {
    isLoading.value = false;
    loginError.value = 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';
  }
};

const handleForgotPassword = () => {
  alert('Passwort zurücksetzen Funktion wird implementiert.');
};
</script>

<template>
  <div class="login-page bg-white flex items-center justify-center">
    <div class="w-full max-w-md px-4">
      <div class="text-center">
        <div class="mb-8">
          <img 
            src="@/assets/logo.jpg" 
            alt="Waldeck-Frankenberger Bank Logo" 
            class="h-32 w-auto object-contain mx-auto" 
          />
          <p class="text-gray-600 text-sm">Intelligente Dokumentenanalyse, für ihre Bilanzen!</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-4 mb-8">
          <div>
            <input 
              type="text" 
              v-model="username" 
              placeholder="Nutzername"
              class="w-full px-4 py-2 border border-gray-300 rounded bg-white text-black"
              autocomplete="username"
            />
          </div>
          
          <div>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="Passwort"
              class="w-full px-4 py-2 border border-gray-300 rounded bg-white text-black"
              autocomplete="current-password"
            />
          </div>
          
          <div v-if="loginError" class="text-red-500 text-sm">
            {{ loginError }}
          </div>
          
          <div>
            <button 
              type="submit" 
              class="bg-gray-800 text-white py-2 px-6 rounded hover:bg-gray-700 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Anmelden...</span>
              <span v-else>Anmelden</span>
            </button>
          </div>
        </form>

        <!-- Logo container -->
        <div class="flex flex-col items-center justify-center mt-3 mb-3">
          <div class="text-center">
            <p class="text-gray-700 text-xs font-medium tracking-wide uppercase mb-1">Powered by</p>
            <img src="@/assets/futurisedoffical-logo.png" alt="Futurised Logo" class="h-20">
          </div>
        </div>

        <!-- Version Badge -->
        <div class="absolute bottom-3 right-3">
          <span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full border border-gray-200">v0.0.1</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove any styles that set a black background */
.login-page {
  @apply bg-white;
}

/* Override any global styles that might be interfering */
body {
  margin: 0;
  padding: 0;
  color: white;
}

input {
  background-color: white;
  @apply border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

/* Button styles */
button[type="submit"] {
  display: inline-block;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
}

button[type="submit"]:hover {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
}
</style>