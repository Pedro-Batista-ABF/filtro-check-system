
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (userData: { username: string; password: string; fullName: string; email: string; }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const USERS_STORAGE_KEY = 'filter-system-users';
const CURRENT_USER_KEY = 'filter-system-current-user';

// Default admin user
const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  fullName: 'Administrador',
  email: 'admin@example.com',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Initialize the users database if it doesn't exist
    const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!existingUsers) {
      const initialUsers = [
        {
          ...DEFAULT_ADMIN,
          password: 'admin123', // In a real app, this would be hashed
        },
      ];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    }
    
    // Check if there's a saved login session
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user data');
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      if (!usersJson) return false;
      
      const users = JSON.parse(usersJson);
      const foundUser = users.find((u: any) => 
        u.username === username && u.password === password
      );
      
      if (foundUser) {
        // Don't include password in the user state
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    toast.success('Logout realizado com sucesso');
  };

  const registerUser = async (userData: { username: string; password: string; fullName: string; email: string; }): Promise<boolean> => {
    // Only authenticated users can register new users
    if (!user) {
      toast.error('Você precisa estar logado para cadastrar novos usuários');
      return false;
    }
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      if (!usersJson) return false;
      
      const users = JSON.parse(usersJson);
      
      // Check if username already exists
      if (users.some((u: any) => u.username === userData.username)) {
        toast.error('Nome de usuário já existe');
        return false;
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        username: userData.username,
        password: userData.password, // In a real app, this would be hashed
        fullName: userData.fullName,
        email: userData.email,
      };
      
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };
  
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    registerUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
