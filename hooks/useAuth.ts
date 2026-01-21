import React, { useState, createContext, useContext, ReactNode } from 'react';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Khởi tạo với một user giả lập để có thể sử dụng ngay mà không cần backend
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);
    // Giả lập quá trình đăng nhập
    setTimeout(() => {
      setUser({
        uid: 'local-user-id',
        email: 'teacher@edu.vn',
        displayName: 'Giáo Viên Trải Nghiệm',
        photoURL: 'https://ui-avatars.com/api/?name=Giao+Vien&background=random',
        isActive: true, // Tự động kích hoạt
        isAdmin: true,  // Cấp quyền Admin để test AdminPanel
      });
      setLoading(false);
    }, 500);
  };

  const signOut = async () => {
    setUser(null);
  };

  return React.createElement(AuthContext.Provider, { value: { user, loading, signInWithGoogle, signOut } }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};