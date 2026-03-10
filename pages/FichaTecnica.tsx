import React, { useState, useMemo, useEffect } from 'react';
import {
  Utensils,
  Package,
  Tags,
  Plus,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  ChefHat,
  X,
  RotateCcw,
  Scale,
  Flame,
  Zap,
  Droplets,
  AlertCircle,
  Save,
  ArrowLeft,
  TrendingUp,
  ListOrdered,
  Printer,
  Upload
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import Table, { Column } from '../components/UI/Table';
import { MateriaPrima, PratoFicha, CategoriaPrato, IngredientePrato } from '../types';
import * as fichaTecnicaService from '../services/fichaTecnicaService';

// Utility class to hide spin buttons
const NO_SPINNER_CLASS = "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]";

// Extended type for Form State (Visual fields not yet in DB)
interface PratoFichaFormState extends PratoFicha {
  sku?: string;
  rendimento: number; // Porções
  unidadeRendimento: string; // un, kg, l
  custoGas?: number;
  custoEnergia?: number;
  custoAgua?: number;
  observacao?: string;
}

const FichaTecnicaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pratos' | 'insumos' | 'categorias'>('pratos');
  const [insumos, setInsumos] = useState<MateriaPrima[]>([]);
  const [categorias, setCategorias] = useState<CategoriaPrato[]>([]);
  const [pratos, setPratos] = useState<PratoFicha[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: 'list' or 'form' (substitui o modal de Prato)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingPrato, setEditingPrato] = useState<PratoFicha | undefined>(undefined);

  // Other Modals (Insumos/Categorias) still use Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'insumo' | 'categoria'>('insumo');
  const [editingInsumo, setEditingInsumo] = useState<MateriaPrima | undefined>(undefined);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(null);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaPrato | null>(null);
  const [newCategoriaName, setNewCategoriaName] = useState('');
  const [showNewCategoriaModal, setShowNewCategoriaModal] = useState(false);
  const [categoriaProdutoPage, setCategoriaProdutoPage] = useState(1);
  const [categoriaSortBy, setCategoriaSortBy] = useState<'nome' | 'lucro' | 'margem'>('nome');
  const PRODUTOS_PER_PAGE = 12;

  // Print states
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printProduct, setPrintProduct] = useState<PratoFicha | null>(null);

  // --- Load Data from Database ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load insumos
      const insumosData = await fichaTecnicaService.getInsumos();
      setInsumos(insumosData.map((i: any) => ({
        id: i.id,
        nome: i.nome,
        unidade: i.unidade,
        custoUnitario: Number(i.custo_unitario)
      })));

      // Load categorias
      const categoriasData = await fichaTecnicaService.getCategorias();
      setCategorias(categoriasData.map((c: any) => ({ id: c.id, nome: c.nome })));

      // Load pratos with ingredientes
      const pratosData = await fichaTecnicaService.getAllPratosWithIngredientes();
      setPratos(pratosData.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        categoriaId: p.categoria_id || '',
        custoTotal: Number(p.custo_total),
        precoVenda: Number(p.preco_venda),
        modoPreparo: p.modo_preparo || '',
        foto: p.foto_url || undefined,
        atualizadoEm: p.updated_at ? new Date(p.updated_at).toLocaleString('pt-BR') : '',
        ingredientes: (p.ingredientes || []).map((ing: any) => ({
          materiaPrimaId: ing.insumo_id,
          quantidade: Number(ing.quantidade)
        })),
        rendimento: p.rendimento,
        unidadeRendimento: p.unidade_rendimento
      })));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handlers ---
  const handleOpenPrato = (prato?: PratoFicha) => {
    setEditingPrato(prato);
    setViewMode('form');
  };

  const handleOpenInsumo = (insumo?: MateriaPrima) => {
    setEditingInsumo(insumo);
    setModalType('insumo');
    setIsModalOpen(true);
  };

  const handleSavePrato = async (prato: PratoFicha) => {
    console.log('handleSavePrato called:', { prato, editingPrato });
    try {
      const pratoData = {
        nome: prato.nome,
        categoria_id: prato.categoriaId || null,
        custo_total: prato.custoTotal,
        preco_venda: prato.precoVenda,
        modo_preparo: prato.modoPreparo || null,
        foto_url: prato.foto || null,
        rendimento: prato.rendimento || 1,
        unidade_rendimento: prato.unidadeRendimento || 'un'
      };
      console.log('pratoData:', pratoData);

      const ingredientesData = (prato.ingredientes || []).map(ing => {
        const insumoId = ing.materiaPrimaId;
        const insumo = insumos.find(i => i.id === insumoId);
        const custoCalculado = insumo ? ing.quantidade * insumo.custoUnitario : 0;
        return {
          insumo_id: insumoId,
          quantidade: ing.quantidade,
          custo_calculado: custoCalculado
        };
      });
      console.log('ingredientesData:', ingredientesData);

      if (editingPrato) {
        console.log('Updating prato with id:', prato.id);
        await fichaTecnicaService.updatePrato(prato.id, pratoData, ingredientesData);
      } else {
        console.log('Creating new prato');
        await fichaTecnicaService.createPrato(pratoData, ingredientesData);
      }
      console.log('Save successful, reloading data...');
      await loadData();
    } catch (err) {
      console.error('Error saving prato:', err);
      alert('Erro ao salvar produto: ' + (err as Error).message);
    }
    setViewMode('list');
    setEditingPrato(undefined);
  };

  const handleDeletePrato = async (id: string) => {
    try {
      const prato = pratos.find(p => p.id === id);
      await fichaTecnicaService.deletePratoWithImage(id, prato?.foto);
      await loadData();
    } catch (err) {
      console.error('Error deleting prato:', err);
    }
  };

  const handleSaveInsumo = async (nome: string, unidade: string, custo: number) => {
    try {
      if (editingInsumo) {
        await fichaTecnicaService.updateInsumo(editingInsumo.id, { nome, unidade, custo_unitario: custo });
      } else {
        await fichaTecnicaService.createInsumo({ nome, unidade, custo_unitario: custo });
      }
      await loadData();
    } catch (err) {
      console.error('Error saving insumo:', err);
    }
    setIsModalOpen(false);
  };

  const handleDeleteInsumo = async (id: string) => {
    try {
      await fichaTecnicaService.deleteInsumo(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting insumo:', err);
    }
  };

  const handleSaveCategoria = async (nome: string) => {
    try {
      await fichaTecnicaService.createCategoria({ nome });
      await loadData();
    } catch (err) {
      console.error('Error saving categoria:', err);
    }
    setIsModalOpen(false);
  };

  const handleUpdateCategoria = async (id: string, nome: string) => {
    try {
      await fichaTecnicaService.updateCategoria(id, { nome });
      await loadData();
    } catch (err) {
      console.error('Error updating categoria:', err);
    }
  };

  const handleDeleteCategoria = async (id: string) => {
    try {
      await fichaTecnicaService.deleteCategoria(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting categoria:', err);
    }
  };

  // --- Sub-components ---

  const InsumoModalContent = () => {
    const [nome, setNome] = useState(editingInsumo?.nome || '');
    const [unidade, setUnidade] = useState(editingInsumo?.unidade || 'kg');
    const [custo, setCusto] = useState(editingInsumo?.custoUnitario || 0);

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nome do Insumo</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm font-medium"
            placeholder="Ex: Arroz Japonês"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Unidade</label>
            <select
              value={unidade}
              onChange={e => setUnidade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white text-sm font-medium"
            >
              <option value="kg">Quilo (kg)</option>
              <option value="l">Litro (L)</option>
              <option value="un">Unidade (un)</option>
              <option value="g">Grama (g)</option>
              <option value="ml">Mililitro (ml)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Custo Unitário</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                value={custo}
                onChange={e => setCusto(parseFloat(e.target.value) || 0)}
                className={`w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm font-bold ${NO_SPINNER_CLASS}`}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
          <button onClick={() => handleSaveInsumo(nome, unidade, custo)} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Salvar</button>
        </div>
      </div>
    );
  };

  const CategoriaModalContent = () => {
    const [nome, setNome] = useState('');
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nome da Categoria</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm font-medium"
            placeholder="Ex: Entradas Quentes"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
          <button onClick={() => handleSaveCategoria(nome)} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Salvar</button>
        </div>
      </div>
    );
  };

  // --- REDESIGNED FICHA TÉCNICA FORM (COMPACT) ---
  const FichaTecnicaForm = ({ initial, onSave, onCancel }: { initial?: PratoFicha, onSave: (p: PratoFicha) => void, onCancel: () => void }) => {
    // Form State
    const [formData, setFormData] = useState<PratoFichaFormState>({
      id: initial?.id || '',
      nome: initial?.nome || '',
      categoriaId: initial?.categoriaId || '',
      custoTotal: initial?.custoTotal || 0,
      precoVenda: initial?.precoVenda || 0,
      modoPreparo: initial?.modoPreparo || '1. ',
      foto: initial?.foto || undefined,
      atualizadoEm: initial?.atualizadoEm || '',
      ingredientes: initial?.ingredientes || [],
      // Visual fields
      sku: 'PRT-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      rendimento: initial?.rendimento || 1,
      unidadeRendimento: initial?.unidadeRendimento || 'un',
      custoGas: 0,
      custoEnergia: 0,
      custoAgua: 0,
      observacao: ''
    });

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | undefined>(initial?.foto);
    const [isUploading, setIsUploading] = useState(false);

    // Insumo Selection State
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [qtdToAdd, setQtdToAdd] = useState<number | ''>('');

    // Preparação Modal State
    const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);

    // Derived Financials
    const custoIngredientes = useMemo(() => {
      return formData.ingredientes.reduce((acc, ing) => {
        const insumo = insumos.find(i => i.id === ing.materiaPrimaId);
        return acc + (insumo ? insumo.custoUnitario * ing.quantidade : 0);
      }, 0);
    }, [formData.ingredientes]);

    const custoOperacionalTotal = (formData.custoGas || 0) + (formData.custoEnergia || 0) + (formData.custoAgua || 0);

    // Custo Unitário Final
    const custoUnitarioFinal = (custoIngredientes + custoOperacionalTotal) / (formData.rendimento || 1);

    // Margem Lucro
    const margemLucro = formData.precoVenda > 0
      ? Math.round(((formData.precoVenda - custoUnitarioFinal) / custoUnitarioFinal) * 100)
      : 0;

    // Actions
    const handleAddIngredient = () => {
      if (!selectedInsumoId || !qtdToAdd) return;
      const newIng: IngredientePrato = { id: Math.random().toString(), materiaPrimaId: selectedInsumoId, quantidade: Number(qtdToAdd) };
      setFormData(prev => ({
        ...prev,
        ingredientes: [...prev.ingredientes, newIng]
      }));
      setSelectedInsumoId('');
      setQtdToAdd('');
    };

    const handleRemoveIngredient = (index: number) => {
      setFormData(prev => ({
        ...prev,
        ingredientes: prev.ingredientes.filter((_, i) => i !== index)
      }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handlePreSave = async () => {
      // Validate required fields
      const errors: string[] = [];
      if (!formData.nome.trim()) errors.push('Nome do produto');
      if (!formData.categoriaId) errors.push('Categoria');
      if (!formData.rendimento || formData.rendimento <= 0) errors.push('Rendimento');
      if (!formData.ingredientes.length) errors.push('Ao menos 1 ingrediente na composição');
      if (!formData.precoVenda || formData.precoVenda <= 0) errors.push('Preço de venda');

      if (errors.length > 0) {
        alert(`Campos obrigatórios:\n\n• ${errors.join('\n• ')}`);
        return;
      }

      setIsUploading(true);
      try {
        let fotoUrl = formData.foto;

        // Upload new image if selected
        if (imageFile) {
          // If editing, delete old image first
          if (initial?.foto && initial.foto !== fotoUrl) {
            try {
              await fichaTecnicaService.deletePratoImage(initial.foto);
            } catch (err) {
              console.error('Error deleting old image:', err);
            }
          }
          // Generate temp ID for new pratos
          const tempId = formData.id || `temp_${Date.now()}`;
          fotoUrl = await fichaTecnicaService.uploadPratoImage(tempId, imageFile);
        }

        const pratoToSave: PratoFicha = {
          id: formData.id,
          nome: formData.nome,
          categoriaId: formData.categoriaId,
          custoTotal: custoUnitarioFinal,
          precoVenda: formData.precoVenda,
          modoPreparo: formData.modoPreparo,
          foto: fotoUrl,
          atualizadoEm: new Date().toLocaleString('pt-BR'),
          ingredientes: formData.ingredientes,
          rendimento: formData.rendimento,
          unidadeRendimento: formData.unidadeRendimento
        };
        onSave(pratoToSave);
      } catch (err) {
        console.error('Error saving prato:', err);
      } finally {
        setIsUploading(false);
      }
    };

    // Sub-modal for Preparação Steps
    const PreparacaoModalContent = () => {
      // Parse steps from string: "1. Step one\n2. Step two"
      const parseSteps = (text: string) => {
        if (!text) return [''];
        // Remove existing numbering if present to let user edit clean text or keep as is?
        // Let's assume user edits raw text or we structure it. User asked for "Etapa 1, 2, 3" to add.
        // Let's split by newline and remove leading numbers for editing
        return text.split('\n').map(line => line.replace(/^\d+\.\s*/, '')).filter(s => s.trim() !== '') || [''];
      };

      const [steps, setSteps] = useState<string[]>(parseSteps(formData.modoPreparo).length ? parseSteps(formData.modoPreparo) : ['']);

      const handleAddStep = () => setSteps([...steps, '']);
      const handleRemoveStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps.length ? newSteps : ['']);
      };
      const handleStepChange = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index] = value;
        setSteps(newSteps);
      };

      const handleSaveSteps = () => {
        // Rebuild string with numbering
        const formatted = steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
        setFormData({ ...formData, modoPreparo: formatted });
        setIsPrepModalOpen(false);
      };

      return (
        <div className="space-y-4 max-h-[60vh] flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="mt-2 text-xs font-bold text-slate-400 w-6 text-right">{idx + 1}.</span>
                <textarea
                  value={step}
                  onChange={e => handleStepChange(idx, e.target.value)}
                  className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:ring-1 focus:ring-blue-500 resize-none h-16"
                  placeholder={`Descreva a etapa ${idx + 1}...`}
                />
                <button
                  onClick={() => handleRemoveStep(idx)}
                  className="mt-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Remover etapa"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddStep}
            className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Adicionar Etapa
          </button>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setIsPrepModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSaveSteps} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Confirmar Etapas</button>
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Preparação */}
        <Modal
          isOpen={isPrepModalOpen}
          onClose={() => setIsPrepModalOpen(false)}
          title="Etapas de Preparação"
          content={<PreparacaoModalContent />}
          type="info"
          maxWidth="max-w-xl"
          hideFooter={true}
        />

        {/* Compact Header */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex item-baseline gap-2">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wide">{initial ? 'Editar Ficha' : 'Nova Ficha'}</h2>
              <span className="text-xs text-slate-400 font-mono">| {formData.sku}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 px-4 border-r border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-400">Custo UN.</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">R$ {custoUnitarioFinal.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-400">Venda</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">R$ {formData.precoVenda.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-slate-400">Margem</p>
                <p className={`text-sm font-black ${margemLucro < 100 ? 'text-amber-500' : 'text-emerald-500'}`}>{margemLucro}%</p>
              </div>
            </div>
            <button onClick={handlePreSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm transform active:scale-95">
              <Save size={16} /> Salvar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* Main Grid: Info + Financials + Tech Specs */}
          <div className="grid grid-cols-12 gap-4 h-full">

            {/* Left Col: Basic Info & Financials Inputs */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-4">
              {/* 1. Identification (Compact) */}
              <section className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-none">
                <div className="flex gap-4">
                  {/* Photo Upload */}
                  <div className="w-36 h-36 shrink-0 relative">
                    <label className="w-full h-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-400 cursor-pointer transition-all overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload size={24} className="mb-1" />
                          <span className="text-[10px] font-medium">Carregar foto</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(undefined);
                          setFormData(prev => ({ ...prev, foto: undefined }));
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Produto</label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={e => setFormData({ ...formData, nome: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Nome do prato..."
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">SKU</label>
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={e => setFormData({ ...formData, sku: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-300 outline-none uppercase text-center"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
                        <select
                          value={formData.categoriaId}
                          onChange={e => setFormData({ ...formData, categoriaId: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
                        >
                          <option value="">Selecione...</option>
                          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Rendimento</label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={formData.rendimento}
                            onChange={e => setFormData({ ...formData, rendimento: parseFloat(e.target.value) || 1 })}
                            className={`w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-center text-slate-800 dark:text-white outline-none ${NO_SPINNER_CLASS}`}
                          />
                          <select
                            value={formData.unidadeRendimento}
                            onChange={e => setFormData({ ...formData, unidadeRendimento: e.target.value })}
                            className="w-24 px-1 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-500 outline-none"
                          >
                            <option value="un">UN</option>
                            <option value="kg">KG</option>
                            <option value="porcao">PORÇÕES</option>
                            <option value="l">LITROS</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Ingredients Table (Stretched Height) */}
              <section className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 min-h-[400px]">
                <div className="flex items-center justify-between mb-3 flex-none">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase flex items-center gap-2"><Package size={14} className="text-blue-500" /> Composição</h3>
                  <span className="text-[10px] font-medium text-slate-400">Total: <b className="text-slate-700 dark:text-slate-200">R$ {custoIngredientes.toFixed(2)}</b></span>
                </div>

                <div className="flex gap-2 mb-3 items-center flex-none">
                  <select
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none dark:text-white font-medium"
                    value={selectedInsumoId}
                    onChange={e => setSelectedInsumoId(e.target.value)}
                  >
                    <option value="">+ Selecionar Ingrediente</option>
                    {insumos.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                  </select>

                  <div className="relative w-24">
                    <input
                      type="number"
                      className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-2 pr-8 py-1.5 text-xs text-center outline-none dark:text-white font-bold ${NO_SPINNER_CLASS}`}
                      placeholder="Qtd"
                      value={qtdToAdd}
                      onChange={e => setQtdToAdd(parseFloat(e.target.value) || '')}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                      {selectedInsumoId ? insumos.find(i => i.id === selectedInsumoId)?.unidade : ''}
                    </span>
                  </div>

                  <button
                    onClick={handleAddIngredient}
                    disabled={!selectedInsumoId || !qtdToAdd}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 -mx-2 px-2 border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="text-left font-semibold pb-2 pl-2">Ingrediente</th>
                        <th className="text-center font-semibold pb-2">Und.</th>
                        <th className="text-center font-semibold pb-2">Qtd.</th>
                        <th className="text-right font-semibold pb-2">R$ Unit.</th>
                        <th className="text-right font-semibold pb-2 pr-2">Total</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {formData.ingredientes.map((ing, idx) => {
                        const insumo = insumos.find(i => i.id === ing.materiaPrimaId);
                        const total = insumo ? insumo.custoUnitario * ing.quantidade : 0;
                        return (
                          <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-2 pl-2 font-medium text-slate-700 dark:text-slate-300">{insumo?.nome}</td>
                            <td className="py-2 text-center text-slate-400 text-[10px]">{insumo?.unidade}</td>
                            <td className="py-2 text-center font-bold text-slate-800 dark:text-white">{ing.quantidade}</td>
                            <td className="py-2 text-right text-slate-500">R$ {insumo?.custoUnitario.toFixed(2)}</td>
                            <td className="py-2 text-right font-bold text-slate-700 dark:text-slate-300 pr-2">R$ {total.toFixed(2)}</td>
                            <td className="py-2 text-center">
                              <button onClick={() => handleRemoveIngredient(idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Col: Pricing & Specs */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
              {/* Pricing Card */}
              <section className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex-none">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={16} className="text-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">Precificação</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Preço de Venda</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                      <input
                        type="number"
                        value={formData.precoVenda}
                        onChange={e => setFormData({ ...formData, precoVenda: parseFloat(e.target.value) || 0 })}
                        className={`w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-lg font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 ${NO_SPINNER_CLASS}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Margem Lucro</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={margemLucro}
                          onChange={e => {
                            const newMargin = parseFloat(e.target.value) || 0;
                            const newPrice = custoUnitarioFinal * (1 + newMargin / 100);
                            setFormData({ ...formData, precoVenda: parseFloat(newPrice.toFixed(2)) });
                          }}
                          className={`w-full pl-2 pr-6 py-1 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs font-bold ${margemLucro < 100 ? 'text-amber-600' : 'text-emerald-600'} outline-none focus:ring-1 focus:ring-blue-500 ${NO_SPINNER_CLASS}`}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Lucro Bruto</p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">R$ {(formData.precoVenda - custoUnitarioFinal).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/50 p-2 rounded-lg mt-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Custo Total UN</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">R$ {custoUnitarioFinal.toFixed(2)}</p>
                  </div>
                </div>
              </section>

              {/* Operational Costs */}
              <section className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex-none">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-amber-500" />
                  <h3 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase">Operacional (Rateio)</h3>
                </div>
                <div className="space-y-2">
                  {[{ label: 'Gás', icon: <Flame size={12} className="text-orange-400" />, field: 'custoGas' },
                  { label: 'Energia', icon: <Zap size={12} className="text-yellow-400" />, field: 'custoEnergia' },
                  { label: 'Água', icon: <Droplets size={12} className="text-blue-400" />, field: 'custoAgua' }]
                    .map((item: any) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {item.icon} {item.label}
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={(formData as any)[item.field] || ''}
                          onChange={e => setFormData({ ...formData, [item.field]: parseFloat(e.target.value) })}
                          className={`w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded text-right text-xs font-bold dark:text-white outline-none ${NO_SPINNER_CLASS}`}
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">R$ {custoOperacionalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              {/* Specs & Obs */}
              <section className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <ListOrdered size={14} className="text-purple-500" />
                  <h3 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase">Dados Técnicos</h3>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Preparação</label>
                  <div
                    onClick={() => setIsPrepModalOpen(true)}
                    className="w-full h-full min-h-[120px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs leading-relaxed dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer overflow-y-auto"
                  >
                    {formData.modoPreparo
                      ? <pre className="whitespace-pre-wrap font-sans">{formData.modoPreparo}</pre>
                      : <span className="text-slate-400 italic">Clique para adicionar etapas de preparo...</span>
                    }
                  </div>
                </div>
              </section>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // --- Main Page Render ---
  return (
    <div className="h-full w-full overflow-hidden flex flex-col">

      {/* View Mode: FORM (Shows inline editor) */}
      {viewMode === 'form' ? (
        <FichaTecnicaForm
          initial={editingPrato}
          onSave={handleSavePrato}
          onCancel={() => {
            setViewMode('list');
            setEditingPrato(undefined);
          }}
        />
      ) : (
        /* View Mode: LIST (Default View) */
        <>
          {/* Other Modals (For Insumos/Categorias - still handled as modals) */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={modalType === 'insumo' ? (editingInsumo ? 'Editar Insumo' : 'Novo Insumo') : 'Nova Categoria'}
            content={modalType === 'insumo' ? <InsumoModalContent /> : <CategoriaModalContent />}
            type={modalType === 'insumo' && editingInsumo ? 'confirm-update' : 'confirm-insert'}
            maxWidth="max-w-md"
            hideFooter={true}
          />

          {/* Print Modal */}
          {printModalOpen && printProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Printer size={20} className="text-emerald-600" />
                  Imprimir Ficha Técnica
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  <span className="font-bold">{printProduct.nome}</span>
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const cat = categorias.find(c => c.id === printProduct.categoriaId);
                      const lucro = printProduct.precoVenda - printProduct.custoTotal;
                      const margem = printProduct.custoTotal > 0 ? Math.round((lucro / printProduct.custoTotal) * 100) : 0;

                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Ficha Técnica - ${printProduct.nome}</title>
                            <style>
                              @page { size: A4; margin: 20mm; }
                              body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
                              h1 { font-size: 24px; margin-bottom: 5px; }
                              h2 { font-size: 16px; margin: 20px 0 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
                              .header { border-bottom: 3px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
                              .category { color: #666; font-size: 14px; }
                              .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }
                              .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
                              .info-label { font-size: 11px; color: #666; text-transform: uppercase; }
                              .info-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
                              .lucro { color: #2563eb; }
                              .margem { color: ${margem < 100 ? '#f59e0b' : '#10b981'}; }
                              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                              th { background: #f5f5f5; font-weight: bold; }
                              .instructions { background: #fafafa; padding: 20px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6; }
                              .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #999; text-align: center; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>${printProduct.nome}</h1>
                              <p class="category">${cat?.nome || 'Sem categoria'}</p>
                            </div>
                            
                            <div class="info-grid">
                              <div class="info-box">
                                <div class="info-label">Rendimento</div>
                                <div class="info-value">${printProduct.rendimento || 1} ${printProduct.unidadeRendimento || 'un'}</div>
                              </div>
                              <div class="info-box">
                                <div class="info-label">Custo Total</div>
                                <div class="info-value">R$ ${printProduct.custoTotal.toFixed(2)}</div>
                              </div>
                              <div class="info-box">
                                <div class="info-label">Preço Venda</div>
                                <div class="info-value">R$ ${printProduct.precoVenda.toFixed(2)}</div>
                              </div>
                              <div class="info-box">
                                <div class="info-label">Lucro</div>
                                <div class="info-value lucro">R$ ${lucro.toFixed(2)}</div>
                              </div>
                            </div>
                            
                            <div style="text-align: center; margin: 15px 0;">
                              <span style="font-size: 14px;">Margem de Lucro: </span>
                              <span class="margem" style="font-size: 24px; font-weight: bold;">${margem}%</span>
                            </div>
                            
                            <h2>Ingredientes / Insumos</h2>
                            <table>
                              <thead>
                                <tr>
                                  <th>Ingrediente</th>
                                  <th style="width: 100px; text-align: center;">Quantidade</th>
                                  <th style="width: 100px; text-align: right;">Custo</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${(printProduct.ingredientes || []).map(ing => {
                          const insumo = insumos.find(i => i.id === ing.insumoId);
                          return `<tr>
                                    <td>${insumo?.nome || 'Desconhecido'}</td>
                                    <td style="text-align: center;">${ing.quantidade} ${insumo?.unidade || ''}</td>
                                    <td style="text-align: right;">R$ ${ing.custoCalculado?.toFixed(2) || '0.00'}</td>
                                  </tr>`;
                        }).join('')}
                              </tbody>
                            </table>
                            
                            ${printProduct.modoPreparo ? `
                              <h2>Modo de Preparo</h2>
                              <div class="instructions">${printProduct.modoPreparo}</div>
                            ` : ''}
                            
                            <div class="footer">
                              Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                            </div>
                          </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                      setPrintModalOpen(false);
                      setPrintProduct(null);
                    }}
                    className="w-full px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    <Printer size={18} />
                    Imprimir Completo
                  </button>

                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Ficha Técnica (Resumo) - ${printProduct.nome}</title>
                            <style>
                              @page { size: A4; margin: 20mm; }
                              body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
                              h1 { font-size: 24px; margin-bottom: 20px; border-bottom: 3px solid #333; padding-bottom: 15px; }
                              h2 { font-size: 16px; margin: 20px 0 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
                              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                              th { background: #f5f5f5; font-weight: bold; }
                              .instructions { background: #fafafa; padding: 20px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6; }
                              .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #999; text-align: center; }
                            </style>
                          </head>
                          <body>
                            <h1>${printProduct.nome}</h1>
                            
                            <h2>Ingredientes / Insumos</h2>
                            <table>
                              <thead>
                                <tr>
                                  <th>Ingrediente</th>
                                  <th style="width: 120px; text-align: center;">Quantidade</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${(printProduct.ingredientes || []).map(ing => {
                          const insumo = insumos.find(i => i.id === ing.insumoId);
                          return `<tr>
                                    <td>${insumo?.nome || 'Desconhecido'}</td>
                                    <td style="text-align: center;">${ing.quantidade} ${insumo?.unidade || ''}</td>
                                  </tr>`;
                        }).join('')}
                              </tbody>
                            </table>
                            
                            ${printProduct.modoPreparo ? `
                              <h2>Modo de Preparo</h2>
                              <div class="instructions">${printProduct.modoPreparo}</div>
                            ` : ''}
                            
                            <div class="footer">
                              Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                            </div>
                          </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                      setPrintModalOpen(false);
                      setPrintProduct(null);
                    }}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                  >
                    <ListOrdered size={18} />
                    Imprimir Resumido
                  </button>
                </div>

                <button
                  onClick={() => { setPrintModalOpen(false); setPrintProduct(null); }}
                  className="w-full mt-4 px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex-none flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
            {[
              { id: 'pratos', label: 'Produtos', icon: <Utensils size={18} /> },
              { id: 'insumos', label: 'Insumos / Ingredientes', icon: <Package size={18} /> },
              { id: 'categorias', label: 'Categorias', icon: <Tags size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id
                  ? 'text-red-600 bg-red-50/30 border-red-600 dark:bg-red-900/10'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/20">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 text-sm font-medium dark:text-white" placeholder={`Buscar em ${activeTab}...`} />
              </div>

              <button
                onClick={() => {
                  if (activeTab === 'pratos') handleOpenPrato();
                  if (activeTab === 'insumos') handleOpenInsumo();
                  if (activeTab === 'categorias') { setModalType('categoria'); setIsModalOpen(true); }
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
              >
                <Plus size={18} strokeWidth={3} />
                {activeTab === 'pratos' && 'Novo Produto'}
                {activeTab === 'insumos' && 'Novo Insumo'}
                {activeTab === 'categorias' && 'Nova Categoria'}
              </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {activeTab === 'pratos' && (
                <Table
                  columns={[
                    { header: 'Nome', accessor: 'nome', className: 'font-bold text-slate-900 dark:text-white text-left pl-4 flex-1 whitespace-nowrap' },
                    {
                      header: 'Categoria',
                      accessor: (p: PratoFicha) => {
                        const cat = categorias.find(c => c.id === p.categoriaId);
                        return <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{cat?.nome || '-'}</span>
                      },
                      className: 'w-32 text-left whitespace-nowrap'
                    },
                    {
                      header: 'Qtd',
                      accessor: (p: PratoFicha) => <span className="font-bold text-slate-600 dark:text-slate-300">{p.rendimento || 1} {p.unidadeRendimento || 'un'}</span>,
                      className: 'text-center w-24 whitespace-nowrap'
                    },
                    { header: 'Custo', accessor: (p: PratoFicha) => <span className="font-bold text-slate-500 dark:text-slate-400">R$ {p.custoTotal.toFixed(2)}</span>, className: 'text-right w-28 whitespace-nowrap' },
                    { header: 'Venda', accessor: (p: PratoFicha) => <span className="font-black text-slate-900 dark:text-white">R$ {p.precoVenda.toFixed(2)}</span>, className: 'text-right w-28 whitespace-nowrap' },
                    {
                      header: '%', accessor: (p: PratoFicha) => {
                        const mg = p.precoVenda > 0 ? Math.round(((p.precoVenda - p.custoTotal) / p.custoTotal) * 100) : 0;
                        return <span className={`font-black ${mg < 100 ? 'text-amber-500' : 'text-emerald-500'}`}>{mg}%</span>
                      }, className: 'text-right w-20 whitespace-nowrap'
                    },
                    {
                      header: 'Lucro', accessor: (p: PratoFicha) => {
                        const lucro = p.precoVenda - p.custoTotal;
                        return <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">R$ {lucro.toFixed(2)}</span>
                      }, className: 'text-right w-28 whitespace-nowrap'
                    },
                    {
                      header: '', accessor: (p: PratoFicha) => (
                        <div className="flex justify-end gap-1 pr-2">
                          <button onClick={() => { setPrintProduct(p); setPrintModalOpen(true); }} className="p-2 text-slate-300 hover:text-emerald-600 transition-colors" title="Imprimir"><Printer size={18} /></button>
                          <button onClick={() => handleOpenPrato(p)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors" title="Editar"><Edit3 size={18} /></button>
                          <button onClick={() => handleDeletePrato(p.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors" title="Excluir"><Trash2 size={18} /></button>
                        </div>
                      ), className: 'w-36 pl-4 whitespace-nowrap'
                    }
                  ]}
                  data={pratos}
                />
              )}

              {activeTab === 'insumos' && (
                <Table
                  columns={[
                    { header: 'Nome', accessor: 'nome', className: 'font-bold text-slate-900 dark:text-white text-left pl-4 w-1/4 whitespace-nowrap' },
                    {
                      header: 'Unidade',
                      accessor: 'unidade',
                      className: 'text-slate-500 text-center w-1/4 whitespace-nowrap'
                    },
                    {
                      header: 'Custo / Unid',
                      accessor: (i: MateriaPrima) => <span className="font-bold text-slate-700 dark:text-slate-300">R$ {i.custoUnitario.toFixed(2)}</span>,
                      className: 'text-right w-1/4 whitespace-nowrap'
                    },
                    {
                      header: '', accessor: (i: MateriaPrima) => (
                        <div className="flex justify-end gap-2 pr-2">
                          <button onClick={() => handleOpenInsumo(i)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit3 size={18} /></button>
                          <button onClick={() => handleDeleteInsumo(i.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                        </div>
                      ), className: 'w-1/4 whitespace-nowrap'
                    }
                  ]}
                  data={insumos}
                />
              )}

              {activeTab === 'categorias' && (
                <div className="flex gap-6 p-6 h-[calc(100vh-150px)]">
                  {/* Sidebar - Sticky */}
                  <div className="w-64 flex-shrink-0 sticky top-0 self-start max-h-full overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Categorias</h3>
                        <button
                          onClick={() => setShowNewCategoriaModal(true)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Mini Modal for New Category */}
                      {showNewCategoriaModal && (
                        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nova Categoria</p>
                          <input
                            type="text"
                            placeholder="Nome da categoria..."
                            value={newCategoriaName}
                            onChange={(e) => setNewCategoriaName(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 mb-3"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setShowNewCategoriaModal(false);
                                setNewCategoriaName('');
                              }}
                              className="flex-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={async () => {
                                if (newCategoriaName.trim()) {
                                  await handleSaveCategoria(newCategoriaName.trim());
                                  setNewCategoriaName('');
                                  setShowNewCategoriaModal(false);
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              Criar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Category List */}
                      <div className="space-y-2">
                        {categorias.map(cat => (
                          <div
                            key={cat.id}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedCategoriaId === cat.id
                              ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                            onClick={() => { setSelectedCategoriaId(cat.id); setCategoriaProdutoPage(1); }}
                          >
                            {editingCategoria?.id === cat.id ? (
                              <input
                                type="text"
                                value={editingCategoria.nome}
                                onChange={(e) => setEditingCategoria({ ...editingCategoria, nome: e.target.value })}
                                onBlur={() => {
                                  if (editingCategoria.nome.trim()) {
                                    handleUpdateCategoria(cat.id, editingCategoria.nome);
                                  }
                                  setEditingCategoria(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && editingCategoria.nome.trim()) {
                                    handleUpdateCategoria(cat.id, editingCategoria.nome);
                                    setEditingCategoria(null);
                                  }
                                }}
                                className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="font-medium text-slate-700 dark:text-slate-300">{cat.nome}</span>
                            )}
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingCategoria(cat); }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteCategoria(cat.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Product Cards Grid */}
                  <div className="flex-1 overflow-y-auto">
                    {selectedCategoriaId ? (() => {
                      const produtosDaCategoria = pratos.filter(p => p.categoriaId === selectedCategoriaId);
                      const qtdProdutos = produtosDaCategoria.length;
                      const mediaMargemPct = qtdProdutos > 0
                        ? Math.round(produtosDaCategoria.reduce((acc, p) => {
                          const lucro = p.precoVenda - p.custoTotal;
                          const margem = p.custoTotal > 0 ? (lucro / p.custoTotal) * 100 : 0;
                          return acc + margem;
                        }, 0) / qtdProdutos)
                        : 0;
                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                              {categorias.find(c => c.id === selectedCategoriaId)?.nome || 'Produtos'}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                <span className="font-bold">{qtdProdutos}</span> produtos
                              </span>
                              <span className={`px-3 py-1 rounded-lg font-bold ${mediaMargemPct < 100 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                                Média: {mediaMargemPct}%
                              </span>
                              <select
                                value={categoriaSortBy}
                                onChange={(e) => { setCategoriaSortBy(e.target.value as any); setCategoriaProdutoPage(1); }}
                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20"
                              >
                                <option value="nome">Ordenar: Nome</option>
                                <option value="lucro">Ordenar: Maior Lucro</option>
                                <option value="margem">Ordenar: Maior %</option>
                              </select>
                            </div>
                          </div>
                          {(() => {
                            // Sort products
                            const sortedProducts = [...produtosDaCategoria].sort((a, b) => {
                              if (categoriaSortBy === 'lucro') {
                                const lucroA = a.precoVenda - a.custoTotal;
                                const lucroB = b.precoVenda - b.custoTotal;
                                return lucroB - lucroA; // Descending
                              }
                              if (categoriaSortBy === 'margem') {
                                const margemA = a.custoTotal > 0 ? ((a.precoVenda - a.custoTotal) / a.custoTotal) * 100 : 0;
                                const margemB = b.custoTotal > 0 ? ((b.precoVenda - b.custoTotal) / b.custoTotal) * 100 : 0;
                                return margemB - margemA; // Descending
                              }
                              return a.nome.localeCompare(b.nome); // Alphabetical
                            });

                            const totalPages = Math.ceil(qtdProdutos / PRODUTOS_PER_PAGE);
                            const startIndex = (categoriaProdutoPage - 1) * PRODUTOS_PER_PAGE;
                            const paginatedProducts = sortedProducts.slice(startIndex, startIndex + PRODUTOS_PER_PAGE);

                            return (
                              <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                  {paginatedProducts.map(produto => {
                                    const lucro = produto.precoVenda - produto.custoTotal;
                                    const margem = produto.custoTotal > 0 ? Math.round((lucro / produto.custoTotal) * 100) : 0;
                                    return (
                                      <div
                                        key={produto.id}
                                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                      >
                                        {/* Image Placeholder */}
                                        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                                          <span className="text-4xl">🍽️</span>
                                        </div>
                                        {/* Info */}
                                        <div className="p-3">
                                          <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2 line-clamp-2">{produto.nome}</h4>
                                          <div className="space-y-0.5 text-[10px]">
                                            <div className="flex justify-between">
                                              <span className="text-slate-500">Custo:</span>
                                              <span className="font-medium text-slate-700 dark:text-slate-300">R$ {produto.custoTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-500">Venda:</span>
                                              <span className="font-bold text-slate-900 dark:text-white">R$ {produto.precoVenda.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-500">Lucro:</span>
                                              <span className="font-bold text-blue-600 dark:text-blue-400">R$ {lucro.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-slate-500">%:</span>
                                              <span className={`font-bold ${margem < 100 ? 'text-amber-500' : 'text-emerald-500'}`}>{margem}%</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {qtdProdutos === 0 && (
                                    <div className="col-span-full text-center py-12 text-slate-400">
                                      Nenhum produto nesta categoria.
                                    </div>
                                  )}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                      onClick={() => setCategoriaProdutoPage(p => Math.max(1, p - 1))}
                                      disabled={categoriaProdutoPage === 1}
                                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      ← Anterior
                                    </button>
                                    <span className="px-4 py-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                      {categoriaProdutoPage} / {totalPages}
                                    </span>
                                    <button
                                      onClick={() => setCategoriaProdutoPage(p => Math.min(totalPages, p + 1))}
                                      disabled={categoriaProdutoPage === totalPages}
                                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      Próximo →
                                    </button>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      );
                    })() : (
                      <div className="flex items-center justify-center h-64 text-slate-400">
                        <div className="text-center">
                          <p className="text-lg mb-2">👈 Selecione uma categoria</p>
                          <p className="text-sm">Os produtos serão exibidos aqui</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FichaTecnicaPage;
