<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBilanzenStore } from '@/stores/bilanzen.js';
import { useDocumentStore } from '@/stores/document.js';
import { storeToRefs } from 'pinia';
import BreadcrumbNav from '@/components/BreadcrumbNav.vue';
// import JsonImportButton from '@/components/JsonImportButton.vue'; // Keep commented out

const router = useRouter();
const bilanzenStore = useBilanzenStore();
const documentStore = useDocumentStore();
const { isLoading, error } = storeToRefs(bilanzenStore);

// --- Base Mock JSON Data String ---
// Using template literal for easier readability
const baseMockJsonString = `{
  "SessionId": "mockSession_${Date.now()}", 
  "Einheitennummer": "", 
  "Personenummer": "", 
  "Branche": "", 
  "Name": "Generierte Muster-Firma", 
  "Abschlussjahr": "2024", 
  "Von": "2023-01-01", 
  "Bis": "2023-12-31", 
  "Abschlussersteller": "Muster Steuerberater", 
  "Rechtsform": "GmbH", 
  "bilanzData": {
    "Aktiva": [
      {"id": "", "number": 11001, "position": "Selbst gesch. Schutz- u. ä. Rechte", "customerValue": 10000, "ratingValue": 10000, "previousValue": 9000, "isSum": false, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null},
      {"id": "", "number": 11022, "position": "Grundstücke und Gebäude", "customerValue": 30190.00, "ratingValue": 30190.00, "previousValue": 33454.00, "isSum": false, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null},
      {"id": "", "number": 11028, "position": "And. Anlagen und BGA", "customerValue": 382836.00, "ratingValue": 382836.00, "previousValue": 325810.00, "isSum": false, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null},
      {"id": "", "number": 11291, "position": "Ford. a. LuL", "customerValue": 324662.25, "ratingValue": 324662.25, "previousValue": 361019.39, "isSum": false, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null},
      {"id": "", "number": 11351, "position": "Scheck, Kasse, Bankguthaben", "customerValue": 41470.75, "ratingValue": 41470.75, "previousValue": 263916.81, "isSum": false, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null}
    ],
    "Passiva": [
      {"id": "", "number": 12071, "position": "Gewinnvortrag", "customerValue": 3068497.62, "ratingValue": 3068497.62, "previousValue": 2528465.10, "isSum": false, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null},
      {"id": "", "number": 12214, "position": "Verbindlichkeiten gg. Kreditinstituten", "customerValue": 1282381.63, "ratingValue": 1282381.63, "previousValue": 1338955.44, "isSum": false, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null}
    ],
    "GuV": [
      {"tableId": null, "number": "13001", "position": "Umsatzerlöse", "customerValue": 1108067.76, "ratingValue": 1108067.76, "previousValue": 1188926.79, "isSum": false, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null},
      {"tableId": null, "number": "13011", "position": "Jahresüberschuss", "customerValue": 169490.63, "ratingValue": 169490.63, "previousValue": 153000.0, "isSum": true, "hasError": false, "hasWarning": false, "notes": [], "lastEditDate": null}
    ]
  },
  "Summenregeln": [
    {"11019": "11001 + 11002 + 11003 + 11005"}
  ],
  "Umkontierungen": [],
  "corrections": []
}`;

// --- Reactive State ---
const bilanzen = computed(() => documentStore.documents);
const activeTab = ref('all');
const uploadedFile = ref(''); // Still needed for the file upload simulation button
const fileProcessed = ref(false); // Keep for potential future use
const isProcessing = ref(false);
const showIdentifierDialog = ref(false);
const personalNumber = ref('');
const unitNumber = ref('');
const businessSector = ref('');
const identifierError = ref('');

// --- Computed Properties ---
const filteredBilanzen = computed(() => {
  if (!bilanzen.value) return [];
  switch (activeTab.value) {
    case 'processed': return bilanzen.value.filter(b => b.status === 'Verarbeitet');
    case 'errors': return bilanzen.value.filter(b => b.status === 'Fehler');
    default: return bilanzen.value;
  }
});

// --- Methods ---
const setActiveTab = (tab) => { activeTab.value = tab; };
const getStatusClass = (status) => { /* ... */ };
const getRowClass = (status) => { /* ... */ };
const navigateToDocument = (id) => { router.push(`/bilanz/${id}`); };
const navigateToEdit = (id) => { router.push(`/bilanz/${id}/edit`); };

// Simulate file selection (if needed for button styling/logic)
const simulateFileUpload = () => { 
  if (!uploadedFile.value) uploadedFile.value = 'MockBilanz.json';
};

const removeFile = () => {
  uploadedFile.value = '';
  fileProcessed.value = false;
};

// Function called by the "Bilanz verarbeiten" button
const processFile = () => {
  // Simulate file selection if not already done 
  // (mainly to enable the button, though we won't use the file itself)
  if (!uploadedFile.value) {
     simulateFileUpload(); 
  }
  // Open the identifier dialog
  isProcessing.value = true; // Show spinner on button
  showIdentifierDialog.value = true;
};

// Function called when confirming identifiers in the dialog
const handleIdentifierSubmit = () => {
  // Validate that required fields are filled
  if (!personalNumber.value || !businessSector.value) {
    identifierError.value = 'Bitte geben Sie die Personennummer und den Wirtschaftszweig ein.';
    // Keep spinner running, dialog open
    return;
  }
  
  identifierError.value = ''; // Clear error

  try {
    // Parse the base mock JSON
    const mockData = JSON.parse(baseMockJsonString);

    // Inject user input into the mock data
    mockData.Personenummer = personalNumber.value;
    mockData.Branche = businessSector.value; 
    if (unitNumber.value) { // Add unit number only if provided
      mockData.Einheitennummer = unitNumber.value;
    }
    // Optionally update name based on input?
    // mockData.Name = `Firma für PN ${personalNumber.value}`; 

    // Generate a somewhat unique ID based on required inputs
    const entryId = `${personalNumber.value}-${businessSector.value.replace(/\s+/g, '')}`;

    // Prepare the document entry data for the store
    const documentEntry = {
      id: entryId,
      name: `Mock_Bilanz_${entryId}.json`, 
      company: mockData.Name, // Use name from (potentially updated) mock data
      documentType: 'Bilanz (Mock)',
      date: new Date().toLocaleDateString('de-DE'),
      status: 'Verarbeitet', // Assume success for mock
      type: 'json'
    };

    // Add the document entry first
    documentStore.addDocument(documentEntry);

    // Now load the actual bilanz data into the bilanzenStore
    // Use the modified mockData object
    bilanzenStore.loadBilanzData(mockData);

    // Close dialog and reset processing state
    closeIdentifierDialog(); // Resets isProcessing

    // Navigate to the new document view
    router.push(`/bilanz/${entryId}`);

  } catch (e) {
    console.error('Error processing mock JSON with user input:', e);
    identifierError.value = 'Fehler beim Verarbeiten der Daten.';
    isProcessing.value = false; // Stop spinner on error
    // Keep dialog open on error
  }
};

const closeIdentifierDialog = () => {
  showIdentifierDialog.value = false;
  isProcessing.value = false; // Stop spinner when closing dialog
  // Don't clear inputs immediately, user might want to correct
  // personalNumber.value = '';
  // unitNumber.value = '';
  // businessSector.value = '';
  // identifierError.value = ''; // Keep error message if closed on error
};

onMounted(() => {
  console.log('Dashboard mounted');
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <BreadcrumbNav />
    <div class="container mx-auto px-4 py-6">
      <!-- 
      <SessionDataInfo v-if="bilanzenStore.sessionData && bilanzenStore.sessionData.SessionId" /> 
      -->
      <h1 class="text-2xl font-medium mb-6">Dashboard</h1>
      
      <!-- File Upload Section -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-medium">Neue Bilanz verarbeiten</h2>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <p class="mb-2 text-sm text-gray-600">Unterstützte Formate: PDF, XLS, XLSX, JSON</p>
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
          <div class="flex justify-between sm:justify-end">
            <!-- <JsonImportButton /> -->
            <button 
              class="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ml-2"
              :disabled="isProcessing" 
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
      <h3 class="text-lg font-medium mb-4">Identifikationsdaten eingeben</h3>
      
      <!-- Input Fields -->
      <div class="space-y-4 mt-4">
        <div>
          <label for="personal-number" class="block text-sm font-medium text-gray-700 mb-1">Personennummer <span class="text-red-500">*</span></label>
          <input 
            id="personal-number"
            type="text" 
            v-model="personalNumber"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Personennummer eingeben"
            maxlength="10"
            @keyup.enter="handleIdentifierSubmit"
          />
        </div>
        <div>
          <label for="unit-number" class="block text-sm font-medium text-gray-700 mb-1">Einheitennummer (Optional)</label>
          <input 
            id="unit-number"
            type="text" 
            v-model="unitNumber"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Einheitennummer eingeben"
            maxlength="10"
            @keyup.enter="handleIdentifierSubmit"
          />
        </div>
        <div>
          <label for="business-sector" class="block text-sm font-medium text-gray-700 mb-1">Wirtschaftszweig <span class="text-red-500">*</span></label>
          <input 
            id="business-sector"
            type="text" 
            v-model="businessSector"
            class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Wirtschaftszweig eingeben"
            maxlength="50" 
            @keyup.enter="handleIdentifierSubmit"
          />
        </div>
      </div>
      
      <p v-if="identifierError" class="text-red-500 text-sm mt-2">{{ identifierError }}</p>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-2 mt-6">
        <button
          @click="closeIdentifierDialog"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Abbrechen
        </button>
        <button
          @click="handleIdentifierSubmit"
          class="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!personalNumber || !businessSector" 
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