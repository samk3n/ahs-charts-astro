import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const POST: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const body = await ctx.request.json().catch(() => null)

    if (!body || !Array.isArray(body.items)) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
    }

    // items: [{ season_id:number, rating:number }, ...]
    const items = body.items.map((it: any) => ({
        season_id: Number(it?.season_id),
        rating: Number(it?.rating),
    }))

    if (items.some((it: any) => Number.isNaN(it.season_id) || Number.isNaN(it.rating))) {
        return new Response(JSON.stringify({ error: 'Invalid items' }), { status: 400 })
    }

    const { error } = await supabase.rpc('upsert_ratings_bulk', {
        p_items: items, // supabase-js will send JSON; our RPC accepts jsonb
    })

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
