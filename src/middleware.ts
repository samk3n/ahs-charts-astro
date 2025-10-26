import type { MiddlewareHandler } from 'astro'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PREFIXES = ['/rate', '/profile'] // require auth
const USERNAME_GATE_ALLOW = [
    '/profile/choose-username',
    '/auth',         // login/signup/verify
    '/api',          // API routes
    '/favicon', '/assets', '/public', '/_image',
    '/sitemap', '/robots'
]

export const onRequest: MiddlewareHandler = async (ctx, next) => {
    const supabase = createServerClient(
        import.meta.env.PUBLIC_SUPABASE_URL!,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (key) => ctx.cookies.get(key)?.value,
                set: (key, value, options) => ctx.cookies.set(key, value, options),
                remove: (key, options) => ctx.cookies.delete(key, options),
            },
        }
    )

    const url = new URL(ctx.request.url)
    const path = url.pathname

    const { data: { user } } = await supabase.auth.getUser()

    // 1) Protect certain routes: require auth
    if (PROTECTED_PREFIXES.some(p => path === p || path.startsWith(p + '/'))) {
        if (!user) return ctx.redirect('/auth/login')
    }

    // 2) Username gate for any logged-in user without a username
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()

        const allow = USERNAME_GATE_ALLOW.some(p => path === p || path.startsWith(p + '/'))
        const isChoosing = path.startsWith('/profile/choose-username')

        if (!profile?.username && !allow && !isChoosing) {
            return ctx.redirect('/profile/choose-username')
        }
    }

    return next()
}
