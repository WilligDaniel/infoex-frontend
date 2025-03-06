import { defineStore } from 'pinia'

export const useDictionaryStore = defineStore('dictionary', {
  state: () => ({
    dictionary: {}
  }),
  
  actions: {
    /**
     * Gets a value from the dictionary
     * @param {string} key - The key to retrieve
     * @returns {any} The value associated with the key, or undefined if not found
     */
    get(key) {
      return this.dictionary[key]
    },
    
    /**
     * Sets a key-value pair in the dictionary
     * @param {string} key - The key to set
     * @param {any} value - The value to associate with the key
     */
    set(key, value) {
      this.dictionary[key] = value
    },
    
    /**
     * Removes a key-value pair from the dictionary
     * @param {string} key - The key to remove
     * @returns {boolean} True if the key was found and removed, false otherwise
     */
    remove(key) {
      if (key in this.dictionary) {
        delete this.dictionary[key]
        return true
      }
      return false
    },
    
    /**
     * Clears all entries from the dictionary
     */
    clear() {
      this.dictionary = {}
    }
  },
  
  getters: {
    /**
     * Returns the size of the dictionary
     * @returns {number} The number of entries in the dictionary
     */
    size: (state) => Object.keys(state.dictionary).length,
    
    /**
     * Returns all keys in the dictionary
     * @returns {string[]} Array of all keys
     */
    keys: (state) => Object.keys(state.dictionary),
    
    /**
     * Returns all values in the dictionary
     * @returns {any[]} Array of all values
     */
    values: (state) => Object.values(state.dictionary),
    
    /**
     * Returns whether the dictionary is empty
     * @returns {boolean} True if the dictionary is empty
     */
    isEmpty: (state) => Object.keys(state.dictionary).length === 0
  }
})

