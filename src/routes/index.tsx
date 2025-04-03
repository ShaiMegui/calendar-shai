import { createBrowserRouter, Navigate } from 'react-router-dom';
import BaseLayout from '@/layouts/BaseLayout';
import AppLayout from '@/layouts/AppLayout';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import EventTypes from '@/pages/app/EventTypes';
import EditEventPage from '@/pages/app/event-types/EditEventPage';
import PreviewEventPage from '@/pages/app/event-types/PreviewEventPage';
import Meetings from '@/pages/app/Meetings';
import Integrations from '@/pages/app/Integrations';
import Availability from '@/pages/app/Availability';
import UserEventsPage from '@/pages/external/UserEventsPage';
import UserSingleEventPage from '@/pages/external/UserSingleEventPage';
import ConfirmMeetingPage from '@/pages/external/ConfirmMeetingPage';
import { AUTH_ROUTES, PROTECTED_ROUTES } from './common/routePaths';
import ProtectedRoute from './ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

export const router = createBrowserRouter([
  // Public routes (no authentication required)
  {
    path: '/',
    element: <BaseLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to={AUTH_ROUTES.SIGN_IN} replace />,
      },
      {
        path: AUTH_ROUTES.SIGN_IN,
        element: <SignIn />,
      },
      {
        path: AUTH_ROUTES.SIGN_UP,
        element: <SignUp />,
      },
      // Ajout des routes externes directement ici
      {
        path: ':username',
        element: <UserEventsPage />,
      },
      {
        path: ':username/:slug',
        element: <UserSingleEventPage />,
      },
      {
        path: 'confirm',
        element: <ConfirmMeetingPage />,
      },
    ],
  },
  // Protected routes (authentication required)
  {
    path: '/app',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to={PROTECTED_ROUTES.EVENT_TYPES} replace />,
      },
      {
        path: 'event-types',
        element: <EventTypes />,
      },
      {
        path: 'event-types/:id/edit',
        element: <EditEventPage />,
      },
      {
        path: 'event-types/:id/preview',
        element: <PreviewEventPage />,
      },
      {
        path: 'meetings',
        element: <Meetings />,
      },
      {
        path: 'integrations',
        element: <Integrations />,
      },
      {
        path: 'availability',
        element: <Availability />,
      },
    ],
  },
]);