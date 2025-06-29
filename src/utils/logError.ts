export function logError(error: Error | string | unknown, context?: string) {
  // TODO: Integrate with external logging service in production
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error(error);
  }
} 