// Base error interface
export interface BaseError {
  message: string;
}

// Firebase error interface
export interface FirebaseError extends BaseError {
  code: string;
  customData?: Record<string, unknown>;
}

// Backend API error interface
export interface ApiError extends BaseError {
  status?: number;
  data?: {
    message?: string;
    [key: string]: unknown;
  };
}

// Parse error function to convert unknown errors to typed errors
export function parseError(error: unknown): BaseError {
  // If it's already a BaseError, return it
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return error as BaseError;
  }
  
  // If it's a string, create a BaseError
  if (typeof error === 'string') {
    return { message: error };
  }
  
  // If it has a message property that's a string
  if (
    typeof error === 'object' && 
    error !== null && 
    'message' in error && 
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return { message: (error as { message: string }).message };
  }
  
  // Default fallback
  return { message: 'An unknown error occurred' };
}

// Function to check if an error is a Firebase error
export function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

// Function to check if an error is an API error
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error
  );
}
