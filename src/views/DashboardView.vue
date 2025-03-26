<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBilanzenStore } from '@/stores/bilanzen.js';
import { useDocumentStore } from '@/stores/document.js';
import { storeToRefs } from 'pinia';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';

const router = useRouter();
const bilanzenStore = useBilanzenStore();
const documentStore = useDocumentStore();
const { isLoading, error } = storeToRefs(bilanzenStore);

// Use documents from documentStore instead of local bilanzen ref
const bilanzen = computed(() => documentStore.documents);

// Tabs state
const activeTab = ref('all');
const uploadedFile = ref('');
const fileProcessed = ref(false);
const isProcessing = ref(false);
const showIdentifierDialog = ref(false);
const identifierNumber = ref('');
const identifierError = ref('');

// Computed properties for filtered documents
const filteredBilanzen = computed(() => {
  if (!bilanzen.value) return [];
  
  switch (activeTab.value) {
    case 'processed':
      return bilanzen.value.filter(b => b.status === 'Verarbeitet');
    case 'errors':
      return bilanzen.value.filter(b => b.status === 'Fehler');
    default:
      return bilanzen.value;
  }
});

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

const getStatusClass = (status) => {
  const classes = 'px-2 py-1 text-xs rounded-full ';
  
  switch (status) {
    case 'Verarbeitet':
      return classes + 'bg-green-100 text-green-800';
    case 'Fehler':
      return classes + 'bg-red-100 text-red-800';
    case 'In Bearbeitung':
      return classes + 'bg-yellow-100 text-yellow-800';
    default:
      return classes + 'bg-gray-100 text-gray-800';
  }
};

const getRowClass = (status) => {
  switch (status) {
    case 'error':
      return 'data-table-row-error';
    case 'warning':
      return 'data-table-row-warning';
    default:
      return 'data-table-row';
  }
};

const navigateToDocument = (id) => {
  console.log('Navigating to document view:', id);
  router.push(`/bilanz/${id}`);
};

const navigateToEdit = (id) => {
  console.log('Navigating to document edit:', id);
  router.push(`/bilanz/${id}/edit`);
};

const navigateToUpload = () => {
  router.push('/upload');
};

const simulateFileUpload = () => {
  if (!uploadedFile.value) {
    // Simulieren der Auswahl von PDF2.pdf
    uploadedFile.value = 'PDF2.pdf';
  }
};

const removeFile = () => {
  uploadedFile.value = '';
  fileProcessed.value = false;
};

const validateIdentifier = (value) => {
  // Check if at least one number is entered
  return /\d+/.test(value);
};

const processFile = () => {
  isProcessing.value = true;
  showIdentifierDialog.value = true;
};

const handleIdentifierSubmit = () => {
  if (!identifierNumber.value) {
    identifierError.value = 'Bitte geben Sie eine Nummer ein';
    return;
  }

  // Close dialog and update state
  showIdentifierDialog.value = false;
  fileProcessed.value = true;
  
  // Create new entry
  const entry = {
    id: identifierNumber.value,
    name: `Waldeck_PDF2.pdf`,
    company: 'Waldeck GmbH',
    documentType: 'Bilanz',
    date: new Date().toLocaleDateString('de-DE'),
    status: 'Verarbeitet',
    type: 'pdf'
  };
  
  // Add to bilanzen array
  documentStore.addDocument(entry);
  
  // Process the file (show loading animation)
  isProcessing.value = true;
  
  // Navigate after a delay
  setTimeout(() => {
    isProcessing.value = false;
    router.push(`/bilanz/${entry.id}`);
  }, 1500);
};

// Add function to handle new XLS file
const addXLSFile = (personalNumber) => {
  const entry = {
    id: Date.now(), // Generate unique ID
    name: `Waldeck_XLS_EXPORT_${personalNumber}.xls`,
    company: 'Waldeck GmbH',
    documentType: 'XLS Export',
    date: new Date().toLocaleDateString('de-DE'),
    status: 'Verarbeitet',
    type: 'xls'
  };
  
  // Add to beginning of bilanzen array
  documentStore.addDocument(entry);
};

const closeIdentifierDialog = () => {
  showIdentifierDialog.value = false;
  isProcessing.value = false;
  identifierNumber.value = '';
  identifierError.value = '';
};

onMounted(() => {
  // No need to initialize mock data anymore as we're using the store
  console.log('Dashboard mounted');
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <BreadcrumbNav />
    <div class="container mx-auto px-4 py-6">
      <h1 class="text-2xl font-medium mb-6">Dashboard</h1>
      
      <!-- File Upload Section -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-medium">Neue Bilanz hochladen</h2>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <p class="mb-2 text-sm text-gray-600">Unterstützte Formate: PDF, XLS, XLSX</p>
            <div 
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors duration-200"
              @click="simulateFileUpload"
            >
              <div v-if="!uploadedFile" class="py-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-sm font-medium text-gray-900">Klicken Sie zum Hochladen</p>
                <p class="text-xs text-gray-500">oder Bilanz hierher ziehen</p>
              </div>
              <div v-else class="flex items-center justify-center py-2">
                <div class="bg-blue-50 p-3 rounded-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="font-medium">{{ uploadedFile }}</span>
                  <button 
                    @click.stop="removeFile" 
                    class="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-center sm:justify-end">
            <button 
              class="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              :disabled="!uploadedFile || isProcessing"
              @click="processFile"
            >
              <span v-if="!isProcessing">Bilanz verarbeiten</span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Wird verarbeitet</span><span class="dots-animation">...</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bilanzen List Section -->
      <div class="bg-white rounded-lg shadow">
        <!-- Tabs -->
        <div class="flex border-b border-gray-200 mb-2">
          <button 
            @click="setActiveTab('all')"
            :class="[
              'px-6 py-2 text-sm font-medium rounded-full mx-1 my-2',
              activeTab === 'all' 
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Alle Bilanzen
          </button>
          <button 
            @click="setActiveTab('processed')"
            :class="[
              'px-6 py-2 text-sm font-medium rounded-full mx-1 my-2',
              activeTab === 'processed' 
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Verarbeitet
          </button>
          <button 
            @click="setActiveTab('errors')"
            :class="[
              'px-6 py-2 text-sm font-medium rounded-full mx-1 my-2',
              activeTab === 'errors' 
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Fehler
          </button>
        </div>
        
        <!-- Table -->
        <div class="overflow-x-auto">
          <div v-if="!bilanzen || bilanzen.length === 0 && !fileProcessed" class="text-center py-12">
            <p class="text-gray-500">Keine Bilanzen vorhanden. Laden Sie eine Bilanz hoch, um zu beginnen.</p>
          </div>
          <table v-else class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bilanz</th>
                <th class="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unternehmen</th>
                <th class="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                <th class="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                <th class="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bilanz in filteredBilanzen" :key="bilanz.id" class="border-b border-gray-100">
                <td class="px-4 py-4">
                  <div class="flex items-center">
                    <svg v-if="bilanz.type === 'pdf'" class="flex-shrink-0 h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="flex-shrink-0 h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-gray-900">{{ bilanz.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 text-sm text-gray-900">{{ bilanz.company }}</td>
                <td class="px-4 py-4 text-sm text-gray-900">{{ bilanz.documentType }}</td>
                <td class="px-4 py-4 text-sm text-gray-900">{{ bilanz.date }}</td>
                <td class="px-4 py-4">
                  <span :class="[
                    'inline-flex px-3 py-1 text-xs font-medium rounded-full',
                    bilanz.status === 'Verarbeitet' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ bilanz.status }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <div class="flex justify-start space-x-2">
                    <div class="relative group">
                      <button 
                        @click="navigateToDocument(bilanz.id)"
                        class="text-blue-600 hover:text-blue-800 border-none bg-transparent" 
                        title="Ansehen"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        Ansicht
                      </div>
                    </div>
                    <div class="relative group">
                      <button 
                        @click="navigateToEdit(bilanz.id)"
                        class="text-gray-600 hover:text-gray-800 border-none bg-transparent" 
                        title="Bearbeiten"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        Bearbeiten
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Entwicklungs-Testserver Badge -->
      <div class="fixed bottom-4 left-4 z-30">
        <span class="px-3 py-1 text-xs bg-red-50 text-red-600 border border-red-100 rounded-full opacity-80 hover:opacity-100 transition-opacity duration-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Entwicklungs-Testserver
        </span>
      </div>
    </div>
  </div>

  <!-- Identifier Input Dialog -->
  <div v-if="showIdentifierDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">Identifikationsnummer eingeben</h3>
      <div class="mb-4">
        <input
          type="text"
          v-model="identifierNumber"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Personalnummer eingeben"
          maxlength="10"
          @keyup.enter="handleIdentifierSubmit"
        />
        <p class="text-sm text-gray-600 mt-1">
          Bitte geben Sie eine Personalnummer ein.
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
          :disabled="!identifierNumber || !validateIdentifier(identifierNumber)"
        >
          Bestätigen
        </button>
      </div>
    </div>
  </div>

  <div v-if="isProcessing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-lg font-semibold mb-4">Bilanz wird verarbeitet...</h3>
      <div class="flex justify-center">
        <svg class="animate-spin -ml-1 mr-2 h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Responsive Anpassungen */
@media (max-width: 768px) {
  table {
    table-layout: fixed;
    width: 100%;
  }
  
  th, td {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  th:nth-child(3), 
  td:nth-child(3), 
  th:nth-child(4), 
  td:nth-child(4) {
    display: none;
  }
}

/* Verbesserte Tabellen-Stile */
th {
  font-weight: 500;
}

td, th {
  white-space: nowrap;
  text-align: left;
  vertical-align: middle;
}

/* Tab-Stile */
button:focus {
  outline: none;
}

/* Animation für die Punkte beim Laden */
@keyframes dotsAnimation {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
  100% { content: ''; }
}

.dots-animation {
  display: inline-block;
  width: 16px;
}

.dots-animation::after {
  content: '';
  animation: dotsAnimation 1.5s infinite;
}
</style>