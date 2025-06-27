import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import { RTLProvider } from './components/RTLProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RTLProvider>
      <App />
    </RTLProvider>
  </StrictMode>
);