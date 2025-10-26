import { useRef, useState } from 'react'

export default function AvatarUploader({ initialUrl }: { initialUrl?: string | null }) {
    const [url, setUrl] = useState<string | null>(initialUrl ?? null)
    const [busy, setBusy] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)

    async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setError(null)

        // Instant optimistic preview
        const localPreview = URL.createObjectURL(file)
        setUrl(localPreview)

        setBusy(true)
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/avatar', { method: 'POST', body: fd })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.error || 'Upload failed')

            // swap in cache-busted URL from server
            setUrl(json.displayUrl as string)
            if (window.location.pathname.startsWith('/profile')) {
                setTimeout(() => window.location.reload(), 400)
            }

        } catch (err: any) {
            setError(err?.message || 'Upload failed')
        } finally {
            setBusy(false)
            if (fileRef.current) fileRef.current.value = ''
            // release the local blob if we created one
            try { URL.revokeObjectURL(localPreview) } catch { }
        }
    }

    return (
        <div className="flex items-center gap-4">
            {url
                ? <img src={url} alt="" className="size-16 rounded-full object-cover border border-border" />
                : <div className="size-16 rounded-full bg-border" />
            }
            <div className="space-y-2">
                <div className="text-sm text-muted">Upload a profile picture (PNG/JPG).</div>
                <div className="flex items-center gap-2">
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={onPick}
                        className="block text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-panel file:px-3 file:py-1.5 file:text-sm file:text-text hover:file:bg-panel/80"
                    />
                    {busy && <span className="text-sm text-muted">Uploading…</span>}
                </div>
                {error && <div className="text-sm text-red-500">{error}</div>}
            </div>
        </div>
    )
}
