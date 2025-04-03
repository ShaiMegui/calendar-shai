import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import QueryProvider from './providers/QueryProvider';
import { useStore } from './store/store';
import { supabase } from './lib/supabase';
import { Toaster } from 'sonner';
import { Loader } from '@/components/loader';

function App() {
  const { setUser, setAccessToken, setExpiresAt, clearUser, clearAccessToken, clearExpiresAt } = useStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name,
          username: session.user.user_metadata.username,
        });
        setAccessToken(session.access_token);
        setExpiresAt(session.expires_at! * 1000);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name,
          username: session.user.user_metadata.username,
        });
        setAccessToken(session.access_token);
        setExpiresAt(session.expires_at! * 1000);
      } else if (event === 'SIGNED_OUT') {
        clearUser();
        clearAccessToken();
        clearExpiresAt();
        // Ne pas rediriger automatiquement
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setAccessToken, setExpiresAt, clearUser, clearAccessToken, clearExpiresAt]);

  return (
    <QueryProvider>
      <RouterProvider 
        router={router} 
        fallbackElement={
          <div className="flex items-center justify-center min-h-screen">
            <Loader size="lg" color="black" className="text-primary opacity-70" />
          </div>
        }
      />
      <Toaster position="top-right" />
    </QueryProvider>
  );
}

export default App;