import React, { useState } from 'react';
import { Plus, ExternalLink, FileText, Trash2, Edit3, Globe, RefreshCw, Folder } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Arquivo, ModalType } from '../types';

const ArquivoForm: React.FC<{ initialData?: Partial<Arquivo>; onSubmit: (data: Partial<Arquivo>) => void }> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Arquivo>>(initialData || {
    nome: '',
    url: '',
    descricao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium shadow-sm";
  const labelClass = "text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5 block ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none";

  return (
    <form id="arquivo-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className={labelClass}>Nome do Arquivo / Pasta</label>
        <div className="relative group">
          <FileText className={iconClass} size={18} />
          <input type="text" name="nome" className={inputClass} placeholder="Ex: Drive de Contratos" required value={formData.nome} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Link / URL</label>
        <div className="relative group">
          <Globe className={iconClass} size={18} />
          <input type="url" name="url" className={inputClass} placeholder="https://drive.google.com/..." required value={formData.url} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Descrição (Opcional)</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={18} />
          <textarea name="descricao" className={`${inputClass} h-32 resize-none pt-4 font-medium`} placeholder="Breve descrição do conteúdo..." value={formData.descricao} onChange={handleChange} />
        </div>
      </div>
    </form>
  );
};

const ArquivosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const { data: data = [], isLoading, refetch } = useQuery({
    queryKey: ['arquivos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('temperos_d_casa')
        .from('arquivos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ action, formData, id }: { action: 'insert' | 'update' | 'delete', formData?: Partial<Arquivo>, id?: string }) => {
      if (action === 'insert') {
        const { error } = await supabase.schema('temperos_d_casa').from('arquivos').insert(formData);
        if (error) throw error;
      } else if (action === 'update') {
        const { error } = await supabase.schema('temperos_d_casa').from('arquivos').update(formData).eq('id', id);
        if (error) throw error;
      } else if (action === 'delete') {
        const { error } = await supabase.schema('temperos_d_casa').from('arquivos').delete().eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arquivos'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    },
    onError: (error) => {
      console.error('Erro na operação:', error);
      alert('Ocorreu um erro ao processar a solicitação.');
    }
  });

  const handleAction = (type: 'edit' | 'delete', item: Arquivo) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Arquivo',
        maxWidth: 'max-w-lg',
        content: `Deseja realmente remover o link de "${item.nome}"?`,
        onConfirm: () => mutation.mutate({ action: 'delete', id: item.id })
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar Arquivo',
        maxWidth: 'max-w-2xl',
        content: <ArquivoForm initialData={item} onSubmit={(formData) => mutation.mutate({ action: 'update', id: item.id, formData })} />,
        onConfirm: () => {
          const form = document.getElementById('arquivo-form') as HTMLFormElement;
          form?.requestSubmit();
        }
      });
    }
  };

  const columns = [
    {
      header: 'Arquivo',
      accessor: (item: Arquivo) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
            <Folder size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white text-sm">{item.nome}</span>
            {item.descricao && <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{item.descricao}</span>}
          </div>
        </div>
      ),
      className: 'w-64'
    },
    {
      header: 'Link Direto',
      accessor: (item: Arquivo) => (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-xl transition-all">
          <ExternalLink size={14} />
          Acessar Agora
        </a>
      ),
      className: 'w-40'
    },
    {
      header: 'Ações',
      accessor: (item: Arquivo) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleAction('edit', item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Editar"><Edit3 size={18} /></button>
          <button onClick={() => handleAction('delete', item)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all" title="Excluir"><Trash2 size={18} /></button>
        </div>
      ),
      className: 'w-24 text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Arquivos e Documentos</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium tracking-wide uppercase">Centralização de links e arquivos estratégicos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModalConfig({
            isOpen: true,
            type: 'confirm-insert',
            title: 'Novo Arquivo',
            maxWidth: 'max-w-2xl',
            content: <ArquivoForm onSubmit={(formData) => mutation.mutate({ action: 'insert', formData })} />,
            onConfirm: () => {
              const form = document.getElementById('arquivo-form') as HTMLFormElement;
              form?.requestSubmit();
            }
          })} className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none tracking-widest text-xs uppercase"><Plus size={20} strokeWidth={3} /> Adicionar Link</button>
          <button onClick={() => refetch()} disabled={isLoading} className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all" title="Atualizar">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table columns={columns} data={data} searchPlaceholder="Buscar por nome ou descrição..." />
      </div>

      <Modal isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} content={modalConfig.content} maxWidth={modalConfig.maxWidth} onConfirm={modalConfig.onConfirm} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default ArquivosPage;
