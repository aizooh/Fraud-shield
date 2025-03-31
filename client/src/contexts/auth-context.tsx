import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { apiRequest } from '@/lib/queryClient';
import { setUser } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: number;
  username: string;
};

type AuthResponse = {
  user: User;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await apiRequest<AuthResponse>({
          url: '/api/user',
          method: 'GET',
        });
        
        setUserState(response.user);
        dispatch(setUser({ username: response.user.username }));
      } catch (error) {
        // User is not logged in
        setUserState(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest<AuthResponse>({
        url: '/api/login',
        method: 'POST',
        data: { username, password },
      });

      setUserState(response.user);
      dispatch(setUser({ username: response.user.username }));
      toast({
        title: 'Success',
        description: 'You are now logged in',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      await apiRequest<AuthResponse>({
        url: '/api/register',
        method: 'POST',
        data: { username, password },
      });

      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      
      // Automatically log in after registration
      await login(username, password);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest<void>({
        url: '/api/logout',
        method: 'POST',
      });
      
      setUserState(null);
      dispatch(setUser(null));
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}