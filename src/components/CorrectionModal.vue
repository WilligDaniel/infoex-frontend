<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-medium">Automatische a.o. Posten Korrektur</h2>
      </div>
      
      <!-- Content -->
      <div class="p-4 overflow-y-auto max-h-[60vh]">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2">Korrekturen werden geladen...</span>
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{{ error }}</p>
        </div>
        
        <!-- Corrections list -->
        <div v-else-if="corrections.length > 0">
          <p class="mb-4 text-sm text-gray-600">
            Folgende Korrekturen wurden automatisch erkannt. Bitte wählen Sie die Korrekturen aus, die Sie anwenden möchten.
          </p>
          
          <div class="space-y-3">
            <div 
              v-for="correction in corrections" 
              :key="correction.id"
              class="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
            >
              <div class="flex items-start">
                <input 
                  type="checkbox" 
                  :id="`correction-${correction.id}`" 
                  v-model="selectedCorrections"
                  :value="correction.id"
                  class="mt-1 mr-3"
                />
                <div>
                  <label :for="`correction-${correction.id}`" class="font-medium cursor-pointer">
                    {{ correction.reason }}
                  </label>
                  <div class="mt-1 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">Alter Wert:</span>
                      <span class="ml-1 text-red-600 line-through">{{ formatCurrency(correction.oldValue) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Neuer Wert:</span>
                      <span class="ml-1 text-green-600">{{ formatCurrency(correction.newValue) }}</span>
                    </div>
                  </div>
                  <div class="mt-2 text-xs text-gray-500">
                    <p>Diese Korrektur wird die Summenberechnung beeinflussen und kann weitere Anpassungen erforderlich machen.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No corrections -->
        <div v-else class="text-center py-8">
          <p class="text-gray-500">Keine Korrekturen gefunden.</p>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button 
          @click="applySelectedCorrections"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="selectedCorrections.length === 0 || isLoading"
        >
          Korrekturen anwenden
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  corrections: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'apply']);

const selectedCorrections = ref([]);

const applySelectedCorrections = () => {
  emit('apply', selectedCorrections.value);
};

// Formatierung für Währungswerte
const formatCurrency = (value) => {
  // Formatiere als Tausend Euro (T€)
  const valueInThousands = value / 1000;
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valueInThousands);
};

// Bestimme die Farbe basierend auf dem Status
const getStatusColor = (oldValue, newValue) => {
  // Wenn die Werte unterschiedlich sind, zeige Rot an
  if (Math.abs(oldValue - newValue) > 0.01) {
    return 'text-red-600';
  }
  return 'text-gray-600';
};
</script> 