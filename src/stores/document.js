import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDocumentStore = defineStore('document', {
  state: () => ({
    currentDocument: {
      id: '',
      companyName: '',
      companyId: '',
      documentType: '',
      documentMethod: '',
      totalAssets: 0,
      totalLiabilities: 0,
      currency: 'EUR',
      status: ''
    },
    documents: [
      {
        id: '1',
        name: 'Waldeck_PDF2.pdf',
        company: 'Waldeck GmbH',
        companyId: 'WD-1',
        documentType: 'Jahresabschluss',
        documentMethod: 'Automatisch extrahiert',
        date: '26.03.2024',
        totalAssets: 481331.29,
        totalLiabilities: 481331.29,
        currency: 'EUR',
        status: 'In Bearbeitung',
        type: 'pdf'
      }
    ],
    isLoading: false,
    error: null
  }),
  
  actions: {
    loadDocument(id) {
      console.log('Loading document with ID:', id);
      
      if (!id) {
        console.error('No document ID provided');
        return null;
      }
      
      const document = this.documents.find(doc => doc.id === id);
      
      if (document) {
        this.currentDocument = document;
        return document;
      } else {
        console.error('Document not found with ID:', id);
        this.currentDocument = {
          id: id,
          companyName: 'Unbekannt',
          companyId: 'ID-' + id,
          documentType: 'Unbekannt',
          documentMethod: 'Unbekannt',
          totalAssets: 0,
          totalLiabilities: 0,
          currency: 'EUR',
          status: 'Unbekannt'
        };
        return this.currentDocument;
      }
    },
    
    resetCurrentDocument() {
      this.currentDocument = {
        id: '',
        companyName: '',
        companyId: '',
        documentType: '',
        documentMethod: '',
        totalAssets: 0,
        totalLiabilities: 0,
        currency: 'EUR',
        status: ''
      };
    },

    addXLSFile(personalNumber) {
      const entry = {
        id: Date.now().toString(),
        name: `Waldeck_XLS_EXPORT_${personalNumber}.xls`,
        company: 'Waldeck GmbH',
        documentType: 'XLS Export',
        date: new Date().toLocaleDateString('de-DE'),
        status: 'Verarbeitet',
        type: 'xls'
      };
      
      // Add to beginning of documents array
      this.documents.unshift(entry);
    },

    addDocument(document) {
      // Add to beginning of documents array
      this.documents.unshift(document);
    }
  }
}) 