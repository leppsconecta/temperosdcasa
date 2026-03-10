import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Grid3X3,

  ArrowUp,
  ArrowDown,
  Save,
  X,
  GripVertical,
  Check,
  Upload,
  Video,
  Loader2,
  Filter,
  Search,
  Layers,
  MoreVertical,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import { ModalType } from '../types';
import { supabase } from '../lib/supabase';

// Produto incluído em um combo
interface ComboProduct {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: string; // Ex: "3"
  unidade: 'Unid' | 'g' | 'ml'; // Unit type
  foto?: string;
  isFromCardapio?: boolean;
  originalItemId?: string;
  useOriginalDescription?: boolean;
}

interface CardapioItem {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  foto?: string;
  ativo: boolean;
  variacoes?: { nome: string; preco: string }[];
  isCombo?: boolean;
  comboItens?: ComboProduct[];
  showSavings?: boolean; // Show savings info
  savingsAmount?: string; // Amount saved, e.g., "15,00"
  visivel?: boolean; // New property for visibility
  categoria_id?: string; // Add category reference
  shopee_link?: string;
  mercadolivre_link?: string;
  amazon_link?: string;
  aliexpress_link?: string;
}

interface DestaqueMidia {
  url: string;
  type: 'image' | 'video';
  duration?: number;
}

interface DestaqueConteudo {
  id: string;
  categoriaId: string;
  titulo: string;
  descricao: string;
  preco?: string;
  midias: DestaqueMidia[];
  ativo: boolean;
}

interface CardapioCategoria {
  id: string;
  nome: string;
  tipo?: 'padrao' | 'especial';
  destaque?: DestaqueConteudo;
  itens: CardapioItem[];
}


const INITIAL_CATEGORIAS: CardapioCategoria[] = [
  {
    id: 'cat-1',
    nome: 'Bebidas',
    itens: [
      { id: 'item-1', nome: 'Coca-Cola 350ml', descricao: 'Refrigerante gelado', preco: '6,00', foto: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', ativo: true, visivel: true },
      { id: 'item-2', nome: 'Suco Natural Laranja', descricao: 'Suco de laranja natural 500ml', preco: '12,00', foto: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', ativo: true, visivel: true },
      { id: 'item-3', nome: 'Água Mineral 500ml', descricao: 'Água mineral sem gás', preco: '4,00', foto: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400', ativo: true, visivel: true },
      { id: 'item-4', nome: 'Cerveja Heineken', descricao: 'Long neck 330ml', preco: '14,00', foto: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', ativo: true, visivel: true },
    ]
  },
  {
    id: 'cat-2',
    nome: 'Pratos Quentes',
    itens: [
      { id: 'item-5', nome: 'Filé à Parmegiana', descricao: 'Filé empanado com molho de tomate e queijo gratinado, arroz e fritas', preco: '58,90', foto: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400', ativo: true },
      { id: 'item-6', nome: 'Risoto de Camarão', descricao: 'Arroz arbóreo cremoso com camarões salteados', preco: '72,00', foto: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=400', ativo: true },
      { id: 'item-7', nome: 'Lasanha Bolonhesa', descricao: 'Massa fresca, molho bolonhesa e bechamel', preco: '45,00', foto: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400', ativo: true },
    ]
  },
  {
    id: 'cat-3',
    nome: 'Pratos Frios',
    itens: [
      { id: 'item-8', nome: 'Salada Caesar', descricao: 'Alface romana, croutons, parmesão e molho caesar', preco: '32,00', foto: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', ativo: true },
      { id: 'item-9', nome: 'Carpaccio', descricao: 'Fatias finas de filé mignon com rúcula e parmesão', preco: '48,00', foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', ativo: true },
    ]
  },
  {
    id: 'cat-4',
    nome: 'Sobremesas',
    itens: [
      { id: 'item-10', nome: 'Petit Gateau', descricao: 'Bolo de chocolate com recheio cremoso e sorvete', preco: '28,00', foto: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', ativo: true },
      { id: 'item-11', nome: 'Pudim de Leite', descricao: 'Pudim tradicional com calda de caramelo', preco: '18,00', foto: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', ativo: true },
      { id: 'item-12', nome: 'Brownie com Sorvete', descricao: 'Brownie de chocolate com sorvete de creme', preco: '24,00', foto: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400', ativo: true },
    ]
  },
  {
    id: 'cat-5',
    nome: 'Porções',
    itens: [
      { id: 'item-13', nome: 'Batata Frita', descricao: 'Porção de batata frita crocante', preco: '25,00', foto: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', ativo: true },
      { id: 'item-14', nome: 'Onion Rings', descricao: 'Anéis de cebola empanados', preco: '28,00', foto: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', ativo: true },
      { id: 'item-15', nome: 'Mix de Petiscos', descricao: 'Coxinha, bolinha de queijo e pastéis', preco: '45,00', foto: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f25?w=400', ativo: true },
      {
        id: 'combo-1',
        nome: 'Combo Happy Hour',
        descricao: 'Perfeito para compartilhar! Inclui nossas melhores porções e bebidas.',
        preco: '89,90',
        foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        ativo: true,
        isCombo: true,
        showSavings: true,
        savingsAmount: '25,00',
        comboItens: [
          { id: 'cp-1', nome: 'Batata Frita', descricao: 'Porção de batata frita crocante', quantidade: '1', unidade: 'Unid' as const, isFromCardapio: true },
          { id: 'cp-2', nome: 'Onion Rings', descricao: 'Anéis de cebola empanados', quantidade: '1', unidade: 'Unid' as const, isFromCardapio: true },
          { id: 'cp-3', nome: 'Cerveja Heineken', descricao: 'Long neck 330ml', quantidade: '4', unidade: 'Unid' as const, isFromCardapio: true },
        ]
      },
    ]
  },
];

const CardapioPage: React.FC = () => {
  const [categorias, setCategorias] = useState<CardapioCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCatId, setActiveCatId] = useState<string>('cat-1');

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [editingItem, setEditingItem] = useState<CardapioItem | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    foto: '',
    visivel: true,
    categoria_id: '',
    variacoes: [] as { nome: string; preco: string }[],
    shopee_link: '',
    mercadolivre_link: '',
    amazon_link: '',
    aliexpress_link: ''
  });
  const [showLinkInputs, setShowLinkInputs] = useState({
    shopee: false,
    mercadolivre: false,
    amazon: false,
    aliexpress: false
  });
  const [tempId, setTempId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Category name editing

  // Category name editing
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

  // Drag and drop state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Category Drag and drop state
  const [draggedCatId, setDraggedCatId] = useState<string | null>(null);
  const [dragOverCatId, setDragOverCatId] = useState<string | null>(null);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combo modal state
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<CardapioItem | null>(null);
  const [comboFormData, setComboFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    foto: '',
    showSavings: false,
    savingsAmount: ''
  });
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);
  const [newComboProduct, setNewComboProduct] = useState<{
    nome: string;
    descricao: string;
    quantidade: string;
    unidade: 'Unid' | 'g' | 'ml';
    useOriginalDescription: boolean;
  }>({ nome: '', descricao: '', quantidade: '', unidade: 'Unid', useOriginalDescription: true });
  const [selectedProduct, setSelectedProduct] = useState<(CardapioItem & { categoryName: string }) | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const comboFileInputRef = useRef<HTMLInputElement>(null);
  const [isComboUploading, setIsComboUploading] = useState(false);

  // Add dropdown state
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Hero images state (up to 3 images for menu cover)
  interface HeroImage {
    id: string;
    foto: string;
    titulo: string; // max 20 characters
    subtitulo: string; // max 50 characters
    showDescription: boolean;
  }
  const [heroImagesExpanded, setHeroImagesExpanded] = useState(false);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([
    { id: 'hero-1', foto: '', titulo: '', subtitulo: '', showDescription: false },
    { id: 'hero-2', foto: '', titulo: '', subtitulo: '', showDescription: false },
    { id: 'hero-3', foto: '', titulo: '', subtitulo: '', showDescription: false }
  ]);
  const [uploadingHeroIndex, setUploadingHeroIndex] = useState<number | null>(null);
  const heroFileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Section expanded states
  const [productsExpanded, setProductsExpanded] = useState(true); // Default expanded

  // Menu Online state
  const [menuOnlineEnabled, setMenuOnlineEnabled] = useState(true);
  const [isUpdatingMenuStatus, setIsUpdatingMenuStatus] = useState(false);

  // Estado para upload de mídia (Categoria Especial)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Function to focus on one section and collapse others
  const focusSection = (section: 'hero' | 'products', resetCategory = false, shouldScroll = true) => {
    setHeroImagesExpanded(section === 'hero');
    setProductsExpanded(section === 'products');

    if (resetCategory && categorias.length > 0) {
      setActiveCatId(categorias[0].id);
    }

    // Scroll to top only if requested
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Custom Modals State
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{ isOpen: boolean, categoryId: string | null }>({ isOpen: false, categoryId: null });
  const [deleteItemModal, setDeleteItemModal] = useState<{ isOpen: boolean, itemId: string | null }>({ isOpen: false, itemId: null });
  const [addCategoryModal, setAddCategoryModal] = useState<{ isOpen: boolean, name: string, type: 'padrao' | 'especial' }>({ isOpen: false, name: '', type: 'padrao' });
  const [itemMenuOpen, setItemMenuOpen] = useState<string | null>(null);
  const [itemMenuPosition, setItemMenuPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

  // Description Modal State
  const [descModalOpen, setDescModalOpen] = useState(false);
  const [editingCatIdForDesc, setEditingCatIdForDesc] = useState<string | null>(null);
  const [tempDesc, setTempDesc] = useState('');



  // ... (rest of the code)

  const handleAddCategoria = () => {
    setAddCategoryModal({ isOpen: true, name: '', type: 'padrao' });
  };

  const handleConfirmAddCategoria = async () => {
    if (addCategoryModal.name.trim()) {
      try {
        const { data, error } = await supabase
          .schema('temperos_d_casa')
          .from('categorias')
          .insert({
            nome: addCategoryModal.name.trim(),
            ordem: categorias.length,
            tipo: addCategoryModal.type
          })
          .select()
          .single();

        if (error) throw error;

        // If special, create empty destaque entry
        if (addCategoryModal.type === 'especial') {
          await supabase
            .schema('temperos_d_casa')
            .from('destaques_conteudo')
            .insert({ categoria_id: data.id, midias: [] });
        }

        const newCat: CardapioCategoria = {
          id: data.id,
          nome: data.nome,
          tipo: data.tipo as 'padrao' | 'especial',
          destaque: addCategoryModal.type === 'especial' ? { id: 'temp', categoriaId: data.id, titulo: '', descricao: '', midias: [], ativo: true } : undefined,
          itens: []
        };
        setCategorias([...categorias, newCat]);
        setActiveCatId(newCat.id);
        setAddCategoryModal({ isOpen: false, name: '', type: 'padrao' });
      } catch (error: any) {
        console.error('Error adding category:', error);
        showToast('Erro ao adicionar categoria: ' + (error.message || 'Erro desconhecido.'), 'error');
      }
    }
  };

  // Get all products from all categories for autocomplete
  const allProducts = categorias.flatMap(cat =>
    cat.itens.filter(item => !item.isCombo).map(item => ({ ...item, categoryName: cat.nome }))
  );

  // Filtered products for autocomplete
  const filteredProducts = productSearchQuery.length >= 1
    ? allProducts.filter(p =>
      p.nome.toLowerCase().includes(productSearchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

  // File upload handler with validations
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      showToast('Formato não suportado. Use imagens ou vídeos.', 'error');
      return;
    }

    // Size validation: 10MB for images, 90MB for videos
    const maxSize = isVideo ? 90 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`Arquivo muito grande. Limite: ${isVideo ? '90MB' : '10MB'}`, 'error');
      return;
    }

    // Video duration validation (max 30 seconds)
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';

      const durationCheck = new Promise<boolean>((resolve) => {
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert('Vídeo muito longo. Limite: 30 segundos.');
            resolve(false);
          } else {
            resolve(true);
          }
        };
        video.onerror = () => {
          alert('Erro ao processar o vídeo.');
          resolve(false);
        };
      });

      video.src = URL.createObjectURL(file);
      const isValid = await durationCheck;
      if (!isValid) return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      // Use existing ID, temp ID, or generate new temp ID
      const fileId = editingItem?.id || tempId || crypto.randomUUID();
      if (!editingItem && !tempId) setTempId(fileId);

      const fileName = `${fileId}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      // 1. Delete old image/video if exists
      if (formData.foto) {
        const oldPath = extractPathFromUrl(formData.foto);
        if (oldPath) {
          await supabase.storage
            .from('cardapio')
            .remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('cardapio')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cardapio')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, foto: publicUrl }));
      setMediaType(isVideo ? 'video' : 'image');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showToast('Erro ao fazer upload: ' + error.message, 'error');
    } finally {
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeCategory = categorias.find(c => c.id === activeCatId);

  // Check scroll capability
  const checkScroll = () => {
    const container = tabsContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 5);
    }
  };

  // Fetch data on mount
  const fetchData = async () => {
    setIsLoading(true);

    // Timeout de segurança: se o banco demorar mais de 10s, destrava a tela
    const safetyTimeout = setTimeout(() => {
      setIsLoading((loading) => {
        if (loading) {
          showToast('Demora na resposta do banco. Exibindo dados locais ou vazios.', 'info');
          return false;
        }
        return loading;
      });
    }, 10000);

    try {
      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .schema('temperos_d_casa')
        .from('categorias')
        .select('*')
        .order('ordem', { ascending: true });

      if (catError) throw catError;

      // Fetch special content (destaques)
      const { data: destaquesData, error: destaquesError } = await supabase
        .schema('temperos_d_casa')
        .from('destaques_conteudo')
        .select('*');

      if (destaquesError && destaquesError.code !== '42P01') console.error('Error fetching destaques:', destaquesError);

      // Fetch products for these categories
      const { data: prodData, error: prodError } = await supabase
        .schema('temperos_d_casa')
        .from('produtos')
        .select('*')
        .order('ordem', { ascending: true });

      if (prodError) throw prodError;

      // Fetch combo items
      const { data: comboItemData, error: comboItemError } = await supabase
        .schema('temperos_d_casa')
        .from('combo_produtos')
        .select('*');

      if (comboItemError) throw comboItemError;

      // Format data
      const formattedCategorias: CardapioCategoria[] = catData.map(cat => ({
        id: cat.id,
        nome: cat.nome,
        tipo: cat.tipo || 'padrao',
        destaque: destaquesData?.find(d => d.categoria_id === cat.id),
        itens: prodData
          .filter(p => p.categoria_id === cat.id)
          .map(p => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao || '',
            preco: p.preco?.toString().replace('.', ',') || '0,00',
            foto: p.foto_url,
            ativo: p.ativo ?? true,
            isCombo: p.is_combo ?? false,
            showSavings: p.show_savings ?? false,
            savingsAmount: p.savings_amount?.toString().replace('.', ',') || '',
            visivel: p.visivel ?? true,
            categoria_id: cat.id,
            variacoes: p.variacoes ? p.variacoes.map((v: any) => ({ ...v, preco: Number(v.preco).toFixed(2).replace('.', ',') })) : [],
            comboItens: comboItemData
              .filter(ci => ci.combo_id === p.id)
              .map(ci => ({
                id: ci.id,
                nome: ci.nome,
                descricao: ci.descricao,
                quantidade: ci.quantidade,
                unidade: ci.unidade as any,
                foto: ci.foto_url,
                isFromCardapio: !!ci.produto_id,
                originalItemId: ci.produto_id
              }))
          }))
      }));

      setCategorias(formattedCategorias);

      // Fetch Menu Status
      try {
        const { data: configData } = await supabase
          .schema('temperos_d_casa')
          .from('config')
          .select('value')
          .eq('key', 'menu_online_enabled')
          .single();

        if (configData) {
          setMenuOnlineEnabled(configData.value === 'true');
        } else {
          // Default to enabled if not found
          setMenuOnlineEnabled(true);
        }
      } catch (e) {
        console.warn('Menu config not found');
      }

      // Fetch Hero Images
      try {
        const { data: heroData, error: heroError } = await supabase
          .schema('temperos_d_casa')
          .from('hero_images')
          .select('*')
          .order('ordem', { ascending: true });

        if (!heroError && heroData && heroData.length > 0) {
          const formattedHeroes = [0, 1, 2].map(idx => {
            const h = heroData.find(hd => hd.ordem === idx);
            return h ? {
              id: h.id,
              foto: h.foto_url,
              titulo: h.titulo || '',
              subtitulo: h.subtitulo || '',
              showDescription: h.show_description ?? false
            } : { id: `hero-${idx}`, foto: '', titulo: '', subtitulo: '', showDescription: false };
          });
          setHeroImages(formattedHeroes);
        }
      } catch (e) {
        console.warn('Hero images table might not be ready yet.');
      }

    } catch (error: any) {
      console.error('Error fetching cardapio data:', error);
      // Only alert if it's not a common "table not found" during setup
      if (error.code !== 'PGRST116' && error.code !== '42P01') {
        showToast('Erro ao carregar dados: ' + error.message, 'error');
      }
      // Fallback para evitar tela branca eterna em caso de erro grave
      if (categorias.length === 0) {
        setCategorias(INITIAL_CATEGORIAS); // Dados de exemplo/fallback
      }
    } finally {
      clearTimeout(safetyTimeout);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categorias]);



  const toggleDestaqueStatus = async (category: CardapioCategoria) => {
    if (!category.destaque) return;

    const newStatus = !category.destaque.ativo;

    try {
      const { error } = await supabase
        .schema('temperos_d_casa')
        .from('destaques_conteudo')
        .update({ ativo: newStatus })
        .eq('id', category.destaque.id);

      if (error) throw error;

      setCategorias(prev => prev.map(c => {
        if (c.id === category.id && c.destaque) {
          return { ...c, destaque: { ...c.destaque, ativo: newStatus } };
        }
        return c;
      }));

    } catch (error) {
      console.error('Error toggling destaque status:', error);
      alert('Erro ao alterar status.');
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };



  const handleDeleteCategoria = (id: string) => {
    setDeleteCategoryModal({ isOpen: true, categoryId: id });
  };

  const handleConfirmDeleteCategoria = async () => {
    if (deleteCategoryModal.categoryId) {
      try {
        const categoryToDelete = categorias.find(c => c.id === deleteCategoryModal.categoryId);

        // 1. Delete associated Storage files
        if (categoryToDelete) {
          const filesToDelete: string[] = [];

          // Collect Product Images
          categoryToDelete.itens.forEach(item => {
            if (item.foto) {
              const oldPath = extractPathFromUrl(item.foto);
              if (oldPath) filesToDelete.push(oldPath);
            }
          });

          // Collect Destaque Media
          if (categoryToDelete.destaque && categoryToDelete.destaque.midias) {
            categoryToDelete.destaque.midias.forEach(midia => {
              if (midia.url) {
                const oldPath = extractPathFromUrl(midia.url);
                if (oldPath) filesToDelete.push(oldPath);
              }
            });
          }

          // Execute Batch Delete if files exist
          if (filesToDelete.length > 0) {
            const { error: storageError } = await supabase.storage
              .from('cardapio')
              .remove(filesToDelete);

            if (storageError) {
              console.error('Error deleting files from storage:', storageError);
              // We continue to delete from DB even if specific files fail, 
              // or we could stop. Usually better to clean up DB even if artifacts remain.
            }
          }
        }

        // 2. Delete from Database
        const { error } = await supabase
          .schema('temperos_d_casa')
          .from('categorias')
          .delete()
          .eq('id', deleteCategoryModal.categoryId);

        if (error) throw error;

        // 3. Update Local State
        setCategorias(categorias.filter(c => c.id !== deleteCategoryModal.categoryId));
        if (activeCatId === deleteCategoryModal.categoryId && categorias.length > 1) {
          const remaining = categorias.filter(c => c.id !== deleteCategoryModal.categoryId);
          if (remaining.length > 0) {
            setActiveCatId(remaining[0].id);
          }
        }
        setDeleteCategoryModal({ isOpen: false, categoryId: null });
        showToast('Categoria e dados associados excluídos com sucesso!', 'success');

      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Erro ao excluir categoria do banco de dados.');
      }
    }
  };

  const handleUpdateCategoryName = async (id: string) => {
    if (editingCategoryName.trim()) {
      try {
        const { error } = await supabase
          .schema('temperos_d_casa')
          .from('categorias')
          .update({ nome: editingCategoryName.trim() })
          .eq('id', id);

        if (error) throw error;

        setCategorias(prev => prev.map(cat =>
          cat.id === id ? { ...cat, nome: editingCategoryName.trim() } : cat
        ));
      } catch (error) {
        console.error('Error updating category name:', error);
        alert('Erro ao atualizar nome da categoria.');
      }
    }
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const startEditingCategory = (cat: CardapioCategoria) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.nome);
  };

  // Drag and drop handlers
  const handleDragStart = (itemId: string) => {
    setDraggedItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (itemId !== draggedItemId) {
      setDragOverItemId(itemId);
    }
  };

  const handleDrop = (targetItemId: string) => {
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    setCategorias(prev => prev.map(cat => {
      if (cat.id === activeCatId) {
        const items = [...cat.itens];
        const draggedIdx = items.findIndex(i => i.id === draggedItemId);
        const targetIdx = items.findIndex(i => i.id === targetItemId);

        if (draggedIdx !== -1 && targetIdx !== -1) {
          const [draggedItem] = items.splice(draggedIdx, 1);
          items.splice(targetIdx, 0, draggedItem);
        }

        return { ...cat, itens: items };
      }
      return cat;
    }));

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  // Category Drag & Drop Handlers
  const handleDragStartCat = (catId: string) => {
    setDraggedCatId(catId);
  };

  const handleDragOverCat = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    if (catId !== draggedCatId) {
      setDragOverCatId(catId);
    }
  };

  const handleDropCat = async (targetCatId: string) => {
    if (!draggedCatId || draggedCatId === targetCatId) {
      setDraggedCatId(null);
      setDragOverCatId(null);
      return;
    }

    const draggedIdx = categorias.findIndex(c => c.id === draggedCatId);
    const targetIdx = categorias.findIndex(c => c.id === targetCatId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const newCategorias = [...categorias];
      const [movedCat] = newCategorias.splice(draggedIdx, 1);
      newCategorias.splice(targetIdx, 0, movedCat);

      setCategorias(newCategorias);

      // Persist new order to Supabase
      try {
        const updates = newCategorias.map((cat, index) => ({
          id: cat.id,
          ordem: index
        }));

        // We need to update each one. 
        // For efficiency in a real app might use a stored proc, but here we'll loop or standard update.
        // Supabase upsert with id match works well.

        // Let's do a batch upsert if possible, but we need all fields required by table? 
        // Usually update is better per row if we don't have all data.
        // Or cleaner: iterate.

        for (const update of updates) {
          await supabase
            .schema('temperos_d_casa')
            .from('categorias')
            .update({ ordem: update.ordem })
            .eq('id', update.id);
        }

      } catch (error) {
        console.error('Error updating category order:', error);
      }
    }

    setDraggedCatId(null);
    setDragOverCatId(null);
  };

  const handleDragEndCat = () => {
    setDraggedCatId(null);
    setDragOverCatId(null);
  };

  // Combo functions
  const openComboModal = (combo?: CardapioItem) => {
    setEditingCombo(combo || null);
    setComboFormData({
      nome: combo?.nome || '',
      descricao: combo?.descricao || '',
      preco: combo?.preco || '',
      foto: combo?.foto || '',
      showSavings: combo?.showSavings || false,
      savingsAmount: combo?.savingsAmount || '',
      shopee_link: combo?.shopee_link || '',
      mercadolivre_link: combo?.mercadolivre_link || '',
      amazon_link: combo?.amazon_link || '',
      aliexpress_link: combo?.aliexpress_link || ''
    });
    setComboProducts(combo?.comboItens || []);
    setShowLinkInputs({
      shopee: !!combo?.shopee_link,
      mercadolivre: !!combo?.mercadolivre_link,
      amazon: !!combo?.amazon_link,
      aliexpress: !!combo?.aliexpress_link
    });
    setNewComboProduct({ nome: '', descricao: '', quantidade: '', unidade: 'Unid', useOriginalDescription: true });
    setProductSearchQuery('');
    setShowProductSuggestions(false);
    setComboModalOpen(true);
  };

  // Combo file upload handler
  const handleComboFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Apenas imagens são permitidas para combos.', 'error');
      return;
    }

    // Size validation: 10MB for images
    if (file.size > 10 * 1024 * 1024) {
      showToast('Imagem muito grande. Limite: 10MB', 'error');
      return;
    }

    setIsComboUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `combos/${fileName}`;

      // 1. Delete old image if exists
      if (comboFormData.foto) {
        const oldPath = extractPathFromUrl(comboFormData.foto);
        if (oldPath) {
          await supabase.storage
            .from('cardapio')
            .remove([oldPath]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('cardapio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cardapio')
        .getPublicUrl(filePath);

      setComboFormData(prev => ({ ...prev, foto: publicUrl }));
    } catch (error: any) {
      console.error('Error uploading combo image:', error);
      showToast('Erro ao fazer upload da imagem.', 'error');
    } finally {
      setIsComboUploading(false);
    }

    if (comboFileInputRef.current) {
      comboFileInputRef.current.value = '';
    }
  };

  // Helper to extract storage path from public URL
  const extractPathFromUrl = (url: string) => {
    if (!url) return null;
    try {
      // Expected format: .../storage/v1/object/public/cardapio/hero/filename.ext
      const parts = url.split('/cardapio/');
      if (parts.length > 1) return parts[1];
      return null;
    } catch (e) {
      return null;
    }
  };

  // Hero image upload handler
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadingHeroIndex(index);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      // 1. Delete old image if exists
      const oldPath = extractPathFromUrl(heroImages[index].foto);
      if (oldPath) {
        await supabase.storage
          .from('cardapio')
          .remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('cardapio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cardapio')
        .getPublicUrl(filePath);

      setHeroImages(prev => {
        const next = prev.map((img, idx) =>
          idx === index ? { ...img, foto: publicUrl } : img
        );
        // Auto-save after state update
        persistHeroItem(index, next[index]);
        return next;
      });
    } catch (error: any) {
      console.error('Error uploading hero image:', error);
      alert('Erro ao fazer upload da imagem de capa: ' + (error.message || 'Erro desconhecido.'));
    } finally {
      setUploadingHeroIndex(null);
    }

    if (heroFileInputRefs[index]?.current) {
      heroFileInputRefs[index].current!.value = '';
    }
  };

  // Helper function to persist a single hero item to DB
  const persistHeroItem = async (index: number, updatedItem?: HeroImage) => {
    const hero = updatedItem || heroImages[index];
    if (!hero) return;

    const payload = {
      foto_url: hero.foto,
      titulo: hero.titulo,
      subtitulo: hero.subtitulo,
      show_description: hero.showDescription,
      ordem: index
    };

    try {
      if (hero.id && !hero.id.startsWith('hero-')) {
        await supabase
          .schema('temperos_d_casa')
          .from('hero_images')
          .update(payload)
          .eq('id', hero.id);
      } else {
        const { data, error } = await supabase
          .schema('temperos_d_casa')
          .from('hero_images')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          // Update local ID to avoid duplicates on next save
          setHeroImages(prev => prev.map((img, idx) =>
            idx === index ? { ...img, id: data.id } : img
          ));
        }
      }
    } catch (error) {
      console.error('Error persisting hero item:', error);
    }
  };

  const handleSaveHero = async () => {
    // This function is still here for bulk save if needed, but the button is gone
    try {
      const promises = heroImages.map((_, idx) => persistHeroItem(idx));
      await Promise.all(promises);
      showToast('Imagens salvas!', 'success');
    } catch (error) {
      console.error('Error saving hero images:', error);
    }
  };

  // Update hero image field
  const updateHeroImageField = (index: number, field: 'titulo' | 'subtitulo' | 'showDescription', value: string | boolean) => {
    setHeroImages(prev => {
      const next = prev.map((img, idx) =>
        idx === index ? { ...img, [field]: value } : img
      );
      // Auto-save
      persistHeroItem(index, next[index]);
      return next;
    });
  };

  // Remove hero image
  const removeHeroImage = async (index: number) => {
    const hero = heroImages[index];
    if (hero.foto) {
      const path = extractPathFromUrl(hero.foto);
      if (path) {
        await supabase.storage
          .from('cardapio')
          .remove([path]);
      }
    }

    setHeroImages(prev => prev.map((img, idx) =>
      idx === index ? { ...img, foto: '', titulo: '', subtitulo: '', showDescription: false } : img
    ));
  };
  const addProductFromSuggestion = () => {
    if (!selectedProduct) return;
    if (!newComboProduct.quantidade.trim()) {
      alert('Informe a quantidade do produto');
      return;
    }
    setComboProducts([...comboProducts, {
      id: `cp-${Date.now()}`,
      nome: selectedProduct.nome,
      descricao: newComboProduct.useOriginalDescription ? selectedProduct.descricao : newComboProduct.descricao,
      quantidade: newComboProduct.quantidade,
      unidade: newComboProduct.unidade,
      foto: selectedProduct.foto,
      isFromCardapio: true,
      originalItemId: selectedProduct.id,
      useOriginalDescription: newComboProduct.useOriginalDescription
    }]);
    setProductSearchQuery('');
    setSelectedProduct(null);
    setNewComboProduct({ nome: '', descricao: '', quantidade: '', unidade: 'Unid', useOriginalDescription: true });
    setShowProductSuggestions(false);
  };

  const handleSaveCombo = async () => {
    if (!comboFormData.nome.trim()) {
      alert('Informe o nome do combo');
      return;
    }
    if (comboProducts.length < 2) {
      alert('O combo deve ter no mínimo 2 produtos');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const priceVal = parseFloat(comboFormData.preco.replace(',', '.')) || 0;
      const savingsVal = parseFloat(comboFormData.savingsAmount.replace(',', '.')) || 0;

      let comboId = editingCombo?.id;

      const comboPayload = {
        nome: comboFormData.nome,
        descricao: comboFormData.descricao,
        preco: priceVal,
        foto_url: comboFormData.foto,
        is_combo: true,
        show_savings: comboFormData.showSavings,
        savings_amount: savingsVal,
        categoria_id: activeCatId,
        ativo: true,
        visivel: true,
        shopee_link: comboFormData.shopee_link,
        mercadolivre_link: comboFormData.mercadolivre_link,
        amazon_link: comboFormData.amazon_link,
        aliexpress_link: comboFormData.aliexpress_link
      };

      if (editingCombo) {
        const { error } = await supabase
          .schema('temperos_d_casa')
          .from('produtos')
          .update(comboPayload)
          .eq('id', comboId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .schema('temperos_d_casa')
          .from('produtos')
          .insert(comboPayload)
          .select()
          .single();
        if (error) throw error;
        comboId = data.id;
      }

      // Sync combo items
      // 1. Delete old items
      const { error: delError } = await supabase
        .schema('temperos_d_casa')
        .from('combo_produtos')
        .delete()
        .eq('combo_id', comboId);
      if (delError) throw delError;

      // 2. Insert new items
      const itemsPayload = comboProducts.map(cp => ({
        combo_id: comboId,
        produto_id: cp.isFromCardapio ? cp.originalItemId : null,
        nome: cp.nome,
        descricao: cp.descricao,
        quantidade: cp.quantidade,
        unidade: cp.unidade,
        foto_url: cp.foto
      }));

      const { error: insError } = await supabase
        .schema('temperos_d_casa')
        .from('combo_produtos')
        .insert(itemsPayload);
      if (insError) throw insError;

      await fetchData(); // Refresh all to reflect changes
      setComboModalOpen(false);
      setEditingCombo(null);
      setComboFormData({ nome: '', descricao: '', preco: '', foto: '', showSavings: false, savingsAmount: '', shopee_link: '', mercadolivre_link: '', amazon_link: '', aliexpress_link: '' });
      setComboProducts([]);
    } catch (error) {
      console.error('Error saving combo:', error);
      alert('Erro ao salvar combo no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const addProductToCombo = () => {
    if (!newComboProduct.nome.trim() || !newComboProduct.quantidade.trim()) {
      alert('Informe o nome e a quantidade do produto');
      return;
    }
    setComboProducts([...comboProducts, {
      id: `cp-${Date.now()}`,
      nome: newComboProduct.nome,
      descricao: newComboProduct.descricao,
      quantidade: newComboProduct.quantidade,
      unidade: newComboProduct.unidade,
      isFromCardapio: false
    }]);
    setNewComboProduct({ nome: '', descricao: '', quantidade: '', unidade: 'Unid', useOriginalDescription: true });
    setSelectedProduct(null);
    setProductSearchQuery('');
  };

  const removeProductFromCombo = (productId: string) => {
    setComboProducts(comboProducts.filter(p => p.id !== productId));
  };

  const openItemModal = (itemToEdit?: CardapioItem) => {
    setEditingItem(itemToEdit || null);
    setFormData({
      nome: itemToEdit?.nome || '',
      descricao: itemToEdit?.descricao || '',
      preco: itemToEdit?.preco ? parseFloat(String(itemToEdit.preco).replace(',', '.')).toFixed(2).replace('.', ',') : '',
      foto: itemToEdit?.foto || '',
      visivel: itemToEdit?.visivel ?? true,
      categoria_id: itemToEdit?.categoria_id || activeCatId,
      variacoes: itemToEdit?.variacoes ? itemToEdit.variacoes.map(v => ({ ...v, preco: String(v.preco).replace('.', ',') })) : [],
      shopee_link: itemToEdit?.shopee_link || '',
      mercadolivre_link: itemToEdit?.mercadolivre_link || '',
      amazon_link: itemToEdit?.amazon_link || '',
      aliexpress_link: itemToEdit?.aliexpress_link || ''
    });
    setTempId(null);
    setShowLinkInputs({
      shopee: !!itemToEdit?.shopee_link,
      mercadolivre: !!itemToEdit?.mercadolivre_link,
      amazon: !!itemToEdit?.amazon_link,
      aliexpress: !!itemToEdit?.aliexpress_link
    });
    setModalConfig({
      isOpen: true,
      type: 'confirm-insert',
      title: itemToEdit ? 'Editar Produto' : 'Novo Produto'
    });
  };

  const handleSaveItem = async () => {
    if (!formData.nome.trim()) {
      alert('Informe o nome do produto');
      return;
    }

    for (const variacao of formData.variacoes) {
      if (!variacao.nome.trim()) {
        alert('Informe o nome para todas as variações');
        return;
      }
      const vPrice = parseFloat(variacao.preco.replace(',', '.'));
      if (isNaN(vPrice) || vPrice <= 0) {
        alert(`Informe um preço válido para a variação "${variacao.nome}"`);
        return;
      }
    }


    if (isSaving) return;
    setIsSaving(true);

    try {
      const priceVal = parseFloat(formData.preco.replace(',', '.')) || 0;
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: priceVal,
        foto_url: formData.foto,
        visivel: formData.visivel,
        ativo: true,
        is_combo: false,
        categoria_id: formData.categoria_id || activeCatId,
        variacoes: formData.variacoes?.map(v => ({ ...v, preco: parseFloat(v.preco.replace(',', '.')) || 0 })),
        shopee_link: formData.shopee_link,
        mercadolivre_link: formData.mercadolivre_link,
        amazon_link: formData.amazon_link,
        aliexpress_link: formData.aliexpress_link
      };

      if (editingItem) {
        const { error } = await supabase
          .schema('temperos_d_casa')
          .from('produtos')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .schema('temperos_d_casa')
          .from('produtos')
          .insert({
            ...payload,
            id: tempId || undefined // Use tempId if we uploaded a file for a new item
          });
        if (error) throw error;
      }

      await fetchData();
      setModalConfig({ isOpen: false });
      await fetchData();
      setModalConfig({ isOpen: false });
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Erro ao salvar produto no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setDeleteItemModal({ isOpen: true, itemId });
  };

  const handleConfirmDeleteItem = async () => {
    if (deleteItemModal.itemId) {
      try {
        const { error } = await supabase
          .schema('temperos_d_casa')
          .from('produtos')
          .delete()
          .eq('id', deleteItemModal.itemId);

        if (error) throw error;

        // Try to delete image from storage (best effort)
        const itemToDelete = categorias.flatMap(c => c.itens).find(i => i.id === deleteItemModal.itemId);
        if (itemToDelete?.foto) {
          const oldPath = extractPathFromUrl(itemToDelete.foto);
          if (oldPath) {
            await supabase.storage.from('cardapio').remove([oldPath]);
          }
        }

        await fetchData();
        setDeleteItemModal({ isOpen: false, itemId: null });
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Erro ao excluir produto.');
      }
    }
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === activeCatId) {
        const idx = cat.itens.findIndex(i => i.id === itemId);
        if (idx === -1) return cat;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= cat.itens.length) return cat;

        const newItens = [...cat.itens];
        [newItens[idx], newItens[newIdx]] = [newItens[newIdx], newItens[idx]];
        return { ...cat, itens: newItens };
      }
      return cat;
    }));
  };

  const updateItemField = (itemId: string, field: keyof CardapioItem, value: string) => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === activeCatId) {
        return {
          ...cat,
          itens: cat.itens.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        };
      }
      return cat;
    }));
  };

  const toggleVisibility = async (itemId: string) => {
    // Find item in all categories if not in activeCategory
    let item: CardapioItem | undefined;
    for (const cat of categorias) {
      item = cat.itens.find(i => i.id === itemId);
      if (item) break;
    }

    if (!item) return;

    const newVisivel = !item.visivel;

    // Optimistic update
    setCategorias(prev => prev.map(cat => ({
      ...cat,
      itens: cat.itens.map(i => i.id === itemId ? { ...i, visivel: newVisivel } : i)
    })));

    try {
      const { error } = await supabase
        .schema('temperos_d_casa')
        .from('produtos')
        .update({ visivel: newVisivel })
        .eq('id', itemId);

      if (error) throw error;

      showToast(newVisivel ? 'Produto exibido no site.' : 'Produto ocultado do site.', 'success');
    } catch (error: any) {
      console.error('Error toggling visibility:', error);
      // Revert optimism
      setCategorias(prev => prev.map(cat => ({
        ...cat,
        itens: cat.itens.map(i => i.id === itemId ? { ...i, visivel: !newVisivel } : i)
      })));
      showToast('Erro ao alterar visibilidade: ' + (error?.message || 'Erro desconhecido'), 'error');
    }
  };

  const handleNavigateItem = (direction: 'prev' | 'next') => {
    if (!editingItem) return;

    // Flatten all items from all categories if we want global navigation, 
    // or just current category. 
    // Requirement says "user can go to next or back". 
    // Let's assume navigation within the current view (all loaded items or current filtered).

    // Let's use `allProducts` (excluding combos if modal is for regular product) 
    // OR create a flat list respecting current filter/sort.
    // For simplicity and best UX, navigation should follow the visible list.

    // BUT `activeCategory` defines the current view usually.
    // If we want to navigate ACROSS categories, we should use `categorias`.

    let navigableItems: CardapioItem[] = [];

    // If using invalid "activeCategory" (like search results across all), we might need logic.
    // Default to flattening all categories for navigation if we want "infinite" scroll effect,
    // or just current category. 
    // Let's implement navigation within the CURRENT displayed list (activeCategory).

    if (activeCategory) {
      navigableItems = activeCategory.itens.filter(i => !i.isCombo);
    } else {
      // If no active category (unlikely), fallback to all
      navigableItems = categorias.flatMap(c => c.itens).filter(i => !i.isCombo);
    }

    const currentIndex = navigableItems.findIndex(i => i.id === editingItem.id);
    if (currentIndex === -1) return;

    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    // Boundary checks
    if (newIndex < 0) return; // Or loop? let's stop at ends
    if (newIndex >= navigableItems.length) return;

    const nextItem = navigableItems[newIndex];
    openItemModal(nextItem);
  };



  const updateDestaqueField = (catId: string, field: 'titulo' | 'descricao' | 'preco', value: string) => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === catId && cat.destaque) {
        return {
          ...cat,
          destaque: { ...cat.destaque, [field]: value }
        };
      }
      return cat;
    }));
  };

  const handleSaveDestaque = async (catId: string) => {
    const cat = categorias.find(c => c.id === catId);
    if (!cat || !cat.destaque) return;

    try {
      const payload = {
        categoria_id: catId,
        titulo: cat.destaque.titulo,
        descricao: cat.destaque.descricao,
        preco: cat.destaque.preco ? parseFloat(String(cat.destaque.preco).replace(',', '.')) : null,
        midias: cat.destaque.midias,
        ativo: true // Assuming active if we are saving it
      };

      const { error } = await supabase
        .schema('temperos_d_casa')
        .from('destaques_conteudo')
        .upsert(payload, { onConflict: 'categoria_id' });

      if (error) throw error;
      showToast('Alterações salvas com sucesso!', 'success');
    } catch (error: any) {
      console.error('Error saving destaque:', error);
      showToast('Erro ao salvar alterações: ' + error.message, 'error');
    }
  };



  const openDescModal = (cat: CardapioCategoria) => {
    if (!cat.destaque) return;
    setEditingCatIdForDesc(cat.id);
    setTempDesc(cat.destaque.descricao);
    setDescModalOpen(true);
  };

  const handleConfirmDesc = async () => {
    if (!editingCatIdForDesc) return;

    // Update local state
    updateDestaqueField(editingCatIdForDesc, 'descricao', tempDesc);

    // Persist to DB
    try {
      const { error } = await supabase
        .schema('temperos_d_casa')
        .from('destaques_conteudo')
        .update({ descricao: tempDesc })
        .eq('categoria_id', editingCatIdForDesc);

      if (error) throw error;
      showToast('Descrição atualizada!', 'success');
    } catch (err: any) {
      console.error('Error saving description:', err);
      showToast('Erro ao salvar descrição.', 'error');
    }

    setDescModalOpen(false);
    setEditingCatIdForDesc(null);
  };

  const handleDestaqueImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, catId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      showToast('Formato de arquivo inválido.', 'error');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    const maxSize = isVideo ? 90 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`Arquivo muito grande. Limite: ${isVideo ? '90MB' : '10MB'}`, 'error');
      return;
    }

    if (isVideo) {
      setIsUploadingMedia(true); // Start loading state
      const video = document.createElement('video');
      video.preload = 'metadata';

      const durationCheck = new Promise<boolean>((resolve) => {
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert('Vídeo muito longo. Limite: 30 segundos.');
            resolve(false);
          } else {
            resolve(true);
          }
        };
        video.onerror = () => {
          alert('Erro ao processar o vídeo.');
          resolve(false);
        };
      });

      video.src = URL.createObjectURL(file);
      const isValid = await durationCheck;
      if (!isValid) {
        setIsUploadingMedia(false);
        return;
      }
    }

    try {
      setIsUploadingMedia(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `destaque-${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `destaques/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cardapio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cardapio')
        .getPublicUrl(filePath);

      const type = file.type.startsWith('image/') ? 'image' : 'video';
      const newMedia = { type, url: publicUrl } as const;

      setCategorias(prev => prev.map(cat => {
        if (cat.id === catId && cat.destaque) {
          const currentMedias = cat.destaque.midias || [];
          return {
            ...cat,
            destaque: { ...cat.destaque, midias: [...currentMedias, newMedia] }
          };
        }
        return cat;
      }));

      // Auto-save after upload to persist the new image list
      // We must save to the 'destaques_conteudo' table
      const cat = categorias.find(c => c.id === catId);
      if (cat) {
        // We use the NEW list 'currentMedias + newMedia' which we constructed above
        const currentMedias = cat.destaque?.midias || [];
        const newMidiasList = [...currentMedias, newMedia];

        // Prepare the payload for destaques_conteudo
        const payload = {
          titulo: cat.destaque?.titulo || '',
          descricao: cat.destaque?.descricao || '',
          preco: cat.destaque?.preco ? parseFloat(String(cat.destaque.preco).replace(',', '.')) : null,
          midias: newMidiasList,
          ativo: cat.destaque?.ativo ?? true,
          categoria_id: catId
        };

        const { error } = await supabase
          .schema('temperos_d_casa')
          .from('destaques_conteudo')
          .upsert(payload, { onConflict: 'categoria_id' });

        if (error) throw error;
        showToast('Mídia adicionada com sucesso!', 'success');
      }

    } catch (error) {
      console.error('Error uploading media:', error);
      showToast('Erro ao fazer upload da mídia.', 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveDestaqueImage = async (catId: string, mediaUrl: string) => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === catId && cat.destaque) {
        const currentMedias = cat.destaque.midias || [];
        return {
          ...cat,
          destaque: { ...cat.destaque, midias: currentMedias.filter(m => m.url !== mediaUrl) }
        };
      }
      return cat;
    }));

    // Auto-save removal
    const cat = categorias.find(c => c.id === catId);
    if (cat && cat.destaque) {
      const currentMedias = cat.destaque.midias || [];
      const newMidiasList = currentMedias.filter(m => m.url !== mediaUrl);

      // Prepare payload for destaques_conteudo
      const payload = {
        titulo: cat.destaque.titulo || '',
        descricao: cat.destaque.descricao || '',
        preco: cat.destaque.preco ? parseFloat(String(cat.destaque.preco).replace(',', '.')) : null,
        midias: newMidiasList,
        ativo: cat.destaque.ativo ?? true,
        categoria_id: catId
      };

      try {
        // 1. Delete from Storage
        const fileName = mediaUrl.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('cardapio')
            .remove([`destaques/${fileName}`]);

          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
          }
        }

        // 2. Update DB
        const { error } = await supabase
          .schema('temperos_d_casa')
          .from('destaques_conteudo')
          .upsert(payload, { onConflict: 'categoria_id' });

        if (error) throw error;
        showToast("Mídia removida com sucesso", "success");

      } catch (error) {
        console.error("Error removing media from DB", error);
        showToast("Erro ao salvar alteração de mídia", "error");
      }
    }
  };

  const toggleMenuOnline = async () => {
    setIsUpdatingMenuStatus(true);
    const newState = !menuOnlineEnabled;
    try {
      const { error } = await supabase
        .schema('temperos_d_casa')
        .from('config')
        .upsert({ key: 'menu_online_enabled', value: String(newState) }, { onConflict: 'key' });

      if (error) throw error;
      setMenuOnlineEnabled(newState);
    } catch (error) {
      console.error('Error toggling menu status:', error);
      alert('Erro ao alterar status do menu online.');
    } finally {
      setIsUpdatingMenuStatus(false);
    }
  };

  const formatPrice = (value: string) => {
    let cleaned = value.replace(/[^\d,\.]/g, '');
    cleaned = cleaned.replace('.', ',');
    return cleaned;
  };

  return (
    <div className="space-y-6 pb-20 relative min-h-[400px]">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Cardápio</h1>
          <p className="text-sm text-slate-500">Gerencie os produtos do seu estabelecimento</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Menu Online Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Site
            </span>
            <button
              onClick={toggleMenuOnline}
              disabled={isUpdatingMenuStatus}
              className={`
                relative w-10 h-5 rounded-full transition-all duration-300 flex items-center
                ${menuOnlineEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}
                ${isUpdatingMenuStatus ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              <div className={`
                absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300
                ${menuOnlineEnabled ? 'left-[22px]' : 'left-0.5'}
                ${isUpdatingMenuStatus ? 'scale-75' : 'scale-100'}
              `} />
            </button>
            <span className={`text-[10px] font-bold uppercase transition-colors ${menuOnlineEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
              {menuOnlineEnabled ? 'Exibir no site' : 'Ocultado do site'}
            </span>
          </div>

          <button
            onClick={() => window.open('/#/public/menu', '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
          >
            <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
            Visualizar
          </button>
        </div>
      </div>



      {/* Hero Images - Collapsible Section */}
      {heroImagesExpanded && (
        <div id="hero-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 dark:text-slate-200">Editor de Capa</h3>
            <button
              onClick={() => focusSection('products')}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm"
            >
              <X size={16} />
              Fechar
            </button>
          </div>

          <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {heroImages.map((hero, idx) => (
                <div key={hero.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">IMAGEM {idx + 1}</span>
                    {hero.foto && (
                      <button
                        onClick={() => removeHeroImage(idx)}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                        title="Remover imagem"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={heroFileInputRefs[idx]}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleHeroImageUpload(e, idx)}
                    className="hidden"
                  />

                  {/* Image upload area */}
                  <div
                    onClick={() => !uploadingHeroIndex && heroFileInputRefs[idx]?.current?.click()}
                    className="aspect-video rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-amber-400 transition-all overflow-hidden relative"
                  >
                    {uploadingHeroIndex === idx ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="text-amber-500 animate-spin" />
                        <span className="text-xs text-slate-400">Carregando...</span>
                      </div>
                    ) : hero.foto ? (
                      <>
                        <img src={hero.foto} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Clique para trocar</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Upload size={24} />
                        <span className="text-xs">Clique para enviar</span>
                      </div>
                    )}
                  </div>

                  {/* Toggle for description */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Adicionar descrição?</span>
                    <button
                      onClick={() => updateHeroImageField(idx, 'showDescription', !hero.showDescription)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${hero.showDescription ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hero.showDescription ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  {/* Title and Subtitle inputs - only shown if toggle is on */}
                  {hero.showDescription && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                      {/* Title input - max 20 characters */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Título</label>
                          <span className={`text-[10px] ${hero.titulo.length > 20 ? 'text-red-500' : 'text-slate-400'}`}>
                            {hero.titulo.length}/20
                          </span>
                        </div>
                        <input
                          type="text"
                          value={hero.titulo}
                          onChange={(e) => updateHeroImageField(idx, 'titulo', e.target.value.slice(0, 20))}
                          placeholder="Título"
                          maxLength={20}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      {/* Subtitle input - max 50 characters */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Subtítulo</label>
                          <span className={`text-[10px] ${hero.subtitulo.length > 50 ? 'text-red-500' : 'text-slate-400'}`}>
                            {hero.subtitulo.length}/50
                          </span>
                        </div>
                        <textarea
                          value={hero.subtitulo}
                          onChange={(e) => updateHeroImageField(idx, 'subtitulo', e.target.value.slice(0, 50))}
                          placeholder="Subtítulo"
                          maxLength={50}
                          rows={2}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Section - Collapsible */}
      {(!heroImagesExpanded) && (
        <div id="products-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-visible">
          <div className="px-5 py-5 space-y-4">
            {/* Category Tabs - Moved Here */}
            <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
              {canScrollLeft && (
                <button
                  onClick={() => scrollTabs('left')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
              )}

              <div
                ref={tabsContainerRef}
                onScroll={checkScroll}
                className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categorias.map(cat => (
                  <div key={cat.id} className="flex-shrink-0">
                    {editingCategoryId === cat.id ? (
                      <div className="flex items-center gap-1 px-2 py-1.5 bg-white dark:bg-slate-700 rounded-xl border-2 border-indigo-500">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateCategoryName(cat.id);
                            if (e.key === 'Escape') { setEditingCategoryId(null); setEditingCategoryName(''); }
                          }}
                          autoFocus
                          className="w-24 px-2 py-1 bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => handleUpdateCategoryName(cat.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}
                          className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => {
                            setActiveCatId(cat.id);
                          }}
                          id={`cat-btn-${cat.id}`}
                          draggable
                          onDragStart={() => handleDragStartCat(cat.id)}
                          onDragOver={(e) => handleDragOverCat(e, cat.id)}
                          onDrop={() => handleDropCat(cat.id)}
                          onDragEnd={handleDragEndCat}
                          className={`
                          px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 relative cursor-grab active:cursor-grabbing border
                          ${activeCatId === cat.id
                              ? cat.tipo === 'especial'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                : 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }
                          ${dragOverCatId === cat.id ? 'ring-2 ring-indigo-400 scale-105' : ''}
                          ${draggedCatId === cat.id ? 'opacity-50' : 'opacity-100'}
                        `}
                        >
                          <div className="mr-1 opacity-50 cursor-grab">
                            <GripVertical size={14} />
                          </div>
                          {cat.tipo === 'especial' && (
                            <Sparkles size={14} className={activeCatId === cat.id ? 'text-purple-200' : 'text-purple-500'} />
                          )}
                          {cat.nome}
                          {cat.tipo !== 'especial' && (
                            <span className={`text-xs ${activeCatId === cat.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                              ({cat.itens.length})
                            </span>
                          )}
                          {cat.tipo === 'especial' && activeCatId === cat.id && (
                            <Star size={10} className="text-amber-300 fill-amber-300 animate-pulse absolute -top-1 -right-1" />
                          )}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setMenuPosition({ top: rect.bottom + 8, left: rect.right - 140 });
                              setCategoryMenuOpen(categoryMenuOpen === cat.id ? null : cat.id);
                            }}
                            className={`ml-1 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer ${activeCatId === cat.id ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <MoreVertical size={14} />
                          </span>
                        </button>

                        {/* Dropdown Menu */}
                        {categoryMenuOpen === cat.id && (
                          <>
                            <div
                              className="fixed inset-0 z-[100]"
                              onClick={() => setCategoryMenuOpen(null)}
                            />
                            <div
                              className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[101] min-w-[140px]"
                              style={{
                                top: menuPosition.top,
                                left: menuPosition.left
                              }}
                            >
                              <button
                                onClick={() => {
                                  startEditingCategory(cat);
                                  setCategoryMenuOpen(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
                              >
                                <Edit3 size={14} className="text-indigo-500" />
                                Renomear
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteCategoria(cat.id);
                                  setCategoryMenuOpen(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 transition-all"
                              >
                                <Trash2 size={14} className="text-red-500" />
                                Deletar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}


              </div>

              {canScrollRight && (
                <button
                  onClick={() => scrollTabs('right')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
              )}
            </div>
            {/* Category Tabs removed from here */}

            {/* Category Header with Actions */}
            {activeCategory && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeCategory.tipo !== 'especial' && (
                    <>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">{activeCategory.nome}</h2>
                      <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {activeCategory.itens.length} produto{activeCategory.itens.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">


                  {/* Filter */}
                  <div className="relative flex items-center">
                    {showFilter ? (
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                        <input
                          type="text"
                          value={filterQuery}
                          onChange={(e) => setFilterQuery(e.target.value)}
                          placeholder="Buscar..."
                          autoFocus
                          className="px-3 py-2 bg-transparent text-sm w-40 outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => { setShowFilter(false); setFilterQuery(''); }}
                          className="p-2 text-slate-400 hover:text-slate-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowFilter(true)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Filtrar produtos"
                      >
                        <Search size={18} />
                      </button>
                    )}
                  </div>

                  {/* Capa Button */}
                  <button
                    onClick={() => focusSection('hero')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-sm transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                  >
                    <ImageIcon size={16} />
                    Capa
                  </button>

                  {/* Add Dropdown */}
                  <button
                    onClick={handleAddCategoria}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm"
                  >
                    <Plus size={16} />
                    Nova Categoria
                  </button>

                  {/* Standard Category Controls */}
                  {activeCategory?.tipo !== 'especial' && (
                    <button
                      onClick={() => openItemModal()}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm"
                    >
                      <Plus size={16} />
                      Adicionar
                    </button>
                  )}



                  {/* View Toggle Removed */}
                </div>
              </div>
            )}

            {!isLoading && categorias.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Layers size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhuma categoria encontrada</h3>
                <p className="text-slate-500 mb-6 text-center max-w-xs">Comece criando uma nova categoria para adicionar seus produtos.</p>
                <button
                  onClick={handleAddCategoria}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md"
                >
                  <Plus size={20} />
                  Criar minha primeira categoria
                </button>
              </div>
            )}

            {/* SPECIAL CATEGORY VIEW - Compact */}
            {activeCategory?.tipo === 'especial' && activeCategory.destaque ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row h-full">
                  {/* Left Column: Details */}
                  <div className="p-5 md:w-1/2 flex flex-col justify-between space-y-4 relative">
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold tracking-wider uppercase">
                          Destaque Especial
                        </span>

                        <div className="flex items-center gap-2 ml-auto">
                          <span className={`text-[10px] font-bold uppercase transition-colors ${activeCategory.destaque.ativo ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {activeCategory.destaque.ativo ? 'Visível' : 'Oculto'}
                          </span>
                          <button
                            onClick={() => toggleDestaqueStatus(activeCategory)}
                            className={`relative w-8 h-4 rounded-full transition-colors ${activeCategory.destaque.ativo ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${activeCategory.destaque.ativo ? 'translate-x-4' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-3">
                        {/* Title Input */}
                        <input
                          type="text"
                          value={activeCategory.destaque.titulo}
                          onChange={(e) => updateDestaqueField(activeCategory.id, 'titulo', e.target.value)}
                          placeholder="Título do destaque"
                          className="text-2xl font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none transition-all w-full placeholder:text-slate-300"
                        />

                        {/* Description Preview & Edit Trigger */}
                        <div
                          onClick={() => openDescModal(activeCategory)}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 cursor-pointer hover:border-indigo-500 hover:shadow-sm transition-all group flex-1"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição</span>
                            <Edit3 size={12} className="text-slate-400 group-hover:text-indigo-500" />
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4">
                            {activeCategory.destaque.descricao || <span className="text-slate-400 italic">Clique para adicionar uma descrição...</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">A partir de R$</span>
                        <input
                          type="text"
                          value={activeCategory.destaque.preco || ''}
                          onChange={(e) => updateDestaqueField(activeCategory.id, 'preco', formatPrice(e.target.value))}
                          placeholder="0,00"
                          className="text-2xl font-light text-emerald-600 dark:text-emerald-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 outline-none w-32"
                        />
                      </div>

                      <button
                        onClick={() => handleSaveDestaque(activeCategory.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors w-fit shadow-md"
                      >
                        <Save size={16} />
                        Salvar Alterações
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Media */}
                  <div className="md:w-1/2 bg-slate-50 dark:bg-slate-800 relative min-h-[280px] p-2 flex flex-col gap-2">
                    {/* Media List */}
                    <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                      {isUploadingMedia && (
                        <div className="relative w-full max-w-[200px] flex-shrink-0 h-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center animate-pulse">
                          <Loader2 size={32} className="text-indigo-500 animate-spin mb-2" />
                          <span className="text-xs font-bold text-slate-500">Enviando...</span>
                        </div>
                      )}
                      {activeCategory.destaque.midias && activeCategory.destaque.midias.length > 0 ? (
                        activeCategory.destaque.midias.map((media, idx) => (
                          <div key={idx} className="relative w-full max-w-[200px] flex-shrink-0 h-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 group border border-slate-200 dark:border-slate-700">
                            {media.type === 'video' ? (
                              <video src={media.url} className="w-full h-full object-contain" />
                            ) : (
                              <img src={media.url} alt="" className="w-full h-full object-contain" />
                            )}

                            <button
                              onClick={() => handleRemoveDestaqueImage(activeCategory.id, media.url)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                              title="Remover imagem"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                          <ImageIcon size={32} className="mb-2 opacity-50" />
                          <p className="text-xs">Sem mídia</p>
                        </div>
                      )}

                      {/* Add Media Button (Always visible at the end or if empty?) - Let's put it at the start or a dedicated button? 
                            Let's add a "New" card at the end if there are images, or simpler: a dedicated upload area below/above.
                            Actually, the request was "Adicione uma imagem ao lado da outra".
                        */}
                      <label className="w-24 flex-shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-indigo-400 transition-all text-slate-400 hover:text-indigo-500">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => handleDestaqueImageUpload(e, activeCategory.id)}
                        />
                        <Plus size={24} />
                        <span className="text-[10px] font-bold mt-1">NOVA</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeCategory?.tipo === 'especial' ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Sparkles size={48} className="text-purple-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Conteúdo Especial</h3>
                <p className="text-slate-500 mb-6 text-center max-w-xs">Esta categoria ainda não possui conteúdo configurado.</p>
                <button
                  onClick={() => {
                    // Initialize with default empty values
                    const newDestaque = { titulo: activeCategory.nome, descricao: '', preco: '', midias: [], ativo: true };
                    // We can manually trigger an update or use a helper. 
                    // Since logic is complex, let's just update local state and let user edit, 
                    // or save immediately? better to just set state so UI switches to editor.
                    setCategorias(prev => prev.map(c =>
                      c.id === activeCategory.id ? { ...c, destaque: newDestaque } : c
                    ));
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-md"
                >
                  <Edit3 size={20} />
                  Configurar Conteúdo
                </button>
              </div>
            ) : null}

            {/* GRID VIEW - Default */}
            {activeCategory?.tipo !== 'especial' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {activeCategory?.itens
                  .filter(item => !filterQuery || item.nome.toLowerCase().includes(filterQuery.toLowerCase()))
                  .map((item, idx) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item.id)}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDrop={() => handleDrop(item.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openItemModal(item)}
                      className={`
                bg-white dark:bg-slate-900 rounded-xl border overflow-hidden hover:shadow-lg transition-all group cursor-pointer active:cursor-grabbing
                ${dragOverItemId === item.id ? 'border-indigo-500 border-2 scale-105' : 'border-slate-100 dark:border-slate-800'}
                ${draggedItemId === item.id ? 'opacity-50' : 'opacity-100'}
              `}
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                        {item.foto ? (
                          <img src={item.foto} alt={item.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={32} className="text-slate-300 dark:text-slate-600" />
                          </div>
                        )}

                        {/* Visibility Overlay */}
                        {!item.visivel && (
                          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <div className="bg-slate-900/80 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
                              <EyeOff size={14} />
                              Produto oculto no site
                            </div>
                          </div>
                        )}

                        {/* 3-dots Menu - Replaces Hover Actions */}
                        <div className="absolute top-2 right-2 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setItemMenuPosition({ top: rect.bottom + 5, left: rect.left - 100 });
                              setItemMenuOpen(itemMenuOpen === item.id ? null : item.id);
                            }}
                            className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        {/* Item Menu Dropdown */}
                        {itemMenuOpen === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-[100]"
                              onClick={(e) => { e.stopPropagation(); setItemMenuOpen(null); }}
                            />
                            <div
                              className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[101] min-w-[150px]"
                              style={{
                                top: itemMenuPosition.top,
                                left: itemMenuPosition.left
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  openItemModal(item);
                                  setItemMenuOpen(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
                              >
                                <Edit3 size={14} className="text-indigo-500" />
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  toggleVisibility(item.id);
                                  setItemMenuOpen(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 transition-all"
                              >
                                {item.visivel ? (
                                  <>
                                    <EyeOff size={14} className="text-slate-500" />
                                    Ocultar do Menu
                                  </>
                                ) : (
                                  <>
                                    <Eye size={14} className="text-emerald-500" />
                                    Exibir no Menu
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteItem(item.id);
                                  setItemMenuOpen(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 transition-all"
                              >
                                <Trash2 size={14} className="text-red-500" />
                                Deletar
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-xs truncate flex-1">{item.nome}</h3>

                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 min-h-[24px]">
                          {item.descricao || 'Sem descrição'}
                        </p>

                        {/* Marketplace Links Indicators */}
                        {(item.shopee_link || item.mercadolivre_link || item.amazon_link || item.aliexpress_link) && (
                          <div className="flex items-center gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
                            {item.shopee_link && (
                              <a href={item.shopee_link} target="_blank" rel="noopener noreferrer" className="w-4 h-4 rounded-sm bg-white overflow-hidden shadow-sm hover:scale-110 transition-transform" title="Shopee">
                                <img src="/shopee-logo.png" alt="Shopee" className="w-full h-full object-contain" />
                              </a>
                            )}
                            {item.mercadolivre_link && (
                              <a href={item.mercadolivre_link} target="_blank" rel="noopener noreferrer" className="w-4 h-4 rounded-sm bg-white overflow-hidden shadow-sm hover:scale-110 transition-transform" title="Mercado Livre">
                                <img src="/mercadolivre-logo.png" alt="Mercado Livre" className="w-full h-full object-contain" />
                              </a>
                            )}
                            {item.amazon_link && (
                              <a href={item.amazon_link} target="_blank" rel="noopener noreferrer" className="w-4 h-4 rounded-sm bg-white overflow-hidden shadow-sm hover:scale-110 transition-transform" title="Amazon">
                                <img src="/amazon-logo.png" alt="Amazon" className="w-full h-full object-contain" />
                              </a>
                            )}
                            {item.aliexpress_link && (
                              <a href={item.aliexpress_link} target="_blank" rel="noopener noreferrer" className="w-4 h-4 rounded-sm bg-white overflow-hidden shadow-sm hover:scale-110 transition-transform" title="AliExpress">
                                <img src="/aliexpress-logo.png" alt="AliExpress" className="w-full h-full object-contain" />
                              </a>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {item.variacoes && item.variacoes.length > 0 ? (
                              <span className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-normal uppercase">A partir de</span>
                                <span>R$ {item.variacoes.reduce((min, v) => {
                                  const p = parseFloat(String(v.preco).replace(',', '.'));
                                  return p < min ? p : min;
                                }, 99999).toFixed(2).replace('.', ',')}</span>
                              </span>
                            ) : (
                              `R$ ${item.preco ? parseFloat(String(item.preco).replace(',', '.')).toFixed(2).replace('.', ',') : '0,00'}`
                            )}
                          </span>

                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}



            {/* Empty State */}
            {
              activeCategory?.tipo !== 'especial' && activeCategory?.itens.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon size={64} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">Nenhum produto cadastrado</h3>
                  <p className="text-sm text-slate-400 mb-4">Adicione produtos a esta categoria</p>
                  <button
                    onClick={() => openItemModal()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
                  >
                    Adicionar Produto
                  </button>
                </div>
              )
            }
          </div >

        </div >
      )
      }

      {/* Splash Section - Collapsible */}


      {/* Product Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={
          <div className="flex items-center justify-between w-full mr-8">
            <span>{modalConfig.title}</span>
            {editingItem && (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleNavigateItem('prev'); }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-30"
                  title="Anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNavigateItem('next'); }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-30"
                  title="Próximo"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        }
        maxWidth="max-w-4xl"
        content={
          <div className="flex flex-col md:flex-row gap-6">
            {/* Coluna Esquerda: Imagem */}
            <div className="w-full md:w-[320px] shrink-0 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Imagem ou Vídeo do produto</label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upload area */}
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl aspect-square flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-indigo-300 transition-all relative overflow-hidden"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 size={32} className="text-indigo-500 animate-spin" />
                      <span className="text-xs text-slate-400">Processando...</span>
                    </div>
                  ) : formData.foto ? (
                    <>
                      {mediaType === 'video' || formData.foto.startsWith('data:video') ? (
                        <video
                          src={formData.foto}
                          className="w-full h-full object-cover rounded-xl"
                          controls
                          muted
                        />
                      ) : (
                        <img src={formData.foto} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      )}
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, foto: '' }));
                          setMediaType(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-slate-300 mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Clique para enviar</span>
                      <span className="text-[10px] text-slate-400 mt-1">Imagem (até 5MB) ou Vídeo (até 50MB, máx 30s)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita: Informações */}
            <div className="flex-1 space-y-5">
              {/* Row 1: Nome do produto e Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Nome do produto <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Coca-Cola 350ml"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Categoria</label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none"
                  >
                    {categorias
                      .filter(c => c.tipo !== 'especial')
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Descrição */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ingredientes ou detalhes do produto..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                />
              </div>

              {/* Row 3: Preços Únicos ou Variações Unificadas */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configuração de Preços</label>
                  {(formData.variacoes?.length || 0) < 10 && (
                    <button
                      type="button"
                      onClick={() => {
                        let newVariacoes = [...(formData.variacoes || [])];
                        // Se não tem variações ainda, a primeira variação assume o preço atual e vira 'Pequena' ou similar
                        if (newVariacoes.length === 0) {
                          newVariacoes = [
                            { nome: 'Pequena', preco: formData.preco },
                            { nome: 'Média', preco: '' }
                          ];
                        } else {
                          // Determina placeholder baseado na quantidade
                          const placeholders = ['Pequena', 'Média', 'Grande', 'Extra G', 'Família'];
                          const nextName = placeholders[newVariacoes.length] || '';
                          newVariacoes.push({ nome: nextName, preco: '' });
                        }
                        setFormData({ ...formData, variacoes: newVariacoes, preco: '' });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <Plus size={14} />
                      + preços
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Se não houver variações, mostra o layout de Valor Único */}
                  {(!formData.variacoes || formData.variacoes.length === 0) ? (
                    <div className="flex gap-4 items-end animate-in fade-in duration-300">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">TIPO</label>
                        <input
                          type="text"
                          value="Valor único"
                          disabled
                          className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-400 font-medium cursor-not-allowed"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">VALOR (R$)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                          <input
                            type="text"
                            value={formData.preco}
                            onChange={(e) => setFormData({ ...formData, preco: formatPrice(e.target.value) })}
                            placeholder="0,00"
                            className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold text-slate-700 dark:text-slate-200"
                          />
                        </div>
                      </div>
                      {/* Espaçador para alinhar com o botão de excluir das variações */}
                      <div className="w-10"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {formData.variacoes.map((variacao, idx) => (
                        <div key={idx} className="flex gap-3 items-end group">
                          <div className="flex-1">
                            {idx === 0 && <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Variação</label>}
                            <input
                              type="text"
                              placeholder={idx === 0 ? "Pequena" : idx === 1 ? "Média" : "Grande"}
                              value={variacao.nome}
                              onChange={(e) => {
                                const newVariacoes = [...formData.variacoes!];
                                newVariacoes[idx].nome = e.target.value;
                                setFormData({ ...formData, variacoes: newVariacoes });
                              }}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
                            />
                          </div>
                          <div className="w-32">
                            {idx === 0 && <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Preço</label>}
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">R$</span>
                              <input
                                type="text"
                                placeholder="0,00"
                                value={variacao.preco}
                                onChange={(e) => {
                                  const newVariacoes = [...formData.variacoes!];
                                  newVariacoes[idx].preco = formatPrice(e.target.value);
                                  setFormData({ ...formData, variacoes: newVariacoes });
                                }}
                                className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 dark:text-slate-200 text-right"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newVariacoes = formData.variacoes!.filter((_, i) => i !== idx);
                              // Se ao remover sobrar apenas 1, volta para o estado de preço único?
                              // O usuário disse: "Se tivermos apenas um valor o placeholder 'Valor único' deve estar bloqueado"
                              // Então se newVariacoes.length === 0, volta.
                              if (newVariacoes.length <= 1) {
                                // Se sobrou uma, recupera o preço dela para o preco principal
                                const finalPrice = newVariacoes.length === 1 ? newVariacoes[0].preco : '';
                                setFormData({ ...formData, variacoes: [], preco: finalPrice });
                              } else {
                                setFormData({ ...formData, variacoes: newVariacoes });
                              }
                            }}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title="Remover preço"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-seção: Links Externos */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 mt-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                  <ExternalLink size={16} />
                  <label className="text-xs font-bold block uppercase tracking-wide">Vendas Externas</label>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">Links de redirecionamento para marketplace. Adicione apenas o que desejar.</p>

                {/* Platform Toggles */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowLinkInputs(prev => ({ ...prev, shopee: !prev.shopee }))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${showLinkInputs.shopee || formData.shopee_link ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 text-orange-600 dark:text-orange-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white text-[10px]">S</div>
                    Shopee
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkInputs(prev => ({ ...prev, mercadolivre: !prev.mercadolivre }))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${showLinkInputs.mercadolivre || formData.mercadolivre_link ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 text-yellow-600 dark:text-yellow-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-slate-900 text-[10px]">M</div>
                    Mercado Livre
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkInputs(prev => ({ ...prev, amazon: !prev.amazon }))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${showLinkInputs.amazon || formData.amazon_link ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-800 dark:text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-800 dark:bg-slate-200 flex items-center justify-center font-bold text-white dark:text-slate-900 text-[10px]">a</div>
                    Amazon
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkInputs(prev => ({ ...prev, aliexpress: !prev.aliexpress }))}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${showLinkInputs.aliexpress || formData.aliexpress_link ? 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-600 dark:text-red-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-[10px]">Al</div>
                    AliExpress
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Shopee */}
                  {(showLinkInputs.shopee || formData.shopee_link) && (
                    <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                      <input
                        type="url"
                        placeholder="https://shopee.com.br/seu-produto"
                        value={formData.shopee_link}
                        onChange={e => setFormData({ ...formData, shopee_link: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-500/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-orange-500 text-slate-900 dark:text-gray-100"
                      />
                    </div>
                  )}

                  {/* Mercado Livre */}
                  {(showLinkInputs.mercadolivre || formData.mercadolivre_link) && (
                    <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                      <input
                        type="url"
                        placeholder="https://produto.mercadolivre.com.br/..."
                        value={formData.mercadolivre_link}
                        onChange={e => setFormData({ ...formData, mercadolivre_link: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-500/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-yellow-400 text-slate-900 dark:text-gray-100"
                      />
                    </div>
                  )}

                  {/* Amazon */}
                  {(showLinkInputs.amazon || formData.amazon_link) && (
                    <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                      <input
                        type="url"
                        placeholder="https://www.amazon.com.br/..."
                        value={formData.amazon_link}
                        onChange={e => setFormData({ ...formData, amazon_link: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-1 focus:ring-slate-800 dark:focus:ring-white text-slate-900 dark:text-gray-100"
                      />
                    </div>
                  )}

                  {/* AliExpress */}
                  {(showLinkInputs.aliexpress || formData.aliexpress_link) && (
                    <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2">
                      <input
                        type="url"
                        placeholder="https://pt.aliexpress.com/item/..."
                        value={formData.aliexpress_link}
                        onChange={e => setFormData({ ...formData, aliexpress_link: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/30 rounded-lg text-sm outline-none focus:ring-1 focus:ring-red-600 text-slate-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        }
        onConfirm={handleSaveItem}
        confirmText={isSaving ? 'Salvando...' : (editingItem ? 'Salvar Alterações' : 'Adicionar Produto')}
        onClose={() => !isSaving && setModalConfig({ isOpen: false })}
      />

      {/* Toast Notification */}
      {
        toast.visible && (
          <div className="fixed bottom-6 right-6 z-[150] animate-in slide-in-from-bottom-5 duration-300">
            <div className={`
            flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border
            ${toast.type === 'success' ? 'bg-white dark:bg-slate-800 border-emerald-500 text-emerald-600' : ''}
            ${toast.type === 'error' ? 'bg-white dark:bg-slate-800 border-red-500 text-red-600' : ''}
            ${toast.type === 'info' ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600' : ''}
          `}>
              {toast.type === 'success' && <CheckCircle size={24} className="fill-current" />}
              {toast.type === 'error' && <AlertTriangle size={24} className="fill-current" />}
              {toast.type === 'info' && <Info size={24} className="fill-current" />}
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{toast.type === 'success' ? 'Sucesso' : toast.type === 'error' ? 'Erro' : 'Informação'}</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(prev => ({ ...prev, visible: false }))}
                className="ml-4 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
        )
      }
      {/* Combo Modal - Two Column Layout */}
      {
        comboModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              {/* Header */}
              <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingCombo ? 'Editar Combo' : 'Novo Combo'}
                </h2>
                <button
                  onClick={() => setComboModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Two Column Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Photo, Name, Description, Price, Savings */}
                  <div className="space-y-4">
                    {/* Foto do Combo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Foto do Combo</label>
                      <input
                        ref={comboFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleComboFileUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => !isComboUploading && comboFileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl h-40 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-amber-300 transition-all relative overflow-hidden"
                      >
                        {isComboUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="text-amber-500 animate-spin" />
                            <span className="text-xs text-slate-400">Processando...</span>
                          </div>
                        ) : comboFormData.foto ? (
                          <>
                            <img src={comboFormData.foto} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setComboFormData(prev => ({ ...prev, foto: '' }));
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload size={24} className="text-slate-300 mb-1" />
                            <span className="text-xs text-slate-500">Clique para enviar (até 5MB)</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Nome */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Nome do Combo <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={comboFormData.nome}
                        onChange={(e) => setComboFormData({ ...comboFormData, nome: e.target.value })}
                        placeholder="Ex: Combo Família"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Descrição</label>
                      <textarea
                        value={comboFormData.descricao}
                        onChange={(e) => setComboFormData({ ...comboFormData, descricao: e.target.value })}
                        placeholder="Descrição do combo..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 resize-none text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Preço */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Valor do Combo</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                        <input
                          type="text"
                          value={comboFormData.preco}
                          onChange={(e) => setComboFormData({ ...comboFormData, preco: formatPrice(e.target.value) })}
                          placeholder="59,90"
                          className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Economia Toggle */}
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mostrar economia</p>
                        <p className="text-xs text-slate-500">Ex: "Cliente economiza R$ 15,00"</p>
                      </div>
                      <button
                        onClick={() => setComboFormData({ ...comboFormData, showSavings: !comboFormData.showSavings })}
                        className={`relative w-12 h-6 rounded-full transition-all ${comboFormData.showSavings ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${comboFormData.showSavings ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    {/* Savings Amount */}
                    {comboFormData.showSavings && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">Valor da economia</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-medium">R$</span>
                          <input
                            type="text"
                            value={comboFormData.savingsAmount}
                            onChange={(e) => setComboFormData({ ...comboFormData, savingsAmount: formatPrice(e.target.value) })}
                            placeholder="15,00"
                            className="w-full pl-12 pr-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Products List */}
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-slate-500">Produtos incluídos <span className="text-red-500">*</span></label>

                    {/* Products List with Thumbnails */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 min-h-[200px] max-h-[280px] overflow-y-auto">
                      {comboProducts.length > 0 ? (
                        <div className="space-y-2">
                          {comboProducts.map((product) => (
                            <div key={product.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                              {/* Thumbnail */}
                              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                {product.foto ? (
                                  <img src={product.foto} alt={product.nome} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={14} className="text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{product.nome}</p>
                                <p className="text-xs text-slate-400 truncate">{product.descricao || 'Sem descrição'}</p>
                              </div>
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded whitespace-nowrap">
                                {product.quantidade} {product.unidade}
                              </span>
                              <button
                                onClick={() => removeProductFromCombo(product.id)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                          <Grid3X3 size={32} className="mb-2 opacity-40" />
                          <p className="text-sm">Nenhum produto adicionado</p>
                        </div>
                      )}
                    </div>

                    {/* Add Product Section */}
                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Adicionar produto</p>

                      {/* Product Search/Name */}
                      <div className="relative">
                        <input
                          type="text"
                          value={productSearchQuery}
                          onChange={(e) => {
                            setProductSearchQuery(e.target.value);
                            setNewComboProduct({ ...newComboProduct, nome: e.target.value });
                            setShowProductSuggestions(true);
                            setSelectedProduct(null);
                          }}
                          onFocus={() => setShowProductSuggestions(true)}
                          placeholder="Buscar ou digitar nome do produto..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                        />

                        {/* Suggestions Dropdown */}
                        {showProductSuggestions && filteredProducts.length > 0 && !selectedProduct && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20 max-h-40 overflow-y-auto">
                            {filteredProducts.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setProductSearchQuery(product.nome);
                                  setNewComboProduct({ ...newComboProduct, nome: product.nome, descricao: product.descricao });
                                  setShowProductSuggestions(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
                              >
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0">
                                  {product.foto ? (
                                    <img src={product.foto} alt={product.nome} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon size={12} className="text-slate-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{product.nome}</p>
                                  <p className="text-xs text-slate-400">{product.categoryName}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Description option for existing products */}
                      {selectedProduct && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setNewComboProduct({ ...newComboProduct, useOriginalDescription: true })}
                              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${newComboProduct.useOriginalDescription ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                            >
                              Usar descrição original
                            </button>
                            <button
                              onClick={() => setNewComboProduct({ ...newComboProduct, useOriginalDescription: false })}
                              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${!newComboProduct.useOriginalDescription ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                            >
                              Nova descrição
                            </button>
                          </div>
                          {!newComboProduct.useOriginalDescription && (
                            <textarea
                              value={newComboProduct.descricao}
                              onChange={(e) => setNewComboProduct({ ...newComboProduct, descricao: e.target.value })}
                              placeholder="Digite a nova descrição..."
                              rows={2}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm resize-none text-slate-900 dark:text-white"
                            />
                          )}
                        </div>
                      )}

                      {/* Description for new products (not from cardapio) */}
                      {!selectedProduct && productSearchQuery && (
                        <textarea
                          value={newComboProduct.descricao}
                          onChange={(e) => setNewComboProduct({ ...newComboProduct, descricao: e.target.value })}
                          placeholder="Descrição do produto..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm resize-none text-slate-900 dark:text-white"
                        />
                      )}

                      {/* Quantity and Unit */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComboProduct.quantidade}
                          onChange={(e) => setNewComboProduct({ ...newComboProduct, quantidade: e.target.value })}
                          placeholder="Qtd"
                          className="w-20 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none text-slate-900 dark:text-white text-center"
                        />
                        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
                          {(['Unid', 'g', 'ml'] as const).map((unit) => (
                            <button
                              key={unit}
                              onClick={() => setNewComboProduct({ ...newComboProduct, unidade: unit })}
                              className={`px-3 py-2 text-xs font-medium transition-all ${newComboProduct.unidade === unit ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            if (selectedProduct) {
                              addProductFromSuggestion();
                            } else {
                              addProductToCombo();
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setComboModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  className={`px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isSaving}
                  onClick={handleSaveCombo}
                >
                  {isSaving ? 'Salvando...' : (editingCombo ? 'Salvar Alterações' : 'Criar Combo')}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Add Category Modal */}
      <Modal
        isOpen={addCategoryModal.isOpen}
        type="confirm-insert"
        title="Nova Categoria"
        content={
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Digite o nome da nova categoria para o seu cardápio.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Nome da Categoria</label>
              <input
                type="text"
                value={addCategoryModal.name}
                onChange={(e) => setAddCategoryModal({ ...addCategoryModal, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddCategoria()}
                placeholder="Ex: Lanches, Bebidas..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Tipo de Categoria</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAddCategoryModal({ ...addCategoryModal, type: 'padrao' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${addCategoryModal.type === 'padrao' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <Grid3X3 size={20} />
                  <span className="text-xs font-bold">Padrão</span>
                  <span className="text-[9px] opacity-70">Lista de produtos</span>
                </button>
                <button
                  onClick={() => setAddCategoryModal({ ...addCategoryModal, type: 'especial' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${addCategoryModal.type === 'especial' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <div className="relative">
                    <Sparkles size={20} />
                    <Star size={8} className="absolute -top-1 -right-1 text-amber-400 fill-amber-400" />
                  </div>
                  <span className="text-xs font-bold">Especial (Destaque)</span>
                  <span className="text-[9px] opacity-70">Stories & Multimídia</span>
                </button>
              </div>
            </div>
          </div>
        }
        onConfirm={handleConfirmAddCategoria}
        confirmText="Criar Categoria"
        onClose={() => setAddCategoryModal({ isOpen: false, name: '', type: 'padrao' })}
      />



      {/* Delete Category Modal */}
      <Modal
        isOpen={deleteCategoryModal.isOpen}
        type="confirm-delete"
        title="Excluir Categoria"
        content="Tem certeza que deseja excluir esta categoria? Todos os produtos vinculados a ela também serão excluídos permanentemente."
        onConfirm={handleConfirmDeleteCategoria}
        confirmText="Sim, Excluir Tudo"
        onClose={() => setDeleteCategoryModal({ isOpen: false, categoryId: null })}
      />

      {/* Delete Item Modal */}
      <Modal
        isOpen={deleteItemModal.isOpen}
        type="confirm-delete"
        title="Excluir Produto"
        content="Tem certeza que deseja remover este produto do cardápio?"
        onConfirm={handleConfirmDeleteItem}
        confirmText="Sim, Remover"
        onClose={() => setDeleteItemModal({ isOpen: false, itemId: null })}
      />

      {/* Description Edit Modal */}
      <Modal
        isOpen={descModalOpen}
        type="confirm-update"
        title="Editar Descrição"
        maxWidth="max-w-2xl"
        content={
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Edite a descrição detalhada para este destaque especial.
            </p>
            <textarea
              value={tempDesc}
              onChange={(e) => setTempDesc(e.target.value)}
              placeholder="Digite a descrição aqui..."
              className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
              autoFocus
            />
          </div>
        }
        onConfirm={handleConfirmDesc}
        confirmText="Salvar Descrição"
        onClose={() => setDescModalOpen(false)}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div >
  );
};

export default CardapioPage;
