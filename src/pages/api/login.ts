import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const POST: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const form = await ctx.request.formData()
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
        const url = new URL('/auth/login', ctx.url)
        url.searchParams.set('e', encodeURIComponent(error.message))
        return Response.redirect(url, 303)
    }

    // If email not verified, still logged in but you can prompt them elsewhere.
    return Response.redirect(new URL('/rate', ctx.url), 303)
}
