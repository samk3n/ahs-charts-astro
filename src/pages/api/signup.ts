import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const POST: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const form = await ctx.request.formData()
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
        const url = new URL('/auth/signup', ctx.url)
        url.searchParams.set('e', encodeURIComponent(error.message))
        return Response.redirect(url, 303)
    }

    // Ask user to verify email; they’ll be able to rate after verification.
    const url = new URL('/auth/verify', ctx.url)
    url.searchParams.set('email', email)
    return Response.redirect(url, 303)
}
