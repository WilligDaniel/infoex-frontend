<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '../stores/documents';

const router = useRouter();
const documentsStore = useDocumentsStore();

const selectedFile = ref(null);
const personNumber = ref('');
const unitNumber = ref('');
const businessSector = ref('');

const canUpload = computed(() => {
  return selectedFile.value && 
         (personNumber.value || unitNumber.value) && 
         businessSector.value;
});

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const removeFile = () => {
  selectedFile.value = null;
};

const uploadDocument = async () => {
  if (!canUpload.value) return;
  
  try {
    const documentData = {
      file: selectedFile.value,
      personNumber: personNumber.value,
      unitNumber: unitNumber.value,
      businessSector: businessSector.value
    };
    
    // Store the data locally (in memory only)
    console.log('Uploading document with data:', documentData);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Navigate to dashboard after successful upload
    router.push('/dashboard');
  } catch (error) {
    console.error('Error uploading document:', error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-medium mb-6">Dokument hochladen</h2>
      
      <!-- Upload Area -->
      <div 
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div class="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <p class="text-gray-600 mb-2">Ziehen Sie Ihre Datei hierher oder</p>
          <label class="cursor-pointer text-blue-600 hover:text-blue-500">
            klicken Sie zum Auswählen
            <input 
              type="file" 
              class="hidden" 
              @change="handleFileSelect"
              accept=".pdf,.xls,.xlsx,.doc,.docx"
            >
          </label>
        </div>
      </div>
      
      <!-- Selected File Info -->
      <div v-if="selectedFile" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-gray-600">{{ selectedFile.name }}</span>
          </div>
          <button 
            @click="removeFile"
            class="text-red-500 hover:text-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Input Fields -->
      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Personennummer
          </label>
          <input 
            type="text" 
            v-model="personNumber"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. 12345"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Einheiten-Nummer
          </label>
          <input 
            type="text" 
            v-model="unitNumber"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. AB123"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Wirtschaftszweig
          </label>
          <input 
            type="text" 
            v-model="businessSector"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Handel"
          >
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3">
        <button 
          @click="$router.push('/dashboard')"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button 
          @click="uploadDocument"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          :disabled="!canUpload"
        >
          Hochladen
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-view {
  @apply max-w-6xl mx-auto py-8 px-4;
}
</style> 