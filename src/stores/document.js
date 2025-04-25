import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBilanzenStore } from './bilanzen'

export const useDocumentStore = defineStore('document', {
  state: () => ({
    currentDocument: null,
    documents: [],
    isLoading: false,
    error: null,
    lastUploadedDocument: null,
    externalData: null
  }),
  
  getters: {
    documentIds: (state) => {
      return state.documents.map(doc => doc.id)
    },
    hasDocuments: (state) => {
      return state.documents.length > 0
    },
    getDocumentById: (state) => (id) => {
      return state.documents.find(doc => doc.id === id)
    },
    getExternalData: (state) => {
      return state.externalData
    }
  },
  
  actions: {
    async loadDocument(id) {
      this.isLoading = true
      try {
        // Simulate API call to fetch document
        const response = await fetch(`/api/documents/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load document')
        }
        
        const document = await response.json()
        this.currentDocument = document
        this.isLoading = false
        return document
      } catch (error) {
        console.error('Error loading document:', error)
        this.error = error.message
        this.isLoading = false
        throw error
      }
    },
    
    resetCurrentDocument() {
      this.currentDocument = null
    },

    addXLSFile(file) {
      // Add the file to documents array
      const newDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: 'xls',
        createdAt: new Date().toISOString(),
        status: 'Processing',
        size: file.size,
        content: null
      }
      
      this.documents.push(newDocument)
      this.lastUploadedDocument = newDocument
      
      // In a real app, you'd upload this file to the server
      // and then process it
      
      return newDocument
    },

    addDocument(document) {
      if (!document.id) {
        document.id = `doc_${Date.now()}`
      }
      
      if (!document.createdAt) {
        document.createdAt = new Date().toISOString()
      }
      
      this.documents.push(document)
      return document
    },
    
    loadExternalJsonData(jsonData) {
      // Store the raw external data
      this.externalData = jsonData
      
      // Process the document
      const documentData = {
        id: `ext_${Date.now()}`,
        name: jsonData.Name || 'External Document',
        type: 'json',
        createdAt: new Date().toISOString(),
        status: 'Processed',
        content: jsonData
      }
      
      // Add to documents collection
      this.addDocument(documentData)
      
      // Set as current document
      this.currentDocument = documentData
      
      // Load the data into the bilanzen store
      const bilanzenStore = useBilanzenStore()
      bilanzenStore.loadBilanzData(jsonData)
      
      return documentData
    },
    
    getSessionDataFromExternalJson() {
      if (!this.externalData) return null
      
      const bilanzenStore = useBilanzenStore()
      return bilanzenStore.sessionData
    }
  }
}) 