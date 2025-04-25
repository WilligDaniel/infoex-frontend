import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useBilanzenStore = defineStore('bilanzen', {
  state: () => ({
    bilanzData: {
      Aktiva: [],
      Passiva: [],
      GuV: []
    },
    corrections: [],
    bilanzen: [],
    isLoading: false,
    error: null,
    editMode: false,
    editingItem: null,
    sessionData: {
      SessionId: null,
      Einheitennummer: null,
      Personenummer: null,
      Branche: null,
      Name: null,
      Abschlussjahr: null,
      Von: null,
      Bis: null,
      Abschlussersteller: null,
      Rechtsform: null
    },
    summenregeln: null,
    umkontierungen: null
  }),
  
  getters: {
    processedBilanzen: (state) => {
      return state.bilanzen ? state.bilanzen.filter(b => b.status === 'Verarbeitet') : [];
    },
    errorBilanzen: (state) => {
      return state.bilanzen ? state.bilanzen.filter(b => b.status === 'Fehler') : [];
    },
    totalAssets: (state) => {
      return state.bilanzData.Aktiva.reduce((sum, item) => sum + (item.ratingValue || 0), 0);
    },
    totalLiabilities: (state) => {
      return state.bilanzData.Passiva.reduce((sum, item) => sum + (item.ratingValue || 0), 0);
    },
    getAktiva: (state) => state.bilanzData.Aktiva,
    getPassiva: (state) => state.bilanzData.Passiva,
    getGuV: (state) => state.bilanzData.GuV,
    
    // Neue Getter für editierbare Spalten
    editableColumns: () => ({
      customerValue: true,
      ratingValue: true,
      previousValue: true
    }),
    
    // Getter für Spalten-Konfiguration
    columnConfig: () => ({
      position: {
        editable: false,
        type: 'text'
      },
      customerValue: {
        editable: true,
        type: 'number',
        format: 'de-DE'
      },
      ratingValue: {
        editable: true,
        type: 'number',
        format: 'de-DE'
      },
      previousValue: {
        editable: true,
        type: 'number',
        format: 'de-DE'
      }
    }),
    
    // Getter für Zellen-Editierbarkeit
    isCellEditable: (state) => (item, column) => {
      // Summenzeilen sind nicht editierbar
      if (item.isSum) {
        return false;
      }
      
      // Position ist nie editierbar
      if (column === 'position') {
        return false;
      }
      
      // Andere Spalten sind editierbar
      return ['customerValue', 'ratingValue', 'previousValue'].includes(column);
    },

    isEditing: (state) => state.editMode,
    currentEditingItem: (state) => state.editingItem,
    
    // Vereinfachte editierbare Spalten
    editableFields: () => [
      {
        field: 'customerValue',
        label: 'Kundenwert',
        editable: true
      },
      {
        field: 'ratingValue',
        label: 'Ratingwert',
        editable: true
      },
      {
        field: 'previousValue',
        label: 'Vorjahreswert',
        editable: true
      }
    ]
  },
  
  actions: {
    updateValue(section, itemId, field, newValue) {
      console.log('Updating value:', { section, itemId, field, newValue });
      
      const item = this.bilanzData[section].find(i => i.id === itemId || i.number === itemId);
      if (!item) {
        console.error('Item not found:', itemId);
        return false;
      }

      try {
        // Convert string format (e.g. "30.190,00") to number if needed
        let value = newValue;
        if (typeof value === 'string') {
          // Remove all dots except the last one (German number format)
          value = value.replace(/\.(?=.*\.)/g, '').replace(',', '.');
          value = parseFloat(value) || 0;
        }

        const oldValue = item[field];
        
        item[field] = value;

        item.hasWarning = true;
        item.lastEditDate = new Date().toISOString();

        if (field === 'customerValue') {
          item.ratingValue = value;
          item.correction = 0; // Reset any previous corrections
          item.automaticCorrection = false;
        }

        console.log('Value updated:', { oldValue, newValue: value });

        // Recalculate sums
        this.applySum(section);
        this.updateTotals();

        return true;
      } catch (error) {
        console.error('Error updating value:', error);
        return false;
      }
    },
    
    loadBilanzData(jsonData = null) {
      console.log('Loading Bilanz data with:', jsonData);
      this.isLoading = true;
      
      try {
        if (jsonData) {
          // Store session data
          this.sessionData = {
            SessionId: jsonData.SessionId || null,
            Einheitennummer: jsonData.Einheitennummer || null,
            Personenummer: jsonData.Personenummer || null,
            Branche: jsonData.Branche || null,
            Name: jsonData.Name || null,
            Abschlussjahr: jsonData.Abschlussjahr || null,
            Von: jsonData.Von || null,
            Bis: jsonData.Bis || null,
            Abschlussersteller: jsonData.Abschlussersteller || null,
            Rechtsform: jsonData.Rechtsform || null
          };

          if (jsonData.bilanzData) {
            this.bilanzData = {
              Aktiva: this.transformBalanceItems(jsonData.bilanzData.Aktiva || []),
              Passiva: this.transformBalanceItems(jsonData.bilanzData.Passiva || []),
              GuV: this.transformBalanceItems(jsonData.bilanzData.GuV || [])
            };
            
            this.normalizeValues('Aktiva');
            this.normalizeValues('Passiva');
            this.normalizeValues('GuV');
          }
          
          if (jsonData.Summenregeln) {
            this.summenregeln = jsonData.Summenregeln;
          }
          
          if (jsonData.Umkontierungen) {
            this.umkontierungen = jsonData.Umkontierungen;
          }
          
          if (jsonData.corrections) {
            this.corrections = jsonData.corrections;
          }
        } else {
          this.loadMockData();
        }
        
        this.isLoading = false;
        console.log('Transformed data:', this.bilanzData);
        return this.bilanzData;
      } catch (error) {
        console.error('Error loading bilanz data:', error);
        this.error = error.message;
        this.isLoading = false;
        throw error;
      }
    },
    
    transformBalanceItems(items) {
      const transformedItems = [];
      
      items.forEach(item => {
        // Add parent item
        transformedItems.push({
          id: item.position,
          number: item.number || item.position,
          position: item.position,
          description: item.description,
          customerValue: item.amount || 0,
          ratingValue: item.amount || 0,
          previousValue: item.previousValue || 0,
          isSum: !item.children || item.children.length > 0,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null,
          correction: 0,
          automaticCorrection: false
        });
        
        if (item.children && Array.isArray(item.children)) {
          item.children.forEach(child => {
            transformedItems.push({
              id: child.position,
              number: child.number || child.position,
              position: child.position,
              description: child.description,
              customerValue: child.amount || 0,
              ratingValue: child.amount || 0,
              previousValue: child.previousValue || 0,
              isSum: false,
              hasError: false,
              hasWarning: false,
              notes: [],
              lastEditDate: null,
              correction: 0,
              automaticCorrection: false
            });
          });
        }
      });
      
      return transformedItems;
    },
    
    getCorrections() {
      console.log('Getting corrections');
      return this.corrections;
    },
    
    applyCorrections(selectedCorrectionIds) {
      console.log('Applying corrections:', selectedCorrectionIds);
      
      selectedCorrectionIds.forEach(correctionId => {
        const correction = this.corrections.find(c => c.id === correctionId);
        
        if (correction) {
          let targetArray;
          if (correction.type === 'Aktiva') {
            targetArray = this.bilanzData.Aktiva;
          } else if (correction.type === 'Passiva') {
            targetArray = this.bilanzData.Passiva;
          } else if (correction.type === 'GuV') {
            targetArray = this.bilanzData.GuV;
          }
          
          const item = targetArray.find(i => i.number === correction.position);
          
          if (item) {
            item.ratingValue = correction.newValue;
            item.hasWarning = true;
            item.correction = correction.newValue - item.customerValue;
            item.automaticCorrection = true;
            
            console.log(`Applied correction to ${correction.type} ${correction.position}: ${correction.oldValue} -> ${correction.newValue}`);
          }
        }
      });
      
      this.applySum('Aktiva');
      this.applySum('Passiva');
      this.applySum('GuV');
      
      return true;
    },
    
    applySum(type) {
      console.log(`Applying sum rules for ${type}`);
      
      if (type === 'Aktiva') {
        const anlagevermögen = this.bilanzData.Aktiva.find(i => i.number === 'A');
        if (anlagevermögen) {
          const sum = this.bilanzData.Aktiva
            .filter(i => i.number.startsWith('A.'))
            .reduce((acc, item) => acc + (item.customerValue || 0), 0);
          anlagevermögen.customerValue = sum;
          anlagevermögen.ratingValue = sum;
        }
        
        // Berechne Summe für Umlaufvermögen (B)
        const umlaufvermögen = this.bilanzData.Aktiva.find(i => i.number === 'B');
        if (umlaufvermögen) {
          const sum = this.bilanzData.Aktiva
            .filter(i => i.number.startsWith('B.'))
            .reduce((acc, item) => acc + (item.customerValue || 0), 0);
          umlaufvermögen.customerValue = sum;
          umlaufvermögen.ratingValue = sum;
        }
      } else if (type === 'Passiva') {
        // Berechne Summe für Eigenkapital (A)
        const eigenkapital = this.bilanzData.Passiva.find(i => i.number === 'A');
        if (eigenkapital) {
          const sum = this.bilanzData.Passiva
            .filter(i => i.number.startsWith('A.'))
            .reduce((acc, item) => acc + (item.customerValue || 0), 0);
          eigenkapital.customerValue = sum;
          eigenkapital.ratingValue = sum;
        }
        
        // Berechne Summe für Verbindlichkeiten (B)
        const verbindlichkeiten = this.bilanzData.Passiva.find(i => i.number === 'B');
        if (verbindlichkeiten) {
          const sum = this.bilanzData.Passiva
            .filter(i => i.number.startsWith('B.'))
            .reduce((acc, item) => acc + (item.customerValue || 0), 0);
          verbindlichkeiten.customerValue = sum;
          verbindlichkeiten.ratingValue = sum;
        }
      }
      
      this.updateTotals();
    },
    
    updateTotals() {
      // Berechne Bilanzsumme Aktiva
      const aktivaTotal = this.bilanzData.Aktiva.reduce((sum, item) => {
        if (item.number.length === 1) {
          return sum + (item.customerValue || 0);
        }
        return sum;
      }, 0);
      
      // Berechne Bilanzsumme Passiva
      const passivaTotal = this.bilanzData.Passiva.reduce((sum, item) => {
        // Nur Hauptpositionen (A, B) in die Gesamtsumme einbeziehen
        if (item.number.length === 1) {
          return sum + (item.customerValue || 0);
        }
        return sum;
      }, 0);
      
      // Aktualisiere die Summenzeilen falls vorhanden
      const aktivaSumme = this.bilanzData.Aktiva.find(i => i.number === 'Σ');
      if (aktivaSumme) {
        aktivaSumme.customerValue = aktivaTotal;
        aktivaSumme.ratingValue = aktivaTotal;
      }
      
      const passivaSumme = this.bilanzData.Passiva.find(i => i.number === 'Σ');
      if (passivaSumme) {
        passivaSumme.customerValue = passivaTotal;
        passivaSumme.ratingValue = passivaTotal;
      }
    },
    
    loadBilanzen() {
      this.isLoading = true;
      this.error = null;
      
      try {
        this.bilanzen = [
          {
            id: 2,
            name: 'Waldeck_XLS1.xls',
            company: 'Waldeck GmbH',
            documentType: 'Bilanz',
            date: '06.03.2025',
            status: 'Verarbeitet',
            type: 'xls'
          },
          {
            id: 3,
            name: 'Waldeck_PDF1.pdf',
            company: 'Waldeck GmbH',
            documentType: 'GuV',
            date: '07.03.2025',
            status: 'Fehler',
            type: 'pdf'
          }
        ];
        
        this.isLoading = false;
      } catch (error) {
        this.error = error.message || 'Fehler beim Laden der Bilanzen';
        this.isLoading = false;
        console.error('Error loading bilanzen:', error);
      }
    },

    addNote(section, itemId, note) {
      const item = this.bilanzData[section].find(i => i.id === itemId);
      if (item) {
        item.notes.push({
          id: Date.now(),
          text: note,
          date: new Date().toISOString(),
          user: 'Bearbeiter'
        });
        item.lastEditDate = new Date().toISOString();
      }
    },

    removeNote(section, itemId, noteId) {
      const item = this.bilanzData[section].find(i => i.id === itemId);
      if (item) {
        item.notes = item.notes.filter(n => n.id !== noteId);
        if (item.notes.length === 0) {
          item.lastEditDate = null;
        }
      }
    },

    getNotes(section, itemId) {
      const item = this.bilanzData[section].find(i => i.id === itemId);
      return item ? item.notes : [];
    },

    prepareDataForSave() {
      return {
        sessionId: this.sessionData.SessionId,
        identificationNumber: this.sessionData.Personenummer,
        balanceSheet: {
          assets: this.bilanzData.Aktiva.map(item => ({
            position: item.number,
            description: item.position,
            value: item.customerValue,
            ratingValue: item.ratingValue,
            previousValue: item.previousValue,
            correction: item.correction,
            automaticCorrection: item.automaticCorrection,
            notes: item.notes
          })),
          liabilities: this.bilanzData.Passiva.map(item => ({
            position: item.number,
            description: item.position,
            value: item.customerValue,
            ratingValue: item.ratingValue,
            previousValue: item.previousValue,
            correction: item.correction,
            automaticCorrection: item.automaticCorrection,
            notes: item.notes
          }))
        },
        profitAndLoss: this.bilanzData.GuV.map(item => ({
          position: item.number,
          description: item.position,
          value: item.customerValue,
          ratingValue: item.ratingValue,
          previousValue: item.previousValue,
          correction: item.correction,
          automaticCorrection: item.automaticCorrection,
          notes: item.notes
        })),
        corrections: this.corrections
      };
    },

    normalizeValues(section) {
      this.bilanzData[section].forEach(item => {
        // Handle customerValue
        if (typeof item.customerValue === 'string' && item.customerValue !== '') {
          item.customerValue = parseFloat(item.customerValue.replace('.', '').replace(',', '.'));
        } else if (item.customerValue === '' || item.customerValue === null || isNaN(item.customerValue)) {
          item.customerValue = 0;
        }
        
        if (item.ratingValue === null || item.ratingValue === undefined || isNaN(item.ratingValue)) {
          item.ratingValue = item.customerValue;
        }
        
        if (typeof item.previousValue === 'string' && item.previousValue !== '') {
          item.previousValue = parseFloat(item.previousValue.replace('.', '').replace(',', '.'));
        } else if (item.previousValue === '' || item.previousValue === null || isNaN(item.previousValue)) {
          item.previousValue = 0;
        }
        
        if (!Array.isArray(item.notes)) {
          item.notes = [];
        } else {
          item.notes = item.notes.filter(note => note !== null && note !== undefined && !isNaN(note) && note !== '');
        }
        
        if (!item.id) {
          item.id = `${section}_${item.number}_${Date.now()}`;
        }
      });
    },

    loadMockData() {
      console.log('Loading mock data');
      
      // Mock session data
      this.sessionData = {
        SessionId: 'Mustermann-1234',
        Einheitennummer: '1234567',
        Personenummer: '7654321',
        Branche: 'IT Services',
        Name: 'Mustermann GmbH',
        Abschlussjahr: '2024',
        Von: '2024-01-01',
        Bis: '2024-12-31',
        Abschlussersteller: 'Steuerberater Mustermann',
        Rechtsform: 'GmbH'
      };
      
      // Mock Aktiva
      this.bilanzData.Aktiva = [
        {
          id: 'aktiva_A_' + Date.now(),
          number: 'A',
          position: 'ANLAGEVERMÖGEN',
          customerValue: 413026,
          ratingValue: 413026,
          previousValue: 359264,
          isSum: true,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null
        },
        {
          id: 'aktiva_B_' + Date.now(),
          number: 'B',
          position: 'UMLAUFVERMÖGEN',
          customerValue: 773084,
          ratingValue: 773084,
          previousValue: 1179787,
          isSum: true,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null
        },
        {
          id: 'aktiva_sum_' + Date.now(),
          number: 'Σ',
          position: 'BILANZSUMME AKTIVA',
          customerValue: 1186110,
          ratingValue: 1186110,
          previousValue: 1539051,
          isSum: true,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null
        }
      ];
      
      // Mock Passiva
      this.bilanzData.Passiva = [
        {
          id: 'passiva_A_' + Date.now(),
          number: 'A',
          position: 'EIGENKAPITAL',
          customerValue: 3068498,
          ratingValue: 3068498,
          previousValue: 2528465,
          isSum: true,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null
        },
        {
          id: 'passiva_B_' + Date.now(),
          number: 'B',
          position: 'FREMDKAPITAL',
          customerValue: 1392382,
          ratingValue: 1392382,
          previousValue: 1448955,
          isSum: true,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null
        },
        {
          id: 'passiva_sum_' + Date.now(),
          number: 'Σ',
          position: 'BILANZSUMME PASSIVA',
          customerValue: 1186110,
          ratingValue: 1186110,
          previousValue: 1539051,
          isSum: true,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null
        }
      ];
      
      // Mock GuV
      this.bilanzData.GuV = [
        {
          id: 'guv_1_' + Date.now(),
          number: '13001',
          position: 'Umsatzerlöse',
          customerValue: 1108067.76,
          ratingValue: 1108067.76,
          previousValue: 1188926.79,
          isSum: false,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null
        },
        {
          id: 'guv_2_' + Date.now(),
          number: '13011',
          position: 'Jahresüberschuss',
          customerValue: 169490.63,
          ratingValue: 169490.63,
          previousValue: 153000.00,
          isSum: true,
          hasError: false,
          hasWarning: false,
          notes: [],
          lastEditDate: null
        }
      ];
    },

    // Neue Methoden für Edit-Mode
    startEditing(section, itemId) {
      const item = this.bilanzData[section].find(i => i.id === itemId || i.number === itemId);
      if (item && !item.isSum) {
        this.editMode = true;
        this.editingItem = {
          section,
          item: { ...item }
        };
      }
    },

    cancelEditing() {
      this.editMode = false;
      this.editingItem = null;
    },

    saveEdit() {
      if (!this.editingItem) return;

      const { section, item } = this.editingItem;
      const originalItem = this.bilanzData[section].find(i => i.id === item.id || i.number === item.number);
      
      if (originalItem) {
        // Update values
        originalItem.customerValue = parseFloat(item.customerValue) || 0;
        originalItem.ratingValue = parseFloat(item.ratingValue) || 0;
        originalItem.previousValue = parseFloat(item.previousValue) || 0;
        
        // Mark as modified
        originalItem.hasWarning = true;
        originalItem.lastEditDate = new Date().toISOString();
        
        // Recalculate sums
        this.applySum(section);
        this.updateTotals();
      }

      this.editMode = false;
      this.editingItem = null;
    },

    // Vereinfachte Update-Methode
    updateItemValue(section, itemId, field, value) {
      const item = this.bilanzData[section].find(i => i.id === itemId || i.number === itemId);
      if (!item || item.isSum) return false;

      try {
        // Konvertiere String-Werte in Zahlen
        const numValue = typeof value === 'string' 
          ? parseFloat(value.replace(/\./g, '').replace(',', '.')) 
          : value;

        if (isNaN(numValue)) return false;

        // Update Wert
        item[field] = numValue;
        item.hasWarning = true;
        item.lastEditDate = new Date().toISOString();

        // Update Rating-Wert wenn Kundenwert geändert
        if (field === 'customerValue') {
          item.ratingValue = numValue;
        }

        // Summen neu berechnen
        this.applySum(section);
        this.updateTotals();

        return true;
      } catch (error) {
        console.error('Error updating value:', error);
        return false;
      }
    }
  }
}); 