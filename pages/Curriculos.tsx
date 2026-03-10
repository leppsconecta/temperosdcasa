import React, { useState, useEffect } from 'react';
import { Eye, StickyNote, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import RoleManager from '../components/RoleManager';
import { ModalType } from '../types';
import { supabase } from '../lib/supabase';

// Tipo local baseado nos campos da tabela public.curriculos
interface CurriculoRow {
  id: string;
  created_at: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  sexo: string | null;
  faixa_etaria: string | null;
  cidade: string | null;
  bairro: string | null;
  cargo: string | null;
  mensagem: string | null;
  anexo_url: string | null;
  anexo_nome: string | null;
  status: string;
  observacoes: string | null;
}

const CurriculosPage: React.FC = () => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    content: React.ReactNode;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'view-content', title: '', content: '' });

  // Busca dados direto da tabela public.curriculos
  const { data = [], refetch } = useQuery<CurriculoRow[]>({
    queryKey: ['curriculos_mda'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_curriculos_mda');

      if (error) {
        console.error('Erro ao buscar currículos (RPC):', error);
        throw error;
      }
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache (dados considerados frescos)
    refetchInterval: 1000 * 60 * 5, // Sincroniza a cada 5 minutos
    refetchOnWindowFocus: true, // Recarrega ao voltar para a aba
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('curriculos_mda_realtime')
      .on('postgres_changes', { event: '*', schema: 'temperos_d_casa', table: 'curriculos' }, () => {
        refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const handleMensagemClick = (e: React.MouseEvent, item: CurriculoRow) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Resumo Profissional',
      content: (
        <div className="p-1">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            {item.mensagem || 'Nenhum resumo informado.'}
          </p>
        </div>
      ),
    });
  };

  const handleObsClick = (e: React.MouseEvent, item: CurriculoRow) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Observações',
      content: (
        <div className="p-1">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
            {item.observacoes || 'Nenhuma observação informada.'}
          </p>
        </div>
      ),
    });
  };

  const handleViewClick = (e: React.MouseEvent, item: CurriculoRow) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Detalhes do Candidato',
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Nome</p>
              <p className="font-bold text-slate-900 dark:text-white">{item.nome}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Cargo</p>
              <p className="text-slate-900 dark:text-white">{item.cargo || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Telefone</p>
              <p className="text-slate-900 dark:text-white">{item.telefone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Sexo</p>
              <p className="text-slate-900 dark:text-white">{item.sexo || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Faixa Etária</p>
              <p className="text-slate-900 dark:text-white">{item.faixa_etaria || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Cidade / Bairro</p>
              <p className="text-slate-900 dark:text-white">{[item.cidade, item.bairro].filter(Boolean).join(' - ') || '—'}</p>
            </div>
          </div>

          {item.mensagem && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 tracking-widest uppercase font-bold">Resumo Profissional</p>
              <p className="text-slate-800 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {item.mensagem}
              </p>
            </div>
          )}

          {item.anexo_url && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <a
                href={item.anexo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-red hover:bg-primary-red-dark text-white font-semibold rounded-xl transition-all text-sm"
              >
                <Download size={16} />
                Baixar Currículo
              </a>
            </div>
          )}

          {item.observacoes && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 tracking-widest uppercase font-bold">Observações</p>
              <p className="text-slate-800 dark:text-slate-300 leading-relaxed bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800">
                {item.observacoes}
              </p>
            </div>
          )}
        </div>
      ),
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

  // Helper para células com truncamento e tooltip
  const Cell = ({ text, className = '' }: { text: string | null | undefined; className?: string }) => (
    <span
      title={text ?? ''}
      className={`block truncate max-w-full ${className}`}
    >
      {text || '—'}
    </span>
  );

  const columns = [
    {
      header: '#',
      accessor: (_: any, index: number) => <span className="text-slate-400 text-xs">{index + 1}</span>,
      className: 'w-10 shrink-0',
    },
    {
      header: 'Data',
      accessor: (item: CurriculoRow) => <span className="text-slate-500 font-medium text-xs whitespace-nowrap">{formatDate(item.created_at)}</span>,
      className: 'w-20 shrink-0',
    },
    {
      header: 'Nome',
      accessor: (item: CurriculoRow) => <Cell text={item.nome} className="font-bold text-slate-900 dark:text-white w-40" />,
      className: 'w-40 shrink-0',
    },
    {
      header: 'Cargo',
      accessor: (item: CurriculoRow) => <Cell text={item.cargo} className="text-slate-700 dark:text-slate-300 w-28" />,
      className: 'w-28 shrink-0',
    },
    {
      header: 'Telefone',
      accessor: (item: CurriculoRow) => <Cell text={item.telefone} className="text-slate-600 w-32" />,
      className: 'w-32 shrink-0',
    },
    {
      header: 'Cidade',
      accessor: (item: CurriculoRow) => <Cell text={item.cidade} className="text-slate-500 w-28" />,
      className: 'w-28 shrink-0',
    },
    {
      header: 'Bairro',
      accessor: (item: CurriculoRow) => <Cell text={item.bairro} className="text-slate-500 w-24" />,
      className: 'w-24 shrink-0',
    },
    {
      header: 'Sx',
      accessor: (item: CurriculoRow) => (
        <span className={`text-xs font-bold ${item.sexo === 'Masculino' ? 'text-blue-600' : item.sexo === 'Feminino' ? 'text-pink-500' : 'text-slate-300'}`}>
          {item.sexo === 'Masculino' ? 'M' : item.sexo === 'Feminino' ? 'F' : '—'}
        </span>
      ),
      className: 'w-10 shrink-0 text-center',
    },
    {
      header: 'Obs',
      accessor: (item: CurriculoRow) => (
        <button
          onClick={(e) => handleMensagemClick(e, item)}
          className={`p-2 rounded-lg transition-colors ${item.mensagem ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100' : 'text-slate-300 cursor-not-allowed'}`}
          disabled={!item.mensagem}
          title={item.mensagem ?? 'Sem resumo profissional'}
        >
          <StickyNote size={16} />
        </button>
      ),
      className: 'w-12 shrink-0 text-center',
    },
    {
      header: 'Ações',
      accessor: (item: CurriculoRow) => (
        <button
          onClick={(e) => handleViewClick(e, item)}
          className="p-2 text-slate-500 hover:text-primary-red hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
          title="Ver detalhes"
        >
          <Eye size={16} />
        </button>
      ),
      className: 'w-16 shrink-0',
    },
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Currículos</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {data.length} candidatura{data.length !== 1 ? 's' : ''} recebida{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-red hover:bg-primary-red-dark text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
        >
          Funções
        </button>
      </div>

      <Table
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por nome, cargo ou cidade..."
      />

      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        content={modalConfig.content}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        type="default"
        title=""
        hideFooter={true}
        content={
          <div className="p-2">
            <RoleManager onClose={() => setIsRoleModalOpen(false)} />
          </div>
        }
      />
    </div>
  );
};

export default CurriculosPage;
