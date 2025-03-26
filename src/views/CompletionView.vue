<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDocumentStore } from '@/stores/document';

const router = useRouter();
const route = useRoute();
const documentStore = useDocumentStore();

const customerName = ref('');
const documentId = ref(route.params.id);
const completionDate = ref(new Date().toLocaleDateString('de-DE'));
const isSaving = ref(false);

const finalizeDocument = () => {
  isSaving.value = true;
  
  // Mock: Speichern der finalen Daten
  const finalEntry = {
    id: documentId.value,
    customerName: customerName.value,
    processedDate: completionDate.value,
    status: 'Abgeschlossen'
  };
  
  console.log('Speichere Dokument...', finalEntry);
  
  // Mock: Verzögerung für Speicherungssimulation
  setTimeout(() => {
    console.log('Dokument erfolgreich gespeichert!');
    isSaving.value = false;
    router.push('/dashboard');
  }, 1000);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 class="text-2xl font-medium mb-6">Dokument Speicherung abschließen</h2>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Personalnummer
        </label>
        <input 
          type="text" 
          :value="documentId"
          disabled
          class="w-full p-2 bg-gray-100 border rounded"
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
          autofocus
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
          :disabled="isSaving"
        >
          Abbrechen
        </button>
        <button
          @click="finalizeDocument"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-400 flex items-center"
          :disabled="!customerName || isSaving"
        >
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSaving ? 'Wird gespeichert...' : 'Abschließen' }}
        </button>
      </div>
    </div>
  </div>
</template> 