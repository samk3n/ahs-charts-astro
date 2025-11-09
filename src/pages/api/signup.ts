import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const POST: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const form = await ctx.request.formData()
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')
    const passwordConfirm = String(form.get('password_confirm') || '') // 1. Get the confirmation password

    // 2. Check if passwords match
    if (password !== passwordConfirm) {
        const url = new URL('/auth/signup', ctx.url)
        url.searchParams.set('e', encodeURIComponent('Passwords do not match.'))
        return new Response(null, {
            status: 303,
            headers: new Headers({ Location: url.toString() }),
        });
    }

    const requestUrl = new URL(ctx.url)
    const origin = requestUrl.origin
    const emailRedirectTo = `${origin}/api/auth/callback`

    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo } })
    if (error) {
        const url = new URL('/auth/signup', ctx.url)
        url.searchParams.set('e', encodeURIComponent(error.message))
        return new Response(null, {
            status: 303,
            headers: new Headers({ Location: url.toString() }),
        });
    }

    // Ask user to verify email; they’ll be able to rate after verification.
    const url = new URL('/auth/verify', ctx.url)
    url.searchParams.set('email', email)
    return new Response(null, {
        status: 303,
        headers: new Headers({ Location: url.toString() }),
    });
}