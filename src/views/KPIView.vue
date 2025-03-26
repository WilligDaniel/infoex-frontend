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
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-medium">KPI-Auswertung</h2>
        
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
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- KPI Cards -->
        <div v-for="kpi in kpis" :key="kpi.id" class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-medium">{{ kpi.name }}</h3>
            <!-- Info Button with Tooltip -->
            <div class="relative">
              <button 
                @mouseenter="kpi.showInfo = true"
                @mouseleave="kpi.showInfo = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </button>
              <!-- Tooltip -->
              <div 
                v-if="kpi.showInfo"
                class="absolute z-10 right-0 mt-2 w-64 px-4 py-2 bg-white border rounded-lg shadow-lg text-sm text-gray-600"
              >
                {{ kpi.description }}
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between mt-4">
            <span class="text-2xl font-bold">{{ kpi.value }}</span>
            <div class="flex items-center space-x-2">
              <!-- Traffic Light -->
              <span 
                class="w-4 h-4 rounded-full"
                :class="{
                  'bg-red-500': kpi.status === 'red',
                  'bg-yellow-500': kpi.status === 'yellow',
                  'bg-green-500': kpi.status === 'green'
                }"
              ></span>
            </div>
          </div>

          <!-- Optional: Placeholder for future comment suggestions -->
          <div class="mt-4 p-2 border border-dashed border-gray-300 rounded">
            <p class="text-sm text-gray-500">Kommentarvorschlag</p>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const documentId = ref(route.params.id);
const isLoading = ref(true);

const navigateToCompletion = () => {
  router.push(`/bilanz/${documentId.value}/completion`);
};

onMounted(() => {
  // Simulate loading delay
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
});

const kpis = ref([
  {
    id: 1,
    name: 'Umsatzrentabilität',
    value: '8,5%',
    status: 'green',
    description: 'Die Umsatzrentabilität zeigt das Verhältnis zwischen Gewinn und Umsatz.',
    showInfo: false
  },
  {
    id: 2,
    name: 'Gesamtkapitalrentabilität',
    value: '6,2%',
    status: 'yellow',
    description: 'Die Gesamtkapitalrentabilität zeigt die Verzinsung des eingesetzten Kapitals.',
    showInfo: false
  },
  {
    id: 3,
    name: 'Debitorenziel',
    value: '45 Tage',
    status: 'yellow',
    description: 'Das Debitorenziel gibt die durchschnittliche Dauer bis zum Zahlungseingang von Forderungen an.',
    showInfo: false
  },
  {
    id: 4,
    name: 'Kreditorenziel',
    value: '38 Tage',
    status: 'green',
    description: 'Das Kreditorenziel gibt die durchschnittliche Dauer bis zur Bezahlung von Verbindlichkeiten an.',
    showInfo: false
  },
  {
    id: 5,
    name: 'Liquidität 1. Grades',
    value: '15%',
    status: 'red',
    description: 'Die Liquidität 1. Grades zeigt das Verhältnis der flüssigen Mittel zu den kurzfristigen Verbindlichkeiten.',
    showInfo: false
  },
  {
    id: 6,
    name: 'Eigenkapitalquote',
    value: '28%',
    status: 'yellow',
    description: 'Die Eigenkapitalquote zeigt den Anteil des Eigenkapitals am Gesamtkapital.',
    showInfo: false
  },
  {
    id: 7,
    name: 'Verschuldungsdauer in Tagen',
    value: '156 Tage',
    status: 'yellow',
    description: 'Die Verschuldungsdauer gibt an, in wie vielen Tagen die Schulden bei gleichbleibender Ertragskraft getilgt werden können.',
    showInfo: false
  },
  {
    id: 8,
    name: 'Anlagendeckung II',
    value: '115%',
    status: 'green',
    description: 'Die Anlagendeckung II zeigt, inwieweit das Anlagevermögen durch langfristiges Kapital finanziert ist.',
    showInfo: false
  },
  {
    id: 9,
    name: 'Working Capital Quote',
    value: '22%',
    status: 'yellow',
    description: 'Die Working Capital Quote zeigt das Verhältnis des Working Capitals zum Umsatz.',
    showInfo: false
  }
]);

// Add new ref for branch selection
const selectedBranch = ref('sonstige');

// Mock functions for new buttons
const generateConsultingOverview = () => {
  console.log('Generating consulting overview...');
  // Mock implementation
};

const downloadDMS = () => {
  console.log('Downloading DMS...');
  // Mock implementation
};
</script> 