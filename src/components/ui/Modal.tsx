import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;
        lockBodyScroll();
        return () => unlockBodyScroll();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" />

            {/* Sheet */}
            <div
                className="relative w-full max-w-lg bg-film-surface rounded-t-2xl border border-film-border animate-slide-up pb-safe-bottom"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-film-border" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-film-border">
                    <h2 className="text-film-text font-mono font-semibold text-sm uppercase tracking-wider">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-film-muted hover:text-film-text transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
