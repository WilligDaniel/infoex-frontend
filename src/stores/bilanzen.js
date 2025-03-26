import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useBilanzenStore = defineStore('bilanzen', {
  state: () => ({
    bilanzData: {
      Aktiva: [
        { id: 'A', number: 'A', position: 'Anlagevermögen', customerValue: 2691.00, ratingValue: 2691.00, previousValue: 3.00, isSum: true, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'B.I', number: 'B.I', position: 'Vorräte', customerValue: 33949.36, ratingValue: 33949.36, previousValue: 27240.01, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'B.II', number: 'B.II', position: 'Forderungen aus Lieferungen & Leistungen', customerValue: 24988.05, ratingValue: 24988.05, previousValue: 21987.40, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'B.III', number: 'B.III', position: 'Forderungen gegen verbundene Unternehmen', customerValue: 266044.83, ratingValue: 266044.83, previousValue: 237655.96, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'B.IV', number: 'B.IV', position: 'Forderungen gegen Gesellschafter', customerValue: 33320.48, ratingValue: 33320.48, previousValue: 31860.88, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'C', number: 'C', position: 'Sonstige Vermögensgegenstände', customerValue: 98934.00, ratingValue: 98934.00, previousValue: 64761.97, isSum: true, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'D', number: 'D', position: 'Guthaben bei Kreditinstituten', customerValue: 21403.57, ratingValue: 21403.57, previousValue: 51647.83, isSum: true, hasError: false, hasWarning: false, notes: [], lastEditDate: null }
      ],
      Passiva: [
        { id: 'A', number: 'A', position: 'Eigenkapital', customerValue: 10000.00, ratingValue: 10000.00, previousValue: 10000.00, isSum: true, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'B', number: 'B', position: 'Rücklagen', customerValue: 606.85, ratingValue: 606.85, previousValue: 606.85, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'C.I', number: 'C.I', position: 'Steuerrückstellungen', customerValue: 19500.00, ratingValue: 19500.00, previousValue: 19500.00, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'C.II', number: 'C.II', position: 'Sonstige Rückstellungen', customerValue: 8050.00, ratingValue: 8050.00, previousValue: 7450.00, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'D.I', number: 'D.I', position: 'Verbindlichkeiten gegenüber Kreditinstituten', customerValue: 307096.63, ratingValue: 307096.63, previousValue: 308591.94, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'D.II', number: 'D.II', position: 'Verbindlichkeiten aus Lieferungen & Leistungen', customerValue: 102618.03, ratingValue: 102618.03, previousValue: 40617.28, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'D.III', number: 'D.III', position: 'Verbindlichkeiten gegenüber Gesellschaftern', customerValue: 29596.61, ratingValue: 29596.61, previousValue: 29604.77, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: 'D.IV', number: 'D.IV', position: 'Sonstige Verbindlichkeiten', customerValue: 3863.17, ratingValue: 3863.17, previousValue: 18786.21, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null }
      ],
      GuV: [
        { id: '1', number: '1', position: 'Umsatzerlöse', customerValue: 1108067.76, ratingValue: 1108067.76, previousValue: 1188926.79, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '2', number: '2', position: 'Sonstige betriebliche Erträge', customerValue: 4009.94, ratingValue: 4009.94, previousValue: 12934.44, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '3', number: '3', position: 'Materialaufwand', customerValue: -692994.99, ratingValue: -692994.99, previousValue: -743169.94, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '4', number: '4', position: 'Personalaufwand', customerValue: -85020.29, ratingValue: -85020.29, previousValue: -150.00, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '5', number: '5', position: 'Abschreibungen auf Sachanlagen', customerValue: -142.50, ratingValue: -142.50, previousValue: -1392.08, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '6', number: '6', position: 'Sonstige betriebliche Aufwendungen', customerValue: -121096.41, ratingValue: -121096.41, previousValue: -274182.38, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '7', number: '7', position: 'Sonstige Zinsen und ähnliche Erträge', customerValue: 1009.53, ratingValue: 1009.53, previousValue: 1293.31, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '8', number: '8', position: 'Zinsen und ähnliche Aufwendungen', customerValue: -12768.40, ratingValue: -12768.40, previousValue: -6417.35, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '9', number: '9', position: 'Steuern vom Einkommen und Ertrag', customerValue: -31131.00, ratingValue: -31131.00, previousValue: -25259.00, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '10', number: '10', position: 'Sonstige Steuern', customerValue: -443.01, ratingValue: -443.01, previousValue: -17.00, isSum: false, hasError: false, hasWarning: false, notes: [], lastEditDate: null },
        { id: '11', number: '11', position: 'Jahresüberschuss', customerValue: 169490.63, ratingValue: 169490.63, previousValue: 153000.00, isSum: true, hasError: false, hasWarning: false, notes: [], lastEditDate: null }
      ]
    },
      corrections: [
      { id: 1, description: 'Korrektur der Forderungen gegen verbundene Unternehmen', oldValue: 266044.83, newValue: 266044.83, position: 'B.III', type: 'Aktiva' },
      { id: 2, description: 'Anpassung der Verbindlichkeiten aus Lieferungen und Leistungen', oldValue: 65731.29, newValue: 65731.29, position: 'C.2', type: 'Passiva' },
      { id: 3, description: 'Korrektur der sonstigen betrieblichen Aufwendungen', oldValue: -120000.00, newValue: -120000.00, position: '6', type: 'GuV' }
    ],
    bilanzen: [],
    isLoading: false,
    error: null
  }),
  
  getters: {
    processedBilanzen: (state) => {
      return state.bilanzen ? state.bilanzen.filter(b => b.status === 'Verarbeitet') : [];
    },
    errorBilanzen: (state) => {
      return state.bilanzen ? state.bilanzen.filter(b => b.status === 'Fehler') : [];
    }
  },
  
  actions: {
    loadBilanzData() {
      console.log('Loading Bilanz data');
      // In einer echten Anwendung würde hier ein API-Aufruf stattfinden
      // Hier verwenden wir die bereits vorhandenen Mock-Daten
      return this.bilanzData;
    },
    
    getCorrections() {
      console.log('Getting corrections');
      return this.corrections;
    },
    
    applyCorrections(selectedCorrectionIds) {
      console.log('Applying corrections:', selectedCorrectionIds);
      
      // Simuliere die Anwendung von Korrekturen
      selectedCorrectionIds.forEach(correctionId => {
        const correction = this.corrections.find(c => c.id === correctionId);
        
        if (correction) {
          // Finde das entsprechende Element in der Bilanz
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
            // Wende die Korrektur an
            item.ratingValue = correction.newValue;
            item.hasWarning = true;
            
            console.log(`Applied correction to ${correction.type} ${correction.position}: ${correction.oldValue} -> ${correction.newValue}`);
          }
        }
      });
      
      // Wende Summenregeln an
      this.applySum('Aktiva');
      this.applySum('Passiva');
      this.applySum('GuV');
      
      return true;
    },
    
    applySum(type) {
      console.log(`Applying sum rules for ${type}`);
      
      if (type === 'Aktiva') {
        // Berechne die Summe des Anlagevermögens (A)
        const anlagevermögen = this.bilanzData.Aktiva.find(i => i.number === 'A');
        if (anlagevermögen) {
          const sum = this.bilanzData.Aktiva
            .filter(i => i.number.startsWith('A.'))
            .reduce((acc, item) => acc + item.ratingValue, 0);
          anlagevermögen.ratingValue = sum;
        }
        
        // Berechne die Summe des Umlaufvermögens (B)
        const umlaufvermögen = this.bilanzData.Aktiva.find(i => i.number === 'B');
        if (umlaufvermögen) {
          const sum = this.bilanzData.Aktiva
            .filter(i => i.number.startsWith('B.'))
            .reduce((acc, item) => acc + item.ratingValue, 0);
          umlaufvermögen.ratingValue = sum;
        }
        
        // Berechne die Bilanzsumme
        const bilanzsumme = this.bilanzData.Aktiva.find(i => i.number === 'Σ');
        if (bilanzsumme) {
          const sum = this.bilanzData.Aktiva
            .filter(i => ['A', 'B', 'C', 'D'].includes(i.number))
            .reduce((acc, item) => acc + item.ratingValue, 0);
          bilanzsumme.ratingValue = sum;
        }
      } else if (type === 'Passiva') {
        // Berechne die Summe des Eigenkapitals (A)
        const eigenkapital = this.bilanzData.Passiva.find(i => i.number === 'A');
        if (eigenkapital) {
          const sum = this.bilanzData.Passiva
            .filter(i => i.number.startsWith('A.'))
            .reduce((acc, item) => acc + item.ratingValue, 0);
          eigenkapital.ratingValue = sum;
        }
        
        // Berechne die Summe der Verbindlichkeiten (C)
        const verbindlichkeiten = this.bilanzData.Passiva.find(i => i.number === 'C');
        if (verbindlichkeiten) {
          const sum = this.bilanzData.Passiva
            .filter(i => i.number.startsWith('C.'))
            .reduce((acc, item) => acc + item.ratingValue, 0);
          verbindlichkeiten.ratingValue = sum;
        }
        
        // Berechne die Bilanzsumme
        const bilanzsumme = this.bilanzData.Passiva.find(i => i.number === 'Σ');
        if (bilanzsumme) {
          const sum = this.bilanzData.Passiva
            .filter(i => ['A', 'B', 'C'].includes(i.number))
            .reduce((acc, item) => acc + item.ratingValue, 0);
          bilanzsumme.ratingValue = sum;
        }
      } else if (type === 'GuV') {
        // Berechne den Jahresüberschuss/-fehlbetrag
        const jahresergebnis = this.bilanzData.GuV.find(i => i.number === '10');
        if (jahresergebnis) {
          const sum = this.bilanzData.GuV
            .filter(i => i.number !== '10')
            .reduce((acc, item) => acc + item.ratingValue, 0);
          jahresergebnis.ratingValue = sum;
        }
      }
    },
    
    loadBilanzen() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // ohne Mock würde hier ein API-Aufruf stattfinden
        // Hier setzen wir einfach Mock-Daten
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
          user: 'Bearbeiter' // ohne Mock Implementierung würde hier der aktuelle Benutzer stehen
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
    }
  }
}); 