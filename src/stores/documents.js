import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useBilanzenStore = defineStore('bilanzen', () => {
  const bilanzen = ref([
    {
      id: '1',
      name: 'Rechnung_2023-01-15.pdf',
      date: '15.01.2023',
      type: 'Rechnung',
      status: 'processed'
    },
    {
      id: '2',
      name: 'Vertrag_2023-02-20.pdf',
      date: '20.02.2023',
      type: 'Vertrag',
      status: 'processed'
    },
    {
      id: '3',
      name: 'Angebot_2023-03-10.pdf',
      date: '10.03.2023',
      type: 'Angebot',
      status: 'processed'
    },
    {
      id: '4',
      name: 'Rechnung_2023-04-05.pdf',
      date: '05.04.2023',
      type: 'Rechnung',
      status: 'processed'
    },
    {
      id: '5',
      name: 'Bilanz_2023.pdf',
      date: '31.12.2023',
      type: 'Bilanz',
      status: 'error'
    }
  ]);

  const isLoading = ref(false);
  const error = ref(null);

  // Computed properties für filtered documents
  const processedBilanzen = computed(() => {
    return bilanzen.value.filter(doc => doc.status === 'processed');
  });

  const errorBilanzen = computed(() => {
    return bilanzen.value.filter(doc => doc.status === 'error');
  });

  const fetchBilanzen = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      error.value = 'Failed to fetch documents';
      console.error('Error fetching documents:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const uploadDocument = async (file) => {
    isLoading.value = true;
    error.value = null;

    try {
      const newDocument = {
        id: String(bilanzen.value.length + 1),
        name: file.name,
        date: new Date().toLocaleDateString('de-DE'),
        type: 'Unbekannt',
        status: 'processing'
      };
      
      bilanzen.value.push(newDocument);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return newDocument.id;
    } catch (err) {
      error.value = 'Failed to upload document';
      console.error('Error uploading document:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    bilanzen,
    processedBilanzen,
    errorBilanzen,
    isLoading,
    error,
    fetchBilanzen,
    uploadDocument
  };
});

// Definiere den Store
export const useDocumentsStore = defineStore('documents', {
  state: () => ({
    documents: [],
    loading: false,
    error: null,
  }),
  
  actions: {
    async fetchDocuments() {
      this.loading = true;
      try {
        // Hier würde normalerweise ein API-Aufruf stehen
        // Simuliere einen API-Aufruf mit Beispieldaten
        await new Promise(resolve => setTimeout(resolve, 500));
        this.documents = [
          { id: 1, name: 'Bilanz 2022.pdf', date: '2023-01-15', status: 'processed' },
          { id: 2, name: 'Bilanz 2021.pdf', date: '2022-01-20', status: 'processed' },
          { id: 3, name: 'Bilanz 2020.pdf', date: '2021-01-18', status: 'processed' }
        ];
        this.error = null;
      } catch (err) {
        this.error = 'Fehler beim Laden der Dokumente';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    async uploadDocument(file) {
      this.loading = true;
      try {
        // Hier würde normalerweise ein API-Aufruf zum Hochladen stehen
        // Simuliere einen API-Aufruf
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Füge das neue Dokument zur Liste hinzu
        const newDoc = {
          id: this.documents.length + 1,
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          status: 'processing'
        };
        
        this.documents.push(newDoc);
        this.error = null;
        return newDoc;
      } catch (err) {
        this.error = 'Fehler beim Hochladen des Dokuments';
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
}); 