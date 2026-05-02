// ─── Master Data ─────────────────────────────────────────────────────────────

export interface Film {
    id: string;
    name: string; // e.g. "Kodak Gold 200"
    iso: number;
    brand?: string;
}

export interface Camera {
    id: string;
    name: string; // e.g. "Leica M6"
    brand?: string;
}

export interface Lens {
    id: string;
    name: string; // e.g. "35mm f/2"
    focalLength?: number;
    maxAperture?: number;
}

// ─── Roll & Frame ─────────────────────────────────────────────────────────────

export interface Frame {
    id: string;
    frameNumber: number;
    timestamp?: string; // ISO 8601
    lensId?: string;
    aperture?: string; // e.g. "f/2.8"
    shutterSpeed?: string; // e.g. "1/250"
    memo?: string;
    latitude?: number;
    longitude?: number;
    locationAccuracy?: number;
}

export type RollStatus = 'active' | 'finished';

export interface Roll {
    id: string;
    filmId: string;
    cameraId: string;
    currentLensId?: string; // 현재 장착된 렌즈
    maxFrames: number;
    startedAt: string; // ISO 8601
    finishedAt?: string; // ISO 8601
    frames: Frame[];
    status: RollStatus;
    memo?: string;
}

// ─── Export/Import envelope ───────────────────────────────────────────────────

export interface ExportData {
    version: 1;
    exportedAt: string;
    masterData: {
        films: Film[];
        cameras: Camera[];
        lenses: Lens[];
    };
    rolls: Roll[];
    activeRollId: string | null;
}
