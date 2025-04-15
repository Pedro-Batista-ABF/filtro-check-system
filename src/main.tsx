
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ApiProvider } from './contexts/ApiContext'
import { ApiContextExtendedProvider } from './contexts/ApiContextExtended'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ApiProvider>
        <ApiContextExtendedProvider>
          <App />
        </ApiContextExtendedProvider>
      </ApiProvider>
    </AuthProvider>
  </BrowserRouter>
);
