import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App'

// One-time localStorage migration / cleanup
try {
  const STORAGE_VERSION = "2";
  if (localStorage.getItem("icmu_storage_version") !== STORAGE_VERSION) {
    localStorage.removeItem("icmu_pwa_dismissed");
    localStorage.removeItem("icmu_feedback_widget_enabled");
    localStorage.removeItem("icmu_admin_sidebar_collapsed");
    localStorage.setItem("icmu_storage_version", STORAGE_VERSION);
    console.log("Storage migration applied.");
  }
} catch (e) {
  console.error("Storage migration failed", e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
