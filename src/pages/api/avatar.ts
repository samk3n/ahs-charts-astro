import type { APIRoute } from 'astro'
import { supabaseFromAPI } from '@/lib/supabaseServer'

export const POST: APIRoute = async (ctx) => {
    const supabase = supabaseFromAPI(ctx)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const form = await ctx.request.formData()
    const file = form.get('file') as File | null
    if (!file) return new Response(JSON.stringify({ error: 'No file' }), { status: 400 })

    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `${user.id}/avatar.${ext}`

    // Upload (overwrite allowed)
    const arrayBuffer = await file.arrayBuffer()
    const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, arrayBuffer, {
            contentType: file.type || 'image/png',
            upsert: true,
        })
    if (upErr) return new Response(JSON.stringify({ error: upErr.message }), { status: 400 })

    // Public URL (stable base, no query)
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = pub?.publicUrl
    if (!publicUrl) return new Response(JSON.stringify({ error: 'Failed to get URL' }), { status: 500 })

    // Read current version, bump it, and store both url + version
    const { data: prof } = await supabase
        .from('profiles')
        .select('avatar_version')
        .eq('id', user.id)
        .single()

    const nextVersion = (prof?.avatar_version ?? 0) + 1

    const { error: updErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, avatar_version: nextVersion })
        .eq('id', user.id)

    if (updErr) return new Response(JSON.stringify({ error: updErr.message }), { status: 400 })

    // Return a display URL that busts caches
    const displayUrl = `${publicUrl}?v=${nextVersion}`
    return new Response(JSON.stringify({ displayUrl, version: nextVersion }), { status: 200 })
}
