
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ApiProvider as ApiProviderOriginal } from './contexts/ApiContext'
import { ApiProvider } from './contexts/ApiContextExtended'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ApiProviderOriginal>
      <ApiProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApiProvider>
    </ApiProviderOriginal>
  </AuthProvider>
);
