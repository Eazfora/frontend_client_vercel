/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'; // 1. Tambahkan useEffect
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>; 
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean; // 2. Pastikan ini ada
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true); // 3. Set loading awal TRUE
  const [user, setUser] = useState<User | null>(null);

  // 4. Gunakan useEffect untuk inisialisasi sesi
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (token && savedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data', error);
      }
    }
    setLoading(false); // 5. Setelah cek selesai, set loading jadi FALSE
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('http://localhost:3000/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await axios.post('http://localhost:3000/auth/register', { email, password, name });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  // 6. Masukkan loading ke dalam value provider
  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};