<template>
  <div>
    <button
      @click="handleImportClick"
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-5 w-5 mr-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
        />
      </svg>
      Import JSON Data
    </button>

    <!-- JSON Import Dialog -->
    <div v-if="showImportDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Import JSON Data</h3>
          <button @click="closeImportDialog" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-grow overflow-auto mb-4">
          <textarea
            v-model="jsonInput"
            class="w-full h-64 p-3 border rounded font-mono text-sm"
            placeholder="Paste your JSON data here..."
          ></textarea>

          <div v-if="jsonError" class="mt-2 p-2 bg-red-100 text-red-700 rounded">
            {{ jsonError }}
          </div>

          <div v-if="jsonPreview" class="mt-4">
            <h4 class="font-medium mb-2">Preview:</h4>
            <div class="p-3 bg-gray-100 rounded max-h-40 overflow-y-auto">
              <p><strong>Name:</strong> {{ jsonPreview.Name || 'Not specified' }}</p>
              <p><strong>Session ID:</strong> {{ jsonPreview.SessionId || 'Not specified' }}</p>
              <p><strong>Aktiva Items:</strong> {{ jsonPreview.bilanzData?.Aktiva?.length || 0 }}</p>
              <p><strong>Passiva Items:</strong> {{ jsonPreview.bilanzData?.Passiva?.length || 0 }}</p>
              <p><strong>GuV Items:</strong> {{ jsonPreview.bilanzData?.GuV?.length || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="flex space-x-2 justify-end">
          <button
            @click="closeImportDialog"
            class="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="importJson"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            :disabled="!isValidJson"
          >
            Import Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDocumentStore } from '../stores/document';
import { useRouter } from 'vue-router';

const documentStore = useDocumentStore();
const router = useRouter();

const showImportDialog = ref(false);
const jsonInput = ref('');
const jsonError = ref('');
const jsonPreview = ref(null);
const isLoading = ref(false);

const isValidJson = computed(() => {
  return jsonPreview.value !== null && !jsonError.value;
});

const handleImportClick = () => {
  showImportDialog.value = true;
  jsonInput.value = '';
  jsonError.value = '';
  jsonPreview.value = null;
};

const closeImportDialog = () => {
  showImportDialog.value = false;
  jsonInput.value = '';
  jsonError.value = '';
  jsonPreview.value = null;
};

const importJson = () => {
  if (!isValidJson.value) return;
  
  isLoading.value = true;
  try {
    // Pre-process the JSON string to handle NaN values before parsing
    const processedJson = jsonInput.value
      .replace(/:\s*NaN/g, ': null')
      .replace(/:\s*\[NaN\]/g, ': []');
    
    // Parse the JSON and load it into the document store
    const data = JSON.parse(processedJson);
    const document = documentStore.loadExternalJsonData(data);
    
    // Close the dialog
    closeImportDialog();
    
    // Navigate to the document view
    router.push(`/bilanz/${document.id}`);
  } catch (error) {
    jsonError.value = `Error importing data: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Watch for changes in the JSON input to provide preview
const validateJson = () => {
  try {
    if (!jsonInput.value.trim()) {
      jsonError.value = '';
      jsonPreview.value = null;
      return;
    }
    
    // Pre-process the JSON string to handle NaN values
    // Replace all instances of NaN with null since JSON doesn't support NaN
    const processedJson = jsonInput.value
      .replace(/:\s*NaN/g, ': null')
      .replace(/:\s*\[NaN\]/g, ': []');
    
    const parsed = JSON.parse(processedJson);
    
    // Basic validation
    if (!parsed.bilanzData) {
      jsonError.value = 'The JSON must contain a bilanzData property.';
      jsonPreview.value = null;
      return;
    }
    
    // If all checks pass
    jsonError.value = '';
    jsonPreview.value = parsed;
  } catch (error) {
    jsonError.value = `Invalid JSON: ${error.message}`;
    jsonPreview.value = null;
  }
};

// Update the JSON preview whenever the input changes
const debouncedValidate = () => {
  const timeoutId = setTimeout(() => {
    validateJson();
  }, 300);
  return () => clearTimeout(timeoutId);
};

// Watch for input changes
import { watch } from 'vue';
watch(jsonInput, () => {
  debouncedValidate();
});
</script> 