import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const GET: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const origin = new URL(ctx.url).origin

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/api/auth/callback`,
        },
    })
    
    if (error || !data?.url) {
        const url = new URL('/auth/login', ctx.url)
        url.searchParams.set('e', encodeURIComponent(error?.message || 'OAuth failed'))
        return Response.redirect(url, 303)
    }
    return Response.redirect(data.url, 303)
}
