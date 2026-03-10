import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: 'Ana Souza',
        state: 'São Paulo (SP)',
        text: 'A qualidade dos temperos impressiona. Desde que comecei a usar na minha cozinha, meus clientes notaram a diferença no sabor dos pratos!',
        rating: 5,
        role: 'Chef de Cozinha'
    },
    {
        id: 2,
        name: 'Carlos Mendes',
        state: 'Minas Gerais (MG)',
        text: 'Entrega rápida e produtos muito bem embalados. O manjericão e o orégano são super frescos, aroma maravilhoso que invade a casa toda.',
        rating: 5,
        role: 'Cliente Frequente'
    },
    {
        id: 3,
        name: 'Juliana Costa',
        state: 'Rio de Janeiro (RJ)',
        text: 'Uso os chás diariamente. A camomila e a erva-doce são excelentes para relaxar à noite. Recomendo muito a variedade e o atendimento!',
        rating: 5,
        role: 'Nutricionista'
    },
    {
        id: 4,
        name: 'Roberto Alves',
        state: 'Paraná (PR)',
        text: 'Para o meu empório, encontrar um fornecedor com grãos tão selecionados foi um divisor de águas. Castanhas sempre crocantes e inteiras.',
        rating: 4,
        role: 'Proprietário de Empório'
    },
    {
        id: 5,
        name: 'Fernanda Lima',
        state: 'Bahia (BA)',
        text: 'Ah, o tempero baiano de vocês tem o toque real da nossa terra! Pimenta na medida e sabor incrível. Parabéns pela curadoria.',
        rating: 5,
        role: 'Cliente Frequente'
    },
    {
        id: 6,
        name: 'Eduardo Castro',
        state: 'Rio Grande do Sul (RS)',
        text: 'Excelente custo-benefício. Compro em atacado e a qualidade nunca cai. Chimichurri é o sucesso absoluto dos nossos churrascos.',
        rating: 5,
        role: 'Churrasqueiro'
    },
    {
        id: 7,
        name: 'Patrícia Gomes',
        state: 'Pernambuco (PE)',
        text: 'Fiquei surpresa com o aroma das especiarias ao abrir a caixa. O açafrão é puríssimo, dá uma cor linda aos alimentos.',
        rating: 5,
        role: 'Cliente Frequente'
    }
];

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000); // 5 seconds
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    return (
        <section className="py-24 bg-white relative overflow-hidden" id="feedbacks">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-mustard-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive-900/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-olive-100/50 text-olive-900 mb-6"
                    >
                        <Star className="w-5 h-5 text-mustard-500 fill-current" />
                        <span className="font-bold tracking-wider uppercase text-sm">O Que Dizem Nossos Clientes</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-olive-900 mb-6"
                    >
                        Aprovado em todo o <span className="text-primary-red">Brasil</span>
                    </motion.h2>
                </div>

                {/* Carousel Container */}
                <div className="relative w-full max-w-4xl mx-auto px-10 md:px-16 flex items-center min-h-[300px]">

                    <button
                        onClick={prev}
                        className="absolute left-0 z-20 p-3 bg-white hover:bg-earth-50 rounded-full shadow-md text-olive-900 transition-transform hover:scale-105 border border-earth-100 hidden sm:flex"
                        aria-label="Previous feedback"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={next}
                        className="absolute right-0 z-20 p-3 bg-white hover:bg-earth-50 rounded-full shadow-md text-olive-900 transition-transform hover:scale-105 border border-earth-100 hidden sm:flex"
                        aria-label="Next feedback"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="w-full relative overflow-hidden flex flex-col justify-center min-h-[250px] md:min-h-[200px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full bg-offwhite/50 backdrop-blur-sm rounded-[2rem] p-8 md:p-12 shadow-sm border border-earth-100/50 flex flex-col items-center text-center"
                            >
                                <div className="flex gap-1 mb-6 text-mustard-500">
                                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                </div>

                                <div className="relative mb-8 max-w-2xl mx-auto">
                                    <Quote className="absolute -top-6 -left-6 md:-left-10 w-10 h-10 text-earth-200 opacity-40" />
                                    <p className="text-xl md:text-2xl text-earth-800 leading-relaxed font-medium italic relative z-10">
                                        "{testimonials[currentIndex].text}"
                                    </p>
                                </div>

                                <div className="flex flex-col items-center">
                                    <p className="font-bold text-lg text-olive-900 mb-1">{testimonials[currentIndex].name}</p>
                                    <p className="text-sm font-medium text-mustard-600 mb-1">{testimonials[currentIndex].role}</p>
                                    <div className="flex items-center gap-1.5 text-earth-500 text-sm font-bold bg-white px-3 py-1 mt-2 rounded-full shadow-sm border border-earth-100">
                                        <MapPin className="w-4 h-4 text-mustard-500" />
                                        {testimonials[currentIndex].state}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Carousel Dots */}
                <div className="flex justify-center gap-2 mt-10 z-20">
                    {testimonials.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            aria-label={`Ir para feedback ${idx + 1}`}
                            className={`h-2 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-mustard-500' : 'w-2 bg-earth-200 hover:bg-earth-300'
                                }`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}
