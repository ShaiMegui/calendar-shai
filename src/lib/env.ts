import { z } from "zod";

const envSchema = z.object({
  VITE_APP_ORIGIN: z.string().default(window.location.origin),
  VITE_SUPABASE_URL: z.string(),
  VITE_SUPABASE_ANON_KEY: z.string(),
});

export const ENV = envSchema.parse({
  VITE_APP_ORIGIN: import.meta.env.VITE_APP_ORIGIN,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});