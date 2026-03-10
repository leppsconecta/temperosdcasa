import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: '/hero-parrilla.jpg',
    title: 'Sais de Parrilla de Qualidade',
    subtitle: 'A combinação perfeita para o seu churrasco ganhar um sabor inesquecível.',
    highlight: 'Parrilla'
  },
  {
    id: 3,
    image: '/hero-temperos.jpg',
    title: 'Temperos Naturais Premium',
    subtitle: 'Qualidade e pureza que transformam qualquer receita em um prato especial.',
    highlight: 'Naturais'
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const nextSlide = () => {
    setIsAutoPlay(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  
  const prevSlide = () => {
    setIsAutoPlay(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-end justify-center overflow-hidden group pb-24 md:pb-32">
      {/* Carousel Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
            style={{ backgroundImage: `url("${slides[currentSlide].image}")` }}
          />
          <div className="absolute inset-0 bg-olive-900/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Title removed per user request */}
            <p className="text-lg sm:text-xl md:text-2xl text-earth-100 mb-10 max-w-2xl mx-auto font-light drop-shadow-md">
              {slides[currentSlide].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="https://wa.me/5511940546968"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-red hover:bg-primary-red-dark text-white px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-lg shadow-red-500/30"
              >
                <MessageCircle className="w-5 h-5" />
                Fale Conosco
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#produtos"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary-green hover:bg-olive-700 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-lg"
              >
                Ver Produtos
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel Controls - Subtle Arrows at Extremities */}
      <button 
        onClick={prevSlide} 
        className="absolute top-1/2 -translate-y-1/2 left-4 z-20 p-2 text-white/50 hover:text-white transition-colors duration-300 focus:outline-none"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" />
      </button>
      
      <button 
        onClick={nextSlide} 
        className="absolute top-1/2 -translate-y-1/2 right-4 z-20 p-2 text-white/50 hover:text-white transition-colors duration-300 focus:outline-none"
        aria-label="Próximo"
      >
        <ChevronRight className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" />
      </button>
    </section>
  );
}
