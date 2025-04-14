import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ApiProvider } from "./contexts/ApiContextExtended";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Peritagem from "./pages/Peritagem";
import Execucao from "./pages/Execucao";
import Checagem from "./pages/Checagem";
import Concluidos from "./pages/Concluidos";
import Sucateamento from "./pages/Sucateamento";
import PeritagemForm from "./pages/PeritagemForm";
import ExecucaoDetails from "./pages/ExecucaoDetails";
import ChecagemForm from "./pages/ChecagemForm";
import ScrapValidationForm from "./pages/ScrapValidationForm";
import ReportView from "./pages/ReportView";
import { useAuth } from "./contexts/AuthContext";
import PageLayout from "./components/layout/PageLayout";
import SectorManagement from '@/pages/SectorManagement';

function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <Router>
          <AppContent />
        </Router>
      </ApiProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoggedIn } = useAuth();

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    return isLoggedIn ? (
      <PageLayout>{children}</PageLayout>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  return (
    
      
        
          
            
              
                
                  
                    
                      
                        
                          
                            
                              
                                
                                  
                                    
                                      
                                        
                                          
                                            
                                              
                                                
                                                  
                                                    
                                                      
                                                        
                                                          
                                                            
                                                              
                                                                
                                                                  
                                                                    
                                                                      
                                                                        
                                                                          
                                                                            
                                                                              
                                                                                
                                                                                  
                                                                                    
                                                                                      
                                                                                        
                                                                                          
                                                                                            
                                                                                              
                                                                                                
                                                                                                  
                                                                                                    
                                                                                                      
                                                                                                        
                                                                                                          
                                                                                                            
                                                                                                              
                                                                                                                
                                                                                                                  
                                                                                                                    
                                                                                                                      
                                                                                                                        
                                                                                                                          
                                                                                                                            
                                                                                                                              
                                                                                                                                
                                                                                                                                  
                                                                                                                                    
                                                                                                                                      
                                                                                                                                        
                                                                                                                                          
                                                                                                                                            
                                                                                                                                              
                                                                                                                                                
                                                                                                                                                  
                                                                                                                                                    
                                                                                                                                                      
                                                                                                                                                        
                                                                                                                                                          
                                                                                                                                                            
                                                                                                                                                              
                                                                                                                                                                
                                                                                                                                                                  
                                                                                                                                                                    
                                                                                                                                                                      
                                                                                                                                                                        
                                                                                                                                                                          
                                                                                                                                                                            
                                                                                                                                                                              
                                                                                                                                                                                
                                                                                                                                                                                  
                                                                                                                                                                                    
                                                                                                                                                                                      
                                                                                                                                                                                        
                                                                                                                                                                                          
                                                                                                                                                                                            
                                                                                                                                                                                              
                                                                                                                                                                                                
                                                                                                                                                                                                  
                                                                                                                                                                                                    
                                                                                                                                                                                                      
                                                                                                                                                                                                        
                                                                                                                                                                                                          
                                                                                                                                                                                                            
                                                                                                                                                                                                              
                                                                                                                                                                                                                
                                                                                                                                                                                                                  
                                                                                                                                                                                                                    
                                                                                                                                                                                                                      
                                                                                                                                                                                                                        
                                                                                                                                                                                          
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/peritagem"
            element={
              <PrivateRoute>
                <Peritagem />
              </PrivateRoute>
            }
          />
          <Route
            path="/execucao"
            element={
              <PrivateRoute>
                <Execucao />
              </PrivateRoute>
            }
          />
          <Route
            path="/checagem"
            element={
              <PrivateRoute>
                <Checagem />
              </PrivateRoute>
            }
          />
          <Route
            path="/concluidos"
            element={
              <PrivateRoute>
                <Concluidos />
              </PrivateRoute>
            }
          />
          <Route
            path="/sucateamento"
            element={
              <PrivateRoute>
                <Sucateamento />
              </PrivateRoute>
            }
          />
          <Route
            path="/peritagem/novo"
            element={
              <PrivateRoute>
                <PeritagemForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/peritagem/:id"
            element={
              <PrivateRoute>
                <PeritagemForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/execucao/:id"
            element={
              <PrivateRoute>
                <ExecucaoDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/checagem/:id"
            element={
              <PrivateRoute>
                <ChecagemForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/sucateamento/:id"
            element={
              <PrivateRoute>
                <ScrapValidationForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/relatorio/:id"
            element={
              <PrivateRoute>
                <ReportView />
              </PrivateRoute>
            }
          />
          {/* Add the new SectorManagement route */}
          <Route path="/setores" element={<PrivateRoute><SectorManagement /></PrivateRoute>} />
        </Routes>
      
    
  );
}

export default App;
