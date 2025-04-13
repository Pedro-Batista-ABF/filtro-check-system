
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ApiProvider as ApiProviderOriginal } from './contexts/ApiContext'
import { ApiProvider } from './contexts/ApiContextExtended'

createRoot(document.getElementById("root")!).render(
  <ApiProviderOriginal>
    <ApiProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApiProvider>
  </ApiProviderOriginal>
);
