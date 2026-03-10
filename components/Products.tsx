import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function Products() {
  const { addToCart, removeFromCart, cart } = useCart();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  // Data State
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const { data, error } = await supabase
          .schema('temperos_d_casa')
          .from('produtos')
          .select('*')
          .eq('favorito', true)
          .eq('visivel', true)
          .order('nome', { ascending: true })
          .limit(10);

        if (error) throw error;

        const formattedProducts = (data || []).map((item: any) => ({
          id: item.id,
          name: item.nome,
          desc: item.descricao || '',
          price: parseFloat(item.preco) || 0,
          img: item.foto_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
          weight: item.variacoes?.length ? 'Várias opções' : 'Unid',
          shopee_link: item.shopee_link,
          mercadolivre_link: item.mercadolivre_link,
          amazon_link: item.amazon_link,
          aliexpress_link: item.aliexpress_link,
        }));

        setProducts(formattedProducts);
      } catch (e) {
        console.error('Erro ao carregar favoritos:', e);
      }
    };

    fetchFavoritos();
  }, []);

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

  const isInCart = (productId: number) => {
    return cart.some(item => item.id === productId);
  };

  return (
    <section id="produtos" className="py-24 relative">
      {/* Decorative elements */}

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-olive-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-mustard-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-olive-900 mb-4">Produtos em Destaque</h2>

          </motion.div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-earth-100 flex flex-col h-full"
              >
                <div className="relative h-32 md:h-48 overflow-hidden">
                  {isInCart(product.id) && (
                    <div className="absolute top-2 left-2 z-10 bg-olive-900/90 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-lg flex items-center gap-1">
                      <ShoppingBag size={10} className="text-mustard-400" />
                      NO CARRINHO
                    </div>
                  )}
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-olive-900 shadow-sm">
                    {product.weight}
                  </div>
                </div>
                <div className="p-4 md:p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-base md:text-xl font-bold text-olive-900 mb-1 md:mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-earth-800 text-xs md:text-sm mb-4 md:mb-6 line-clamp-3">{product.desc}</p>
                  </div>

                  <div className="mt-auto space-y-3">
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

                    <button
                      onClick={(e) => {
                        if (isInCart(product.id)) {
                          removeFromCart(product.id);
                        } else {
                          handleAddToCart(product, e);
                        }
                      }}
                      className={`flex items-center justify-center gap-2 w-full py-2 md:py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm font-bold transition-all shadow-md hover:shadow-lg ${isInCart(product.id)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-mustard-500 hover:bg-mustard-600 text-olive-900'
                        }`}
                    >
                      {isInCart(product.id) ? <Trash2 className="w-3 h-3 md:w-4 md:h-4" /> : <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />}
                      {isInCart(product.id) ? 'Remover' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/produtos"
            className="inline-flex items-center justify-center gap-2 bg-primary-red hover:bg-primary-red-dark text-white px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-lg"
          >
            Ver mais produtos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
