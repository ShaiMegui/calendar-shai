export const AUTH_ROUTES = {
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
} as const;

export const PROTECTED_ROUTES = {
  EVENT_TYPES: '/app/event-types',
  EVENT_TYPE_EDIT: (id: string) => `/app/event-types/${id}/edit`,
  EVENT_TYPE_PREVIEW: (id: string) => `/app/event-types/${id}/preview`,
  MEETINGS: '/app/meetings',
  INTEGRATIONS: '/app/integrations',
  AVAILBILITIY: '/app/availability',
} as const;