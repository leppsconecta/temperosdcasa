
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trash2, StickyNote, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Feedback, FeedbackStatus, ModalType, AvaliacaoProduto } from '../types';
import { supabase } from '../lib/supabase';


const FeedbacksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'elogio');
  const queryClient = useQueryClient();

  // Helper para normalizar status (caso venha diferente do banco legado)
  // Helper para normalizar status (caso venha diferente do banco legado)
  const getNormalizedStatus = (status: string) => {
    if (status === 'Pending') return 'Pendente';
    return status;
  };

  // --- QUERY POST FEEDBACKS (Originais) ---
  const { data: feedbackData = [], isLoading: loadingFeedbacks, refetch: refetchFeedbacks } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      // 1. Busca feedbacks via RPC para evitar erro de schema (406)
      const { data: result, error } = await supabase.rpc('manage_feedbacks_mda', {
        action_type: 'SELECT_ALL'
      });

      if (error) throw error;

      if (result) {
        // Ordenação manual: Pendente primeiro
        const sortedResult = [...result].sort((a, b) => {
          const statusA = getNormalizedStatus(a.status);
          const statusB = getNormalizedStatus(b.status);

          if (statusA === 'Pendente' && statusB !== 'Pendente') return -1;
          if (statusA !== 'Pendente' && statusB === 'Pendente') return 1;

          return 0;
        });

        return sortedResult.map((item: any) => ({
          ...item,
          data_original: item.data || item.created_at,
          data: (item.data || item.created_at) ? new Date(item.data || item.created_at).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
          tipo: item.tipo ? item.tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : 'elogio',
          descricao: item.descricao || ''
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // --- QUERY PRODUCT REVIEWS ---
  const { data: productReviewsData = [], isLoading: loadingReviews, refetch: refetchReviews } = useQuery({
    queryKey: ['avaliacoes_produto'],
    queryFn: async () => {
      // 1. Busca avaliações via RPC para evitar erro de schema (406)
      const { data: result, error } = await supabase.rpc('manage_feedbacks_mda', {
        action_type: 'SELECT_REVIEWS'
      });

      if (error) throw error;

      if (result) {
        return result.map((item: any) => ({
          ...item,
          data: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
          tipo: item.tipo || 'Elogio',
          descricao: item.avaliacao
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = loadingFeedbacks || loadingReviews;
  const refetch = () => { refetchFeedbacks(); refetchReviews(); };

  // Configuração Realtime
  useEffect(() => {
    const channel = supabase
      .channel('feedbacks_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'temperos_d_casa',
          table: 'feedbacks'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    const channelProducts = supabase
      .channel('avaliacoes_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'temperos_d_casa',
          table: 'avaliacoes_produto'
        },
        () => {
          refetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(channelProducts);
    };
  }, [refetch]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // 1. Atualiza status via RPC para evitar erro de schema (406)
      const { error } = await supabase.rpc('manage_feedbacks_mda', {
        action_type: 'UPDATE_STATUS',
        f_id: id,
        payload: { status: newStatus }
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status.');
    }
  };

  const handleProductReviewStatusChange = async (id: string, newStatus: string) => {
    try {
      // 2. Atualiza status de avaliação via RPC (reutilizando lógica similar se necessário ou direta por enquanto se avaliacoes for no public)
      // Como avaliacoes_produto também está no temperos_d_casa, vamos precisar de outra RPC ou expandir a manage_feedbacks mas por simplicidade aqui usarei a lógica direta se o usuário permitir, 
      // mas como o Erro 406 é fatal, farei uma RPC genérica se necessário.
      // Por enquanto, vou converter para RPC também para garantir.
      const { error } = await supabase.rpc('manage_feedbacks_mda', {
        action_type: 'UPDATE_STATUS_REVIEW', // Precisamos adicionar essa no banco
        f_id: id,
        payload: { status: newStatus }
      });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['avaliacoes_produto'] });
    } catch (error) {
      console.error('Erro ao atualizar status da avaliação:', error);
      alert('Erro ao atualizar status.');
    }
  };



  const handleDescClick = (e: React.MouseEvent, item: Feedback) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Descrição do feedback',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Nome</p>
              <p className="text-slate-900 dark:text-white">{item.nome}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Código</p>
              <p className="text-primary-red dark:text-red-400 font-bold">{item.codigo}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 uppercase mb-2 tracking-widest font-bold">Descrição</p>
            <div className="text-slate-900 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[60vh] overflow-y-auto text-lg">
              {item.descricao || 'Nenhuma descrição cadastrada.'}
            </div>
          </div>
        </div>
      ),
      maxWidth: 'max-w-3xl'
    });
  };




  // Counts for alert badges
  const getUnresolvedCount = (type: string) => {
    if (type === 'produtos') {
      return productReviewsData.filter((item: any) => getNormalizedStatus(item.status) === 'Pendente').length;
    }
    return feedbackData.filter(item => item.tipo === type && getNormalizedStatus(item.status) !== 'Resolvido').length;
  };

  const tabs = ['elogio', 'reclamacao', 'sugestao', 'denuncia', 'produtos'];

  const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      elogio: 'Elogio',
      reclamacao: 'Reclamação',
      sugestao: 'Sugestão',
      denuncia: 'Denúncia',
      produtos: 'Produtos'
    };
    return labels[tab] || tab;
  };

  const filteredData = activeTab === 'produtos'
    ? productReviewsData
    : feedbackData.filter(item => item.tipo === activeTab);

  // Calcula contadores para os insights
  const stats = {
    total: feedbackData.length,
    elogio: feedbackData.filter(i => i.tipo === 'elogio').length,
    reclamacao: feedbackData.filter(i => i.tipo === 'reclamacao').length,
    sugestao: feedbackData.filter(i => i.tipo === 'sugestao').length,
    denuncia: feedbackData.filter(i => i.tipo === 'denuncia').length
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-500">{index + 1}</span>, className: 'w-12 text-center' },
    { header: 'Data', accessor: 'data', className: 'w-28 text-slate-700 dark:text-slate-300' },
    { header: 'Cód', accessor: (item: Feedback) => <span className="font-bold text-primary-red dark:text-red-400">{item.codigo}</span>, className: 'w-20' },
    { header: 'Tipo', accessor: (item: Feedback) => <span className="text-xs font-bold text-slate-500 uppercase">{getTabLabel(item.tipo)}</span>, className: 'w-24' },
    {
      header: 'Status',
      accessor: (item: Feedback) => (
        <select
          value={getNormalizedStatus(item.status)}
          onChange={(e) => handleStatusChange(item.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-primary-red cursor-pointer outline-none transition-colors font-bold
            ${getNormalizedStatus(item.status) === 'Pendente' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
              getNormalizedStatus(item.status) === 'Resolvendo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'}
          `}
        >
          <option value="Pendente" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendente</option>
          <option value="Resolvendo" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Resolvendo</option>
          <option value="Resolvido" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Resolvido</option>
        </select>
      ),
      className: 'w-32'
    },
    { header: 'Origem', accessor: 'origem', className: 'w-24 text-slate-500 font-medium' },
    { header: 'Nome', accessor: (item: Feedback) => <span className="font-bold text-slate-900 dark:text-white">{item.nome}</span>, className: 'w-40' },
    { header: 'Contato', accessor: 'contato', className: 'w-36 text-slate-600 font-medium' },
    {
      header: 'Descrição',
      accessor: (item: Feedback) => (
        <div
          onClick={(e) => handleDescClick(e, item)}
          className="cursor-pointer group flex items-start gap-2 max-w-[300px]"
          title="Clique para ver detalhes"
        >
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            "{item.descricao || 'Sem descrição'}"
          </p>
          <StickyNote size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        </div>
      ),
      className: 'w-[300px] text-left'
    }
  ];

  const productColumns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-500">{index + 1}</span>, className: 'w-[5%] text-center' },
    { header: 'Data', accessor: 'data', className: 'w-[10%] text-slate-700 dark:text-slate-300' },
    {
      header: 'Status',
      accessor: (item: any) => (
        <select
          value={item.status || 'Pendente'}
          onChange={(e) => handleProductReviewStatusChange(item.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`text-xs px-2 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-colors
            ${item.status === 'Pendente' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
              'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'}
          `}
        >
          <option value="Pendente" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendente</option>
          <option value="Resolvido" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Resolvido</option>
        </select>
      ),
      className: 'w-[15%]'
    },
    { header: 'Categoria', accessor: 'categoria_nome', className: 'w-[15%] text-slate-600 dark:text-slate-400 whitespace-nowrap' },
    { header: 'Produto', accessor: (item: any) => <span className="text-slate-900 dark:text-white">{item.produto_nome}</span>, className: 'w-[20%]' },
    {
      header: 'Tipo',
      accessor: (item: any) => (
        <span className={`text-xs px-2 py-1 rounded-full ${item.tipo === 'Reclamação' ? 'bg-red-50 text-red-600' :
          item.tipo === 'Sugestão' ? 'bg-blue-50 text-blue-600' :
            'bg-emerald-50 text-emerald-600'
          }`}>
          {item.tipo}
        </span>
      ),
      className: 'w-[10%]'
    },
    {
      header: 'Descrição',
      accessor: (item: any) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1" title={item.avaliacao}>
          {item.avaliacao}
        </span>
      ),
      className: 'w-[25%]'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Feedbacks</h1>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Acompanhe a satisfação dos clientes e resolva pendências.</p>
        </div>

        {/* Insights Stats */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 min-w-[5rem]">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Elogios</span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 leading-none mt-1">{stats.elogio}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 min-w-[5rem]">
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Reclam.</span>
            <span className="text-xl font-black text-red-700 dark:text-red-300 leading-none mt-1">{stats.reclamacao}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 min-w-[5rem]">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Sugest.</span>
            <span className="text-xl font-black text-amber-700 dark:text-amber-300 leading-none mt-1">{stats.sugestao}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 min-w-[5rem]">
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Denúnc.</span>
            <span className="text-xl font-black text-orange-700 dark:text-orange-300 leading-none mt-1">{stats.denuncia}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
        {tabs.map(tab => {
          const count = getUnresolvedCount(tab);

          let activeClass = '';
          let inactiveClass = '';
          let badgeClass = '';

          switch (tab) {
            case 'elogio':
              activeClass = 'bg-emerald-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-emerald-600';
              inactiveClass = 'bg-emerald-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-emerald-700 shadow-sm';
              break;
            case 'reclamacao':
              activeClass = 'bg-red-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-red-600';
              inactiveClass = 'bg-red-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-red-700 shadow-sm';
              break;
            case 'sugestao':
              activeClass = 'bg-amber-500 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-amber-500';
              inactiveClass = 'bg-amber-500 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-amber-600 shadow-sm';
              break;
            case 'denuncia':
              activeClass = 'bg-orange-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-orange-600';
              inactiveClass = 'bg-orange-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-orange-700 shadow-sm';
              badgeClass = 'bg-white text-orange-700 shadow-sm';
              break;
            case 'produtos':
              activeClass = 'bg-blue-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-blue-600';
              inactiveClass = 'bg-blue-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-blue-700 shadow-sm';
              break;
            default:
              activeClass = 'bg-indigo-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-indigo-600';
              inactiveClass = 'bg-indigo-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-indigo-700 shadow-sm';
          }

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-6 py-3 rounded-t-lg font-bold text-sm transition-all flex items-center gap-2 border-b-2
                ${activeTab === tab ? activeClass : inactiveClass}
              `}
            >
              {getTabLabel(tab)}
              {count > 0 && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold animate-pulse ${badgeClass}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Table
        columns={activeTab === 'produtos' ? productColumns : columns}
        data={filteredData}
        searchPlaceholder="Buscar por nome, código ou contato..."
      />

      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        content={modalConfig.content}
        maxWidth={modalConfig.maxWidth}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};


export default FeedbacksPage;
