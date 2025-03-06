<template>
  <div>
    <BreadcrumbNav />
    <div class="container mx-auto px-4 py-6">
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Dokument wird geladen...</span>
      </div>

      <div v-else-if="!currentDocument" class="bg-white p-6 shadow text-center">
        <p class="text-gray-600">Das Dokument konnte nicht gefunden werden.</p>
        <button 
          @click="navigateToDashboard" 
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Zurück zum Dashboard
        </button>
      </div>

      <div v-else class="bg-white p-6 shadow">
        <!-- Header mit PDF-Vorschau und Dokumentinfo -->
        <div class="flex flex-col md:flex-row mb-6 relative">
          <!-- Bearbeitungsmodus-Hinweis entfernt -->
          
          <div class="md:w-1/3 mb-4 md:mb-0 md:mr-6">
            <div class="bg-gray-100 border border-gray-200 h-56 relative">
              <!-- Statische PDF-Vorschau mit Mock-Bild -->
              <div class="w-full h-full flex flex-col">
                <!-- PDF-Inhalt -->
                <div class="flex-grow flex items-center justify-center bg-[#3A3E42] relative">
                  <!-- Weißer Bereich in der Mitte für PDF-Inhalt -->
                  <div class="w-3/5 h-full bg-white mx-auto overflow-auto" ref="pdfContainer" style="max-height: 100%;">
                    <!-- Container mit fester Größe für den Inhalt -->
                    <div class="p-4 w-full" :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }">
                      <p class="text-gray-800 font-medium">FACT GmbH Wirtschaftsprüfungsgesellschaft</p>
                      <p class="text-sm text-gray-600 mt-2">Seite - 2</p>
                      <!-- Beispielinhalt für Scrolling -->
                      <div class="mt-4">
                        <p class="text-xs mb-1">A. Anlagevermögen: 2.691,00</p>
                        <p class="text-xs mb-1">B.I Vorräte: 33.949,36</p>
                        <p class="text-xs mb-1">B.II Forderungen: 24.988,05</p>
                        <p class="text-xs mb-1">B.III Forderungen: 266.044,83</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Vollbild-Button -->
                  <div class="absolute top-2 right-2">
                    <button 
                      @click="openFullPdf" 
                      class="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                      title="In voller Größe öffnen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Zoom-Steuerung -->
                  <div class="absolute bottom-1 right-1 flex space-x-1">
                    <button 
                      @click="zoomOut" 
                      class="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                      title="Verkleinern"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <button 
                      @click="zoomIn" 
                      class="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                      title="Vergrößern"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button 
                      @click="resetZoom" 
                      class="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                      title="Zoom zurücksetzen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- PDF-Info -->
                <div class="flex justify-center items-center py-2 bg-gray-50 border-t border-gray-200">
                  <div class="text-sm text-gray-600">
                    PDF-Vorschau ({{ Math.round(zoomLevel * 100) }}%)
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1 text-center">PDF2.pdf - Extraktion von Seiten 15-34</p>
          </div>
          <div class="md:w-2/3">
            <div class="flex justify-between mb-4">
              <h1 class="text-2xl font-medium mb-4">
                {{ currentDocument.companyName || 'Unbekanntes Unternehmen' }} ({{ currentDocument.companyId || 'Keine ID' }})
              </h1>
              <div class="flex space-x-2 relative">
                <button 
                  v-if="editMode" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors" 
                  @click="saveChanges"
                >
                  Änderungen speichern
                </button>
                <div v-if="editMode" class="absolute -bottom-8 right-0 bg-blue-50 border border-blue-100 rounded-md px-2 py-1 text-xs text-blue-600 whitespace-nowrap shadow-sm">
                  <div class="absolute -top-2 right-4 w-2 h-2 bg-blue-50 border-t border-l border-blue-100 transform -rotate-45"></div>
                  Bearbeitungsmodus aktiv
                </div>
                <button 
                  v-else 
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors" 
                  @click="navigateToEdit"
                >
                  Bearbeiten
                </button>
              </div>
            </div>
            <div class="grid grid-cols-4 gap-3">
              <div class="info-box bg-[#D9D9D9]">
                <p class="info-box-label">Kundeninformation</p>
                <p class="info-box-value">{{ currentDocument.documentType || 'Unbekannt' }}</p>
                <p class="text-sm text-gray-700">{{ currentDocument.documentMethod || 'Keine Methode' }}</p>
              </div>
              <div class="info-box bg-[#D9D9D9]">
                <p class="info-box-label">Σ Aktiva</p>
                <p class="info-box-value">{{ formatCurrency(currentDocument.totalAssets || 0) }}</p>
              </div>
              <div class="info-box bg-[#D9D9D9]">
                <p class="info-box-label">Σ Passiva</p>
                <p class="info-box-value">{{ formatCurrency(currentDocument.totalLiabilities || 0) }}</p>
              </div>
              <div class="info-box bg-[#D9D9D9]">
                <p class="info-box-label">in</p>
                <p class="info-box-value">{{ currentDocument.currency || 'EUR' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mb-6 flex space-x-4">
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center" @click="showCorrectionModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Automatische a.o. Posten Korrektur ausführen
          </button>
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Status ändern
          </button>
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center" @click="saveDocument">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Dokument speichern
          </button>
        </div>

        <!-- Tabs -->
        <div class="mb-6">
          <div class="flex border-b border-gray-300">
            <button 
              @click="currentTab = 'assets'"
              class="px-4 py-2 text-sm font-medium border-b-2 mr-6 focus:outline-none"
              :class="currentTab === 'assets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:border-gray-300'"
            >
              Aktiva
            </button>
            
            <button 
              @click="currentTab = 'liabilities'"
              class="px-4 py-2 text-sm font-medium border-b-2 mr-6 focus:outline-none"
              :class="currentTab === 'liabilities' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:border-gray-300'"
            >
              Passiva
            </button>
            
            <button 
              @click="currentTab = 'income'"
              class="px-4 py-2 text-sm font-medium border-b-2 focus:outline-none"
              :class="currentTab === 'income' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:border-gray-300'"
            >
              GuV
            </button>
          </div>
        </div>

        <!-- Table Header -->
        <div class="flex border-b border-gray-300 mb-1">
          <div class="w-1/12 p-2 font-medium">Nummer</div>
          <div class="w-5/12 p-2 font-medium">Bilanzposition</div>
          <div class="w-2/12 p-2 text-right font-medium">Kundenbilanz</div>
          <div class="w-2/12 p-2 text-right font-medium">Bilanz für Rating</div>
          <div class="w-2/12 p-2 text-right font-medium">Vorjahreswert</div>
        </div>

        <!-- Table Content - Aktiva -->
        <div v-if="currentTab === 'assets'">
          <div 
            v-for="item in assets" 
            :key="item.id"
            class="mb-1 relative"
          >
            <!-- Farbige Indikatorlinie links -->
            <div 
              v-if="item.hasError" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-red-500"
            ></div>
            <div 
              v-else-if="item.hasWarning" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-[#E47120]"
            ></div>
            <div 
              v-else-if="item.number.includes('.')" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-[#3A73B8]"
            ></div>
            
            <!-- Zeile mit separaten Zellen -->
            <div class="flex">
              <!-- Nummer -->
              <div 
                class="w-1/12 p-2 border border-gray-200" 
                :class="getRowClass(item)"
              >
                <span class="pl-2">{{ item.number }}</span>
              </div>
              
              <!-- Bilanzposition -->
              <div 
                class="w-5/12 p-2 border-t border-b border-r border-gray-200" 
                :class="getRowClass(item)"
              >
                <span class="uppercase">{{ item.position }}</span>
              </div>
              
              <!-- Kundenbilanz -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative" 
                :class="[
                  getRowClass(item), 
                  item.customerValue !== item.ratingValue ? 'bg-red-100 bg-opacity-30' : '',
                  (editMode || showCorrections) ? 'cursor-text hover:bg-blue-50' : ''
                ]"
                :contenteditable="editMode || showCorrections"
                @focus="handleCellFocus($event)"
                @blur="updateValue(item, 'customerValue', $event)"
              >
                <span :class="{ 'text-red-600': item.customerValue < 0 }">
                  {{ formatCurrency(item.customerValue) }}
                </span>
                <div v-if="(editMode || showCorrections) && !item.isSum" class="absolute top-0 right-0 w-2 h-2 bg-blue-400 opacity-50"></div>
              </div>
              
              <!-- Bilanz für Rating -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative" 
                :class="[
                  getRowClass(item),
                  item.customerValue !== item.ratingValue ? 'bg-red-100 bg-opacity-30' : '',
                  (editMode || showCorrections) ? 'cursor-text hover:bg-blue-50' : ''
                ]"
                :contenteditable="editMode || showCorrections"
                @focus="handleCellFocus($event)"
                @blur="updateValue(item, 'ratingValue', $event)"
              >
                <span :class="{ 'text-red-600': item.ratingValue < 0 }">
                  {{ formatCurrency(item.ratingValue) }}
                </span>
                <div v-if="(editMode || showCorrections) && !item.isSum" class="absolute top-0 right-0 w-2 h-2 bg-blue-400 opacity-50"></div>
              </div>
              
              <!-- Vorjahreswert -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200" 
                :class="getRowClass(item)"
              >
                <span :class="{ 'text-red-600': item.previousValue < 0 }">
                  {{ formatCurrency(item.previousValue) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Content - Passiva -->
        <div v-if="currentTab === 'liabilities'">
          <div 
            v-for="item in liabilities" 
            :key="item.id"
            class="mb-1 relative"
          >
            <!-- Farbige Indikatorlinie links -->
            <div 
              v-if="item.hasError" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-red-500"
            ></div>
            <div 
              v-else-if="item.hasWarning" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-[#E47120]"
            ></div>
            <div 
              v-else-if="item.number.includes('.')" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-[#3A73B8]"
            ></div>
            
            <!-- Zeile mit separaten Zellen -->
            <div class="flex">
              <!-- Nummer -->
              <div 
                class="w-1/12 p-2 border border-gray-200" 
                :class="getRowClass(item)"
              >
                <span class="pl-2">{{ item.number }}</span>
              </div>
              
              <!-- Bilanzposition -->
              <div 
                class="w-5/12 p-2 border-t border-b border-r border-gray-200" 
                :class="getRowClass(item)"
              >
                <span class="uppercase">{{ item.position }}</span>
              </div>
              
              <!-- Kundenbilanz -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative" 
                :class="[
                  getRowClass(item), 
                  item.customerValue !== item.ratingValue ? 'bg-red-100 bg-opacity-30' : '',
                  (editMode || showCorrections) ? 'cursor-text hover:bg-blue-50' : ''
                ]"
                :contenteditable="editMode || showCorrections"
                @focus="handleCellFocus($event)"
                @blur="updateValue(item, 'customerValue', $event)"
              >
                <span :class="{ 'text-red-600': item.customerValue < 0 }">
                  {{ formatCurrency(item.customerValue) }}
                </span>
                <div v-if="(editMode || showCorrections) && !item.isSum" class="absolute top-0 right-0 w-2 h-2 bg-blue-400 opacity-50"></div>
              </div>
              
              <!-- Bilanz für Rating -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative" 
                :class="[
                  getRowClass(item),
                  item.customerValue !== item.ratingValue ? 'bg-red-100 bg-opacity-30' : '',
                  (editMode || showCorrections) ? 'cursor-text hover:bg-blue-50' : ''
                ]"
                :contenteditable="editMode || showCorrections"
                @focus="handleCellFocus($event)"
                @blur="updateValue(item, 'ratingValue', $event)"
              >
                <span :class="{ 'text-red-600': item.ratingValue < 0 }">
                  {{ formatCurrency(item.ratingValue) }}
                </span>
                <div v-if="(editMode || showCorrections) && !item.isSum" class="absolute top-0 right-0 w-2 h-2 bg-blue-400 opacity-50"></div>
              </div>
              
              <!-- Vorjahreswert -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200" 
                :class="getRowClass(item)"
              >
                <span :class="{ 'text-red-600': item.previousValue < 0 }">
                  {{ formatCurrency(item.previousValue) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Content - GuV -->
        <div v-if="currentTab === 'income'">
          <div 
            v-for="item in incomeStatement" 
            :key="item.id"
            class="mb-1 relative"
          >
            <!-- Farbige Indikatorlinie links -->
            <div 
              v-if="item.hasError" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-red-500"
            ></div>
            <div 
              v-else-if="item.hasWarning" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-[#E47120]"
            ></div>
            <div 
              v-else-if="item.number.includes('.')" 
              class="absolute left-0 top-0 bottom-0 w-1 bg-[#3A73B8]"
            ></div>
            
            <!-- Zeile mit separaten Zellen -->
            <div class="flex">
              <!-- Nummer -->
              <div 
                class="w-1/12 p-2 border border-gray-200" 
                :class="getRowClass(item)"
              >
                <span class="pl-2">{{ item.number }}</span>
              </div>
              
              <!-- Bilanzposition -->
              <div 
                class="w-5/12 p-2 border-t border-b border-r border-gray-200" 
                :class="getRowClass(item)"
              >
                <span class="uppercase">{{ item.position }}</span>
              </div>
              
              <!-- Kundenbilanz -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative" 
                :class="[
                  getRowClass(item), 
                  item.customerValue !== item.ratingValue ? 'bg-red-100 bg-opacity-30' : '',
                  (editMode || showCorrections) ? 'cursor-text hover:bg-blue-50' : ''
                ]"
                :contenteditable="editMode || showCorrections"
                @focus="handleCellFocus($event)"
                @blur="updateValue(item, 'customerValue', $event)"
              >
                <span :class="{ 'text-red-600': item.customerValue < 0 }">
                  {{ formatCurrency(item.customerValue) }}
                </span>
                <div v-if="(editMode || showCorrections) && !item.isSum" class="absolute top-0 right-0 w-2 h-2 bg-blue-400 opacity-50"></div>
              </div>
              
              <!-- Bilanz für Rating -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative" 
                :class="[
                  getRowClass(item),
                  item.customerValue !== item.ratingValue ? 'bg-red-100 bg-opacity-30' : '',
                  (editMode || showCorrections) ? 'cursor-text hover:bg-blue-50' : ''
                ]"
                :contenteditable="editMode || showCorrections"
                @focus="handleCellFocus($event)"
                @blur="updateValue(item, 'ratingValue', $event)"
              >
                <span :class="{ 'text-red-600': item.ratingValue < 0 }">
                  {{ formatCurrency(item.ratingValue) }}
                </span>
                <div v-if="(editMode || showCorrections) && !item.isSum" class="absolute top-0 right-0 w-2 h-2 bg-blue-400 opacity-50"></div>
              </div>
              
              <!-- Vorjahreswert -->
              <div 
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200" 
                :class="getRowClass(item)"
              >
                <span :class="{ 'text-red-600': item.previousValue < 0 }">
                  {{ formatCurrency(item.previousValue) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toggle for showing corrections -->
      <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        <button 
          @click="toggleCorrections" 
          class="flex items-center bg-white px-4 py-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span class="text-sm">{{ showCorrections ? 'Korrekturen ausblenden' : 'Korrekturen anzeigen' }}</span>
          <div class="ml-2 relative">
            <div 
              class="w-4 h-4 rounded-full border border-gray-300"
              :class="{ 'bg-blue-500 border-blue-500': showCorrections }"
            ></div>
            <div 
              v-if="showCorrections"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </button>
        
        <button 
          v-if="hasAppliedCorrections"
          @click="showRevertModal = true" 
          class="flex items-center bg-white px-4 py-2 rounded-full shadow-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span class="text-sm">Korrekturen rückgängig</span>
        </button>
      </div>

      <!-- Correction Modal -->
      <div 
        v-if="showCorrectionModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium">Automatische a.o. Posten Korrektur</h3>
            <button @click="showCorrectionModal = false" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-4 overflow-auto flex-grow">
            <p class="mb-4 text-gray-600">
              Folgende Korrekturen wurden für die Bilanz erkannt. Wählen Sie die Korrekturen aus, die angewendet werden sollen.
            </p>
            
            <div class="space-y-3">
              <div 
                v-for="(correction, index) in mockCorrections" 
                :key="index"
                class="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0 mt-0.5">
                    <input 
                      type="checkbox" 
                      :id="'correction-' + index" 
                      v-model="correction.selected"
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    >
                  </div>
                  <label :for="'correction-' + index" class="ml-3 flex-grow cursor-pointer">
                    <div class="flex justify-between">
                      <span class="font-medium">{{ correction.title }}</span>
                      <span 
                        class="text-sm px-2 py-0.5 rounded-full" 
                        :class="correction.impact === 'positiv' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ correction.impact === 'positiv' ? 'Positiver Effekt' : 'Negativer Effekt' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ correction.description }}</p>
                    
                    <div class="mt-2 bg-gray-50 p-2 rounded text-sm">
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <span class="text-gray-500">Betroffene Position:</span>
                          <span class="font-medium ml-1">{{ correction.position }}</span>
                        </div>
                        <div>
                          <span class="text-gray-500">Korrekturwert:</span>
                          <span class="font-medium ml-1" :class="correction.value < 0 ? 'text-red-600' : ''">
                            {{ formatCurrency(correction.value) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              @click="showCorrectionModal = false" 
              class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button 
              @click="applySelectedCorrections" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              :disabled="!hasSelectedCorrections"
            >
              Ausgewählte Korrekturen anwenden
            </button>
          </div>
        </div>
      </div>

      <!-- Revert Corrections Modal -->
      <div 
        v-if="showRevertModal" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium">Korrekturen rückgängig machen</h3>
            <button @click="showRevertModal = false" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-4 overflow-auto flex-grow">
            <p class="mb-4 text-gray-600">
              Folgende Korrekturen wurden auf die Bilanz angewendet. Wählen Sie die Korrekturen aus, die rückgängig gemacht werden sollen.
            </p>
            
            <div v-if="appliedCorrections.length === 0" class="text-center py-6 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Keine Korrekturen angewendet</p>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="(correction, index) in appliedCorrections" 
                :key="index"
                class="p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0 mt-0.5">
                    <input 
                      type="checkbox" 
                      :id="'revert-correction-' + index" 
                      v-model="correction.selected"
                      class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    >
                  </div>
                  <label :for="'revert-correction-' + index" class="ml-3 flex-grow cursor-pointer">
                    <div class="flex justify-between">
                      <span class="font-medium">{{ correction.title }}</span>
                      <span 
                        class="text-sm px-2 py-0.5 rounded-full" 
                        :class="correction.impact === 'positiv' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ correction.impact === 'positiv' ? 'Positiver Effekt' : 'Negativer Effekt' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ correction.description }}</p>
                    
                    <div class="mt-2 bg-gray-50 p-2 rounded text-sm">
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <span class="text-gray-500">Betroffene Position:</span>
                          <span class="font-medium ml-1">{{ correction.position }}</span>
                        </div>
                        <div>
                          <span class="text-gray-500">Korrekturwert:</span>
                          <span class="font-medium ml-1" :class="correction.value < 0 ? 'text-red-600' : ''">
                            {{ formatCurrency(correction.value) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              @click="showRevertModal = false" 
              class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button 
              @click="revertSelectedCorrections" 
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-400 transition-colors"
              :disabled="!hasSelectedReversions"
            >
              Ausgewählte Korrekturen rückgängig machen
            </button>
          </div>
        </div>
      </div>

      <!-- Feedback-Toast für Änderungen -->
      <div 
        v-if="showFeedback" 
        class="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-md shadow-lg z-30 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ feedbackMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import { useDocumentStore } from '../stores/document';
import { useBilanzenStore } from '../stores/bilanzen';
import { useRoute, useRouter } from 'vue-router';
import CorrectionModal from '../components/CorrectionModal.vue';
import BreadcrumbNav from '../components/BreadcrumbNav.vue';

const props = defineProps({
  id: {
    type: String,
    default: null
  },
  editMode: {
    type: Boolean,
    default: false
  }
});

const route = useRoute();
const router = useRouter();
const documentStore = useDocumentStore();
const bilanzenStore = useBilanzenStore();

// Reactive state
const showCorrections = ref(false);
const showCorrectionModal = ref(false);
const currentTab = ref('assets');
const isLoading = ref(true);
const corrections = ref([]);
const zoomLevel = ref(1.0); // Starte mit 100% Zoom
const pdfContainer = ref(null);
const pdfUrl = ref(null);
const showFullPdf = ref(false);
const showFeedback = ref(false);
const feedbackMessage = ref('');
const showRevertModal = ref(false);
const appliedCorrections = ref([]);

// Verwende die ID aus den Props oder aus der Route
const documentId = computed(() => props.id || route.params.id);

// Computed property für den Titel basierend auf dem Modus
const pageTitle = computed(() => {
  return props.editMode ? 'Bilanz bearbeiten' : 'Bilanz ansehen';
});

// Tabs
const tabs = [
  { id: 'assets', name: 'Aktiva' },
  { id: 'liabilities', name: 'Passiva' },
  { id: 'income', name: 'GuV' }
];

// Computed properties mit Fallback-Werten
const currentDocument = computed(() => documentStore.currentDocument || null);
const assets = computed(() => bilanzenStore.bilanzData?.Aktiva || []);
const liabilities = computed(() => bilanzenStore.bilanzData?.Passiva || []);
const incomeStatement = computed(() => bilanzenStore.bilanzData?.GuV || []);

// Navigation zum Dashboard
const navigateToDashboard = () => {
  router.push('/');
};

// PDF Zoom Methods
const zoomIn = () => {
  if (zoomLevel.value < 2.0) {
    zoomLevel.value += 0.1;
    applyZoom();
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.1;
    applyZoom();
  }
};

const resetZoom = () => {
  zoomLevel.value = 1.0;
  applyZoom();
};

const applyZoom = () => {
  if (pdfContainer.value) {
    const content = pdfContainer.value.querySelector('div');
    if (content) {
      content.style.transform = `scale(${zoomLevel.value})`;
      content.style.transformOrigin = 'top left';
      // Anpassen der Mindesthöhe für korrektes Scrollen
      content.style.minHeight = `${100 / zoomLevel.value}%`;
    }
  }
};

const openFullPdf = () => {
  console.log('Opening PDF in full screen');
  // In einer echten Anwendung würde hier die PDF-Datei geöffnet werden
  window.open(pdfUrl.value || '/src/assets/PDF2.pdf', '_blank');
};

const loadPdf = () => {
  try {
    // Verwende eine absolute URL, um Probleme mit relativen Pfaden zu vermeiden
    const baseUrl = window.location.origin;
    pdfUrl.value = `${baseUrl}/src/assets/PDF2.pdf`;
    console.log('PDF URL set to:', pdfUrl.value);
  } catch (error) {
    console.error('Fehler beim Laden der PDF-Datei:', error);
    pdfUrl.value = null;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', { 
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const applyCorrections = (selectedCorrectionIds) => {
  isLoading.value = true;
  
  // Simulate API call delay
  setTimeout(() => {
    const success = bilanzenStore.applyCorrections(selectedCorrectionIds);
    
    if (success) {
      showCorrectionModal.value = false;
      showCorrections.value = true;
      
      // Zeige Feedback
      feedbackMessage.value = `${selectedCorrectionIds.length} Korrekturen wurden erfolgreich angewendet.`;
      showFeedback.value = true;
      setTimeout(() => {
        showFeedback.value = false;
      }, 3000);
    }
    
    isLoading.value = false;
  }, 1000);
};

const getRowClass = (item) => {
  // Nur die Summenzeilen bekommen eine spezielle Hintergrundfarbe
  if (item.isSum) return 'bg-[#D9D9D9]';
  
  // Alle anderen Zeilen haben die Standardfarbe, unabhängig von Fehlern oder Warnungen
  return 'bg-[#F4F4F4]';
};

const handleCellFocus = (event) => {
  // Wähle den gesamten Text aus, wenn die Zelle fokussiert wird
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(event.target);
  selection.removeAllRanges();
  selection.addRange(range);
  
  // Entferne die Formatierung für die Bearbeitung
  const text = event.target.innerText;
  const numericValue = text.replace(/\./g, '').replace(',', '.');
  event.target.innerText = numericValue;
};

const updateValue = (item, field, event) => {
  if (!props.editMode && !showCorrections.value) return;
  
  try {
    // Entferne Formatierung und konvertiere zu Zahl
    const rawValue = event.target.innerText.replace(/\./g, '').replace(',', '.');
    const newValue = parseFloat(rawValue);
    
    if (!isNaN(newValue)) {
      // Speichere den alten Wert für Undo-Funktionalität
      const oldValue = item[field];
      
      // Nur aktualisieren, wenn sich der Wert geändert hat
      if (oldValue !== newValue) {
        // Aktualisiere den Wert
        item[field] = newValue;
        
        // Markiere als geändert
        item.hasWarning = true;
        
        // Wende Summenregeln an
        if (currentTab.value === 'assets') {
          bilanzenStore.applySum('Aktiva');
        } else if (currentTab.value === 'liabilities') {
          bilanzenStore.applySum('Passiva');
        } else if (currentTab.value === 'income') {
          bilanzenStore.applySum('GuV');
        }
        
        console.log(`Wert aktualisiert: ${field} von ${oldValue} zu ${newValue}`);
        
        // Zeige visuelle Bestätigung
        event.target.classList.add('bg-green-100');
        setTimeout(() => {
          event.target.classList.remove('bg-green-100');
        }, 500);
      }
    }
    
    // Formatiere den Wert wieder für die Anzeige
    event.target.innerHTML = `<span class="${newValue < 0 ? 'text-red-600' : ''}">${formatCurrency(item[field])}</span>`;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Werts:', error);
    // Bei Fehler den ursprünglichen Wert wiederherstellen
    event.target.innerHTML = `<span class="${item[field] < 0 ? 'text-red-600' : ''}">${formatCurrency(item[field])}</span>`;
  }
};

const navigateToEdit = () => {
  console.log('Navigating to edit mode for document:', documentId.value);
  router.push(`/bilanz/${documentId.value}/edit`);
};

const saveChanges = () => {
  console.log('Saving changes for document:', documentId.value);
  isLoading.value = true;
  
  // Sammle alle Änderungen
  const changes = {
    Aktiva: assets.value.filter(item => item.hasWarning),
    Passiva: liabilities.value.filter(item => item.hasWarning),
    GuV: incomeStatement.value.filter(item => item.hasWarning)
  };
  
  // Zähle die Gesamtzahl der Änderungen
  const totalChanges = changes.Aktiva.length + changes.Passiva.length + changes.GuV.length;
  
  console.log('Changes to save:', changes);
  
  // Simulate API call delay
  setTimeout(() => {
    // Hier würde normalerweise ein API-Aufruf stattfinden
    console.log('Changes saved successfully');
    
    // Markiere Änderungen als gespeichert
    [...assets.value, ...liabilities.value, ...incomeStatement.value].forEach(item => {
      if (item.hasWarning) {
        // Behalte die Warnung bei, aber markiere als gespeichert
        item.isSaved = true;
      }
    });
    
    isLoading.value = false;
    
    // Zeige Feedback
    feedbackMessage.value = `${totalChanges} Änderungen wurden erfolgreich gespeichert.`;
    showFeedback.value = true;
    setTimeout(() => {
      showFeedback.value = false;
      
      // Zurück zur Ansicht navigieren
      router.push(`/bilanz/${documentId.value}`);
    }, 2000);
  }, 1000);
};

const navigateToDocument = (id) => {
  console.log('Navigating to document view:', id);
  router.push(`/bilanz/${id}`);
};

const loadDocument = async () => {
  isLoading.value = true;
  
  console.log('Loading document with ID:', documentId.value);
  
  try {
    // Hier würde normalerweise ein API-Aufruf stattfinden
    // Stattdessen verwenden wir Mock-Daten
    if (documentId.value) {
      // Simuliere das Laden eines Dokuments
      setTimeout(() => {
        // Setze das aktuelle Dokument manuell
        documentStore.$patch({
          currentDocument: {
            id: documentId.value,
            companyName: 'Waldeck GmbH',
            companyId: 'WD-' + documentId.value,
            documentType: 'Jahresabschluss',
            documentMethod: 'Automatisch extrahiert',
            totalAssets: 481331.29,
            totalLiabilities: 481331.29,
            currency: 'EUR',
            status: 'In Bearbeitung'
          }
        });
        
        // Lade die Bilanzdaten
        bilanzenStore.loadBilanzData();
        
        // Lade die Korrekturen
        corrections.value = bilanzenStore.getCorrections();
        
        isLoading.value = false;
        
        // Im Bearbeitungsmodus automatisch Korrekturen anzeigen
        if (props.editMode) {
          showCorrections.value = true;
        }
      }, 500);
    } else {
      console.error('Keine Dokument-ID vorhanden');
      isLoading.value = false;
    }
  } catch (error) {
    console.error('Fehler beim Laden des Dokuments:', error);
    isLoading.value = false;
  }
};

const toggleCorrections = () => {
  showCorrections.value = !showCorrections.value;
  
  if (showCorrections.value) {
    // Wenn Korrekturen angezeigt werden, zeige einen Hinweis
    console.log('Korrekturen werden angezeigt. Klicken Sie auf einen Wert, um ihn zu bearbeiten.');
  } else {
    // Wenn Korrekturen ausgeblendet werden, zeige einen Hinweis
    console.log('Korrekturen werden ausgeblendet.');
  }
};

onMounted(() => {
  console.log('Document view mounted with ID:', documentId.value);
  console.log('Edit mode:', props.editMode);
  
  // Lade das Dokument basierend auf der ID
  loadDocument();
  
  // Lade die PDF-Datei
  loadPdf();
  
  // Initialisiere Zoom
  nextTick(() => {
    applyZoom();
  });
  
  // Füge einen Event-Listener hinzu, um Bearbeitungsmodus zu erkennen
  if (props.editMode) {
    console.log('Edit mode is active. You can edit values directly in the table.');
    document.addEventListener('keydown', handleKeyDown);
  }
});

// Füge diese Funktion zum Script-Teil hinzu
// Tastaturkürzel für Speichern (Strg+S)
const handleKeyDown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    if (props.editMode) {
      saveChanges();
    }
  }
};

// Entferne den Event-Listener beim Unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

// Überwache Änderungen am aktiven Tab
watch(currentTab, () => {
  console.log('Active tab changed:', currentTab.value);
});

// Füge diese Funktion zum Script-Teil hinzu, um die Summen zu berechnen
const recalculateSums = (section) => {
  let data;
  
  if (section === 'Aktiva') {
    data = assets.value;
  } else if (section === 'Passiva') {
    data = liabilities.value;
  } else if (section === 'GuV') {
    data = incomeStatement.value;
  } else {
    return;
  }
  
  // Finde alle Summenzeilen
  const sumRows = data.filter(item => item.isSum);
  
  // Berechne die Summen basierend auf den Unterposten
  sumRows.forEach(sumRow => {
    // Finde alle Unterposten dieser Summenzeile
    const childItems = data.filter(item => 
      item.number.startsWith(sumRow.number.split('.')[0]) && 
      item.number.includes('.') && 
      !item.isSum
    );
    
    // Berechne die Summe der Kundenbilanz
    sumRow.customerValue = childItems.reduce((sum, item) => sum + item.customerValue, 0);
    
    // Berechne die Summe der Rating-Bilanz
    sumRow.ratingValue = childItems.reduce((sum, item) => sum + item.ratingValue, 0);
    
    // Berechne die Summe der Vorjahreswerte
    sumRow.previousValue = childItems.reduce((sum, item) => sum + item.previousValue, 0);
    
    console.log(`Summe für ${sumRow.position} neu berechnet: ${sumRow.customerValue}`);
  });
};

// Füge diese Variablen zum Script-Teil hinzu
const mockCorrections = ref([
  {
    id: 1,
    title: "Außerordentliche Aufwendungen",
    description: "Umgliederung von außerordentlichen Aufwendungen in sonstige betriebliche Aufwendungen gemäß BilRUG.",
    position: "GuV - 13. Sonstige betriebliche Aufwendungen",
    value: -12500.00,
    impact: "negativ",
    selected: false
  },
  {
    id: 2,
    title: "Forderungen gegen Gesellschafter",
    description: "Umgliederung von Forderungen gegen Gesellschafter in Forderungen gegen verbundene Unternehmen.",
    position: "Aktiva - B.III Forderungen gegen verbundene Unternehmen",
    value: 33320.48,
    impact: "positiv",
    selected: false
  },
  {
    id: 3,
    title: "Rückstellungen für Pensionen",
    description: "Anpassung der Pensionsrückstellungen gemäß versicherungsmathematischem Gutachten.",
    position: "Passiva - B. Rückstellungen",
    value: -8200.00,
    impact: "negativ",
    selected: false
  },
  {
    id: 4,
    title: "Aktive latente Steuern",
    description: "Aktivierung latenter Steuern auf steuerliche Verlustvorträge.",
    position: "Aktiva - C. Sonstige Vermögensgegenstände",
    value: 15600.00,
    impact: "positiv",
    selected: false
  },
  {
    id: 5,
    title: "Verbindlichkeiten aus Lieferungen und Leistungen",
    description: "Korrektur von Verbindlichkeiten aus Lieferungen und Leistungen aufgrund von Doppelerfassungen.",
    position: "Passiva - C. Verbindlichkeiten",
    value: 7850.30,
    impact: "positiv",
    selected: false
  }
]);

// Computed property für die Prüfung, ob Korrekturen ausgewählt wurden
const hasSelectedCorrections = computed(() => {
  return mockCorrections.value.some(correction => correction.selected);
});

// Computed property für die Prüfung, ob Korrekturen angewendet wurden
const hasAppliedCorrections = computed(() => {
  return appliedCorrections.value.length > 0;
});

// Computed property für die Prüfung, ob Korrekturen zum Rückgängigmachen ausgewählt wurden
const hasSelectedReversions = computed(() => {
  return appliedCorrections.value.some(correction => correction.selected);
});

// Funktion zum Anwenden der ausgewählten Korrekturen
const applySelectedCorrections = () => {
  const selectedCorrections = mockCorrections.value.filter(correction => correction.selected);
  
  if (selectedCorrections.length === 0) {
    return;
  }
  
  isLoading.value = true;
  
  // Sammle die IDs der ausgewählten Korrekturen
  const selectedCorrectionIds = selectedCorrections.map(correction => correction.id);
  
  // Simulate API call delay
  setTimeout(() => {
    // Hier würde normalerweise ein API-Aufruf stattfinden
    console.log('Applying corrections:', selectedCorrections);
    
    // Zeige Feedback
    feedbackMessage.value = `${selectedCorrections.length} Korrekturen wurden erfolgreich angewendet.`;
    showFeedback.value = true;
    setTimeout(() => {
      showFeedback.value = false;
    }, 3000);
    
    // Schließe das Modal
    showCorrectionModal.value = false;
    
    // Aktiviere die Korrekturansicht
    showCorrections.value = true;
    
    // Markiere die betroffenen Positionen
    applyMockCorrections(selectedCorrections);
    
    // Füge die angewendeten Korrekturen zur Liste hinzu
    selectedCorrections.forEach(correction => {
      // Kopiere die Korrektur und setze selected auf false
      const appliedCorrection = { ...correction, selected: false };
      // Füge sie zur Liste der angewendeten Korrekturen hinzu
      appliedCorrections.value.push(appliedCorrection);
    });
    
    // Setze die Auswahl zurück
    mockCorrections.value.forEach(correction => {
      correction.selected = false;
    });
    
    isLoading.value = false;
  }, 1000);
};

// Funktion zum Anwenden der Mock-Korrekturen auf die Bilanzdaten
const applyMockCorrections = (selectedCorrections) => {
  // Für jede ausgewählte Korrektur
  selectedCorrections.forEach(correction => {
    // Bestimme den Bereich (Aktiva, Passiva, GuV)
    let section, items;
    
    if (correction.position.startsWith('Aktiva')) {
      section = 'Aktiva';
      items = assets.value;
    } else if (correction.position.startsWith('Passiva')) {
      section = 'Passiva';
      items = liabilities.value;
    } else if (correction.position.startsWith('GuV')) {
      section = 'GuV';
      items = incomeStatement.value;
    }
    
    if (!items) return;
    
    // Extrahiere den Positionsnamen aus der Korrektur
    const positionName = correction.position.split(' - ')[1];
    
    // Finde die entsprechende Position in den Bilanzdaten
    const item = items.find(item => item.position.includes(positionName));
    
    if (item) {
      // Markiere das Item als korrigiert
      item.hasWarning = true;
      
      // Aktualisiere den Wert für das Rating (nicht den Kundenwert)
      const oldValue = item.ratingValue;
      item.ratingValue = oldValue + correction.value;
      
      console.log(`Korrektur angewendet: ${correction.title}, Position: ${positionName}, Alter Wert: ${oldValue}, Neuer Wert: ${item.ratingValue}`);
      
      // Aktualisiere die Summen
      recalculateSums(section);
    }
  });
};

// Funktion zum Rückgängigmachen der ausgewählten Korrekturen
const revertSelectedCorrections = () => {
  const selectedReversions = appliedCorrections.value.filter(correction => correction.selected);
  
  if (selectedReversions.length === 0) {
    return;
  }
  
  isLoading.value = true;
  
  // Simulate API call delay
  setTimeout(() => {
    // Hier würde normalerweise ein API-Aufruf stattfinden
    console.log('Reverting corrections:', selectedReversions);
    
    // Zeige Feedback
    feedbackMessage.value = `${selectedReversions.length} Korrekturen wurden erfolgreich rückgängig gemacht.`;
    showFeedback.value = true;
    setTimeout(() => {
      showFeedback.value = false;
    }, 3000);
    
    // Schließe das Modal
    showRevertModal.value = false;
    
    // Mache die Korrekturen rückgängig
    revertMockCorrections(selectedReversions);
    
    // Entferne die rückgängig gemachten Korrekturen aus der Liste
    appliedCorrections.value = appliedCorrections.value.filter(correction => !correction.selected);
    
    isLoading.value = false;
  }, 1000);
};

// Funktion zum Rückgängigmachen der Mock-Korrekturen
const revertMockCorrections = (selectedReversions) => {
  // Für jede ausgewählte Korrektur
  selectedReversions.forEach(correction => {
    // Bestimme den Bereich (Aktiva, Passiva, GuV)
    let section, items;
    
    if (correction.position.startsWith('Aktiva')) {
      section = 'Aktiva';
      items = assets.value;
    } else if (correction.position.startsWith('Passiva')) {
      section = 'Passiva';
      items = liabilities.value;
    } else if (correction.position.startsWith('GuV')) {
      section = 'GuV';
      items = incomeStatement.value;
    }
    
    if (!items) return;
    
    // Extrahiere den Positionsnamen aus der Korrektur
    const positionName = correction.position.split(' - ')[1];
    
    // Finde die entsprechende Position in den Bilanzdaten
    const item = items.find(item => item.position.includes(positionName));
    
    if (item) {
      // Aktualisiere den Wert für das Rating (nicht den Kundenwert)
      const oldValue = item.ratingValue;
      // Beim Rückgängigmachen wird der Korrekturwert abgezogen (umgekehrte Operation)
      item.ratingValue = oldValue - correction.value;
      
      console.log(`Korrektur rückgängig gemacht: ${correction.title}, Position: ${positionName}, Alter Wert: ${oldValue}, Neuer Wert: ${item.ratingValue}`);
      
      // Prüfe, ob noch andere Korrekturen für dieses Item aktiv sind
      const hasOtherCorrections = appliedCorrections.value.some(c => 
        !c.selected && // Nicht ausgewählt zum Rückgängigmachen
        c.position.includes(positionName) // Betrifft die gleiche Position
      );
      
      // Wenn keine anderen Korrekturen mehr aktiv sind, entferne die Warnung
      if (!hasOtherCorrections) {
        item.hasWarning = false;
      }
      
      // Aktualisiere die Summen
      recalculateSums(section);
    }
  });
};

const saveDocument = () => {
  console.log('Saving document:', documentId.value);
  isLoading.value = true;
  
  // Simulate API call delay
  setTimeout(() => {
    // Hier würde normalerweise ein API-Aufruf stattfinden
    console.log('Document saved successfully');
    
    isLoading.value = false;
    
    // Zeige Feedback
    feedbackMessage.value = `Dokument wurde erfolgreich gespeichert.`;
    showFeedback.value = true;
    setTimeout(() => {
      showFeedback.value = false;
    }, 3000);
  }, 1000);
};
</script>

<style scoped>
.font-frutiger {
  font-family: "Frutiger Std", sans-serif;
}

/* Standardfarbe für normale Zeilen */
.bg-\[\#F4F4F4\] {
  background-color: #F4F4F4;
}

/* Summenzeilen */
.bg-\[\#D9D9D9\] {
  background-color: #D9D9D9;
}

/* Fehler in Summenregeln */
.bg-\[\#FBD2D2\] {
  background-color: #FBD2D2;
}

/* Korrektur durchgeführt */
.bg-\[\#FAE3D2\] {
  background-color: #FAE3D2;
}

/* Werte-Formatierung */
.financial-value {
  @apply text-right px-4;
}

.financial-value-negative {
  @apply text-red-600;
}

/* Vertikale blaue Linie für Gruppierung */
.group-indicator {
  @apply w-1 h-full bg-[#3A73B8] absolute left-0;
}

/* Vertikale rote Linie für Fehler */
.error-indicator {
  @apply w-1 h-full bg-red-500 absolute left-0;
}

/* Vertikale orange Linie für Warnungen */
.warning-indicator {
  @apply w-1 h-full bg-[#E47120] absolute left-0;
}

/* Tab Styles */
.tab-button {
  @apply outline-none focus:outline-none;
}

.tab-button.active {
  @apply z-20;
}

.tab-shape {
  @apply border-b-0 transition-all duration-200;
}

.tab-button:not(.active) .tab-shape {
  @apply opacity-90 border-gray-300;
}

.tab-button:not(.active):hover .tab-shape {
  @apply opacity-100;
}
</style> 