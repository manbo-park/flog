import { PageLayout } from '@/components/ui/PageLayout';
import { Switch } from '@/components/ui/Switch';
import { useSettingsStore } from '@/store/settingsStore';

export function SettingsScreen() {
    const { autoFinishRoll, setAutoFinishRoll } = useSettingsStore();

    return (
        <PageLayout title="설정" showBack>
            <div className="px-4 py-4 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <p className="font-mono text-xs text-film-muted uppercase tracking-widest px-1">
                        롤
                    </p>
                    <div className="bg-film-surface border border-film-border rounded-xl px-4 py-3">
                        <Switch
                            checked={autoFinishRoll}
                            onChange={setAutoFinishRoll}
                            label="최대 프레임 수 도달 시 롤 자동 마무리"
                        />
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
