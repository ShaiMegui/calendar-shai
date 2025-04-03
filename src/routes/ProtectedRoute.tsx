import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store/store';
import { AUTH_ROUTES } from './common/routePaths';
import { Loader } from '@/components/loader';

interface ProtectedRouteProps {
  children: ReactNode;
}

const EXTERNAL_ROUTES = [
  '/confirm', 
  '/:username', 
  '/:username/:slug'
];

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken } = useStore();
  const [isChecking, setIsChecking] = useState(true);

  // Vérifie si la route actuelle est une route externe
  const isExternalRoute = EXTERNAL_ROUTES.some(route => 
    new RegExp(`^${route.replace(/:[^/]+/g, '[^/]+')}$`).test(location.pathname)
  );

  useEffect(() => {
    const checkAuth = () => {
      // Ignorer la vérification pour les routes externes
      if (isExternalRoute) {
        setIsChecking(false);
        return;
      }

      if (!user || !accessToken) {
        // Store the current location to redirect back after login
        const currentPath = location.pathname + location.search;
        navigate(AUTH_ROUTES.SIGN_IN, { 
          replace: true,
          state: { from: currentPath }
        });
      }
      setIsChecking(false);
    };

    // Add a small delay to ensure store is hydrated
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [user, accessToken, navigate, location, isExternalRoute]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" color="black" className="text-primary opacity-70" />
      </div>
    );
  }

  // Pour les routes externes, toujours autoriser l'accès
  if (isExternalRoute) {
    return <>{children}</>;
  }

  // Pour les routes protégées, vérifier l'authentification
  if (!user || !accessToken) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;