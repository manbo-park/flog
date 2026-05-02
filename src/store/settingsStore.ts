import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
    autoFinishRoll: boolean;
    setAutoFinishRoll: (value: boolean) => void;
    recordLocation: boolean;
    setRecordLocation: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            autoFinishRoll: false,
            setAutoFinishRoll: (value) => set({ autoFinishRoll: value }),
            recordLocation: false,
            setRecordLocation: (value) => set({ recordLocation: value }),
        }),
        {
            name: 'filo-settings',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
