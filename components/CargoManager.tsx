import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, X, Check, Briefcase } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface Cargo {
    id: string;
    nome: string;
}

export default function CargoManager({ onClose, onUpdate }: { onClose?: () => void; onUpdate?: () => void }) {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [lastAddedName, setLastAddedName] = useState<string | null>(null);
    const itemsRef = useRef<Map<string, HTMLDivElement>>(new Map());

    const { data: cargos = [], isLoading } = useQuery<Cargo[]>({
        queryKey: ['cargos_mda_admin'],
        queryFn: async () => {
            const { data, error } = await supabase.schema('temperos_d_casa')
                .rpc('manage_cargos_mda', { action_type: 'SELECT_ALL' });

            if (error) {
                console.error('Erro no CargoManager (fetch RPC):', error);
                throw error;
            }
            return (data as Cargo[]) ?? [];
        },
    });

    const addMutation = useMutation({
        mutationFn: async (nome: string) => {
            const { error } = await supabase.schema('temperos_d_casa')
                .rpc('manage_cargos_mda', {
                    action_type: 'INSERT',
                    c_nome: nome.trim()
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cargos_mda_admin'] });
            setLastAddedName(inputValue.trim());
            setInputValue('');
            setIsAdding(false);
            if (onUpdate) onUpdate();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, nome }: { id: string; nome: string }) => {
            const { error } = await supabase.schema('temperos_d_casa')
                .rpc('manage_cargos_mda', {
                    action_type: 'UPDATE',
                    c_id: id,
                    c_nome: nome.trim()
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cargos_mda_admin'] });
            setEditingId(null);
            if (onUpdate) onUpdate();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.schema('temperos_d_casa')
                .rpc('manage_cargos_mda', {
                    action_type: 'DELETE',
                    c_id: id
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cargos_mda_admin'] });
            if (onUpdate) onUpdate();
        },
    });

    const handleAdd = () => {
        if (!inputValue.trim()) return;
        addMutation.mutate(inputValue);
    };

    const handleUpdate = (id: string) => {
        if (!editValue.trim()) return;
        updateMutation.mutate({ id, nome: editValue });
    };

    const startEditing = (c: Cargo) => {
        setEditingId(c.id);
        setEditValue(c.nome);
    };

    // Scroll para o novo cargo quando a lista for atualizada
    useEffect(() => {
        if (lastAddedName && cargos.length > 0) {
            const timer = setTimeout(() => {
                const element = Array.from(itemsRef.current.values()).find(
                    (el): el is HTMLDivElement => (el as HTMLDivElement).getAttribute('data-name') === lastAddedName
                );
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-primary-red', 'ring-inset');
                    setTimeout(() => element.classList.remove('ring-2', 'ring-primary-red', 'ring-inset'), 2000);
                }
                setLastAddedName(null);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [cargos, lastAddedName]);

    return (
        <div className="w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cargos Disponíveis</h3>

            {/* Add input */}
            {isAdding ? (
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-primary-red rounded-xl px-3 py-2 shadow-sm">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Nome do cargo..."
                        className="flex-grow bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={addMutation.isPending}
                        className="p-1.5 bg-primary-red text-white rounded-lg hover:bg-primary-red-dark transition-colors shrink-0"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setIsAdding(false); setInputValue(''); }}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary-red hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl transition-colors w-full border border-dashed border-primary-red/40"
                >
                    <Plus className="w-4 h-4" />
                    Novo Cargo
                </button>
            )}

            {/* List */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {isLoading && (
                    <div className="text-center py-8 text-slate-400 text-sm">Carregando...</div>
                )}
                {!isLoading && cargos.length === 0 && !isAdding && (
                    <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <Briefcase className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                        <p className="text-slate-400 text-sm">Nenhum cargo cadastrado.</p>
                    </div>
                )}
                {cargos.map(c => (
                    <div
                        key={c.id}
                        data-name={c.nome}
                        ref={el => {
                            if (el) itemsRef.current.set(c.id, el);
                            else itemsRef.current.delete(c.id);
                        }}
                        className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl group transition-all"
                    >
                        {editingId === c.id ? (
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    autoFocus
                                    type="text"
                                    className="flex-grow bg-transparent outline-none text-sm text-slate-900 dark:text-white"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate(c.id)}
                                />
                                <button
                                    onClick={() => handleUpdate(c.id)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1 text-slate-400 hover:bg-slate-50 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.nome}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEditing(c)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                        title="Editar"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Remover "${c.nome}"?`)) deleteMutation.mutate(c.id);
                                        }}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Remover"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
