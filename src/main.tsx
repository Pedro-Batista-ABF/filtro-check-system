
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ApiProvider } from './contexts/ApiContext'

createRoot(document.getElementById("root")!).render(
  <ApiProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApiProvider>
);
