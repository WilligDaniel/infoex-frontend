<script setup>
import { useRouter } from 'vue-router';
import DocumentUpload from '@/components/DocumentUpload.vue';

const router = useRouter();

const goBack = () => {
  router.push('/');
};
</script>

<template>
  <div class="upload-view">
    <header class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <img src="@/assets/logo.jpg" alt="Waldeck-Frankenberger Bank Logo" class="h-10 mr-4" />
          <h1 class="text-primary">InfoExtract AI</h1>
        </div>
      </div>
      <div class="flex items-center text-sm text-neutral-darkgray">
        <span class="cursor-pointer" @click="goBack">Dashboard</span>
        <img src="@/assets/icons/breadcrumb-arrow.svg" alt=">" class="mx-2 h-3" />
        <span class="text-primary">Dokument hochladen</span>
      </div>
    </header>

    <div class="card mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2>Dokument hochladen</h2>
      </div>
      
      <p class="mb-6 text-neutral-darkgray">
        Laden Sie ein Dokument hoch, um Informationen automatisch zu extrahieren. 
        Unterstützte Formate sind PDF, DOC, DOCX, JPG und PNG.
      </p>
      
      <DocumentUpload />
      
      <div class="mt-8 flex justify-end">
        <button class="btn-outline mr-4" @click="goBack">Abbrechen</button>
        <button class="btn-primary" @click="goBack">Zurück zum Dashboard</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-view {
  @apply max-w-6xl mx-auto py-8 px-4;
}
</style> 