import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Send, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, clearCart, isSidebarOpen, toggleSidebar } = useCart();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) return;
    
    setIsLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
      const now = new Date();
      const dateString = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // Group items by category
      const groupedItems: { [key: string]: typeof cart } = {};
      cart.forEach(item => {
        if (!groupedItems[item.category]) {
          groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
      });

      let message = `Olá *Temperos D'Casa*, gostaria de um orçamento rápido dos produtos abaixo:%0A`;
      message += `Escolhi ${totalItems} produtos 🚀%0A%0A`;

      const categoryMap: { [key: string]: { name: string; emoji: string } } = {
        'temperos': { name: 'TEMPEROS', emoji: '🧄' },
        'chas': { name: 'CHÁS & ERVAS', emoji: '🍃' },
        'graos': { name: 'GRÃOS E OLEAGENOSAS', emoji: '🥔' }
      };

      Object.keys(groupedItems).forEach((category) => {
        const catInfo = categoryMap[category] || { name: category.toUpperCase(), emoji: '📦' };
        message += `*${catInfo.name}*%0A`;
        
        groupedItems[category].forEach((item, index) => {
          const itemNumber = (index + 1).toString().padStart(2, '0');
          message += `${catInfo.emoji} *${itemNumber}* - %0A`;
          message += `${item.name}: ${item.weight}%0A`;
          message += `${item.quantity} unid.%0A`;
          if (index < groupedItems[category].length - 1) {
              message += `-----%0A`;
          }
        });
        message += `---------------------------------%0A%0A`;
      });

      message += `Fico no aguardo do orçamento:%0A`;
      message += `* Nome: *${name}*%0A`;
      message += `* WhatsApp: *${whatsapp}*%0A`;
      message += `* Data: *${dateString}*`;

      // Redirect to WhatsApp after success screen delay
      setTimeout(() => {
        window.open(`https://wa.me/5511940546968?text=${message}`, '_blank');
        clearCart();
        toggleSidebar();
        setIsCheckoutMode(false);
        setIsSuccess(false);
        setName('');
        setWhatsapp('');
      }, 1500);
      
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[70%] sm:w-[400px] bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-earth-100 flex items-center justify-center relative bg-primary-red text-white shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-lg font-bold">Seu Carrinho</h2>
              </div>
              <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Screen */}
            {isSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <Send className="w-10 h-10 text-green-600" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-olive-900 mb-2">Tudo pronto!</h3>
                  <p className="text-earth-600">Estamos redirecionando você para o WhatsApp para finalizar o orçamento.</p>
                </div>
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-earth-400 space-y-4">
                      <ShoppingBag className="w-16 h-16 opacity-20" />
                      <p className="text-lg">Seu carrinho está vazio.</p>
                      <button onClick={toggleSidebar} className="text-mustard-600 font-medium hover:underline">
                        Continuar comprando
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={`${item.id}-${item.variationName || ''}`} className="flex items-start gap-3 bg-offwhite p-3 rounded-lg border border-earth-100">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-olive-900 text-sm truncate">
                            {item.name}
                            {item.variationName && <span className="text-mustard-600 text-[10px] ml-2 uppercase">({item.variationName})</span>}
                          </h3>
                          <p className="text-xs text-earth-500 mb-2">{item.weight}</p>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.variationName)}
                              className="w-6 h-6 rounded-full border border-earth-200 flex items-center justify-center hover:bg-earth-100 text-olive-900 text-sm"
                            >
                              -
                            </button>
                            <span className="font-medium w-6 text-center text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.variationName)}
                              className="w-6 h-6 rounded-full border border-earth-200 flex items-center justify-center hover:bg-earth-100 text-olive-900 text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.variationName)}
                          className="text-earth-400 hover:text-red-500 transition-colors p-1"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer / Checkout */}
                {cart.length > 0 && (
                  <div className="p-4 border-t border-earth-100 bg-white shrink-0">
                    {!isCheckoutMode ? (
                      <button
                        onClick={() => setIsCheckoutMode(true)}
                        className="w-full flex items-center justify-center gap-2 bg-mustard-500 hover:bg-mustard-600 text-olive-900 px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-lg font-bold transition-colors shadow-lg"
                      >
                        Solicitar Orçamento
                      </button>
                    ) : (
                      <form onSubmit={handleCheckout} className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-olive-900">Seus Dados</h3>
                          <button 
                            type="button" 
                            onClick={() => setIsCheckoutMode(false)}
                            className="text-sm text-earth-500 hover:text-olive-900 underline"
                          >
                            Voltar
                          </button>
                        </div>
                        <div>
                          <label htmlFor="cart-name" className="block text-xs font-medium text-earth-800 mb-1">Nome Completo</label>
                          <input
                            type="text"
                            id="cart-name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-earth-200 focus:ring-2 focus:ring-olive-500 outline-none text-sm"
                            placeholder="Seu nome"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label htmlFor="cart-whatsapp" className="block text-xs font-medium text-earth-800 mb-1">WhatsApp</label>
                          <input
                            type="tel"
                            id="cart-whatsapp"
                            required
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-earth-200 focus:ring-2 focus:ring-olive-500 outline-none text-sm"
                            placeholder="(11) 90000-0000"
                            disabled={isLoading}
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 bg-primary-red hover:bg-primary-red-dark disabled:bg-earth-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-lg font-bold transition-colors shadow-lg mt-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Confirmar e Enviar
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
