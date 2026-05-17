import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Film, Trash2, AlertTriangle, Settings, Database } from 'lucide-react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { RollCard } from '@/components/roll/RollCard';
import { useRollStore } from '@/store/rollStore';
import { useMasterDataStore } from '@/store/masterDataStore';
import type { ExportData } from '@/types';

const FRAME_COUNT_OPTIONS = [
    { value: '24', label: '24컷' },
    { value: '36', label: '36컷' },
    { value: '48', label: '48컷' },
    { value: '72', label: '72컷' },
];

export function FilmListScreen() {
    const navigate = useNavigate();
    const { rolls, startRoll, importRolls, clearAll: clearRolls } = useRollStore(
        useShallow((s) => ({
            rolls: s.rolls,
            startRoll: s.startRoll,
            importRolls: s.importRolls,
            clearAll: s.clearAll,
        })),
    );
    const { films, cameras, importMasterData } = useMasterDataStore(
        useShallow((s) => ({
            films: s.films,
            cameras: s.cameras,
            importMasterData: s.importMasterData,
        })),
    );

    const [showNewRoll, setShowNewRoll] = useState(false);
    const [filmId, setFilmId] = useState('');
    const [cameraId, setCameraId] = useState('');
    const [maxFrames, setMaxFrames] = useState('36');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [showImportSuccess, setShowImportSuccess] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [confirmClear, setConfirmClear] = useState(false);

    const { activeRolls, finishedRolls } = useMemo(() => {
        const byDate = (a: (typeof rolls)[0], b: (typeof rolls)[0]) =>
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
        return {
            activeRolls: rolls.filter((r) => r.status === 'active').sort(byDate),
            finishedRolls: rolls.filter((r) => r.status === 'finished').sort(byDate),
        };
    }, [rolls]);

    function validateAndStart() {
        const newErrors: Record<string, string> = {};
        if (!filmId) newErrors.film = '필름을 선택하세요';
        if (!cameraId) newErrors.camera = '카메라를 선택하세요';
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }
        startRoll({ filmId, cameraId, maxFrames: parseInt(maxFrames) });
        setShowNewRoll(false);
        navigate('/shoot', { replace: true });
    }

    function handleExport() {
        const masterData = useMasterDataStore.getState();
        const rollState = useRollStore.getState();
        const data: ExportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            masterData: {
                films: masterData.films,
                cameras: masterData.cameras,
                lenses: masterData.lenses,
            },
            rolls: rollState.rolls,
            activeRollId: rollState.activeRollId,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filo-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function parseImportData(json: string): ExportData {
        const data = JSON.parse(json) as Record<string, unknown>;
        if (data?.version !== 1) throw new Error('지원하지 않는 버전입니다.');
        const md = data.masterData as Record<string, unknown> | undefined;
        if (
            !md ||
            !Array.isArray(md.films) ||
            !Array.isArray(md.cameras) ||
            !Array.isArray(md.lenses)
        )
            throw new Error('masterData 형식이 올바르지 않습니다.');
        if (!Array.isArray(data.rolls)) throw new Error('rolls 형식이 올바르지 않습니다.');
        return data as unknown as ExportData;
    }

    function handleImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = parseImportData(ev.target?.result as string);
                    importMasterData(data.masterData);
                    importRolls(data.rolls, data.activeRollId);
                    setShowImportSuccess(true);
                } catch (err) {
                    setImportError(
                        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
                    );
                }
            };
            reader.onerror = () => setImportError('파일을 읽는 중 오류가 발생했습니다.');
            reader.readAsText(file);
        };
        input.click();
    }

    return (
        <PageLayout
            title={<img src="/filo-logo-white-with-shadow.png" alt="filo" className="h-14" />}
            rightAction={
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleImport}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="가져오기"
                    >
                        <Download size={16} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="내보내기"
                    >
                        <Upload size={16} />
                    </button>
                    <button
                        onClick={() => setConfirmClear(true)}
                        className="p-2 text-film-muted hover:text-film-danger transition-colors"
                        title="롤 전체 삭제"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={() => navigate('/master')}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="기본 데이터"
                    >
                        <Database size={16} />
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="설정"
                    >
                        <Settings size={16} />
                    </button>
                </div>
            }
        >
            {confirmClear && (
                <div className="mx-4 mt-4 flex items-center gap-3 bg-film-surface border border-film-danger rounded-xl px-4 py-3">
                    <AlertTriangle size={16} className="shrink-0 text-film-danger" />
                    <span className="flex-1 font-mono text-xs text-film-muted">
                        촬영한 롤을 모두 삭제합니다
                    </span>
                    <button
                        onClick={() => {
                            clearRolls();
                            setConfirmClear(false);
                        }}
                        className="font-mono text-xs text-film-danger hover:text-red-400 transition-colors px-2 py-1"
                    >
                        삭제
                    </button>
                    <button
                        onClick={() => setConfirmClear(false)}
                        className="font-mono text-xs text-film-muted hover:text-film-text transition-colors px-2 py-1"
                    >
                        취소
                    </button>
                </div>
            )}

            <div className="px-4 py-4 flex flex-col gap-3">
                {/* Start New Roll CTA */}
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => {
                        setErrors({});
                        setFilmId('');
                        setCameraId('');
                        setMaxFrames('36');
                        setShowNewRoll(true);
                    }}
                >
                    + 새 롤 시작
                </Button>

                {/* Roll list */}
                {activeRolls.length === 0 && finishedRolls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Film size={40} className="text-film-border" />
                        <div className="text-center">
                            <p className="text-film-muted font-mono text-sm">롤이 없습니다</p>
                            <p className="text-film-border font-mono text-xs mt-1">
                                첫 번째 롤을 시작하세요!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 mt-1">
                        {activeRolls.length > 0 && (
                            <>
                                <div className="flex items-center gap-1.5 px-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-film-accent animate-pulse shrink-0" />
                                    <p className="font-mono text-xs text-film-accent uppercase tracking-widest">
                                        촬영 중
                                    </p>
                                </div>
                                {activeRolls.map((roll) => (
                                    <RollCard key={roll.id} roll={roll} />
                                ))}
                            </>
                        )}
                        {activeRolls.length > 0 && finishedRolls.length > 0 && (
                            <div className="h-4" />
                        )}
                        {finishedRolls.length > 0 && (
                            <>
                                <p className="font-mono text-xs text-film-muted uppercase tracking-widest px-1">
                                    촬영 완료
                                </p>
                                {finishedRolls.map((roll) => (
                                    <RollCard key={roll.id} roll={roll} />
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* New Roll Modal */}
            <Modal isOpen={showNewRoll} onClose={() => setShowNewRoll(false)} title="새 롤">
                <div className="flex flex-col gap-4">
                    {films.length === 0 || cameras.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-film-muted font-mono text-sm">
                                필름과 카메라를 각각 하나 이상 먼저 등록해야 합니다.
                            </p>
                            <Button
                                variant="primary"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setShowNewRoll(false);
                                    navigate('/master');
                                }}
                            >
                                기본 데이터 등록하기
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Select
                                label="필름"
                                placeholder="필름 선택..."
                                value={filmId}
                                onChange={(e) => {
                                    setFilmId(e.target.value);
                                    setErrors((p) => ({ ...p, film: '' }));
                                }}
                                options={films.map((f) => ({
                                    value: f.id,
                                    label: `${f.name} (ISO ${f.iso})`,
                                }))}
                                error={errors.film}
                            />
                            <Select
                                label="카메라"
                                placeholder="카메라 선택..."
                                value={cameraId}
                                onChange={(e) => {
                                    setCameraId(e.target.value);
                                    setErrors((p) => ({ ...p, camera: '' }));
                                }}
                                options={cameras.map((c) => ({ value: c.id, label: c.name }))}
                                error={errors.camera}
                            />
                            <Select
                                label="최대 컷 수"
                                value={maxFrames}
                                onChange={(e) => setMaxFrames(e.target.value)}
                                options={FRAME_COUNT_OPTIONS}
                            />

                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={validateAndStart}
                            >
                                롤 장전 →
                            </Button>
                        </>
                    )}
                </div>
            </Modal>

            {/* 가져오기 성공 모달 */}
            <Modal
                isOpen={showImportSuccess}
                onClose={() => setShowImportSuccess(false)}
                title="가져오기 완료"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-film-muted font-mono text-sm">
                        데이터를 성공적으로 가져왔습니다.
                    </p>
                    <Button variant="primary" fullWidth onClick={() => setShowImportSuccess(false)}>
                        확인
                    </Button>
                </div>
            </Modal>

            {/* 가져오기 실패 모달 */}
            <Modal
                isOpen={importError !== null}
                onClose={() => setImportError(null)}
                title="가져오기 실패"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-film-muted font-mono text-sm">
                        파일 형식이 올바르지 않아 가져올 수 없습니다.
                    </p>
                    {importError && (
                        <p className="text-film-danger font-mono text-xs bg-film-surface rounded-lg px-3 py-2">
                            {importError}
                        </p>
                    )}
                    <Button variant="secondary" fullWidth onClick={() => setImportError(null)}>
                        닫기
                    </Button>
                </div>
            </Modal>

        </PageLayout>
    );
}
