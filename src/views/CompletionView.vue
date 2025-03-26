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
const showNumberDialog = ref(false);
const personalNumber = ref('');
const unitNumber = ref('');
const isPersonalNumber = ref(true);
const isLoading = ref(false);
const showIdentifierDialog = ref(false);
const identifierError = ref('');

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
  // Show number input dialog first
  showNumberDialog.value = true;
};

const handleNumberSubmit = () => {
  const number = isPersonalNumber.value ? personalNumber.value : unitNumber.value;
  
  if (!number) {
    alert('Bitte geben Sie eine Nummer ein');
    return;
  }
  
  showNumberDialog.value = false;
  isLoading.value = true;
  
  // Create a Blob from the XLS file URL
  fetch('/Waldeck_XLS_EXPORT_.xls')
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Waldeck_XLS_EXPORT_${number}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      documentStore.addXLSFile(number);
      
      setTimeout(() => {
        isLoading.value = false;
        router.push('/dashboard');
      }, 1500);
    });
};

const finalizeDocument = () => {
  if (!customerName.value) {
    alert('Bitte geben Sie einen Kundennamen ein');
    return;
  }
  isLoading.value = true;
  
  // Create a Blob from the XLS file URL
  fetch('/Waldeck_XLS_EXPORT_.xls')
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Waldeck_XLS_EXPORT_${documentId.value}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      documentStore.addXLSFile(documentId.value);
      
      setTimeout(() => {
        isLoading.value = false;
        router.push('/dashboard');
      }, 1500);
    });
};

const handleIdentifierSubmit = () => {
  if (isPersonalNumber.value ? !personalNumber.value : !unitNumber.value) {
    identifierError.value = 'Bitte geben Sie eine gültige Identifikationsnummer ein';
    return;
  }

  showIdentifierDialog.value = false;
  isLoading.value = true;
  
  // Create a Blob from the XLS file URL
  fetch('/Waldeck_XLS_EXPORT_.xls')
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const number = isPersonalNumber.value ? personalNumber.value : unitNumber.value;
      link.download = `Waldeck_XLS_EXPORT_${number}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      documentStore.addXLSFile(number);
      
      setTimeout(() => {
        isLoading.value = false;
        router.push('/dashboard');
      }, 1500);
    });
};

const closeIdentifierDialog = () => {
  showIdentifierDialog.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-medium mb-6">Dokument Speicherung abschließen</h2>
      
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

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Identifikationsnummer
        </label>
        <input 
          type="text" 
          :value="documentId"
          disabled
          class="w-full p-2 bg-gray-100 border rounded"
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
          :disabled="!customerName"
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

  <!-- Number Input Dialog -->
  <div v-if="showNumberDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-medium mb-4">Nummer für Export eingeben</h3>
      
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
      </div>
      
      <div class="flex justify-end space-x-2">
        <button
          @click="showNumberDialog = false"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          @click="handleNumberSubmit"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          :disabled="!(isPersonalNumber ? personalNumber : unitNumber)"
        >
          Bestätigen
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

  <!-- Identifier Input Dialog -->
  <div v-if="showIdentifierDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">Identifikationsnummer eingeben</h3>
      
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
        
        <!-- Personennummer Input -->
        <div v-if="isPersonalNumber">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Personennummer
          </label>
          <input 
            type="text" 
            v-model="personalNumber"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Personennummer eingeben"
            maxlength="10"
            @keyup.enter="handleIdentifierSubmit"
          />
        </div>
        
        <!-- Einheitennummer Input -->
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Einheitennummer
          </label>
          <input 
            type="text" 
            v-model="unitNumber"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Einheitennummer eingeben"
            maxlength="10"
            @keyup.enter="handleIdentifierSubmit"
          />
        </div>
        
        <p class="text-sm text-gray-600 mt-1">
          Bitte geben Sie eine {{ isPersonalNumber ? 'Personennummer' : 'Einheitennummer' }} ein.
        </p>
        <p v-if="identifierError" class="text-red-500 text-sm mt-1">{{ identifierError }}</p>
      </div>
      
      <div class="flex justify-end space-x-2">
        <button
          @click="closeIdentifierDialog"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Abbrechen
        </button>
        <button
          @click="handleIdentifierSubmit"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          :disabled="!(isPersonalNumber ? personalNumber : unitNumber)"
        >
          Bestätigen
        </button>
      </div>
    </div>
  </div>
</template> 