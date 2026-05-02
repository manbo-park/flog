interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="flex items-center justify-between w-full gap-4 text-left focus:outline-none"
        >
            <div className="flex flex-col gap-0.5">
                <span className="font-mono text-sm text-film-text">{label}</span>
                {description && (
                    <span className="font-mono text-xs text-film-muted">{description}</span>
                )}
            </div>
            <div className="relative shrink-0 w-11 h-6 rounded-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 accent-gradient-bg" />
                <div
                    className={[
                        'absolute inset-0 bg-film-border transition-opacity duration-200',
                        checked ? 'opacity-0' : 'opacity-100',
                    ].join(' ')}
                />
                <span
                    className={[
                        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-film-text transition-transform duration-200 z-10',
                        checked ? 'translate-x-5' : 'translate-x-0',
                    ].join(' ')}
                />
            </div>
        </button>
    );
}
