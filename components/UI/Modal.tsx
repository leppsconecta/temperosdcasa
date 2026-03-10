import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    type: string;
    title: string;
    content: React.ReactNode;
    maxWidth?: string;
    confirmText?: string;
    isLoading?: boolean;
    hideFooter?: boolean;
    onConfirm?: () => void;
    onClose: () => void;
}

export default function Modal({ isOpen, title, content, maxWidth = 'max-w-lg', confirmText = 'Confirmar', isLoading = false, hideFooter = false, onConfirm, onClose }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh] relative`}>
                {title ? (
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 sticky top-0 z-10">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-white shadow-sm rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="absolute top-4 right-4 z-20">
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="p-6 overflow-y-auto">
                    {content}
                </div>
                {!hideFooter && onConfirm && (
                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-slate-600 font-bold disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary-red text-white font-bold rounded-xl shadow-md disabled:opacity-70 flex items-center gap-2"
                        >
                            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
