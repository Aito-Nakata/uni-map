// Debug mode utilities for web
export const isDebugMode = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.search.includes('debug=true');
};

export const debugLog = (message: string, data?: any) => {
  if (isDebugMode()) {
    console.log(`[CHUNITHM App Debug] ${message}`, data || '');
  }
};

export const debugError = (message: string, error?: any) => {
  if (isDebugMode()) {
    console.error(`[CHUNITHM App Error] ${message}`, error || '');
  }
};

export const debugComponent = (componentName: string, props?: any) => {
  if (isDebugMode()) {
    console.log(`[Component] ${componentName} rendered`, props || '');
  }
};