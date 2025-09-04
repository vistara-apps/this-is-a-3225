/**
 * Services Index
 * Central export point for all API services
 */

import openaiService from './openai.js'
import supabaseService from './supabase.js'
import tiktokService from './tiktok.js'
import instagramService from './instagram.js'

// Export individual services
export { 
  openaiService,
  supabaseService,
  tiktokService,
  instagramService
}

// Export unified API interface
export const api = {
  openai: openaiService,
  supabase: supabaseService,
  tiktok: tiktokService,
  instagram: instagramService
}

// Service health check utility
export async function checkServicesHealth() {
  const results = {
    openai: { status: 'unknown', error: null },
    supabase: { status: 'unknown', error: null },
    tiktok: { status: 'unknown', error: null },
    instagram: { status: 'unknown', error: null }
  }

  // Check OpenAI service
  try {
    await openaiService.getUsageStats()
    results.openai.status = 'healthy'
  } catch (error) {
    results.openai.status = 'error'
    results.openai.error = error.message
  }

  // Note: Other services require authentication tokens to check health
  // In a real implementation, you would check these with valid tokens

  return results
}

// Service configuration utility
export function configureServices(config) {
  // This would allow runtime configuration of services
  // For example, switching between development and production endpoints
  console.log('Services configured with:', config)
}

export default api
