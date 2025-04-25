<template>
  <div class="bg-white shadow rounded-lg p-4 mb-6">
    <h2 class="text-lg font-medium mb-4">Session Data</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="(field, index) in displayFields" :key="index" class="flex flex-col">
        <span class="text-sm text-gray-500">{{ field.label }}</span>
        <span class="font-medium">{{ formatValue(field.key) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBilanzenStore } from '../stores/bilanzen';

const bilanzenStore = useBilanzenStore();

// List of fields to display from the session data
const displayFields = [
  { key: 'SessionId', label: 'Session ID' },
  { key: 'Name', label: 'Name' },
  { key: 'Einheitennummer', label: 'Einheitennummer' },
  { key: 'Personenummer', label: 'Personennummer' },
  { key: 'Branche', label: 'Branche' },
  { key: 'Rechtsform', label: 'Rechtsform' },
  { key: 'Abschlussjahr', label: 'Abschlussjahr' },
  { key: 'Von', label: 'Zeitraum von' },
  { key: 'Bis', label: 'Zeitraum bis' },
  { key: 'Abschlussersteller', label: 'Abschlussersteller' }
] as const;

// Format value based on type
const formatValue = (key: string) => {
  const value = bilanzenStore.sessionData[key];
  
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  // Format dates if needed
  if (key === 'Von' || key === 'Bis') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('de-DE').format(date);
      }
    } catch (e) {
      // If date parsing fails, return as is
    }
  }
  
  return value;
};
</script>

<script lang="ts">
export default {
  name: 'SessionDataInfo'
};
</script> 