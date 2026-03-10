import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  Users,
  Share2,
  Calendar,
  Handshake,
  Layers,
  Package,
  Sparkles,
  Loader2,
  Star,
  Search,
  Send,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ComboProduct {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: string;
  unidade?: string;
  foto?: string;
}


// Destaque Types
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

interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  foto?: string;
  isCombo?: boolean;
  comboItens?: ComboProduct[];
  showSavings?: boolean;
  savingsAmount?: string;
  visivel?: boolean;
  variacoes?: { nome: string; preco: string }[];
}

interface MenuCategory {
  id: string;
  nome: string;
  tipo?: 'padrao' | 'especial';
  destaque?: DestaqueConteudo;
  itens: MenuItem[];
}

// Special Category View Component
const SpecialCategoryView: React.FC<{ destaque: DestaqueConteudo }> = ({ destaque }) => {
  const [currentMedia, setCurrentMedia] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);





  useEffect(() => {
    setCurrentMedia(0);
  }, [destaque.id]);

  useEffect(() => {
    // Reset progress on slide change
    setProgress(0);

    if (!destaque.midias || destaque.midias.length === 0) return;

    const media = destaque.midias[currentMedia];
    if (!media) return;

    let timer: NodeJS.Timeout;

    if (media.type === 'image') {
      const duration = 10000; // Fixed 10s duration per user request
      const interval = 50; // Smoother 50ms updates
      const totalSteps = duration / interval;
      let currentStep = 0;

      timer = setInterval(() => {
        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;

        setProgress(newProgress);

        if (currentStep >= totalSteps) {
          clearInterval(timer);
          setCurrentMedia(c => (c + 1) % destaque.midias.length);
        }
      }, interval);
    } else if (media.type === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.log('Auto-play blocked:', e));
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentMedia, destaque.midias]);

  const handleVideoEnded = () => {
    setCurrentMedia(c => (c + 1) % destaque.midias.length);
  };

  const handleVideoProgress = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl relative w-full max-w-sm mx-auto border border-slate-100 flex flex-col">
      {/* Media Layer - Aspect Ratio 9:16 */}
      <div className="relative w-full aspect-[9/16] bg-slate-900 overflow-hidden shrink-0">
        {destaque.midias.map((media, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${idx === currentMedia ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {media.type === 'video' ? (
              idx === currentMedia && (
                <video
                  ref={videoRef}
                  src={media.url}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  onEnded={handleVideoEnded}
                  onTimeUpdate={handleVideoProgress}
                  muted={false}
                />
              )
            ) : (
              <img src={media.url} alt="" className="w-full h-full object-cover" />
            )}
            {/* Gradient only at top for visibility of progress bar */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
          </div>
        ))}

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 p-2 flex gap-1">
          {destaque.midias.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-100 ease-linear ${idx < currentMedia ? 'w-full' : idx === currentMedia ? '' : 'w-0'}`}
                style={{ width: idx === currentMedia ? `${progress}%` : undefined }}
              />
            </div>
          ))}
        </div>

        {/* Navigation Touch Zones */}
        <div className="absolute inset-0 z-20 flex">
          <div
            className="w-[30%] h-full outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMedia(c => (c - 1 + destaque.midias.length) % destaque.midias.length);
            }}
          />
          <div
            className="w-[70%] h-full outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMedia(c => (c + 1) % destaque.midias.length);
            }}
          />
        </div>
      </div>

      {/* Content Section - Flowing Below Image */}
      <div className="p-5 bg-white text-slate-800 relative z-30 border-t border-slate-100">
        <h2 className="text-2xl font-black mb-3 leading-tight text-amber-500 uppercase drop-shadow-sm">{destaque.titulo}</h2>
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500 leading-relaxed">{destaque.descricao}</p>
          {destaque.preco && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">A partir de</span>
              <span className="text-2xl font-light text-amber-500">
                R$ {destaque.preco}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hero Image Interface
interface HeroImage {
  id: string;
  foto: string;
  titulo: string;
  subtitulo: string;
  showDescription: boolean;
}

interface ExpandedItem {
  categoryId: string;
  itemIndex: number;
}

const MenuOnline: React.FC = () => {
  const [categorias, setCategorias] = useState<MenuCategory[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<ExpandedItem | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [expandedComboItemIndex, setExpandedComboItemIndex] = useState<number | null>(null);
  const [menuEnabled, setMenuEnabled] = useState(true);

  // Rating Feedback States
  const [showRatingSearch, setShowRatingSearch] = useState(false);
  const [ratingSearchTerm, setRatingSearchTerm] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProductToRate, setSelectedProductToRate] = useState<MenuItem | null>(null);
  const [ratingText, setRatingText] = useState('');
  const [ratingType, setRatingType] = useState<'Elogio' | 'Sugestão' | 'Reclamação'>('Elogio');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isRatingSuccess, setIsRatingSuccess] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll categories
  useEffect(() => {
    if (categoriesRef.current && activeCatId) {
      const activeBtn = document.getElementById(`cat-btn-${activeCatId}`);
      if (activeBtn) {
        // Calculate center position
        const container = categoriesRef.current;
        const scrollLeft = activeBtn.offsetLeft - (container.offsetWidth / 2) + (activeBtn.offsetWidth / 2);

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeCatId]);

  const contactOptions = [
    { icon: MessageSquare, label: 'Sugestões', color: 'bg-blue-500', url: 'https://hashiexpressjundiai.com.br' },
    { icon: Share2, label: 'Redes Sociais', color: 'bg-pink-500', url: 'https://instagram.com/hashiexpressjundiai' },
    { icon: Calendar, label: 'Reservas', color: 'bg-green-500', url: 'https://hashiexpressjundiai.com.br' },
    { icon: Handshake, label: 'Parcerias', color: 'bg-orange-500', url: 'https://hashiexpressjundiai.com.br' },
    { icon: Star, label: 'Avaliar Produto', color: 'bg-yellow-500', action: 'rate' },
  ];

  const activeCategory = categorias.find(c => c.id === activeCatId);
  const allItems = categorias.flatMap(cat => cat.itens.filter(i => i.visivel !== false).map(item => ({ ...item, categoryId: cat.id })));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Menu Status
      try {
        const { data: configData } = await supabase
          .schema('temperos_d_casa')
          .from('config')
          .select('value')
          .eq('key', 'menu_online_enabled')
          .single();

        if (configData) {
          setMenuEnabled(configData.value === 'true');
        }
      } catch (e) {
        console.warn('Menu config not found');
      }

      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .schema('temperos_d_casa')
        .from('categorias')
        .select('*')
        .order('ordem', { ascending: true });

      if (catError) throw catError;

      // Fetch products
      const { data: prodData, error: prodError } = await supabase
        .schema('temperos_d_casa')
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (prodError) throw prodError;

      // Fetch combo items
      const { data: comboItemData, error: comboItemError } = await supabase
        .schema('temperos_d_casa')
        .from('combo_produtos')
        .select('*');

      if (comboItemError) throw comboItemError;

      // Fetch special content (destaques)
      const { data: destaquesData, error: destaquesError } = await supabase
        .schema('temperos_d_casa')
        .from('destaques_conteudo')
        .select('*');

      if (destaquesError && destaquesError.code !== '42P01') console.error('Error fetching destaques:', destaquesError);

      // Format data
      const formattedCategorias: MenuCategory[] = catData.map(cat => ({
        id: cat.id,
        nome: cat.nome,
        tipo: cat.tipo || 'padrao',
        destaque: destaquesData?.find(d => d.categoria_id === cat.id && d.ativo),
        itens: prodData
          .filter(p => p.categoria_id === cat.id)
          .map(p => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao || '',
            preco: p.preco ? Number(p.preco).toFixed(2).replace('.', ',') : '0,00',
            foto: p.foto_url,
            isCombo: p.is_combo ?? false,
            showSavings: p.show_savings ?? false,
            savingsAmount: p.savings_amount ? Number(p.savings_amount).toFixed(2).replace('.', ',') : '',
            visivel: p.visivel ?? true,
            comboItens: comboItemData
              .filter(ci => ci.combo_id === p.id)
              .map(ci => ({
                id: ci.id,
                nome: ci.nome,
                descricao: ci.descricao,
                quantidade: ci.quantidade,
                unidade: ci.unidade as any,
                foto: ci.foto_url
              })),
            variacoes: p.variacoes ? p.variacoes.map((v: any) => ({ ...v, preco: Number(v.preco).toFixed(2).replace('.', ',') })) : []
          }))
      }));

      // Filter out inactive special categories
      const filteredCategorias = formattedCategorias.filter(cat =>
        cat.tipo !== 'especial' || (cat.destaque && cat.destaque.ativo)
      );

      setCategorias(filteredCategorias);
      if (filteredCategorias.length > 0) {
        setActiveCatId(filteredCategorias[0].id);
      }

      // Fetch Hero Images
      try {
        const { data: heroData, error: heroError } = await supabase
          .schema('temperos_d_casa')
          .from('hero_images')
          .select('*')
          .order('ordem', { ascending: true });

        if (!heroError && heroData) {
          const formattedHeroes = heroData
            .filter(h => h.foto_url) // Only show images with a URL
            .map(h => ({
              id: h.id,
              foto: h.foto_url,
              titulo: h.titulo || '',
              subtitulo: h.subtitulo || '',
              showDescription: h.show_description ?? false
            }));
          setHeroImages(formattedHeroes);
        }
      } catch (e) {
        console.warn('Hero images not found');
      }

    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (heroImages.length > 0) {
      const timer = setInterval(() => {
        setCurrentHero(prev => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroImages]);

  // Get current expanded item details
  const getCurrentExpandedItem = () => {
    if (!expandedItem) return null;
    const cat = categorias.find(c => c.id === expandedItem.categoryId);
    if (!cat) return null;
    return cat.itens[expandedItem.itemIndex];
  };

  // Navigate to next/prev item in expanded view
  const navigateExpanded = (direction: 'prev' | 'next') => {
    if (!expandedItem) return;

    const cat = categorias.find(c => c.id === expandedItem.categoryId);
    if (!cat) return;

    setSlideDirection(direction === 'next' ? 'left' : 'right');

    setTimeout(() => {
      if (direction === 'next') {
        if (expandedItem.itemIndex < cat.itens.length - 1) {
          setExpandedItem({ ...expandedItem, itemIndex: expandedItem.itemIndex + 1 });
        }
      } else {
        if (expandedItem.itemIndex > 0) {
          setExpandedItem({ ...expandedItem, itemIndex: expandedItem.itemIndex - 1 });
        }
      }
      setSlideDirection(null);
    }, 150);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) {
        navigateExpanded('next');
      } else {
        navigateExpanded('prev');
      }
    }
  };

  const openExpanded = (categoryId: string, itemIndex: number) => {
    setExpandedItem({ categoryId, itemIndex });
  };

  const closeExpanded = () => {
    setExpandedItem(null);
  };

  const currentItem = getCurrentExpandedItem();
  const canGoPrev = expandedItem ? expandedItem.itemIndex > 0 : false;
  const canGoNext = expandedItem ? (categorias.find(c => c.id === expandedItem.categoryId)?.itens.length || 0) > expandedItem.itemIndex + 1 : false;

  if (!menuEnabled && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Package size={48} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Menu Indisponível</h1>
        <p className="text-slate-400 max-w-xs mx-auto mb-8">
          No momento nosso cardápio online está em manutenção ou temporariamente desativado.
        </p>
        <a
          href="https://hashiexpressjundiai.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 tracking-widest font-semibold hover:text-indigo-400 transition-colors"
        >
          hashiexpressjundiai.com.br
        </a>
      </div>
    );
  }



  const handleContactAction = (option: any) => {
    if (option.action === 'rate') {
      setShowContactModal(false);
      setShowRatingSearch(true);
    } else {
      window.open(option.url, '_blank');
    }
  };

  const handleProductSelectForRating = (product: MenuItem) => {
    setSelectedProductToRate(product);
    setShowRatingSearch(false);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedProductToRate || !ratingText.trim()) return;

    setIsSubmittingRating(true);
    try {
      const category = categorias.find(c => c.itens.some(i => i.id === selectedProductToRate.id));

      const { error } = await supabase.rpc('manage_feedbacks_mda', {
        action_type: 'INSERT_REVIEW',
        payload: {
          produto_nome: selectedProductToRate.nome,
          categoria_nome: category?.nome || 'Geral',
          avaliacao: ratingText,
          status: 'Pendente',
          tipo: ratingType
        }
      });

      if (error) throw error;

      if (error) throw error;

      setIsRatingSuccess(true);
      // Reset logic moved to success modal close
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setTimeout(() => {
      setIsRatingSuccess(false);
      setRatingText('');
      setRatingType('Elogio');
      setSelectedProductToRate(null);
    }, 300);
  };

  const filteredProductsForRating = ratingSearchTerm
    ? allItems.filter(item => item.nome.toLowerCase().includes(ratingSearchTerm.toLowerCase()))
    : [];



  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans">
      {/* Search Product Modal for Rating */}
      {/* Search Product Modal for Rating */}
      {/* Search Product Modal for Rating */}
      {showRatingSearch && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowRatingSearch(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
              <button onClick={() => setShowRatingSearch(false)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
              <div className="flex-1 bg-slate-100 rounded-xl flex items-center px-4 py-3">
                <Search size={20} className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Busque o produto..."
                  className="bg-transparent w-full outline-none text-slate-800 font-medium"
                  autoFocus
                  value={ratingSearchTerm}
                  onChange={e => setRatingSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {ratingSearchTerm ? (
                <div className="space-y-2">
                  {filteredProductsForRating.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleProductSelectForRating(item)}
                      className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                        {item.foto && <img src={item.foto} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{item.nome}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{item.descricao}</p>
                      </div>
                    </div>
                  ))}
                  {filteredProductsForRating.length === 0 && (
                    <p className="text-center text-slate-400 py-8">Nenhum produto encontrado</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Search size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Digite o nome do produto que deseja avaliar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Form Modal */}
      {showRatingModal && selectedProductToRate && (
        <div className="fixed inset-0 z-[61] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{isRatingSuccess ? 'Sucesso!' : 'Avaliar Produto'}</h3>
              <button onClick={handleCloseRatingModal} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {isRatingSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 animate-in zoom-in duration-300">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Avaliação Enviada!</h3>
                <p className="text-slate-500 mb-8">Obrigado por compartilhar sua opinião conosco.</p>
                <button
                  onClick={handleCloseRatingModal}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shadow-sm shrink-0">
                    {selectedProductToRate.foto ? (
                      <img src={selectedProductToRate.foto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={24} /></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-800 leading-tight">{selectedProductToRate.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">Compartilhe sua experiência</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Avaliação</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setRatingType('Elogio')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${ratingType === 'Elogio'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      <ThumbsUp size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Elogio</span>
                    </button>
                    <button
                      onClick={() => setRatingType('Sugestão')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${ratingType === 'Sugestão'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      <MessageCircle size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Sugestão</span>
                    </button>
                    <button
                      onClick={() => setRatingType('Reclamação')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${ratingType === 'Reclamação'
                        ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      <ThumbsDown size={20} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">Reclamação</span>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sua Avaliação</label>
                  <textarea
                    value={ratingText}
                    onChange={e => setRatingText(e.target.value)}
                    placeholder="O que você achou deste produto? Sabor, apresentação, etc..."
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px] text-slate-700 resize-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleSubmitRating}
                  disabled={isSubmittingRating || !ratingText.trim()}
                  className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmittingRating ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  {isSubmittingRating ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Carousel */}

      <section className="h-[40vh] sm:h-[50vh] relative overflow-hidden bg-slate-900">
        {heroImages.length > 0 ? (
          heroImages.map((hero, idx) => (
            <div
              key={hero.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHero ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={hero.foto} alt={hero.titulo} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {hero.showDescription && (hero.titulo || hero.subtitulo) && (
                <div
                  className="absolute inset-x-0 bottom-0 pb-12 pt-24 px-6 flex flex-col items-center justify-center text-white text-center animate-in fade-in slide-in-from-bottom duration-700"
                >
                  {hero.titulo && <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 drop-shadow-lg">{hero.titulo}</h1>}
                  {hero.subtitulo && <p className="text-sm sm:text-base font-medium opacity-90 drop-shadow-md max-w-xs sm:max-w-md">{hero.subtitulo}</p>}
                </div>
              )}
            </div>
          ))
        ) : !isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">Hashi Express</h1>
            <p className="text-sm sm:text-base font-medium opacity-80">Sabor e tradição em cada detalhe</p>
          </div>
        ) : null}

        {/* Person Icon Button */}
        <button
          onClick={() => setShowContactModal(true)}
          className="absolute bottom-4 right-4 p-3 bg-red-600 text-white rounded-full shadow-lg animate-pulse hover:bg-red-700 transition-colors z-10"
        >
          <User size={24} />
        </button>

      </section>

      {/* Categories Bar */}
      <div id="menu-start" className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm min-h-[58px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[58px]">
            <Loader2 size={24} className="text-red-600 animate-spin" />
          </div>
        ) : (
          <div
            ref={categoriesRef}
            className="flex gap-1 p-2 overflow-x-auto scrollbar-hide justify-start md:justify-center px-4"
          >
            {categorias.map(cat => (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setActiveCatId(cat.id)}
                className={`
                  flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 relative snap-center
                  ${activeCatId === cat.id
                    ? cat.tipo === 'especial'
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                      : 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {cat.tipo === 'especial' && (
                  <Sparkles size={14} className={activeCatId === cat.id ? 'text-white' : 'text-amber-500'} />
                )}
                {cat.nome}
                {cat.tipo === 'especial' && activeCatId === cat.id && (
                  <Star size={10} className="text-amber-300 fill-amber-300 animate-pulse absolute -top-1 -right-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          {activeCategory?.nome}
          {activeCategory?.tipo === 'especial' && <Sparkles size={20} className="text-purple-500" />}
        </h2>

        {activeCategory?.tipo === 'especial' && activeCategory.destaque ? (
          <SpecialCategoryView destaque={activeCategory.destaque} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeCategory?.itens.filter(item => item.visivel !== false).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openExpanded(activeCatId, idx)}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group relative ${item.isCombo ? 'border-purple-200 ring-1 ring-purple-100' : 'border-slate-100'}`}
              >
                {/* Combo and Savings Badges - Stacked vertically on mobile */}
                {item.isCombo && (
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    {/* Combo Badge */}
                    <div className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg w-fit">
                      <Layers size={10} />
                      COMBO
                    </div>

                    {/* Savings Badge */}
                    {item.showSavings && item.savingsAmount && (
                      <div className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg w-fit">
                        <Sparkles size={10} />
                        -R${item.savingsAmount}
                      </div>
                    )}
                  </div>
                )}

                {/* Image */}
                <div className="aspect-square bg-slate-100 overflow-hidden relative">
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      Sem foto
                    </div>
                  )}
                  {/* Combo gradient overlay */}
                  {item.isCombo && (
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Info */}
                <div className={`p-3 ${item.isCombo ? 'bg-gradient-to-b from-white to-purple-50' : ''}`}>
                  <h3 className="font-bold text-slate-800 text-sm truncate mb-1">{item.nome}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2 min-h-[32px]">{item.descricao}</p>
                  <div className="flex items-center justify-between">
                    {item.variacoes && item.variacoes.length > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">A partir de</span>
                        <span className={`text-lg font-black ${item.isCombo ? 'text-purple-600' : 'text-red-600'}`}>
                          R$ {item.variacoes.reduce((min, v) => {
                            const p = parseFloat(v.preco.replace(',', '.'));
                            return p < min ? p : min;
                          }, 99999).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-lg font-black ${item.isCombo ? 'text-purple-600' : 'text-red-600'}`}>R$ {item.preco}</span>
                    )}
                    {item.isCombo && item.comboItens && (
                      <span className="text-[10px] text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                        {item.comboItens.length} itens
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Expanded Product Modal */}
      {expandedItem && currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeExpanded}
        >
          {/* Close Button */}
          <button
            onClick={closeExpanded}
            className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50"
          >
            <X size={24} />
          </button>

          {/* Navigation Arrows */}
          {canGoPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateExpanded('prev'); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {canGoNext && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateExpanded('next'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Product Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`
              bg-white rounded-3xl overflow-hidden overflow-y-auto max-w-md w-[90%] max-h-[85vh] shadow-2xl
              transition-all duration-150 ease-out
              ${slideDirection === 'left' ? '-translate-x-full opacity-0' : ''}
              ${slideDirection === 'right' ? 'translate-x-full opacity-0' : ''}
              ${!slideDirection ? 'translate-x-0 opacity-100' : ''}
            `}
          >
            {/* Image */}
            <div className="aspect-square bg-slate-100 overflow-hidden relative">
              {currentItem.foto ? (
                <img src={currentItem.foto} alt={currentItem.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">
                  Sem foto
                </div>
              )}
              {/* Combo overlay badge on image */}
              {currentItem.isCombo && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                  <Layers size={12} />
                  COMBO
                </div>
              )}
            </div>

            {/* Info */}
            <div className={`p-6 ${currentItem.isCombo ? 'bg-gradient-to-b from-white to-purple-50' : ''}`}>
              <h2 className={`text-2xl font-black mb-2 ${currentItem.isCombo ? 'text-purple-800' : 'text-slate-800'}`}>{currentItem.nome}</h2>

              {currentItem.preco ? (
                <>
                  <p className="text-slate-500 leading-relaxed mb-6">{currentItem.descricao}</p>



                  {/* Combo products list - Expandable with carousel */}
                  {currentItem.isCombo && currentItem.comboItens && currentItem.comboItens.length > 0 && (
                    <div className="mb-5">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={16} className="text-purple-600" />
                        <p className="text-sm font-bold text-purple-700">Este combo inclui:</p>
                      </div>

                      {/* Expanded Carousel View */}
                      {expandedComboItemIndex !== null && (
                        <div className="bg-white rounded-2xl border-2 border-purple-200 overflow-hidden mb-4 shadow-lg">
                          {/* Carousel Header with Combo X label */}
                          <div className="bg-purple-100 px-4 py-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-700">
                              Item {expandedComboItemIndex + 1} de {currentItem.comboItens.length}
                            </span>
                            <button
                              onClick={() => setExpandedComboItemIndex(null)}
                              className="p-1 hover:bg-purple-200 rounded-full transition-all"
                            >
                              <X size={14} className="text-purple-600" />
                            </button>
                          </div>

                          {/* Carousel Content - Only show image section if item has photo */}
                          {currentItem.comboItens[expandedComboItemIndex].foto ? (
                            <div className="relative">
                              <div className="aspect-video bg-slate-100 overflow-hidden">
                                <img
                                  src={currentItem.comboItens[expandedComboItemIndex].foto}
                                  alt={currentItem.comboItens[expandedComboItemIndex].nome}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Navigation Arrows */}
                              {expandedComboItemIndex > 0 && (
                                <button
                                  onClick={() => setExpandedComboItemIndex(expandedComboItemIndex - 1)}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
                                >
                                  <ChevronLeft size={18} className="text-purple-600" />
                                </button>
                              )}
                              {expandedComboItemIndex < currentItem.comboItens.length - 1 && (
                                <button
                                  onClick={() => setExpandedComboItemIndex(expandedComboItemIndex + 1)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
                                >
                                  <ChevronRight size={18} className="text-purple-600" />
                                </button>
                              )}
                            </div>
                          ) : null}

                          {/* Item Details - Full information when expanded */}
                          <div className="p-4">
                            <h4 className="font-bold text-slate-800 mb-1">{currentItem.comboItens[expandedComboItemIndex].nome}</h4>
                            <p className="text-sm text-slate-500 mb-2">{currentItem.comboItens[expandedComboItemIndex].descricao}</p>
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                              {currentItem.comboItens[expandedComboItemIndex].quantidade} {currentItem.comboItens[expandedComboItemIndex].unidade || 'un'}
                            </span>
                          </div>

                          {/* Carousel dots indicator - only show dots for items with descriptions */}
                          <div className="flex justify-center gap-1.5 pb-3">
                            {currentItem.comboItens.filter(i => i.descricao).map((item, idx) => {
                              const realIdx = currentItem.comboItens.findIndex(i => i.id === item.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => setExpandedComboItemIndex(realIdx)}
                                  className={`w-2 h-2 rounded-full transition-all ${realIdx === expandedComboItemIndex ? 'bg-purple-600 w-4' : 'bg-purple-200 hover:bg-purple-300'}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Products List - Compact view with scroll after 5 items */}
                      <div className={`bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm ${currentItem.comboItens.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
                        {currentItem.comboItens.map((item, idx) => {
                          const hasDescription = !!item.descricao;
                          const isClickable = hasDescription;

                          return (
                            <div key={item.id} className="relative">
                              {/* Item X label above each item */}
                              <div className="bg-purple-50 px-4 py-1 border-b border-purple-100">
                                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wide">
                                  Item {idx + 1}
                                </span>
                              </div>
                              {isClickable ? (
                                <button
                                  onClick={() => setExpandedComboItemIndex(expandedComboItemIndex === idx ? null : idx)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-purple-50 last:border-0 ${expandedComboItemIndex === idx ? 'bg-purple-50' : 'hover:bg-slate-50'}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    {/* Product Name */}
                                    <p className="font-semibold text-slate-800 text-sm truncate">{item.nome}</p>
                                    {/* Brief Description */}
                                    <p className="text-xs text-slate-400 truncate">{item.descricao}</p>
                                  </div>
                                  {/* Quantity */}
                                  <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {item.quantidade} {item.unidade || 'un'}
                                  </span>
                                  <ChevronRight size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${expandedComboItemIndex === idx ? 'rotate-90' : ''}`} />
                                </button>
                              ) : (
                                <div className="w-full flex items-center gap-3 px-4 py-3 border-b border-purple-50 last:border-0">
                                  <div className="flex-1 min-w-0">
                                    {/* Product Name */}
                                    <p className="font-semibold text-slate-800 text-sm truncate">{item.nome}</p>
                                    {/* No description indicator */}
                                    <p className="text-xs text-slate-300 italic">Sem descrição</p>
                                  </div>
                                  {/* Quantity */}
                                  <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {item.quantidade} {item.unidade || 'un'}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Scroll hint */}
                      {currentItem.comboItens.length > 5 && (
                        <p className="text-[10px] text-center text-purple-400 mt-2">Role para ver mais itens</p>
                      )}
                    </div>
                  )}


                  <div className="flex items-end justify-between">
                    {currentItem.variacoes && currentItem.variacoes.length > 0 ? (
                      <div className="space-y-2 mb-4 w-full flex-1">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Opções:</p>
                        {currentItem.variacoes.map((v, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 w-full gap-4">
                            <span className="font-semibold text-slate-700">{v.nome}</span>
                            <span className="font-black text-red-600 text-lg whitespace-nowrap">R$ {v.preco}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <span className={`text-3xl font-black ${currentItem.isCombo ? 'text-purple-600' : 'text-red-600'}`}>R$ {currentItem.preco}</span>
                        {/* Savings Badge */}
                        {currentItem.isCombo && currentItem.showSavings && currentItem.savingsAmount && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full shadow-md">
                              <Sparkles size={12} />
                              Você economiza R$ {currentItem.savingsAmount}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-slate-400">
                      {expandedItem.itemIndex + 1} / {categorias.find(c => c.id === expandedItem.categoryId)?.itens.filter(i => i.visivel !== false).length}
                    </div>
                  </div>

                  {/* Rating Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductSelectForRating(currentItem);
                      }}
                      className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-500 font-medium rounded-xl flex items-center justify-center gap-2 transition-all group"
                    >
                      <Star size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-yellow-500 transition-colors" />
                      <span className="text-sm">Avalie este produto</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="max-h-32 overflow-y-auto">
                  <p className="text-slate-500 leading-relaxed">{currentItem.descricao}</p>
                </div>
              )}
            </div>
          </div>

          {/* Swipe indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
            {categorias.find(c => c.id === expandedItem.categoryId)?.itens.filter(i => i.visivel !== false).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${idx === expandedItem.itemIndex ? 'bg-red-600 w-6' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {
        showContactModal && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X size={20} />
              </button>

              <div className="pt-8 px-6 text-center">
                <h2 className="text-xl font-bold text-slate-800">Fale Conosco</h2>
                <p className="text-sm text-slate-500 mt-1 mb-6">Escolha uma opção</p>
              </div>

              <div className="p-6 pt-2 space-y-3">
                {contactOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (option.action === 'rate') {
                        setShowContactModal(false);
                        setShowRatingSearch(true);
                      } else if (option.url) {
                        window.open(option.url, '_blank');
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all group"
                  >
                    <div className={`w-10 h-10 ${option.color} rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                      <option.icon size={20} />
                    </div>
                    <span className="text-base font-bold text-slate-700">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      }


      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div >
  );
};

export default MenuOnline;
