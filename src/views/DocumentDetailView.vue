<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDocumentsStore } from '@/stores/documents';

const route = useRoute();
const router = useRouter();
const documentsStore = useDocumentsStore();

// Tabs state
const activeTab = ref('extracted');

// Get document from store
const document = computed(() => documentsStore.currentDocument || {
  id: 0,
  name: 'Loading...',
  extractedData: {}
});

const isLoading = computed(() => documentsStore.isLoading);

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

const goBack = () => {
  router.push('/');
};

const reprocessDocument = async () => {
  if (document.value && document.value.id) {
    await documentsStore.reprocessDocument(document.value.id);
  }
};

const downloadDocument = () => {
  // In a real app, this would trigger a download
  console.log('Downloading document:', document.value.name);
};

onMounted(async () => {
  const documentId = route.params.id;
  if (documentId) {
    await documentsStore.fetchDocument(documentId);
  }
});
</script>

<template>
  <div class="document-detail">
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
        <span class="cursor-pointer" @click="goBack">Dokumente</span>
        <img src="@/assets/icons/breadcrumb-arrow.svg" alt=">" class="mx-2 h-3" />
        <span class="text-primary">{{ document.name }}</span>
      </div>
    </header>

    <div v-if="isLoading" class="card mb-8 p-8 text-center">
      <p class="text-neutral-darkgray">Dokument wird geladen...</p>
    </div>

    <div v-else class="card mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2>{{ document.name }}</h2>
        <div class="flex">
          <button class="btn-outline flex items-center mr-4" @click="downloadDocument">
            <span>Herunterladen</span>
            <img src="@/assets/icons/download-icon.svg" alt="Download" class="ml-2 h-4" />
          </button>
          <button class="btn-primary flex items-center" @click="reprocessDocument">
            <span>Neu verarbeiten</span>
          </button>
        </div>
      </div>

      <div class="tabs flex border-b border-neutral-gray mb-6">
        <div 
          class="tab mr-8 pb-2" 
          :class="activeTab === 'extracted' ? 'tab-active border-b-2 border-primary' : 'tab-inactive'"
          @click="setActiveTab('extracted')"
        >
          <span>Extrahierte Daten</span>
        </div>
        <div 
          class="tab mr-8 pb-2" 
          :class="activeTab === 'preview' ? 'tab-active border-b-2 border-primary' : 'tab-inactive'"
          @click="setActiveTab('preview')"
        >
          <span>Dokumentvorschau</span>
        </div>
      </div>

      <div v-if="activeTab === 'extracted'" class="extracted-data">
        <div v-if="!document.extractedData || Object.keys(document.extractedData).length === 0" class="py-8 text-center">
          <p class="text-neutral-darkgray">Keine extrahierten Daten verfügbar.</p>
          <button class="btn-primary mt-4" @click="reprocessDocument">Dokument verarbeiten</button>
        </div>
        <div v-else class="grid grid-cols-2 gap-6">
          <div v-for="(value, key) in document.extractedData" :key="key" class="field-group">
            <div class="text-sm text-neutral-darkgray mb-1">{{ key }}</div>
            <div class="font-medium">{{ value }}</div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'preview'" class="document-preview">
        <div class="bg-neutral-gray h-96 flex items-center justify-center">
          <p class="text-neutral-darkgray">Dokumentvorschau wird geladen...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-detail {
  @apply max-w-6xl mx-auto py-8 px-4;
}

.field-group {
  @apply p-4 bg-neutral-light rounded;
}
</style> 