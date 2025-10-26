import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const GET: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const { searchParams } = new URL(ctx.url)

    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/'

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        console.log("Error: ", error)
        if (error) {
            const url = new URL('/auth/login', ctx.url)
            url.searchParams.set('e', encodeURIComponent(error.message))
            return Response.redirect(url, 303)
        }
    }

    // Redirect to the home page or wherever you want after successful login
    return Response.redirect(new URL(next, ctx.url), 303)
}