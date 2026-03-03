import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => userInfo.value?.id)
  
  // Actions
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }
  
  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    userId,
    setToken,
    setUserInfo,
    logout
  }
})

export const useVenueStore = defineStore('venue', () => {
  const venues = ref([])
  const currentVenue = ref(null)
  const filters = ref({
    city: '',
    venueType: '',
    partnerOnly: false,
    priceRange: []
  })
  
  function setVenues(list) {
    venues.value = list
  }
  
  function setCurrentVenue(venue) {
    currentVenue.value = venue
  }
  
  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }
  
  return {
    venues,
    currentVenue,
    filters,
    setVenues,
    setCurrentVenue,
    setFilters
  }
})

export const usePlanStore = defineStore('plan', () => {
  const currentPlan = ref(null)
  const plans = ref([])
  
  function setCurrentPlan(plan) {
    currentPlan.value = plan
  }
  
  function addPlan(plan) {
    plans.value.push(plan)
  }
  
  return {
    currentPlan,
    plans,
    setCurrentPlan,
    addPlan
  }
})