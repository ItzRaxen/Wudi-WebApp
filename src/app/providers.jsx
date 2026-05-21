import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useMemo } from 'react';
import { useUiStore } from '../store/uiStore.js';

export function AppProviders({ children }) {
  const darkMode = useUiStore((state) => state.darkMode);
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes cache
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
    [],
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
    </QueryClientProvider>
  );
}
