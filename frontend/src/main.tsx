import { StrictMode, type ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from '@/apperror/GlobalErrorHandler.tsx';
// import "react-phone-number-input/style.css";

const errorHandler = (error: unknown, info: ErrorInfo) => {
  console.error('Error caught by ErrorBoundary:', error);

  if (error instanceof Error) {
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }

  console.error('Component Stack:', info.componentStack);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorPage} // Use the ErrorPage as the fallback UI
    onError={errorHandler}
    onReset={() => (location.href = '/')}
    >
    <App />
    </ErrorBoundary>
  </StrictMode>,
)
