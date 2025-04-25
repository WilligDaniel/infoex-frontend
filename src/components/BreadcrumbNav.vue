<!-- BreadcrumbNav.vue -->
<template>
  <nav class="bg-gray-100 py-3 px-4 mb-4">
    <ol class="flex text-sm">
      <li class="flex items-center">
        <router-link to="/" class="text-blue-600 hover:text-blue-800">Home</router-link>
      </li>
      
      <li v-if="currentRoute.includes('bilanz')" class="flex items-center">
        <span class="mx-2 text-gray-500">/</span>
        <router-link to="/dashboard" class="text-blue-600 hover:text-blue-800">Bilanz</router-link>
      </li>
      
      <li v-if="currentRoute.includes('/bilanz/') && !currentRoute.includes('/edit')" class="flex items-center">
        <span class="mx-2 text-gray-500">/</span>
        <span class="text-gray-600">Ansicht</span>
      </li>
      
      <li v-if="currentRoute.includes('/bilanz/') && currentRoute.includes('/edit')" class="flex items-center">
        <span class="mx-2 text-gray-500">/</span>
        <span class="text-gray-600">Bearbeiten</span>
      </li>
      
      <li v-if="documentId" class="flex items-center">
        <span class="mx-2 text-gray-500">/</span>
        <span class="text-gray-600">({{ documentId }})</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentRoute = computed(() => route.path);
const documentId = computed(() => {
  if (route.params.id) {
    return route.params.id;
  }
  return null;
});
</script>

<script lang="ts">
export default {
  name: 'BreadcrumbNav'
};
</script> 