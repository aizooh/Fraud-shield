import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { apiRequest } from '@/lib/queryClient';
import { setUser } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export type User = {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profilePicture?: string;
  authProvider: string;
};

export type UserSettings = {
  id: number;
  userId: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: string;
  dashboardLayout: string;
  language: string;
};

type AuthContextType = {
  user: User | null;
  userSettings: UserSettings | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: UpdateProfileData) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  loginWithGoogle: () => void;
  isAdmin: boolean;
};

type RegisterData = {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

type UpdateProfileData = {
  username?: string;
  password?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const loadUserSettings = async (userId: number) => {
    try {
      const settings = await apiRequest<UserSettings>({
        url: '/api/user/settings',
        method: 'GET',
      });
      setUserSettings(settings);
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const userData = await apiRequest<User>({
          url: '/api/user',
          method: 'GET',
        });
        
        setUserState(userData);
        dispatch(setUser({ username: userData.username }));
        
        // Load user settings
        await loadUserSettings(userData.id);
      } catch (error) {
        // User is not logged in
        setUserState(null);
        setUserSettings(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await apiRequest<User>({
        url: '/api/login',
        method: 'POST',
        data: { username, password },
      });

      setUserState(userData);
      dispatch(setUser({ username: userData.username }));
      
      // Load user settings
      await loadUserSettings(userData.id);
      
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

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const newUser = await apiRequest<User>({
        url: '/api/register',
        method: 'POST',
        data: userData,
      });

      setUserState(newUser);
      dispatch(setUser({ username: newUser.username }));
      
      // Load user settings (should be created automatically on registration)
      await loadUserSettings(newUser.id);
      
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: UpdateProfileData) => {
    try {
      setIsLoading(true);
      const updatedUser = await apiRequest<User>({
        url: '/api/user/profile',
        method: 'PUT',
        data: userData,
      });

      setUserState(updatedUser);
      dispatch(setUser({ username: updatedUser.username }));
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    try {
      setIsLoading(true);
      const updatedSettings = await apiRequest<UserSettings>({
        url: '/api/user/settings',
        method: 'PUT',
        data: settings,
      });

      setUserSettings(updatedSettings);
      
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
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
      setUserSettings(null);
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

  const loginWithGoogle = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/api/auth/google';
  };

  // Compute whether the user is an admin
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userSettings,
        isLoading, 
        login, 
        register, 
        logout, 
        updateProfile, 
        updateSettings,
        loginWithGoogle,
        isAdmin
      }}
    >
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