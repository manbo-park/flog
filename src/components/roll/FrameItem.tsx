import { Clock, FileText, MapPin, Search } from 'lucide-react';
import type { Frame } from '@/types';
import { useMasterDataStore } from '@/store/masterDataStore';

interface FrameItemProps {
    frame: Frame;
    onEdit: () => void;
}

export function FrameItem({ frame, onEdit }: FrameItemProps) {
    const lens = useMasterDataStore((s) => s.lenses.find((l) => l.id === frame.lensId));
    const timestampStr = (() => {
        if (!frame.timestamp) return null;
        const time = new Date(frame.timestamp);
        const timeStr = time.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        const dateStr = time.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
        });
        return `${dateStr} ${timeStr}`;
    })();

    const hasMetadata = frame.lensId || frame.aperture || frame.shutterSpeed || frame.memo || frame.latitude != null;

    const locationStr = (() => {
        if (frame.latitude == null || frame.longitude == null) return null;
        const lat = Math.abs(frame.latitude).toFixed(4) + (frame.latitude >= 0 ? '°N' : '°S');
        const lng = Math.abs(frame.longitude).toFixed(4) + (frame.longitude >= 0 ? '°E' : '°W');
        return `${lat}, ${lng}`;
    })();

    return (
        <button
            onClick={onEdit}
            className="w-full flex items-start gap-4 py-3 border-b border-film-border last:border-b-0 text-left hover:bg-film-surface/50 rounded-lg px-1 -mx-1 transition-colors active:scale-[0.99]"
        >
            {/* Frame number */}
            <div className="shrink-0 w-8 text-center">
                <span className="text-film-accent font-mono font-bold text-base">
                    {String(frame.frameNumber).padStart(2, '0')}
                </span>
            </div>

            {/* Metadata */}
            <div className="flex-1 min-w-0">
                {/* Timestamp */}
                <div className="flex items-center gap-2 text-film-muted text-xs font-mono mb-1">
                    <Clock size={11} />
                    <span>{timestampStr ?? '촬영 시간 없음'}</span>
                </div>

                {hasMetadata ? (
                    <div className="flex flex-col gap-1">
                        {lens && (
                            <div className="flex items-center gap-1 text-film-muted text-xs font-mono">
                                <Search size={11} className="shrink-0" />
                                <span>{lens.name}</span>
                            </div>
                        )}
                        {(frame.aperture || frame.shutterSpeed) && (
                            <div className="flex items-center gap-2 text-film-muted text-xs font-mono">
                                {frame.aperture && (
                                    <span>f {frame.aperture.replace(/^f\//i, '')}</span>
                                )}
                                {frame.shutterSpeed && <span>ss {frame.shutterSpeed}</span>}
                            </div>
                        )}
                        {frame.memo && (
                            <div className="flex items-center gap-1 text-film-muted text-xs font-mono">
                                <FileText size={11} className="shrink-0" />
                                <span>{frame.memo}</span>
                            </div>
                        )}
                        {locationStr && (
                            <div className="flex items-center gap-1 text-film-muted text-xs font-mono">
                                <MapPin size={11} className="shrink-0" />
                                <span>{locationStr}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <span className="text-film-border text-xs font-mono italic">
                            탭하여 프레임 정보 추가
                        </span>
                    </div>
                )}
            </div>
        </button>
    );
}
