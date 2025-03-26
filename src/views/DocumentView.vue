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
          <div class="md:w-2/3">
            <div class="flex justify-between mb-4">
              <h1 class="text-2xl font-medium mb-4">
                {{ currentDocument.companyName }} (WD-{{ currentDocument.companyId || 'Keine ID' }})
              </h1>
              <div class="flex space-x-2 relative">
                <!-- Dokument speichern Button nur im Bearbeitungsmodus anzeigen -->
                <button 
                  v-if="editMode"
                  class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center" 
                  @click="saveDocument"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Dokument speichern
                </button>
                <!-- Bearbeiten Button im Ansichtsmodus anzeigen -->
                <router-link 
                  v-if="!editMode"
                  :to="`/bilanz/${$route.params.id}/edit`"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bearbeiten
                </router-link>
              </div>
            </div>

            <!-- Disclaimer für Ansichtsmodus -->
            <div v-if="!editMode" class="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-blue-800">Sie befinden sich im Ansichtsmodus. Um Änderungen vorzunehmen, klicken Sie bitte auf den "Bearbeiten" Button.</span>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="mb-4">
              <span v-if="editMode" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Bearbeitungsmodus
              </span>
              <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ansichtsmodus
              </span>
            </div>

            <div class="grid grid-cols-4 gap-3">
              <div class="info-box bg-[#D9D9D9]">
                <p class="info-box-label">KUNDENINFORMATION</p>
                <p class="info-box-value">{{ currentDocument.documentType || 'Jahresabschluss' }}</p>
                <p class="text-sm text-gray-700">{{ currentDocument.documentMethod || 'Automatisch extrahiert' }}</p>
              </div>
              <div class="info-box bg-[#D9D9D9]">
                <p class="info-box-label">Σ AKTIVA</p>
                <p class="info-box-value">{{ formatCurrency(currentDocument.totalAssets || 0) }}</p>
              </div>
              <div class="info-box bg-[#D9D9D9]">
                <p class="info-box-label">Σ PASSIVA</p>
                <p class="info-box-value">{{ formatCurrency(currentDocument.totalLiabilities || 0) }}</p>
              </div>
              <div class="info-box bg-[#D9D9D9]">
                <p class="info-box-label">in</p>
                <p class="info-box-value">{{ currentDocument.currency || 'EUR' }}</p>
              </div>
            </div>
          </div>
          
          <!-- PDF Preview Panel -->
          <div class="md:w-1/3 relative">
            <div class="absolute right-0 top-0">
              <div class="bg-white border border-gray-200 rounded-lg shadow-lg">
                <!-- Toggle Header -->
                <div 
                  @click="isPdfExpanded = !isPdfExpanded"
                  class="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                >
                  <span class="text-sm font-medium">PDF Vorschau</span>
                  <svg 
                    class="w-5 h-5 transform transition-transform"
                    :class="isPdfExpanded ? 'rotate-180' : ''"
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
                
                <!-- Collapsible Content -->
                <div v-show="isPdfExpanded" class="border-t border-gray-200">
                  <div class="h-64 relative">
                    <!-- PDF Content -->
                    <div class="w-full h-full flex flex-col">
                      <div class="flex-grow flex items-center justify-center bg-[#3A3E42] relative">
                        <!-- PDF Container -->
                        <div class="w-4/5 h-full bg-white mx-auto overflow-auto" ref="pdfContainer">
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
                        
                        <!-- Zoom Controls -->
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mb-6 flex space-x-4">
          <button
            @click="showCorrectionModal = true" 
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm">Automatische a.o. Posten Korrektur</span>
          </button>
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Status ändern
          </button>
          <!-- Bearbeiten Button -->
          <button 
            v-if="!editMode" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors" 
            @click="navigateToEdit"
          >
            Bearbeiten
          </button>
          <!-- Änderungen speichern Button -->
          <button 
            v-if="editMode" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors" 
            @click="saveChanges"
          >
            Änderungen speichern
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

        <!-- Korrekturen anzeigen Button -->
        <div class="mb-4 flex justify-end">
          <button 
            @click="toggleCorrections" 
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span class="text-sm">{{ showCorrections ? 'Korrekturen ausblenden' : 'Korrekturen anzeigen' }}</span>
          </button>
        </div>

        <!-- Table Header -->
        <div class="flex border-b border-gray-300 mb-1">
          <div class="w-1/12 p-2 font-medium">Nummer</div>
          <div class="w-5/12 p-2 font-medium">Bilanzposition</div>
          <div class="w-2/12 p-2 text-right font-medium">Kundenbilanz</div>
          <div class="w-2/12 p-2 text-right font-medium">Bilanz für Rating</div>
          <div class="w-2/12 p-2 text-right font-medium">Vorjahreswert</div>
          <div v-if="showCorrections" class="w-2/12 p-2 text-right font-medium">Korrekturen</div>
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
                class="w-1/12 p-2 border border-gray-200 relative" 
                :class="getRowClass(item)"
              >
                <span class="pl-2">{{ item.number }}</span>
                <!-- Notiz-Indikator -->
                <div v-if="item.notes && item.notes.length > 0" 
                  class="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"
                  title="Diese Position hat Bemerkungen"
                ></div>
              </div>
              
              <!-- Bilanzposition -->
              <div 
                class="w-5/12 p-2 border-t border-b border-r border-gray-200 flex justify-between items-center" 
                :class="getRowClass(item)"
              >
                <span class="uppercase">{{ item.position }}</span>
                <!-- Notiz-Button -->
                <button
                  @click="openNotesDialog(item, 'Aktiva')"
                  class="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  :class="{ 'text-blue-600': item.notes && item.notes.length > 0 }"
                  title="Bemerkungen anzeigen/bearbeiten"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </button>
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

              <!-- Korrekturen Spalte -->
              <div 
                v-if="showCorrections"
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative shadow-md -mt-1 bg-white" 
                :class="[
                  getRowClass(item),
                  'cursor-text hover:bg-blue-50'
                ]"
                :contenteditable="true"
                @focus="handleCellFocus($event)"
                @blur="updateCorrection(item, $event)"
              >
                <span :class="{ 'text-red-600': (item.correction || 0) < 0 }">
                  {{ formatCurrency(item.correction || 0) }}
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
                class="w-1/12 p-2 border border-gray-200 relative" 
                :class="getRowClass(item)"
              >
                <span class="pl-2">{{ item.number }}</span>
                <!-- Notiz-Indikator -->
                <div v-if="item.notes && item.notes.length > 0" 
                  class="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"
                  title="Diese Position hat Bemerkungen"
                ></div>
              </div>
              
              <!-- Bilanzposition -->
              <div 
                class="w-5/12 p-2 border-t border-b border-r border-gray-200 flex justify-between items-center" 
                :class="getRowClass(item)"
              >
                <span class="uppercase">{{ item.position }}</span>
                <!-- Notiz-Button -->
                <button
                  @click="openNotesDialog(item, 'Passiva')"
                  class="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  :class="{ 'text-blue-600': item.notes && item.notes.length > 0 }"
                  title="Bemerkungen anzeigen/bearbeiten"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </button>
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

              <!-- Korrekturen Spalte -->
              <div 
                v-if="showCorrections"
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative shadow-md -mt-1 bg-white" 
                :class="[
                  getRowClass(item),
                  'cursor-text hover:bg-blue-50'
                ]"
                :contenteditable="true"
                @focus="handleCellFocus($event)"
                @blur="updateCorrection(item, $event)"
              >
                <span :class="{ 'text-red-600': (item.correction || 0) < 0 }">
                  {{ formatCurrency(item.correction || 0) }}
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
            <!-- Zeile mit separaten Zellen -->
            <div class="flex">
              <!-- Nummer -->
              <div 
                class="w-1/12 p-2 border border-gray-200 relative" 
                :class="getRowClass(item)"
              >
                <span class="pl-2">{{ item.number }}</span>
                <!-- Notiz-Indikator -->
                <div v-if="item.notes && item.notes.length > 0" 
                  class="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"
                  title="Diese Position hat Bemerkungen"
                ></div>
              </div>
              
              <!-- Bilanzposition -->
              <div 
                class="w-4/12 p-2 border-t border-b border-r border-gray-200 flex justify-between items-center" 
                :class="getRowClass(item)"
              >
                <span class="uppercase">{{ item.position }}</span>
                <!-- Notiz-Button -->
                <button
                  @click="openNotesDialog(item, 'GuV')"
                  class="ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  :class="{ 'text-blue-600': item.notes && item.notes.length > 0 }"
                  title="Bemerkungen anzeigen/bearbeiten"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </button>
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

              <!-- Korrekturen Spalte -->
              <div 
                v-if="showCorrections"
                class="w-2/12 p-2 text-right border-t border-b border-r border-gray-200 relative shadow-md -mt-1 bg-white" 
                :class="[
                  getRowClass(item),
                  'cursor-text hover:bg-blue-50'
                ]"
                :contenteditable="true"
                @focus="handleCellFocus($event)"
                @blur="updateCorrection(item, $event)"
              >
                <span :class="{ 'text-red-600': (item.correction || 0) < 0 }">
                  {{ formatCurrency(item.correction || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>
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
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ correction.description }}</p>
                    
                    <div class="mt-2 bg-gray-50 p-2 rounded text-sm">
                      <div class="grid grid-cols-1 gap-2">
                        <div>
                          <span class="text-gray-500">{{ correction.positionFrom ? 'Umgliederung von:' : 'Anpassung der Position:' }}</span>
                          <span class="font-medium ml-1">{{ correction.positionFrom || correction.position }}</span>
                        </div>
                        <div v-if="correction.positionTo">
                          <span class="text-gray-500">Umgliederung nach:</span>
                          <span class="font-medium ml-1">{{ correction.positionTo }}</span>
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

      <!-- Pop-up Dialog für Personen-/Einheitennummer -->
      <div v-if="showNumberDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">Personen-/Einheitennummer eingeben</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Bitte geben Sie die Personen- oder Einheitennummer ein
            </label>
            <input 
              type="text" 
              v-model="identifierNumber"
              maxlength="10"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. 12345 oder AB123"
              @input="validateIdentifier"
            >
            <p class="mt-1 text-sm text-gray-500">
              Personennummer: nur Zahlen<br>
              Einheitennummer: Buchstaben und Zahlen<br>
              Maximal 10 Stellen
            </p>
            <p v-if="identifierError" class="mt-1 text-sm text-red-600">
              {{ identifierError }}
            </p>
          </div>
          <div class="flex justify-end space-x-3">
            <button 
              @click="cancelIdentifierInput"
              class="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button 
              @click="confirmIdentifierInput"
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              :disabled="!isValidIdentifier"
            >
              Bestätigen
            </button>
          </div>
        </div>
      </div>

      <!-- Notes Dialog -->
      <div v-if="showNotesDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">
              Bemerkungen zu {{ selectedItem?.position }}
              <span class="text-sm text-gray-500">({{ selectedSection }})</span>
            </h3>
            <button @click="closeNotesDialog" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Existing Notes -->
          <div class="mb-4 max-h-60 overflow-y-auto">
            <div v-if="selectedItem?.notes?.length" class="space-y-3">
              <div v-for="note in selectedItem.notes" :key="note.id" class="bg-gray-50 p-3 rounded-lg">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="whitespace-pre-wrap">{{ note.text }}</p>
                    <p class="text-sm text-gray-500 mt-1">
                      {{ formatDate(note.date) }} von {{ note.user }}
                    </p>
                  </div>
                  <button 
                    @click="removeNote(note.id)" 
                    class="text-red-500 hover:text-red-700 ml-2"
                    title="Bemerkung löschen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="text-gray-500 text-center py-4">Keine Bemerkungen vorhanden</p>
          </div>

          <!-- Add New Note -->
          <div class="border-t pt-4">
            <textarea
              v-model="newNote"
              class="w-full p-2 border rounded-lg mb-4"
              rows="3"
              placeholder="Neue Bemerkung hinzufügen..."
            ></textarea>
            <div class="flex justify-end space-x-2">
              <button
                @click="closeNotesDialog"
                class="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                @click="saveNote"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                :disabled="!newNote.trim()"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
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

// Neue Variablen für das Pop-up
const showNumberDialog = ref(false);
const identifierNumber = ref('');
const identifierError = ref('');
const isValidIdentifier = ref(false);

// Neue Variablen für Bemerkungen
const showNotesDialog = ref(false);
const selectedItem = ref(null);
const selectedSection = ref('');
const newNote = ref('');

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
  
  // Speichere den ursprünglichen Wert als Datenattribut
  const originalText = event.target.innerText;
  event.target.dataset.originalValue = originalText;
  
  // Zeige den Wert ohne Formatierung an
  event.target.innerText = originalText;
};

const updateValue = (item, field, event) => {
  if (!props.editMode && !showCorrections.value) return;
  
  try {
    // Hole den ursprünglichen Wert
    const originalValue = item[field];
    
    // Wenn sich der Text nicht geändert hat, behalte den ursprünglichen Wert
    if (event.target.innerText === event.target.dataset.originalValue) {
      event.target.innerHTML = `<span class="${originalValue < 0 ? 'text-red-600' : ''}">${formatCurrency(originalValue)}</span>`;
      return;
    }
    
    // Entferne alle Tausenderpunkte und ersetze Komma durch Punkt für die Konvertierung
    const rawValue = event.target.innerText
      .trim()
      .replace(/\s/g, '') // Entferne Leerzeichen
      .replace(/\./g, '')  // Entferne Tausenderpunkte
      .replace(',', '.'); // Ersetze Komma durch Punkt
    
    const newValue = parseFloat(rawValue);
    
    if (!isNaN(newValue)) {
      // Nur aktualisieren, wenn sich der Wert geändert hat
      if (Math.abs(originalValue - newValue) > 0.001) { // Verwende Epsilon-Vergleich für Fließkommazahlen
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
        
        console.log(`Wert aktualisiert: ${field} von ${originalValue} zu ${newValue}`);
        
        // Zeige visuelle Bestätigung
        event.target.classList.add('bg-green-100');
        setTimeout(() => {
          event.target.classList.remove('bg-green-100');
        }, 500);
      }
    }
    
    // Formatiere den Wert wieder für die Anzeige
    event.target.innerHTML = `<span class="${item[field] < 0 ? 'text-red-600' : ''}">${formatCurrency(item[field])}</span>`;
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
    if (documentId.value) {
      // Simuliere das Laden eines Dokuments
      setTimeout(() => {
        // Setze das aktuelle Dokument manuell
        documentStore.$patch({
          currentDocument: {
            id: documentId.value,
            companyName: 'Waldeck GmbH',
            companyId: documentId.value, // Verwende die ID direkt ohne WD- Präfix
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
    positionFrom: "GuV - Außerordentliche Aufwendungen",
    positionTo: "GuV - 13. Sonstige betriebliche Aufwendungen",
    position: "GuV - 13. Sonstige betriebliche Aufwendungen",
    value: -12500.00,
    impact: "negativ",
    selected: false
  },
  {
    id: 2,
    title: "Forderungen gegen Gesellschafter",
    description: "Umgliederung von Forderungen gegen Gesellschafter in Forderungen gegen verbundene Unternehmen.",
    positionFrom: "Aktiva - B.IV Forderungen gegen Gesellschafter",
    positionTo: "Aktiva - B.III Forderungen gegen verbundene Unternehmen",
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

const saveDocument = async () => {
  // Navigate to KPI view
  router.push(`/bilanz/${documentId.value}/kpi`);
};

// Neue Methode für das Handling von Korrekturen
const updateCorrection = (item, event) => {
  if (!showCorrections.value) return;
  
  try {
    const text = event.target.innerText.trim();
    const numericValue = parseFloat(text.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(numericValue)) {
      event.target.innerText = formatCurrency(item.correction || 0);
      return;
    }
    
    // Aktualisiere den Korrekturwert
    item.correction = numericValue;
    
    // Aktualisiere den Rating-Wert basierend auf der Korrektur
    item.ratingValue = item.customerValue + numericValue;
    
    // Formatiere den Wert wieder
    event.target.innerText = formatCurrency(numericValue);
    
    // Markiere das Item als korrigiert wenn eine Korrektur vorhanden ist
    item.hasWarning = numericValue !== 0;
    
    // Aktualisiere die Summen
    recalculateSums(currentTab.value);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Korrektur:', error);
    event.target.innerText = formatCurrency(item.correction || 0);
  }
};

// Validierung der Eingabe
const validateIdentifier = () => {
  const value = identifierNumber.value;
  
  if (!value) {
    identifierError.value = 'Bitte geben Sie eine Nummer ein.';
    isValidIdentifier.value = false;
    return;
  }
  
  if (value.length > 10) {
    identifierError.value = 'Die Nummer darf maximal 10 Stellen haben.';
    isValidIdentifier.value = false;
    return;
  }
  
  // Prüfe ob es eine Personennummer (nur Zahlen) ist
  if (/^\d+$/.test(value)) {
    identifierError.value = '';
    isValidIdentifier.value = true;
    return;
  }
  
  // Prüfe ob es eine Einheitennummer (Buchstaben und Zahlen) ist
  if (/^[A-Za-z0-9]+$/.test(value)) {
    identifierError.value = '';
    isValidIdentifier.value = true;
    return;
  }
  
  identifierError.value = 'Ungültiges Format. Verwenden Sie nur Zahlen für Personennummern oder Buchstaben und Zahlen für Einheitennummern.';
  isValidIdentifier.value = false;
};

// Bestätigung der Eingabe
const confirmIdentifierInput = () => {
  if (isValidIdentifier.value) {
    showNumberDialog.value = false;
    // Hier würde in einer echten Implementierung die Nummer gespeichert werden
    console.log('Identifier saved:', identifierNumber.value);
  }
};

// Abbruch der Eingabe
const cancelIdentifierInput = () => {
  showNumberDialog.value = false;
  identifierNumber.value = '';
  identifierError.value = '';
  isValidIdentifier.value = false;
};

// Pop-up nach dem Hochladen anzeigen
const showIdentifierDialog = () => {
  showNumberDialog.value = true;
};

// Erweitere die bestehende Upload-Funktion
const handleFileUpload = async (file) => {
  // ... existing upload logic ...
  
  // Nach erfolgreichem Upload das Pop-up anzeigen
  showIdentifierDialog();
};

// Funktion zum Öffnen des Bemerkungen-Dialogs
const openNotesDialog = (item, section) => {
  selectedItem.value = item;
  selectedSection.value = section;
  showNotesDialog.value = true;
  newNote.value = '';
};

// Funktion zum Schließen des Bemerkungen-Dialogs
const closeNotesDialog = () => {
  showNotesDialog.value = false;
  selectedItem.value = null;
  selectedSection.value = '';
  newNote.value = '';
};

// Funktion zum Speichern einer neuen Bemerkung
const saveNote = () => {
  if (newNote.value.trim() && selectedItem.value && selectedSection.value) {
    bilanzenStore.addNote(selectedSection.value, selectedItem.value.id, newNote.value.trim());
    newNote.value = '';
    
    // Zeige Feedback
    feedbackMessage.value = 'Bemerkung wurde gespeichert';
    showFeedback.value = true;
    setTimeout(() => {
      showFeedback.value = false;
    }, 3000);
  }
};

// Funktion zum Löschen einer Bemerkung
const removeNote = (noteId) => {
  if (selectedItem.value && selectedSection.value) {
    bilanzenStore.removeNote(selectedSection.value, selectedItem.value.id, noteId);
    
    // Zeige Feedback
    feedbackMessage.value = 'Bemerkung wurde gelöscht';
    showFeedback.value = true;
    setTimeout(() => {
      showFeedback.value = false;
    }, 3000);
  }
};

// Funktion zum Formatieren des Datums
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Add to script setup
const isPdfExpanded = ref(false);
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

/* Neue Styles für Bemerkungen */
.note-indicator {
  @apply absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full;
}

.note-button {
  @apply ml-2 p-1 text-gray-500 hover:text-blue-600 transition-colors;
}

.note-button.has-notes {
  @apply text-blue-600;
}
</style> 