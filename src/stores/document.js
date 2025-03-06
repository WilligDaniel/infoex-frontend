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
        companyName: 'Waldeck GmbH',
        companyId: 'WD-1',
        documentType: 'Jahresabschluss',
        documentMethod: 'Automatisch extrahiert',
        totalAssets: 481331.29,
        totalLiabilities: 481331.29,
        currency: 'EUR',
        status: 'In Bearbeitung'
      },
      {
        id: '2',
        companyName: 'Mustermann AG',
        companyId: 'MA-2',
        documentType: 'Jahresabschluss',
        documentMethod: 'Manuell erfasst',
        totalAssets: 750000.00,
        totalLiabilities: 750000.00,
        currency: 'EUR',
        status: 'Abgeschlossen'
      }
    ]
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
    }
  }
}) 