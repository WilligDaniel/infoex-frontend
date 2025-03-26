import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }),
  
  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user
  },
  
  actions: {
    async login(username, password) {
      this.isLoading = true;
      this.error = null;
      
      try {
        if (username === '1' && password === '1') {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          this.user = {
            username: 'Waldeck',
            name: 'Waldeck-Frankenberger Bank'
          };
          this.isAuthenticated = true;
          return true;
        } else {
          throw new Error('Ungültige Anmeldedaten');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async logout() {
      this.isLoading = true;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.user = null;
        this.isAuthenticated = false;
      } finally {
        this.isLoading = false;
      }
    },
    
    checkAuth() {
      return this.isAuthenticated;
    }
  }
}); 