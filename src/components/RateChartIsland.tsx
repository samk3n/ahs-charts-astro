import { useMemo, useState } from 'react'
import SVGBarChart from './SVGBarChart';
import ValueStepper from './ValueStepper';

type Season = { id: number; title: string }
type Props = {
    seasons: Season[]
    initialRatings: Record<number, number> // season_id -> rating
    emailVerified: boolean
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerpRGB = (A: number[], B: number[], t: number) => [
    Math.round(lerp(A[0], B[0], t)),
    Math.round(lerp(A[1], B[1], t)),
    Math.round(lerp(A[2], B[2], t)),
]
const toCss = (rgb: number[], a = 0.9) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
const RED = [229, 57, 53], YEL = [253, 216, 53], GRN = [67, 160, 71]
const colorFor = (s: number) => {
    const v = clamp(s ?? 0, 0, 100)
    return v <= 50 ? toCss(lerpRGB(RED, YEL, v / 50)) : toCss(lerpRGB(YEL, GRN, (v - 50) / 50))
}

export default function RateChartIsland({ seasons, initialRatings, emailVerified }: Props) {
    // Working copy
    const [ratings, setRatings] = useState<Record<number, number>>(() => {
        const base: Record<number, number> = {}
        seasons.forEach(s => { base[s.id] = initialRatings[s.id] ?? 50 })
        return base
    })
    // Last saved copy (for dirty check)
    const [saved, setSaved] = useState<Record<number, number>>(() => {
        const base: Record<number, number> = {}
        seasons.forEach(s => { base[s.id] = initialRatings[s.id] ?? 50 })
        return base
    })
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<string | null>(null)

    const isDirty = useMemo(() => {
        return seasons.some(s => (ratings[s.id] ?? 0) !== (saved[s.id] ?? 0))
    }, [seasons, ratings, saved])

    const labels = useMemo(() => seasons.map(s => s.title), [seasons])
    const values = useMemo(() => seasons.map(s => ratings[s.id] ?? 0), [seasons, ratings])

    function onChange(season_id: number, value: number) {
        setMsg(null)
        setRatings(prev => ({ ...prev, [season_id]: value }))
    }

    async function onValidate() {
        if (!emailVerified || !isDirty || saving) return
        setSaving(true)
        setMsg(null)
        try {
            const items = seasons.map(s => ({ season_id: s.id, rating: ratings[s.id] ?? 0 }))
            const res = await fetch('/api/ratings-bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json?.error || 'Save failed')

            // mark as saved
            setSaved(ratings)
            setMsg('Saved!')
        } catch (e: any) {
            setMsg(e?.message || 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    // SVG layout (labels vertical ≤500px, −20° otherwise)
    const W = 760
    const H = 260
    const labelAngle = typeof window !== 'undefined' && window.innerWidth <= 500 ? -90 : -20
    const bottomMargin = labelAngle === -90 ? 120 : 60
    const margin = { top: 20, right: 12, bottom: bottomMargin, left: 46 }
    const innerW = W - margin.left - margin.right
    const innerH = H - margin.top - margin.bottom
    const n = labels.length
    const band = n ? innerW / n : 0
    const barW = Math.max(2, band * 0.7)
    const x = (i: number) => margin.left + i * band + (band - barW) / 2
    const y = (v: number) => margin.top + innerH - (clamp(v, 0, 100) / 100) * innerH
    const barH = (v: number) => (clamp(v, 0, 100) / 100) * innerH
    const ticks = Array.from({ length: 11 }, (_, i) => i * 10)

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            {/* Controls */}
            <section className="rounded-xl border border-border bg-panel p-3 flex flex-col items-center">
                <h2 className="mb-3 text-sm font-semibold text-muted tracking-wide">Rate each season (0–100)</h2>

                {!emailVerified && (
                    <div className="mb-3 rounded-lg border border-border bg-bg/50 p-3 text-sm text-muted">
                        Verify your email to save ratings.
                    </div>
                )}

                <div className="space-y-3 flex flex-col gap-3">
                    {seasons.map((s, idx) => (
                        <div key={s.id} className="grid grid-cols-[1fr,3rem] items-center gap-3">
                            <div>
                                <div className="mb-1 text-[0.95rem]">{idx + 1}. {s.title}</div>
                                {/* <input
                                    type="range" min={0} max={100}
                                    value={ratings[s.id] ?? 0}
                                    aria-label={`${s.title} rating`}
                                    disabled={!emailVerified}
                                    onChange={(e) => onChange(s.id, Number((e.target as HTMLInputElement).value))}
                                    className="w-full accent-accent"
                                /> */}
                                <ValueStepper
                                    min={0}
                                    max={100}
                                    value={ratings[s.id] ?? 0}
                                    aria-label={`${s.title} rating`}
                                    disabled={!emailVerified}
                                    onChange={(newValue) => onChange(s.id, newValue)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span className="h-2 w-4 rounded bg-[rgb(229,57,53)]"></span> 0
                        <span className="h-2 w-4 rounded bg-[rgb(253,216,53)]"></span> 50
                        <span className="h-2 w-4 rounded bg-[rgb(67,160,71)]"></span> 100
                    </div>
                </div>

                <div className="flex flex-col items-center mt-5">
                    <button
                        onClick={onValidate}
                        disabled={!emailVerified || !isDirty || saving}
                        className="rounded-lg border border-border bg-panel px-3 py-2 font-medium hover:bg-panel/80 disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? 'Saving…' : 'Validate & Save'}
                    </button>

                    {msg && <div className={`mt-2 text-sm ${msg === 'Saved!' ? 'text-green-500' : 'text-red-500'}`}>{msg}</div>}

                    {isDirty && emailVerified && !saving && (
                        <div className="mt-2 text-sm text-muted">You have unsaved changes.</div>
                    )}
                </div>

            </section>

            {/* Chart */}
            <section className="rounded-xl border border-border bg-panel p-3 h-fit">
                <h2 className="text-sm font-semibold text-muted tracking-wide">Your ratings</h2>

                <div className="relative">
                    <SVGBarChart labels={labels} values={values} />
                </div>
            </section>
        </div>
    )
}
