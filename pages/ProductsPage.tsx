import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ShoppingCart, Search, ChevronLeft, ChevronRight, Plus, Minus, X, Trash2, ThumbsUp, MessageCircle, ThumbsDown, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

const ITEMS_PER_PAGE = 20;

const DESTAQUE_CAT = { id: 'destaque', name: '⭐ Destaque' };

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('destaque');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart, removeFromCart, cart } = useCart();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [flyingImage, setFlyingImage] = useState<{ src: string, x: number, y: number } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewType, setReviewType] = useState<'elogio' | 'sugestao' | 'reclamacao' | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Data State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [{ data: prodData }, { data: catData }] = await Promise.all([
          supabase.schema('temperos_d_casa').from('produtos').select('*').eq('visivel', true).order('ordem'),
          supabase.schema('temperos_d_casa').from('categorias').select('id, nome').order('ordem'),
        ]);

        const formattedProducts = (prodData || []).map((item: any) => ({
          id: item.id,
          name: item.nome,
          desc: item.descricao || '',
          price: parseFloat(item.preco) || 0,
          img: item.foto_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
          weight: item.variacoes?.length ? 'Várias opções' : 'Unid',
          category: item.categoria_id || 'sem-categoria',
          favorito: item.favorito || false,
          variacoes: item.variacoes || [],
          shopee_link: item.shopee_link,
          mercadolivre_link: item.mercadolivre_link,
          amazon_link: item.amazon_link,
          aliexpress_link: item.aliexpress_link,
        }));

        setProducts(formattedProducts);

        const hasDestaques = formattedProducts.some(p => p.favorito);
        const formattedCats = (catData || []).map((c: any) => ({ id: c.id, name: c.nome }));
        setCategories(hasDestaques ? [DESTAQUE_CAT, ...formattedCats] : formattedCats);
        setActiveCategory(hasDestaques ? 'destaque' : (formattedCats[0]?.id || 'todos'));
      } catch (e) {
        console.error('Erro ao carregar produtos:', e);
      }
    };

    fetchProducts();
  }, []);


  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      let matchesCategory: boolean;
      if (activeCategory === 'todos') {
        matchesCategory = true;
      } else if (activeCategory === 'destaque') {
        matchesCategory = product.favorito === true;
      } else {
        matchesCategory = product.category === activeCategory;
      }
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const ExternalLinkIcons = ({ product, isBig = false }: { product: any, isBig?: boolean }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const links = [
      { id: 'shopee', url: product.shopee_link, color: '#ffffff', textColor: '#EE4D2D', label: 'Shopee', iconSrc: '/shopee-logo.png' },
      { id: 'mercadolivre', url: product.mercadolivre_link, color: '#ffffff', textColor: '#2D3277', label: 'Mercado Livre', iconSrc: '/mercadolivre-logo.png' },
      { id: 'amazon', url: product.amazon_link, color: '#ffffff', textColor: '#000000', label: 'Amazon', iconSrc: '/amazon-logo.png' },
      { id: 'aliexpress', url: product.aliexpress_link, color: '#ffffff', textColor: '#E62E04', label: 'AliExpress', iconSrc: '/aliexpress-logo.png' },
    ].filter(l => l.url);

    if (links.length === 0) return null;

    const firstLink = links[0];
    const otherLinks = links.slice(1);

    return (
      <div className="relative">
        {/* Desktop View & Modal View: Show all icons in a row */}
        <div className={`${isBig ? 'flex' : 'hidden md:flex'} items-center ${isBig ? 'gap-3' : 'gap-2'}`}>
          {links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              className={`flex items-center justify-center ${isBig ? 'rounded-2xl' : 'rounded-xl'} transition-transform hover:scale-105 shadow-sm border border-black/5 flex-shrink-0 bg-white overflow-hidden`}
              style={{
                width: isBig ? '56px' : '40px',
                height: isBig ? '56px' : '40px',
              }}
            >
              <img src={link.iconSrc} alt={link.label} className="w-full h-full object-contain p-1" />
            </a>
          ))}
        </div>

        {/* Mobile View (Small Card Only): Show only first link + toggle for others */}
        {!isBig && (
          <div className="md:hidden">
            <button
              onClick={() => {
                if (otherLinks.length > 0) {
                  setShowDropdown(!showDropdown);
                } else {
                  window.open(firstLink.url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="flex items-center justify-center rounded-xl shadow-sm border border-black/5 flex-shrink-0 bg-white overflow-hidden"
              style={{
                width: '40px',
                height: '40px',
              }}
            >
              <img src={firstLink.iconSrc} alt={firstLink.label} className="w-full h-full object-contain p-1" />
              {otherLinks.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
              )}
            </button>

            <AnimatePresence>
              {showDropdown && otherLinks.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-2xl shadow-2xl z-50 border border-earth-100 flex flex-col gap-1 min-w-[170px] max-w-[90vw]"
                  >
                    <div className="text-[10px] font-bold text-earth-400 px-3 uppercase mb-1 border-b border-earth-50 pb-1">Onde comprar:</div>
                    {links.map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowDropdown(false)}
                        className={`flex items-center gap-3 p-2.5 hover:bg-earth-50 rounded-xl transition-colors ${link.id === firstLink.id ? 'bg-earth-50/50' : ''}`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm bg-white border border-earth-100 overflow-hidden"
                        >
                          <img src={link.iconSrc} alt={link.label} className="w-full h-full object-contain p-1" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-olive-900 leading-tight">{link.label}</span>
                        </div>
                      </a>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  };

  const handleQuantityChange = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    const quantity = quantities[product.id] || 1;
    addToCart(product, quantity);

    // Reset quantity after adding
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const isInCart = (productId: number | string, variationName?: string) => {
    return cart.some(item => item.id === productId && item.variationName === variationName);
  };

  const [selectedVariation, setSelectedVariation] = useState<any | null>(null);

  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    setSelectedVariation(null);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedVariation(null);
    setIsDescExpanded(false);
  };

  const handleNextProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProduct) return;
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProduct.id);
    const nextIndex = (currentIndex + 1) % filteredProducts.length;
    setSelectedProduct(filteredProducts[nextIndex]);
  };

  const handlePrevProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProduct) return;
    const currentIndex = filteredProducts.findIndex(p => p.id === selectedProduct.id);
    const prevIndex = (currentIndex - 1 + filteredProducts.length) % filteredProducts.length;
    setSelectedProduct(filteredProducts[prevIndex]);
  };

  return (
    <div className="min-h-screen font-sans text-earth-800 selection:bg-mustard-500/30 selection:text-olive-900 bg-offwhite">
      {/* Navigation Buttons */}

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`product-${selectedProduct.id}`}
              className={`relative w-full max-w-[420px] md:max-w-[700px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300 ${
                (selectedProduct.variacoes?.length > 0 || isDescExpanded) 
                  ? 'max-h-[90vh] md:h-[500px]' 
                  : 'max-h-[90vh] md:h-[320px]'
              }`}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
              >
                <X className="w-6 h-6 text-olive-900" />
              </button>

              <div className="w-full md:w-[320px] aspect-square relative bg-earth-100 overflow-hidden flex-shrink-0">
                {/* Navigation Buttons */}
                <button
                  onClick={handlePrevProduct}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/60 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 text-olive-900" />
                </button>
                <button
                  onClick={handleNextProduct}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/60 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5 text-olive-900" />
                </button>
                <img
                  src={selectedProduct.img}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 p-5 md:p-7 flex flex-col h-full overflow-y-auto">
                <div className="mb-2">
                  <span className="text-[10px] font-black text-mustard-600 uppercase tracking-widest bg-mustard-500/10 px-2.5 py-1 rounded-full">
                    {categories.find(c => c.id === selectedProduct.category)?.name}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-olive-900 mb-1 leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-earth-400 text-xs font-bold tracking-tight">{selectedProduct.weight}</p>
                </div>

                {/* Descrição Compacta */}
                <div className="mb-5">
                  <p className={`text-earth-600 text-xs leading-relaxed ${!isDescExpanded ? 'line-clamp-2' : ''}`}>
                    {selectedProduct.desc}
                  </p>
                  {selectedProduct.desc && selectedProduct.desc.length > 60 && (
                    <button 
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="text-[10px] font-black text-mustard-600 uppercase mt-1 hover:underline"
                    >
                      {isDescExpanded ? 'Ver Menos' : 'Ver Mais'}
                    </button>
                  )}
                </div>

                {selectedProduct.variacoes && selectedProduct.variacoes.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2.5">Escolha uma opção:</p>
                    <div className="space-y-1.5">
                      {selectedProduct.variacoes.map((v: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedVariation(v)}
                          className={`flex justify-between items-center w-full px-4 py-3 rounded-2xl border transition-all ${
                            selectedVariation?.nome === v.nome 
                              ? 'border-mustard-500 bg-mustard-50/50 ring-1 ring-mustard-500' 
                              : 'border-earth-100 bg-white hover:border-earth-200'
                          }`}
                        >
                          <div className="flex flex-col items-start flex-1 min-w-0 text-left">
                            <span className={`text-sm font-black truncate w-full ${selectedVariation?.nome === v.nome ? 'text-olive-900' : 'text-earth-800'}`}>{v.nome}</span>
                            <span className="text-[10px] font-bold text-earth-400 tracking-tight">{v.qtd} {v.unidade}</span>
                          </div>
                          <span className="text-sm font-black text-olive-900 ml-4 whitespace-nowrap">R$ {parseFloat(v.preco).toFixed(2).replace('.', ',')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-5 border-t border-earth-50">
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <span className="text-[10px] font-black text-earth-400 uppercase tracking-widest">Quantidade:</span>
                    <div className="flex items-center gap-1.5 bg-earth-50 rounded-xl p-1">
                      <button
                        onClick={() => handleQuantityChange(selectedProduct.id, -1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-olive-900 hover:bg-earth-100 transition-colors shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-olive-900 w-7 text-center text-sm">{quantities[selectedProduct.id] || 1}</span>
                      <button
                        onClick={() => handleQuantityChange(selectedProduct.id, 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-olive-900 hover:bg-earth-100 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full">
                    {(() => {
                      const marketplaceLinks = [selectedProduct.shopee_link, selectedProduct.mercadolivre_link, selectedProduct.amazon_link, selectedProduct.aliexpress_link].filter(Boolean);
                      const numLinks = marketplaceLinks.length;

                      return (
                        <>
                          {!isInCart(selectedProduct.id, selectedVariation?.nome) && (
                            <div className="flex gap-1.5">
                              {selectedProduct.shopee_link && (
                                <a href={selectedProduct.shopee_link} target="_blank" rel="noreferrer" className="w-11 h-11 bg-white border border-earth-100 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                  <img src="/shopee-logo.png" className="w-7 h-7 object-contain" alt="Shopee" />
                                </a>
                              )}
                              {selectedProduct.mercadolivre_link && (
                                <a href={selectedProduct.mercadolivre_link} target="_blank" rel="noreferrer" className="w-11 h-11 bg-white border border-earth-100 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                  <img src="/mercadolivre-logo.png" className="w-7 h-7 object-contain" alt="ML" />
                                </a>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (isInCart(selectedProduct.id, selectedVariation?.nome)) {
                                removeFromCart(selectedProduct.id, selectedVariation?.nome);
                              } else {
                                const quantity = quantities[selectedProduct.id] || 1;
                                addToCart(selectedProduct, quantity, selectedVariation);
                                setQuantities(prev => ({ ...prev, [selectedProduct.id]: 1 }));
                              }
                            }}
                            disabled={selectedProduct.variacoes?.length > 0 && !selectedVariation}
                            className={`flex-1 h-11 flex items-center justify-center gap-2 transition-all font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider ${
                              isInCart(selectedProduct.id, selectedVariation?.nome)
                                ? 'bg-red-500 text-white'
                                : 'bg-mustard-500 text-olive-900 shadow-md hover:shadow-lg'
                            } ${selectedProduct.variacoes?.length > 0 && !selectedVariation ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                          >
                            {isInCart(selectedProduct.id, selectedVariation?.nome) ? <Trash2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                            <span>
                              {isInCart(selectedProduct.id, selectedVariation?.nome) 
                                ? 'Remover' 
                                : (selectedProduct.variacoes?.length > 0 && !selectedVariation 
                                    ? 'Escolha uma opção' 
                                    : 'Adicionar')}
                            </span>
                          </button>
                        </>
                      );
                    })()}
                  </div>

                  {/* Avaliar Produto Link */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="text-xs font-semibold text-earth-500 hover:text-mustard-600 transition-colors underline decoration-earth-300 hover:decoration-mustard-600 underline-offset-4"
                    >
                      Avalie este produto
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-earth-100">
                <h3 className="text-xl font-bold text-olive-900">Avaliar Produto</h3>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 bg-earth-50 hover:bg-earth-100 rounded-full transition-colors text-earth-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[80vh]">
                {/* Product Info */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-earth-100 flex-shrink-0">
                    <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-olive-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-earth-500">Compartilhe sua experiência</p>
                  </div>
                </div>

                {/* Tipo de Avaliação */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-3">
                    Tipo de avaliação
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setReviewType('elogio')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${reviewType === 'elogio'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-earth-100 bg-white text-earth-500 hover:border-green-200 hover:bg-green-50/50'
                        }`}
                    >
                      <ThumbsUp className={`w-6 h-6 ${reviewType === 'elogio' ? 'text-green-500' : ''}`} />
                      <span className="text-[10px] font-bold">ELOGIO</span>
                    </button>

                    <button
                      onClick={() => setReviewType('sugestao')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${reviewType === 'sugestao'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-earth-100 bg-white text-earth-500 hover:border-blue-200 hover:bg-blue-50/50'
                        }`}
                    >
                      <MessageCircle className={`w-6 h-6 ${reviewType === 'sugestao' ? 'text-blue-500' : ''}`} />
                      <span className="text-[10px] font-bold">SUGESTÃO</span>
                    </button>

                    <button
                      onClick={() => setReviewType('reclamacao')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${reviewType === 'reclamacao'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-earth-100 bg-white text-earth-500 hover:border-red-200 hover:bg-red-50/50'
                        }`}
                    >
                      <ThumbsDown className={`w-6 h-6 ${reviewType === 'reclamacao' ? 'text-red-500' : ''}`} />
                      <span className="text-[10px] font-bold">RECLAMAÇÃO</span>
                    </button>
                  </div>
                </div>

                {/* Sua Avaliação */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-3">
                    Sua avaliação
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="O que você achou deste produto? Sabor, apresentação, etc..."
                    className="w-full h-32 p-4 bg-white border border-earth-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-mustard-500/20 focus:border-mustard-500 resize-none shadow-sm placeholder:text-earth-400"
                  />
                </div>

                {/* Submit */}
                <button
                  disabled={!reviewType || !reviewText.trim()}
                  onClick={() => {
                    // MOCK submit action
                    setIsReviewModalOpen(false);
                    setReviewType(null);
                    setReviewText('');
                    alert('Avaliação enviada com sucesso!');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-mustard-500 hover:bg-mustard-600 disabled:opacity-50 disabled:cursor-not-allowed text-olive-900 font-bold rounded-2xl transition-colors shadow-sm"
                >
                  <Send className="w-5 h-5" />
                  Enviar Avaliação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search and Filter - Fixed Sub-Header */}
      <div className="fixed top-[64px] left-0 right-0 z-40 bg-offwhite border-b border-earth-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between">
          {/* Categories - Horizontal Scroll on Mobile */}
          <div className="flex flex-nowrap justify-start items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 max-w-full scrollbar-hide no-scrollbar flex-grow">
            <button
              onClick={() => { setActiveCategory('todos'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeCategory === 'todos'
                ? 'bg-olive-900 text-white shadow-md'
                : 'bg-white text-earth-800 hover:bg-earth-100 border border-earth-200'
                }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeCategory === cat.id
                  ? 'bg-olive-700 text-white shadow-md'
                  : 'bg-white text-earth-800 hover:bg-earth-100 border border-earth-200'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-earth-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="block w-full pl-10 pr-3 py-2 border border-earth-200 rounded-full leading-5 bg-white placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-mustard-500 focus:border-mustard-500 sm:text-sm transition-shadow shadow-sm"
            />
          </div>
        </div>
      </div>

      <main className="pt-[210px] md:pt-[150px] pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Product Grid */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            <AnimatePresence mode="popLayout">
              {currentProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-earth-100 flex flex-col h-full relative"
                >
                  <div 
                    className="relative h-32 md:h-48 overflow-hidden rounded-t-[15px] cursor-pointer"
                    onClick={() => handleOpenModal(product)}
                  >
                    {cart.some(item => item.id === product.id) && (
                      <div className="absolute top-2 left-2 z-10 bg-olive-900/90 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-lg flex items-center gap-1">
                        <ShoppingBag size={10} className="text-mustard-400" />
                        NO CARRINHO
                      </div>
                    )}
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-olive-900 shadow-sm z-10">
                      {product.weight}
                    </div>
                    {/* Price Badge */}
                    <div className="absolute bottom-2 right-2 bg-[#8cc63f] text-white px-2 py-1 rounded-lg shadow-md border border-[#76a832] font-black tracking-tight flex items-baseline gap-0.5 z-20">
                      <span className="text-[9px] font-bold">R$</span>
                      <span className="text-lg leading-none">{(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="p-4 md:p-6 flex flex-col flex-grow pt-5">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-mustard-600 uppercase tracking-wider bg-mustard-500/10 px-2 py-1 rounded-md">
                        {categories.find(c => c.id === product.category)?.name}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 
                        className="text-base md:text-xl font-bold text-olive-900 mb-1 md:mb-2 line-clamp-2 cursor-pointer hover:text-mustard-600 transition-colors"
                        onClick={() => handleOpenModal(product)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-earth-800 text-xs md:text-sm mb-2 line-clamp-2">{product.desc}</p>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-xs text-mustard-600 font-bold hover:underline mb-4 text-left"
                      >
                        Ver detalhes
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Price & Weight */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          {product.variacoes && product.variacoes.length > 0 ? (
                            <>
                              <span className="text-[10px] font-bold text-earth-400 uppercase tracking-tighter leading-none">A partir de</span>
                              <span className="text-xl font-black text-olive-900 leading-tight">
                                R$ {product.variacoes.reduce((min: number, v: any) => {
                                  const p = parseFloat(v.preco);
                                  return p < min ? p : min;
                                }, 99999).toFixed(2).replace('.', ',')}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-black text-olive-900 leading-tight">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-earth-400 uppercase tracking-tighter leading-none text-right">Peso/Medida</span>
                          <span className="text-sm font-bold text-olive-700 leading-tight">
                            {product.variacoes && product.variacoes.length > 0
                              ? product.variacoes.reduce((min: any, v: any) => parseFloat(v.preco) < parseFloat(min.preco) ? v : min, product.variacoes[0]).qtd + ' ' + product.variacoes.reduce((min: any, v: any) => parseFloat(v.preco) < parseFloat(min.preco) ? v : min, product.variacoes[0]).unidade
                              : (product.weight || 'Unid')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3 bg-earth-50 rounded-lg p-1">
                        <button
                          onClick={() => handleQuantityChange(product.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-olive-900 hover:bg-earth-100 transition-colors shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-olive-900 w-6 text-center">{quantities[product.id] || 1}</span>
                        <button
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-olive-900 hover:bg-earth-100 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {(() => {
                        const marketplaceLinks = [product.shopee_link, product.mercadolivre_link, product.amazon_link, product.aliexpress_link].filter(Boolean);
                        const numLinks = marketplaceLinks.length;

                        return (
                          <div className="flex items-center justify-center gap-1.5 md:gap-2 w-full">
                            {!isInCart(product.id) && <ExternalLinkIcons product={product} />}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (product.variacoes && product.variacoes.length > 0) {
                                  handleOpenModal(product);
                                } else {
                                  if (isInCart(product.id)) {
                                    removeFromCart(product.id);
                                  } else {
                                    const quantity = quantities[product.id] || 1;
                                    addToCart(product, quantity);
                                    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
                                  }
                                }
                              }}
                              className={`flex-grow h-12 flex items-center justify-center gap-2 font-black rounded-xl transition-all shadow-sm group ${
                                isInCart(product.id)
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-mustard-500 hover:bg-mustard-600 text-olive-900'
                              } ${(product.variacoes && product.variacoes.length > 0 && isInCart(product.id)) ? 'opacity-50' : ''}`}
                              title={isInCart(product.id) ? 'Remover do Carrinho' : 'Adicionar ao Carrinho'}
                            >
                              {isInCart(product.id) ? <Trash2 className="w-4 h-4 md:w-5 md:h-5" /> : <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />}
                              <span className={`${(numLinks >= 3 && !isInCart(product.id)) ? 'hidden' : 'inline'}`}>
                                {isInCart(product.id) ? 'Remover' : 'Adicionar'}
                              </span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-earth-500">Nenhum produto encontrado.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-16 gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full border border-earth-200 hover:bg-earth-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-olive-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-earth-800 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full border border-earth-200 hover:bg-earth-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-olive-900"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
