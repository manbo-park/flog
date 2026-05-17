import { useNavigate } from 'react-router-dom';
import { Film, Camera, FileText } from 'lucide-react';
import type { Roll } from '@/types';
import { useMasterDataStore } from '@/store/masterDataStore';

interface RollCardProps {
    roll: Roll;
}

export function RollCard({ roll }: RollCardProps) {
    const navigate = useNavigate();
    const film = useMasterDataStore((s) => s.films.find((f) => f.id === roll.filmId));
    const camera = useMasterDataStore((s) => s.cameras.find((c) => c.id === roll.cameraId));

    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    const startStr = fmt(roll.startedAt);
    const endStr = roll.finishedAt ? fmt(roll.finishedAt) : null;

    const dateStr =
        roll.status === 'active'
            ? `${startStr} ~`
            : endStr && endStr !== startStr
              ? `${startStr} ~ ${endStr}`
              : startStr;

    const progress = roll.frames.length;

    return (
        <button
            onClick={() => navigate(`/rolls/${roll.id}`)}
            className="w-full bg-film-surface border border-film-border rounded-xl p-4 text-left hover:border-film-muted transition-colors active:scale-[0.98]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Date */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-film-muted text-xs font-mono">{dateStr}</span>
                    </div>

                    {/* Film name */}
                    <div className="flex items-center gap-2 text-film-text font-mono font-semibold text-sm mb-1">
                        <Film size={14} className="text-film-accent shrink-0" />
                        <span className="truncate">{film?.name ?? '알 수 없는 필름'}</span>
                    </div>

                    {/* Camera */}
                    <div className="flex items-center gap-2 text-film-muted text-xs font-mono">
                        <Camera size={12} className="shrink-0" />
                        <span className="truncate">{camera?.name ?? '—'}</span>
                    </div>

                    {/* Memo */}
                    {roll.memo && (
                        <div className="flex items-start gap-2 text-film-muted text-xs font-mono mt-1">
                            <FileText size={12} className="shrink-0 mt-0.5" />
                            <span className="line-clamp-2 break-words">{roll.memo}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
                <div className="flex justify-end mb-1">
                    <span className="font-mono">
                        <span className="text-film-text text-base font-semibold">
                            {String(progress).padStart(2, '0')}
                        </span>
                        <span className="text-film-muted text-xs">/{roll.maxFrames}</span>
                    </span>
                </div>
                <div className="h-0.5 bg-film-border rounded-full overflow-hidden relative">
                    <div
                        className="absolute inset-0 accent-gradient-bg transition-all duration-300"
                        style={{
                            clipPath: `inset(0 ${100 - Math.min((progress / roll.maxFrames) * 100, 100)}% 0 0)`,
                        }}
                    />
                </div>
            </div>
        </button>
    );
}
