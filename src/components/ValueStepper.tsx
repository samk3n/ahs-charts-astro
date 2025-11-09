// ValueStepper.tsx

type Props = {
    value: number
    onChange: (newValue: number) => void
    min: number
    max: number
    disabled: boolean
    'aria-label': string
}

// A simple utility to keep the value within the min/max bounds.
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function ValueStepper({ value, onChange, min, max, disabled, 'aria-label': ariaLabel }: Props) {

    function handleAdjust(amount: number) {
        if (disabled) return
        const newValue = clamp(value + amount, min, max)
        onChange(newValue)
    }

    const buttonClasses = "flex h-8 w-10 items-center justify-center rounded-md border border-border bg-accent/70 font-mono text-sm text-white hover:bg-accent/40 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition"

    return (
        <div className="flex items-center justify-start gap-2" aria-label={ariaLabel}>
            {/* Decrease Buttons */}
            <button onClick={() => handleAdjust(-10)} disabled={disabled || value <= min} className={buttonClasses}>-10</button>
            <button onClick={() => handleAdjust(-1)} disabled={disabled || value <= min} className={buttonClasses}>-1</button>

            {/* Value Display */}
            <div className="w-12 text-center font-mono text-xl font-semibold text-text">
                {value}
            </div>

            {/* Increase Buttons */}
            <button onClick={() => handleAdjust(1)} disabled={disabled || value >= max} className={buttonClasses}>+1</button>
            <button onClick={() => handleAdjust(10)} disabled={disabled || value >= max} className={buttonClasses}>+10</button>
        </div>
    )
}