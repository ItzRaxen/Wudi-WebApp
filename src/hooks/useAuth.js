import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, initialized, setAuth, setUser, setInitialized, clearAuth } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (!mounted) return;
        setUser(currentUser);
      })
      .catch(() => {
        if (!mounted) return;
        setInitialized(true);
      });
    return () => {
      mounted = false;
    };
  }, [setInitialized, setUser]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data);
      toast.success('Logged in');
    },
    onError: (error) => toast.error(error.message || 'Login failed'),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => toast.success('Registration submitted. Please verify your email.'),
    onError: (error) => toast.error(error.message || 'Registration failed'),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: (data) => {
      setAuth(data);
      toast.success('Email verified successfully. Welcome!');
    },
    onError: (error) => toast.error(error.message || 'Verification failed'),
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out');
    },
  });

  const loginWithGoogleMutation = useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: (data) => {
      setAuth(data);
      toast.success('Logged in with Google');
    },
    onError: (error) => toast.error(error.message || 'Google Login failed'),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: authService.uploadAvatar,
    onSuccess: (newAvatarUrl) => {
      if (newAvatarUrl) {
        setUser({ ...user, avatarUrl: newAvatarUrl });
      } else {
        // Refresh user data from server
        authService.getCurrentUser({ forceRefresh: true }).then((u) => { if (u) setUser(u); });
      }
      toast.success('Profile photo updated!');
    },
    onError: (error) => toast.error(error.message || 'Failed to update photo'),
  });

  return {
    user,
    initialized,
    isAuthenticated: Boolean(user),
    login: loginMutation.mutateAsync,
    loginWithGoogle: loginWithGoogleMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending || loginWithGoogleMutation.isPending,
    isRegistering: registerMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
  };
}
