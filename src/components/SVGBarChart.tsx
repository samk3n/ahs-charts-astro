type Props = {
    labels: string[];
    values: number[];
    height?: number; // px
};

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRGB = (A: number[], B: number[], t: number) => [
    Math.round(lerp(A[0], B[0], t)),
    Math.round(lerp(A[1], B[1], t)),
    Math.round(lerp(A[2], B[2], t)),
];
const toCss = (rgb: number[], a = 0.9) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
const RED = [229, 15, 15], YEL = [253, 216, 53], GRN = [67, 160, 71];
const colorFor = (s: number) => {
    const v = clamp(s ?? 0, 0, 100);
    return v <= 50 ? toCss(lerpRGB(RED, YEL, v / 50)) : toCss(lerpRGB(YEL, GRN, (v - 50) / 50));
};

export default function SVGBarChart({ labels, values, height }: Props) {
    const W = 760;              // viewBox width; responsive via CSS
    const H = height ? height : W *9/16;
    const labelAngle = W > 500 ? -60 : -90; // SSR-friendly (same as before)
    const bottomMargin = labelAngle === -90 ? 140 : 120;

    const margin = { top: 20, right: 12, bottom: bottomMargin, left: 46 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const n = labels.length;
    const band = n ? innerW / n : 0;
    const barW = Math.max(2, band * 0.7);

    const x = (i: number) => margin.left + i * band + (band - barW) / 2;
    const y = (v: number) => margin.top + innerH - (clamp(v, 0, 100) / 100) * innerH;
    const barH = (v: number) => (clamp(v, 0, 100) / 100) * innerH;

    const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="AHS ratings chart">
            {/* Y grid + tick labels */}
            {ticks.map((t) => {
                const gy = y(t);
                return (
                    <g key={t}>
                        <line x1={margin.left} x2={margin.left + innerW} y1={gy} y2={gy} className="stroke-white/10" />
                        <text x={margin.left - 8} y={gy + 4} textAnchor="end" className="fill-text text-lg font-light">{t}</text>
                    </g>
                );
            })}

            {/* Bars + values */}
            {values.map((v, i) => (
                <g key={i}>
                    <rect
                        x={x(i)} y={y(v)} width={barW} height={barH(v)} rx={3} ry={3}
                        fill={colorFor(v)} className="stroke-white/20"
                    />
                    <text x={x(i) + barW / 2} y={y(v) - 6} textAnchor="middle" className="fill-text text-lg font-semibold">
                        {Math.round(v ?? 0)}
                    </text>
                </g>
            ))}

            {/* X labels */}
            {labels.map((name, i) => {
                const tx = margin.left + i * band + band / 2;
                const ty = margin.top + innerH + 18;
                return (
                    <text
                        key={i}
                        transform={`translate(${tx},${ty}) rotate(${labelAngle})`}
                        textAnchor={labelAngle < 0 ? 'end' : 'start'}
                        dominantBaseline="middle"
                        className="fill-muted"
                    >
                        {name}
                    </text>
                );
            })}

            {/* Y axis + title */}
            <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + innerH} className="stroke-white/20" />
            <text
                transform={`rotate(-90 ${margin.left - 32} ${margin.top + innerH / 2})`}
                textAnchor="middle" className="fill-muted text-[12px]"
            >
                Rating
            </text>
        </svg>
    );
}
