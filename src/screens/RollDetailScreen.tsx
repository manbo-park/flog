import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Trash2,
    Play,
    Plus,
    Pencil,
    Camera,
    FileText,
    ClipboardCopy,
    Check,
    MapPin,
} from 'lucide-react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FrameItem } from '@/components/roll/FrameItem';
import { useRollStore } from '@/store/rollStore';
import { useMasterDataStore } from '@/store/masterDataStore';
import type { Frame } from '@/types';

const APERTURE_OPTIONS = [
    'f/1.0',
    'f/1.2',
    'f/1.4',
    'f/1.8',
    'f/2',
    'f/2.8',
    'f/4',
    'f/5.6',
    'f/8',
    'f/11',
    'f/16',
    'f/22',
    'f/32',
].map((v) => ({ value: v, label: v }));

const SHUTTER_OPTIONS = [
    '1',
    '1/2',
    '1/4',
    '1/8',
    '1/15',
    '1/30',
    '1/60',
    '1/125',
    '1/250',
    '1/500',
    '1/1000',
    '1/2000',
    '1/4000',
    'B',
].map((v) => ({ value: v, label: v }));

export function RollDetailScreen() {
    const { rollId } = useParams<{ rollId: string }>();
    const navigate = useNavigate();
    const {
        rolls,
        deleteRoll,
        updateFrame,
        updateRoll,
        deleteFrame,
        insertFrame,
        resumeRoll,
        setActiveRollId,
    } = useRollStore();
    const { films, cameras, lenses } = useMasterDataStore();

    const roll = rolls.find((r) => r.id === rollId);

    const [editingFrame, setEditingFrame] = useState<Frame | null>(null);
    const [lensId, setLensId] = useState('');
    const [aperture, setAperture] = useState('');
    const [shutterSpeed, setShutterSpeed] = useState('');
    const [memo, setMemo] = useState('');
    const [tsDate, setTsDate] = useState('');
    const [tsTime, setTsTime] = useState('');
    const [copied, setCopied] = useState(false);
    const [toastFading, setToastFading] = useState(false);
    const [showDeleteRoll, setShowDeleteRoll] = useState(false);
    const [showResumeConfirm, setShowResumeConfirm] = useState(false);
    const [showAddFrame, setShowAddFrame] = useState(false);
    const [addFrameAt, setAddFrameAt] = useState(1);
    const [showEditRoll, setShowEditRoll] = useState(false);
    const [editFilmId, setEditFilmId] = useState('');
    const [editCameraId, setEditCameraId] = useState('');
    const [editMaxFrames, setEditMaxFrames] = useState('');
    const [editRollMemo, setEditRollMemo] = useState('');

    if (!roll) {
        return (
            <PageLayout title="롤" showBack>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-film-muted font-mono text-sm">롤을 찾을 수 없습니다.</p>
                    <Button onClick={() => navigate('/rolls')}>롤 목록으로</Button>
                </div>
            </PageLayout>
        );
    }

    const film = films.find((f) => f.id === roll.filmId);
    const camera = cameras.find((c) => c.id === roll.cameraId);

    const isActive = roll.status === 'active';
    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    const startStr = fmt(roll.startedAt);
    const endStr = roll.finishedAt ? fmt(roll.finishedAt) : null;
    const dateStr = isActive
        ? `${startStr} ~`
        : endStr && endStr !== startStr
          ? `${startStr} ~ ${endStr}`
          : startStr;

    function toDateStr(iso: string) {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function toTimeStr(iso: string) {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    function openEditFrame(frame: Frame) {
        setEditingFrame(frame);
        setLensId(frame.lensId ?? '');
        setAperture(frame.aperture ?? '');
        setShutterSpeed(frame.shutterSpeed ?? '');
        setMemo(frame.memo ?? '');
        setTsDate(frame.timestamp ? toDateStr(frame.timestamp) : '');
        setTsTime(frame.timestamp ? toTimeStr(frame.timestamp) : '');
    }

    const prevFrameTimestamp = editingFrame
        ? (roll.frames[editingFrame.frameNumber - 2]?.timestamp ?? null)
        : null;

    const currentTs = tsDate && tsTime ? new Date(`${tsDate}T${tsTime}`).toISOString() : null;
    const tsError = !!(
        prevFrameTimestamp &&
        currentTs &&
        currentTs.slice(0, 19) < prevFrameTimestamp.slice(0, 19)
    );

    function saveFrame() {
        if (!editingFrame || !roll) return;
        updateFrame(roll.id, editingFrame.id, {
            lensId: lensId || undefined,
            aperture: aperture || undefined,
            shutterSpeed: shutterSpeed || undefined,
            memo: memo || undefined,
            timestamp: currentTs ?? undefined,
        });
        setEditingFrame(null);
    }

    function handleDeleteFrame() {
        if (!editingFrame || !roll) return;
        deleteFrame(roll.id, editingFrame.id);
        setEditingFrame(null);
    }

    function handleDeleteRoll() {
        deleteRoll(roll!.id);
        navigate('/rolls', { replace: true });
    }

    function openEditRoll() {
        setEditFilmId(roll!.filmId);
        setEditCameraId(roll!.cameraId);
        setEditMaxFrames(String(roll!.maxFrames));
        setEditRollMemo(roll!.memo ?? '');
        setShowEditRoll(true);
    }

    function saveRoll() {
        const maxFrames = parseInt(editMaxFrames, 10);
        if (!editFilmId || !editCameraId || !maxFrames || maxFrames < 1) return;
        updateRoll(roll!.id, {
            filmId: editFilmId,
            cameraId: editCameraId,
            maxFrames,
            memo: editRollMemo || undefined,
        });
        setShowEditRoll(false);
    }

    async function copyFixifPayload() {
        if (!roll) return;
        const frames = roll.frames.map((frame) => {
            const lens = lenses.find((l) => l.id === frame.lensId);
            const apertureNum = frame.aperture
                ? parseFloat(frame.aperture.replace('f/', ''))
                : undefined;
            const entry: Record<string, unknown> = { n: frame.frameNumber };
            if (frame.timestamp) entry.t = frame.timestamp;
            if (lens) entry.lens = lens.name;
            if (apertureNum != null && !isNaN(apertureNum)) entry.aperture = apertureNum;
            if (frame.shutterSpeed) entry.shutter = frame.shutterSpeed;
            if (frame.memo) entry.memo = frame.memo;
            if (frame.latitude != null) entry.lat = frame.latitude;
            if (frame.longitude != null) entry.lng = frame.longitude;
            return entry;
        });

        const payload = {
            v: 1,
            roll: {
                camera: { make: camera?.brand ?? '', model: camera?.name ?? '' },
                film: { name: film?.name ?? '', iso: film?.iso ?? 0 },
                frames,
            },
        };

        const json = JSON.stringify(payload);
        const encoded = new TextEncoder().encode(json);
        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(encoded);
        writer.close();
        const chunks: Uint8Array[] = [];
        const reader = cs.readable.getReader();
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }
        const total = chunks.reduce((s, c) => s + c.length, 0);
        const buf = new Uint8Array(total);
        let offset = 0;
        for (const chunk of chunks) {
            buf.set(chunk, offset);
            offset += chunk.length;
        }
        let binary = '';
        for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
        const result = 'FIXIF1:' + btoa(binary);

        await navigator.clipboard.writeText(result);
        setCopied(true);
        setToastFading(false);
        setTimeout(() => setToastFading(true), 1800);
        setTimeout(() => setCopied(false), 2400);
    }

    function handleInsertFrame() {
        const newId = insertFrame(roll!.id, addFrameAt);
        setShowAddFrame(false);
        const updatedRoll = useRollStore.getState().rolls.find((r) => r.id === roll!.id);
        const newFrame = updatedRoll?.frames.find((f) => f.id === newId);
        if (newFrame) openEditFrame(newFrame);
    }

    return (
        <PageLayout
            title={film?.name ?? 'Roll'}
            showBack
            rightAction={
                <div className="flex items-center">
                    <button
                        onClick={copyFixifPayload}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="EXIF 데이터 복사"
                    >
                        {copied ? (
                            <Check size={16} className="text-film-accent" />
                        ) : (
                            <ClipboardCopy size={16} />
                        )}
                    </button>
                    <button
                        onClick={openEditRoll}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="롤 수정"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => setShowDeleteRoll(true)}
                        className="p-2 text-film-muted hover:text-film-danger transition-colors"
                        title="롤 삭제"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            }
        >
            <div className="px-4 py-4">
                {/* Roll meta */}
                <div className="bg-film-surface border border-film-border rounded-xl p-4 mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {isActive && (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-film-accent animate-pulse" />
                                    <span className="text-film-accent font-mono text-xs uppercase tracking-widest">
                                        촬영 중
                                    </span>
                                </>
                            )}
                            {!isActive && (
                                <span className="text-film-muted font-mono text-xs uppercase tracking-widest">
                                    촬영 완료
                                </span>
                            )}
                        </div>
                        <span className="text-film-muted font-mono text-xs">{dateStr}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                            <div className="text-film-text font-mono font-bold text-lg">
                                {roll.frames.length}
                            </div>
                            <div className="text-film-muted font-mono text-xs">촬영됨</div>
                        </div>
                        <div>
                            <div className="text-film-text font-mono font-bold text-lg">
                                {roll.maxFrames}
                            </div>
                            <div className="text-film-muted font-mono text-xs">전체</div>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-film-border text-film-muted font-mono text-xs flex items-center gap-1.5">
                        <Camera size={11} />
                        {camera?.name ?? '—'}
                    </div>
                    {roll.memo && (
                        <div className="mt-2 text-film-muted font-mono text-xs flex items-start gap-1.5">
                            <FileText size={11} className="shrink-0 mt-0.5" />
                            <span className="whitespace-pre-wrap break-words">{roll.memo}</span>
                        </div>
                    )}
                </div>

                {/* Go to shoot (if active) */}
                {isActive && (
                    <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        className="mb-4"
                        onClick={() => {
                            setActiveRollId(roll.id);
                            navigate('/shoot');
                        }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Play size={14} />
                            촬영 계속하기
                        </span>
                    </Button>
                )}

                {/* Resume shooting (if finished) */}
                {!isActive && (
                    <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        className="mb-4 muted-border"
                        onClick={() => setShowResumeConfirm(true)}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Play size={14} />
                            촬영 재개하기
                        </span>
                    </Button>
                )}

                {/* Frames list */}
                {roll.frames.length > 0 && (
                    <div className="flex items-center justify-end mb-2">
                        <button
                            onClick={() => {
                                setAddFrameAt(roll.frames.length + 1);
                                setShowAddFrame(true);
                            }}
                            className="flex items-center gap-1 font-mono text-xs text-film-accent hover:opacity-70 transition-opacity"
                        >
                            <Plus size={13} />
                            프레임 추가
                        </button>
                    </div>
                )}
                {roll.frames.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-film-border font-mono text-sm">기록된 컷이 없습니다.</p>
                    </div>
                ) : (
                    <div className="bg-film-surface border border-film-border rounded-xl px-4">
                        {roll.frames.map((frame) => (
                            <FrameItem
                                key={frame.id}
                                frame={frame}
                                onEdit={() => openEditFrame(frame)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Edit frame modal */}
            <Modal
                isOpen={!!editingFrame}
                onClose={() => setEditingFrame(null)}
                title={`${editingFrame?.frameNumber ?? ''}번 프레임`}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-mono text-xs text-film-muted">촬영 시간</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={tsDate}
                                onChange={(e) => setTsDate(e.target.value)}
                                className="flex-1 bg-film-surface border border-film-border rounded-lg px-3 py-2 font-mono text-sm text-film-text focus:outline-none focus:border-film-accent"
                            />
                            <input
                                type="time"
                                step="1"
                                value={tsTime}
                                onChange={(e) => setTsTime(e.target.value)}
                                className="w-32 bg-film-surface border border-film-border rounded-lg px-3 py-2 font-mono text-sm text-film-text focus:outline-none focus:border-film-accent"
                            />
                        </div>
                        {tsError && (
                            <p className="font-mono text-xs text-film-warn">
                                이전 컷의 촬영 시간보다 이릅니다.
                            </p>
                        )}
                    </div>
                    <Select
                        label="렌즈"
                        value={lensId}
                        onChange={(e) => setLensId(e.target.value)}
                        options={lenses.map((l) => ({ value: l.id, label: l.name }))}
                        placeholder="렌즈 선택..."
                    />
                    <Select
                        label="조리개"
                        value={aperture}
                        onChange={(e) => setAperture(e.target.value)}
                        options={APERTURE_OPTIONS}
                        placeholder="조리개 선택..."
                    />
                    <Select
                        label="셔터 속도"
                        value={shutterSpeed}
                        onChange={(e) => setShutterSpeed(e.target.value)}
                        options={SHUTTER_OPTIONS}
                        placeholder="셔터 속도 선택..."
                    />
                    <Input
                        label="메모"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="이 컷에 대한 메모..."
                    />

                    {editingFrame?.latitude != null && editingFrame?.longitude != null && (
                        <div className="flex flex-col gap-1">
                            <label className="font-mono text-xs text-film-muted">위치 정보</label>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `${editingFrame!.latitude},${editingFrame!.longitude}`,
                                    );
                                    setCopied(true);
                                    setToastFading(false);
                                    setTimeout(() => setToastFading(true), 1800);
                                    setTimeout(() => setCopied(false), 2400);
                                }}
                                className="flex items-center gap-2 bg-film-surface border border-film-border rounded-lg px-3 py-2 font-mono text-xs text-film-accent active:opacity-70 transition-opacity text-left"
                            >
                                <MapPin size={12} className="shrink-0" />
                                <span>
                                    {Math.abs(editingFrame.latitude).toFixed(6)}
                                    {editingFrame.latitude >= 0 ? '°N' : '°S'},&nbsp;
                                    {Math.abs(editingFrame.longitude).toFixed(6)}
                                    {editingFrame.longitude >= 0 ? '°E' : '°W'}
                                </span>
                                {editingFrame.locationAccuracy != null && (
                                    <span className="ml-auto text-film-muted">
                                        ±{Math.round(editingFrame.locationAccuracy)}m
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3 mt-1">
                        <Button variant="danger" size="md" fullWidth onClick={handleDeleteFrame}>
                            삭제
                        </Button>
                        <Button variant="primary" size="md" fullWidth onClick={saveFrame}>
                            저장
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit roll modal */}
            <Modal
                isOpen={showEditRoll}
                onClose={() => setShowEditRoll(false)}
                title="롤 정보 수정"
            >
                <div className="flex flex-col gap-4">
                    <Select
                        label="필름"
                        value={editFilmId}
                        onChange={(e) => setEditFilmId(e.target.value)}
                        options={films.map((f) => ({ value: f.id, label: f.name }))}
                        placeholder="필름 선택..."
                    />
                    <Select
                        label="카메라"
                        value={editCameraId}
                        onChange={(e) => setEditCameraId(e.target.value)}
                        options={cameras.map((c) => ({ value: c.id, label: c.name }))}
                        placeholder="카메라 선택..."
                    />
                    <Input
                        label="전체 프레임 수"
                        type="number"
                        value={editMaxFrames}
                        onChange={(e) => setEditMaxFrames(e.target.value)}
                        placeholder="36"
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-mono text-film-muted uppercase tracking-wider">
                            메모
                        </label>
                        <textarea
                            value={editRollMemo}
                            onChange={(e) => setEditRollMemo(e.target.value)}
                            placeholder="이 롤에 대한 메모..."
                            rows={3}
                            className="bg-film-bg border border-film-border rounded-lg px-3 py-2.5 text-film-text font-mono text-sm placeholder-film-muted focus:outline-none focus:border-film-accent transition-colors resize-none"
                        />
                    </div>
                    <div className="flex gap-3 mt-1">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowEditRoll(false)}
                        >
                            취소
                        </Button>
                        <Button variant="primary" fullWidth onClick={saveRoll}>
                            저장
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add frame modal */}
            <Modal isOpen={showAddFrame} onClose={() => setShowAddFrame(false)} title="프레임 추가">
                <div className="flex flex-col gap-4">
                    <Select
                        label="삽입할 위치"
                        value={String(addFrameAt)}
                        onChange={(e) => setAddFrameAt(Number(e.target.value))}
                        options={Array.from({ length: roll.frames.length + 1 }, (_, i) => ({
                            value: String(i + 1),
                            label: `${i + 1}번`,
                        }))}
                    />
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowAddFrame(false)}
                        >
                            취소
                        </Button>
                        <Button variant="primary" fullWidth onClick={handleInsertFrame}>
                            추가
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Resume roll confirmation */}
            <Modal
                isOpen={showResumeConfirm}
                onClose={() => setShowResumeConfirm(false)}
                title="촬영을 재개할까요?"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-film-muted font-mono text-sm">
                        촬영이 마무리된 롤입니다. 촬영을 재개하시겠습니까?
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowResumeConfirm(false)}
                        >
                            취소
                        </Button>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={() => {
                                resumeRoll(roll!.id);
                                setShowResumeConfirm(false);
                                navigate('/shoot');
                            }}
                        >
                            재개
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Copy success toast */}
            {copied && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div
                        className={`animate-slide-up flex items-center gap-2 bg-film-surface border border-film-border rounded-full px-4 py-2 shadow-lg transition-opacity duration-500 ${toastFading ? 'opacity-0' : 'opacity-100'}`}
                    >
                        <Check size={13} className="text-film-accent shrink-0" />
                        <span className="font-mono text-xs text-film-text whitespace-nowrap">
                            fixif 데이터가 클립보드에 복사되었습니다.
                        </span>
                    </div>
                </div>
            )}

            {/* Delete roll confirmation */}
            <Modal
                isOpen={showDeleteRoll}
                onClose={() => setShowDeleteRoll(false)}
                title="롤을 삭제할까요?"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-film-muted font-mono text-sm">
                        이 롤과 기록된 {roll.frames.length}컷을 영구적으로 삭제합니다. 이 작업은
                        되돌릴 수 없습니다.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowDeleteRoll(false)}
                        >
                            취소
                        </Button>
                        <Button variant="danger" fullWidth onClick={handleDeleteRoll}>
                            삭제
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    );
}
