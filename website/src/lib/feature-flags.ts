/**
 * Feature flags pour activer/désactiver des fonctionnalités selon l'environnement
 */

export const IS_DEV = process.env.NODE_ENV === 'development'
export const IS_PROD = process.env.NODE_ENV === 'production'
export const IS_TEST = process.env.NODE_ENV === 'test'

// Feature flags
export const FEATURE_FLAGS = {
  // Pages de test/debug (visibles uniquement en dev)
  enableTestPages: IS_DEV || process.env.ENABLE_TEST_PAGES === 'true',
  
  // Composants de cache debug
  enableCacheControls: IS_DEV || process.env.ENABLE_CACHE_DEBUG === 'true',
  
  // API de revalidation manuelle
  enableRevalidateAPI: IS_DEV || process.env.ENABLE_REVALIDATE_API === 'true',
  
  // Logs de performance
  enablePerformanceLogs: IS_DEV,
  
  // React Query DevTools
  enableReactQueryDevTools: IS_DEV,
} as const

// Helper pour vérifier une feature
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature]
}

// Liste des routes à exclure en production
export const TEST_ROUTES = [
  '/admin/test',
  '/admin/test/surveillance-perf',
  '/admin/test/alarms-perf',
  '/admin/test/audit-perf',
  '/admin/test/settings-perf',
  '/admin/test/users-perf',
  '/test',
  '/test/surveillance-perf',
  '/test/alarms-perf',
  '/test/audit-perf',
  '/test/settings-perf',
  '/test/users-perf',
  '/debug',
] as const
