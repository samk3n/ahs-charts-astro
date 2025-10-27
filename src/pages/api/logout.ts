import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const POST: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    await supabase.auth.signOut()
    // return Response.redirect(new URL('/', ctx.url), 303)
    const to = new URL("/", ctx.url);
    return new Response(null, {
        status: 303,
        headers: new Headers({ Location: to.toString() }),
    });
}
