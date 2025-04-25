<template>
  <!-- Loading Overlay -->
  <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96">
      <div class="flex flex-col items-center">
        <svg class="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-lg font-medium">KPI-Auswertung wird geladen...</p>
      </div>
    </div>
  </div>

  <div class="min-h-screen bg-gray-50 py-8" :class="{ 'opacity-0': isLoading }">
    <!-- Copy Success Notification -->
    <div 
      v-if="showCopyNotification"
      class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in-up"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span>Kommentar wurde in die Zwischenablage kopiert</span>
    </div>

    <div class="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-medium">KPI-Auswertung</h2>
        
        <!-- Identifiers and Branch -->
        <div class="flex items-center gap-4">
          <!-- Wirtschaftszweig Display -->
          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Wirtschaftszweig</label>
            <div class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
              {{ wirtschaftszweig }}
            </div>
          </div>
          <!-- Branchen Dropdown -->
          <div class="w-48">
            <label class="block text-sm font-medium text-gray-700 mb-1">Branche</label>
            <select 
              v-model="selectedBranch"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="landwirtschaft">Landwirtschaft</option>
              <option value="gastronomie">Gastronomie</option>
              <option value="retail">Retail</option>
              <option value="sonstige">Sonstige</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Grouped KPI Sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- 1. Substanz -->
        <div>
          <h3 class="text-lg font-semibold mb-4 border-b pb-2 text-center text-cyan-700">Substanz</h3>
          <div class="space-y-4">
            <div v-for="kpi in substanzKpis" :key="kpi.id" class="bg-gray-50 rounded-lg p-4 shadow-sm">
              <!-- Reused KPI Card Content -->
              <div class="flex items-start justify-between mb-2">
                 <h4 class="font-medium text-base">{{ kpi.name }}</h4>
                 <div class="relative">
                   <button @mouseenter="kpi.showInfo = true" @mouseleave="kpi.showInfo = false" class="text-gray-400 hover:text-gray-600">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
                   </button>
                   <div v-if="kpi.showInfo" class="absolute z-10 right-0 mt-2 w-64 px-4 py-2 bg-white border rounded-lg shadow-lg text-sm text-gray-600">
                     {{ kpi.description }}
                   </div>
                 </div>
               </div>
               <div class="flex items-center justify-between mt-4">
                 <span class="text-2xl font-bold">{{ kpi.value }}</span>
                 <div class="relative group">
                    <div class="w-6 h-6 rounded-full transition-all duration-200" :class="{ 'bg-red-500': kpi.status === 'red', 'bg-yellow-500': kpi.status === 'yellow', 'bg-green-500': kpi.status === 'green' }"></div>
                   <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">Automatischer Status</div>
                 </div>
               </div>
               <div class="mt-4 flex items-center justify-between">
                 <button @click="openKpiEditModal(kpi)" class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                   Kennzahl bearbeiten
                 </button>
                 <div class="w-5 h-5 rounded-full ml-2 flex-shrink-0" :class="getManualStatusClass(kpi.manualStatus)"></div>
               </div>
               <div class="mt-2" v-if="kpi.comment">
                 <button @click="copyComment(kpi.comment)" class="w-full px-3 py-1.5 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                   Gespeicherten Kommentar kopieren
                 </button>
               </div>
              <!-- End Reused KPI Card Content -->
            </div>
          </div>
        </div>

        <!-- 2. Liquidität -->
        <div>
          <h3 class="text-lg font-semibold mb-4 border-b pb-2 text-center text-cyan-700">Liquidität</h3>
           <div class="space-y-4">
            <div v-for="kpi in liquiditaetKpis" :key="kpi.id" class="bg-gray-50 rounded-lg p-4 shadow-sm">
               <!-- Reused KPI Card Content (Copy from Substanz section) -->
               <div class="flex items-start justify-between mb-2"><h4 class="font-medium text-base">{{ kpi.name }}</h4><div class="relative"><button @mouseenter="kpi.showInfo = true" @mouseleave="kpi.showInfo = false" class="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></button><div v-if="kpi.showInfo" class="absolute z-10 right-0 mt-2 w-64 px-4 py-2 bg-white border rounded-lg shadow-lg text-sm text-gray-600">{{ kpi.description }}</div></div></div><div class="flex items-center justify-between mt-4"><span class="text-2xl font-bold">{{ kpi.value }}</span><div class="relative group"><div class="w-6 h-6 rounded-full transition-all duration-200" :class="{ 'bg-red-500': kpi.status === 'red', 'bg-yellow-500': kpi.status === 'yellow', 'bg-green-500': kpi.status === 'green' }"></div><div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">Automatischer Status</div></div></div><div class="mt-4 flex items-center justify-between"><button @click="openKpiEditModal(kpi)" class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Kennzahl bearbeiten</button><div class="w-5 h-5 rounded-full ml-2 flex-shrink-0" :class="getManualStatusClass(kpi.manualStatus)"></div></div><div class="mt-2" v-if="kpi.comment"><button @click="copyComment(kpi.comment)" class="w-full px-3 py-1.5 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Gespeicherten Kommentar kopieren</button></div>
             </div>
          </div>
        </div>

        <!-- 3. Rentabilität -->
        <div>
          <h3 class="text-lg font-semibold mb-4 border-b pb-2 text-center text-cyan-700">Rentabilität</h3>
          <div class="space-y-4">
            <div v-for="kpi in rentabilitaetKpis" :key="kpi.id" class="bg-gray-50 rounded-lg p-4 shadow-sm">
              <!-- Reused KPI Card Content (Copy from Substanz section) -->
               <div class="flex items-start justify-between mb-2"><h4 class="font-medium text-base">{{ kpi.name }}</h4><div class="relative"><button @mouseenter="kpi.showInfo = true" @mouseleave="kpi.showInfo = false" class="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></button><div v-if="kpi.showInfo" class="absolute z-10 right-0 mt-2 w-64 px-4 py-2 bg-white border rounded-lg shadow-lg text-sm text-gray-600">{{ kpi.description }}</div></div></div><div class="flex items-center justify-between mt-4"><span class="text-2xl font-bold">{{ kpi.value }}</span><div class="relative group"><div class="w-6 h-6 rounded-full transition-all duration-200" :class="{ 'bg-red-500': kpi.status === 'red', 'bg-yellow-500': kpi.status === 'yellow', 'bg-green-500': kpi.status === 'green' }"></div><div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">Automatischer Status</div></div></div><div class="mt-4 flex items-center justify-between"><button @click="openKpiEditModal(kpi)" class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Kennzahl bearbeiten</button><div class="w-5 h-5 rounded-full ml-2 flex-shrink-0" :class="getManualStatusClass(kpi.manualStatus)"></div></div><div class="mt-2" v-if="kpi.comment"><button @click="copyComment(kpi.comment)" class="w-full px-3 py-1.5 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Gespeicherten Kommentar kopieren</button></div>
            </div>
          </div>
        </div>

        <!-- 4. Finanzierungsstruktur -->
        <div>
          <h3 class="text-lg font-semibold mb-4 border-b pb-2 text-center text-cyan-700">Finanzierungsstruktur</h3>
          <div class="space-y-4">
            <div v-for="kpi in finanzierungsstrukturKpis" :key="kpi.id" class="bg-gray-50 rounded-lg p-4 shadow-sm">
              <!-- Reused KPI Card Content (Copy from Substanz section) -->
               <div class="flex items-start justify-between mb-2"><h4 class="font-medium text-base">{{ kpi.name }}</h4><div class="relative"><button @mouseenter="kpi.showInfo = true" @mouseleave="kpi.showInfo = false" class="text-gray-400 hover:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></button><div v-if="kpi.showInfo" class="absolute z-10 right-0 mt-2 w-64 px-4 py-2 bg-white border rounded-lg shadow-lg text-sm text-gray-600">{{ kpi.description }}</div></div></div><div class="flex items-center justify-between mt-4"><span class="text-2xl font-bold">{{ kpi.value }}</span><div class="relative group"><div class="w-6 h-6 rounded-full transition-all duration-200" :class="{ 'bg-red-500': kpi.status === 'red', 'bg-yellow-500': kpi.status === 'yellow', 'bg-green-500': kpi.status === 'green' }"></div><div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">Automatischer Status</div></div></div><div class="mt-4 flex items-center justify-between"><button @click="openKpiEditModal(kpi)" class="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>Kennzahl bearbeiten</button><div class="w-5 h-5 rounded-full ml-2 flex-shrink-0" :class="getManualStatusClass(kpi.manualStatus)"></div></div><div class="mt-2" v-if="kpi.comment"><button @click="copyComment(kpi.comment)" class="w-full px-3 py-1.5 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Gespeicherten Kommentar kopieren</button></div>
             </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex justify-between mt-6 space-x-3">
        <div class="space-x-3">
          <button 
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            @click="generateConsultingOverview"
          >
            Beratungsübersicht erzeugen
          </button>
          <button 
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            @click="downloadDMS"
          >
            DMS Download
          </button>
        </div>
        
        <div class="space-x-3">
          <button 
            @click="$router.push('/dashboard')"
            class="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Zurück zum Dashboard
          </button>
          <button 
            @click="navigateToCompletion"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Weiter zur Abschließung
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- KPI Edit Modal -->
  <div v-if="showKpiEditModal && editingKpi" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium">Kennzahl bearbeiten: {{ editingKpi.name }} ({{ editingKpi.value }})</h3>
      </div>
      <div class="p-6">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Manuellen Status auswählen:</label>
          <div class="flex space-x-4 justify-center">
            <button 
              v-for="status in ['green', 'yellow', 'red']" 
              :key="status" 
              @click="selectedManualStatus = status"
              class="w-10 h-10 rounded-full border-2 transition-all duration-150"
              :class="[
                getManualStatusClass(status),
                selectedManualStatus === status ? 'ring-2 ring-offset-2 ring-blue-500' : 'border-transparent'
              ]"
            ></button>
          </div>
        </div>
        <div class="mb-4">
          <label for="kpi-comment" class="block text-sm font-medium text-gray-700 mb-1">Kommentar (erforderlich):</label>
          <textarea 
            id="kpi-comment"
            v-model="kpiComment"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Begründung für den gewählten Status..."
          ></textarea>
          <p v-if="modalError" class="text-red-500 text-sm mt-1">{{ modalError }}</p>
        </div>
      </div>
      <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
        <button 
          @click="closeKpiEditModal"
          class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
        <button 
          @click="saveKpiChanges"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
          :disabled="!selectedManualStatus || !kpiComment.trim()"
        >
          Speichern
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useBilanzenStore } from '@/stores/bilanzen.js';

const router = useRouter();
const route = useRoute();
const bilanzenStore = useBilanzenStore();
const documentId = ref(route.params.id);
const isLoading = ref(true);

// --- Computed properties to get identifier data from store ---
const wirtschaftszweig = computed(() => bilanzenStore.sessionData?.Branche || 'N/A');

// --- State for KPI Edit Modal ---
const showKpiEditModal = ref(false);
const editingKpi = ref(null); // Holds the KPI object being edited
const selectedManualStatus = ref(''); // Holds the status selected in the modal
const kpiComment = ref(''); // Holds the comment entered in the modal
const modalError = ref(''); // Error message for the modal

// --- Refs for existing logic ---
const showCopyNotification = ref(false);
const selectedBranch = ref('sonstige');

const kpis = ref([
  {
    id: 1,
    name: 'Umsatzrentabilität',
    value: '8,5%',
    status: 'green',
    manualStatus: 'gray',
    comment: '',
    description: 'Die Umsatzrentabilität zeigt das Verhältnis zwischen Gewinn und Umsatz.',
    showInfo: false
  },
  {
    id: 2,
    name: 'Gesamtkapitalrentabilität',
    value: '6,2%',
    status: 'yellow',
    manualStatus: 'gray',
    comment: '',
    description: 'Die Gesamtkapitalrentabilität zeigt die Verzinsung des eingesetzten Kapitals.',
    showInfo: false
  },
  {
    id: 3,
    name: 'Debitorenziel',
    value: '45 Tage',
    status: 'yellow',
    manualStatus: 'gray',
    comment: '',
    description: 'Das Debitorenziel gibt die durchschnittliche Dauer bis zum Zahlungseingang von Forderungen an.',
    showInfo: false
  },
  {
    id: 4,
    name: 'Kreditorenziel',
    value: '38 Tage',
    status: 'green',
    manualStatus: 'gray',
    comment: '',
    description: 'Das Kreditorenziel gibt die durchschnittliche Dauer bis zur Bezahlung von Verbindlichkeiten an.',
    showInfo: false
  },
  {
    id: 5,
    name: 'Liquidität 1. Grades',
    value: '15%',
    status: 'red',
    manualStatus: 'gray',
    comment: '',
    description: 'Die Liquidität 1. Grades zeigt das Verhältnis der flüssigen Mittel zu den kurzfristigen Verbindlichkeiten.',
    showInfo: false
  },
  {
    id: 6,
    name: 'Eigenkapitalquote',
    value: '28%',
    status: 'yellow',
    manualStatus: 'gray',
    comment: '',
    description: 'Die Eigenkapitalquote zeigt den Anteil des Eigenkapitals am Gesamtkapital.',
    showInfo: false
  },
  {
    id: 7,
    name: 'Verschuldungsdauer in Tagen',
    value: '156 Tage',
    status: 'yellow',
    manualStatus: 'gray',
    comment: '',
    description: 'Die Verschuldungsdauer gibt an, in wie vielen Tagen die Schulden bei gleichbleibender Ertragskraft getilgt werden können.',
    showInfo: false
  },
  {
    id: 8,
    name: 'Anlagendeckung II',
    value: '115%',
    status: 'green',
    manualStatus: 'gray',
    comment: '',
    description: 'Die Anlagendeckung II zeigt, inwieweit das Anlagevermögen durch langfristiges Kapital finanziert ist.',
    showInfo: false
  },
  {
    id: 9,
    name: 'Working Capital Quote',
    value: '22%',
    status: 'yellow',
    manualStatus: 'gray',
    comment: '',
    description: 'Die Working Capital Quote zeigt das Verhältnis des Working Capitals zum Umsatz.',
    showInfo: false
  }
]);

// --- Define KPI Groupings ---
const substanzNames = ['Eigenkapitalquote', 'Working Capital Quote'];
const liquiditaetNames = ['Liquidität 1. Grades', 'Debitorenziel', 'Kreditorenziel'];
const rentabilitaetNames = ['Umsatzrentabilität', 'Gesamtkapitalrentabilität'];
const finanzierungsstrukturNames = ['Verschuldungsdauer in Tagen', 'Anlagendeckung II'];

// --- Computed Properties for Grouped KPIs ---
const substanzKpis = computed(() => kpis.value.filter(kpi => substanzNames.includes(kpi.name)));
const liquiditaetKpis = computed(() => kpis.value.filter(kpi => liquiditaetNames.includes(kpi.name)));
const rentabilitaetKpis = computed(() => kpis.value.filter(kpi => rentabilitaetNames.includes(kpi.name)));
const finanzierungsstrukturKpis = computed(() => kpis.value.filter(kpi => finanzierungsstrukturNames.includes(kpi.name)));

// --- Methods ---

const navigateToCompletion = () => {
  router.push(`/bilanz/${documentId.value}/completion`);
};

// Get CSS class for manual status light
const getManualStatusClass = (status) => {
  switch (status) {
    case 'red': return 'bg-red-500';
    case 'yellow': return 'bg-yellow-500';
    case 'green': return 'bg-green-500';
    default: return 'bg-gray-400'; // Default gray for 'gray' or unknown
  }
};

// Open the KPI edit modal
const openKpiEditModal = (kpi) => {
  editingKpi.value = kpi;
  selectedManualStatus.value = kpi.manualStatus === 'gray' ? '' : kpi.manualStatus; // Pre-select if already set
  kpiComment.value = kpi.comment;
  modalError.value = ''; // Clear previous errors
  showKpiEditModal.value = true;
};

// Close the KPI edit modal
const closeKpiEditModal = () => {
  showKpiEditModal.value = false;
  editingKpi.value = null;
  selectedManualStatus.value = '';
  kpiComment.value = '';
  modalError.value = '';
};

// Save changes from the KPI edit modal
const saveKpiChanges = () => {
  if (!selectedManualStatus.value || !kpiComment.value.trim()) {
    modalError.value = 'Bitte wählen Sie einen Status und geben Sie einen Kommentar ein.';
    return;
  }

  // Find the KPI in the main array and update it
  const kpiIndex = kpis.value.findIndex(k => k.id === editingKpi.value.id);
  if (kpiIndex !== -1) {
    kpis.value[kpiIndex].manualStatus = selectedManualStatus.value;
    kpis.value[kpiIndex].comment = kpiComment.value.trim();
  }
  
  // Close the modal
  closeKpiEditModal();
};

// Copy the stored comment to clipboard
const copyComment = async (comment) => {
  if (!comment) return; // Do nothing if no comment
  try {
    await navigator.clipboard.writeText(comment);
    showCopyNotification.value = true;
    setTimeout(() => {
      showCopyNotification.value = false;
    }, 3000);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
};

// Mock functions for other buttons
const generateConsultingOverview = () => { console.log('Generating consulting overview...'); };
const downloadDMS = () => { console.log('Downloading DMS...'); };

onMounted(() => {
  // Simulate loading delay
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
  
  // Append animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(1rem); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
  `;
  document.head.appendChild(style);
});

</script> 