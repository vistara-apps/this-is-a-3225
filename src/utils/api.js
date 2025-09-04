/**
 * API Utility Functions
 * Provides common functionality for all API services
 */

export class APIError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.code = code
  }
}

export class RateLimitError extends APIError {
  constructor(message, retryAfter) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.retryAfter = retryAfter
  }
}

/**
 * Generic API request handler with retry logic and error handling
 */
export async function apiRequest(url, options = {}, retries = 3) {
  const {
    timeout = 30000,
    retryDelay = 1000,
    ...fetchOptions
  } = options

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 60
          throw new RateLimitError(
            errorData.message || 'Rate limit exceeded',
            parseInt(retryAfter)
          )
        }

        throw new APIError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code
        )
      }

      return await response.json()
    } catch (error) {
      if (attempt === retries) {
        throw error
      }

      // Don't retry on client errors (4xx) except rate limits
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }

      // Exponential backoff for retries
      const delay = retryDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Rate limiter utility
 */
export class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = []
  }

  async checkLimit() {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest)
      throw new RateLimitError(`Rate limit exceeded. Try again in ${waitTime}ms`, waitTime)
    }

    this.requests.push(now)
  }
}

/**
 * Response cache utility
 */
export class ResponseCache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map()
    this.ttl = ttl
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    })
  }

  clear() {
    this.cache.clear()
  }
}

/**
 * Environment configuration helper
 */
export function getEnvVar(name, defaultValue = null) {
  const value = import.meta.env[name]
  if (!value && defaultValue === null) {
    throw new Error(`Environment variable ${name} is required`)
  }
  return value || defaultValue
}

/**
 * Data transformation utilities
 */
export function transformResponse(data, transformer) {
  if (typeof transformer === 'function') {
    return transformer(data)
  }
  return data
}

export function validateRequiredFields(data, requiredFields) {
  const missing = requiredFields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}
