import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const GET: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)

    // Optional: identify current user to exclude them from the check
    const { data: { user } } = await supabase.auth.getUser()

    const url = new URL(ctx.request.url)
    const username = (url.searchParams.get('username') || '').trim()

    // Basic format validation first
    if (!/^[A-Za-z0-9_]{5,}$/.test(username)) {
        return new Response(JSON.stringify({ ok: true, available: false, reason: 'invalid' }), { status: 200 })
    }

    const query = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('username', username)

    if (user) query.neq('id', user.id)

    const { count, error } = await query
    if (error) {
        return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 400 })
    }

    const available = (count ?? 0) === 0
    return new Response(JSON.stringify({ ok: true, available }), { status: 200 })
}
