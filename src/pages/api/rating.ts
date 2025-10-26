import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '../../lib/supabaseServer'

export const POST: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const { season_id, rating } = await ctx.request.json()

    if (typeof season_id !== 'number' || typeof rating !== 'number') {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
    }

    // Use the secure RPC (Step 4B) to avoid passing user_id from client
    const { error } = await supabase.rpc('upsert_rating', {
        p_season_id: season_id,
        p_rating: rating,
    })

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
    return new Response(JSON.stringify({ ok: true }))
}
