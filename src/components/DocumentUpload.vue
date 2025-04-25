<script setup>
import { ref } from 'vue';
import { useDocumentsStore } from '@/stores/documents';

const documentsStore = useDocumentsStore();

const isUploading = ref(false);
const uploadProgress = ref(0);
const dragActive = ref(false);
const fileInput = ref(null);
const personalNumber = ref('');
const unitNumber = ref('');
const businessSector = ref('');

const handleFileChange = async (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    await uploadFile(files[0]);
  }
};

const handleDragEnter = (e) => {
  e.preventDefault();
  e.stopPropagation();
  dragActive.value = true;
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  dragActive.value = false;
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDrop = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  dragActive.value = false;
  
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    await uploadFile(e.dataTransfer.files[0]);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const uploadFile = async (file) => {
  isUploading.value = true;
  uploadProgress.value = 0;
  
  // Simulate progress
  const interval = setInterval(() => {
    uploadProgress.value += 10;
    if (uploadProgress.value >= 100) {
      clearInterval(interval);
    }
  }, 200);
  
  try {
    await documentsStore.uploadDocument(file);
    
    // Ensure progress reaches 100%
    uploadProgress.value = 100;
    
    // Reset after a short delay
    setTimeout(() => {
      isUploading.value = false;
      uploadProgress.value = 0;
    }, 500);
    
  } catch (error) {
    console.error('Upload failed:', error);
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};
</script>

<template>
  <div 
    class="upload-container"
    :class="{ 'drag-active': dragActive }"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <input 
      type="file" 
      ref="fileInput" 
      class="hidden" 
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
      @change="handleFileChange"
    />
    
    <div v-if="!isUploading" class="upload-content" @click="triggerFileInput">
      <div class="upload-icon mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p class="text-lg mb-2">Dokument hier ablegen oder klicken zum Hochladen</p>
      <p class="text-sm text-neutral-darkgray">Unterstützte Formate: PDF, DOC, DOCX, JPG, PNG</p>
    </div>
    
    <div v-else class="upload-progress">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <p class="mt-2">Hochladen... {{ uploadProgress }}%</p>
    </div>
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Personalnummer</label>
    <input
      v-model="personalNumber"
      type="text"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      placeholder="Personalnummer eingeben"
    />
  </div>
  
  <div>
    <label class="block text-sm font-medium text-gray-700">Einheitsnummer</label>
    <input
      v-model="unitNumber"
      type="text"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      placeholder="Einheitennummer eingeben"
    />
  </div>

  <div>
    <label class="block text-sm font-medium text-gray-700">Geschäftsbereich</label>
    <input
      v-model="businessSector"
      type="text"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      placeholder="Geschäftsbereich eingeben"
    />
  </div>
</template>

<style scoped>
.upload-container {
  @apply rounded-lg p-8 flex items-center justify-center text-center cursor-pointer transition-colors;
  /* removed border-2 border-dashed border-neutral-gray */
}

.drag-active {
  /* removed border and bg highlight */
}

.upload-content {
  @apply flex flex-col items-center;
}

.progress-bar-container {
  @apply w-full h-2 bg-neutral-gray rounded-full overflow-hidden;
}

.progress-bar {
  @apply h-full bg-primary transition-all duration-200;
}

.upload-progress {
  @apply w-full max-w-md;
}
</style>