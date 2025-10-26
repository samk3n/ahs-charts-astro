import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const POST: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })

    const body = await ctx.request.json().catch(() => null)
    const username = body?.username?.trim()

    if (!username || !/^[A-Za-z0-9_]{5,}$/.test(username)) {
        return new Response(JSON.stringify({ error: 'Invalid username format' }), { status: 400 })
    }

    // Check if username already exists
    const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('username', username)
        .neq('id', user.id)

    if (count && count > 0) {
        return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 409 })
    }

    // Update user's username
    const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id)

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
