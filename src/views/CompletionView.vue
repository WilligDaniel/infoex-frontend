<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDocumentStore } from '@/stores/document.js';

const router = useRouter();
const route = useRoute();
const documentStore = useDocumentStore();

const customerName = ref('');
const documentId = ref(route.params.id);
const completionDate = ref(new Date().toLocaleDateString('de-DE'));
const personalNumber = ref('');
const unitNumber = ref('');
const isPersonalNumber = ref(true);
const isLoading = ref(false);

// Computed properties for input bindings
const activeNumber = computed({
  get: () => isPersonalNumber.value ? personalNumber.value : unitNumber.value,
  set: (value) => {
    if (isPersonalNumber.value) {
      personalNumber.value = value;
    } else {
      unitNumber.value = value;
    }
  }
});

const inactiveNumber = computed({
  get: () => isPersonalNumber.value ? unitNumber.value : personalNumber.value,
  set: () => {} // No-op since this field is disabled
});

const downloadXLS = () => {
  const number = isPersonalNumber.value ? personalNumber.value : unitNumber.value;
  
  // Create the download link
  const link = document.createElement('a');
  link.href = `/src/assets/Waldeck_XLS_EXPORT_.xls`;
  link.download = `Waldeck_XLS_EXPORT_${number}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Add to document store which will update the dashboard
  documentStore.addXLSFile(number);
  
  // Navigate to dashboard after short delay
  setTimeout(() => {
    router.push('/dashboard');
  }, 500);
};

const finalizeDocument = () => {
  if ((isPersonalNumber.value && !personalNumber.value) || (!isPersonalNumber.value && !unitNumber.value)) {
    alert('Bitte geben Sie eine Nummer ein');
    return;
  }
  
  // Show loading animation
  isLoading.value = true;
  
  // Navigate to KPI view after a short delay
  setTimeout(() => {
    isLoading.value = false;
    router.push(`/bilanz/${documentId.value}/kpi`);
  }, 1500);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-medium mb-6">Dokument Speicherung abschließen</h2>
      
      <div class="mb-4">
        <div class="flex space-x-4 mb-2">
          <button 
            @click="isPersonalNumber = true"
            :class="[
              'px-4 py-2 rounded-lg',
              isPersonalNumber ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            ]"
          >
            Personennummer
          </button>
          <button 
            @click="isPersonalNumber = false"
            :class="[
              'px-4 py-2 rounded-lg',
              !isPersonalNumber ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            ]"
          >
            Einheitennummer
          </button>
        </div>
        
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ isPersonalNumber ? 'Personennummer' : 'Einheitennummer' }}
        </label>
        <input 
          type="text" 
          v-model="activeNumber"
          class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          :placeholder="isPersonalNumber ? 'Personennummer eingeben' : 'Einheitennummer eingeben'"
          maxlength="10"
        />
        
        <label class="block text-sm font-medium text-gray-700 mb-1 mt-4">
          {{ isPersonalNumber ? 'Einheitennummer' : 'Personennummer' }}
        </label>
        <input 
          type="text" 
          v-model="inactiveNumber"
          disabled
          class="w-full p-2 bg-gray-100 border rounded"
          :placeholder="isPersonalNumber ? 'Einheitennummer eingeben' : 'Personennummer eingeben'"
          maxlength="10"
        />
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Kundenname
        </label>
        <input 
          type="text" 
          v-model="customerName"
          class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Namen eingeben"
        />
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Bearbeitungsdatum
        </label>
        <input 
          type="text" 
          :value="completionDate"
          disabled
          class="w-full p-2 bg-gray-100 border rounded"
        />
      </div>
      
      <div class="flex justify-end space-x-2">
        <button
          @click="router.push('/dashboard')"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          @click="finalizeDocument"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="!customerName || (isPersonalNumber ? !personalNumber : !unitNumber)"
        >
          <span v-if="!isLoading">Abschließen und Exportieren</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Wird verarbeitet...
          </span>
        </button>
      </div>
    </div>
  </div>

  <!-- Loading Overlay -->
  <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-lg font-medium">Dokument wird verarbeitet...</p>
      </div>
    </div>
  </div>
</template> 