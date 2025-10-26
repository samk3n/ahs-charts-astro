import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { APIContext, AstroGlobal } from 'astro'

export function supabaseFromAstro(Astro: AstroGlobal) {
  const { cookies } = Astro

  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookies.delete(name, options)
        },
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: false
      },
    }
  )
}

// For API routes (no AstroGlobal)
export function supabaseFromAPI({ cookies }: APIContext) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => cookies.get(key)?.value,
        set: (key, value, options) => cookies.set(key, value, options),
        remove: (key, options) => cookies.delete(key, options),
      },
      auth: {
        persistSession: true,
        detectSessionInUrl: false
      },
    }
  )
}