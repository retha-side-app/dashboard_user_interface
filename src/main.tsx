import { lazy, Suspense, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Lazy load the App component
const App = lazy(() => import('./App'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </StrictMode>
);