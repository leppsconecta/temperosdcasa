import { motion } from 'motion/react';
import { Package, Store, Truck, Percent } from 'lucide-react';

export default function Wholesale() {
  const benefits = [
    {
      icon: Store,
      title: 'Varejo',
      desc: 'Compre a quantidade ideal para o seu dia a dia com a melhor qualidade.',
    },
    {
      icon: Package,
      title: 'Atacado',
      desc: 'Condições especiais e preços diferenciados para compras em volume.',
    },
    {
      icon: Truck,
      title: 'Envio Nacional',
      desc: 'Logística eficiente para entregar em qualquer lugar do Brasil.',
    },
    {
      icon: Percent,
      title: 'Revendedores',
      desc: 'Margens atrativas para você lucrar revendendo nossos produtos.',
    },
  ];

  return (
    <section id="atacado" className="py-24 bg-primary-red text-offwhite relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#FDD835 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent-yellow font-semibold tracking-wider uppercase text-sm mb-4 block">
              Para o seu negócio ou sua casa
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Atacado e Varejo
            </h2>
            <p className="text-lg text-earth-200 max-w-2xl mx-auto font-light">
              Temos a solução perfeita para a sua necessidade. Seja para abastecer a despensa de casa ou o estoque do seu comércio.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                 className="bg-secondary-green backdrop-blur-sm border border-white/20 p-4 md:p-8 rounded-2xl text-center hover:bg-olive-700 transition-colors shadow-lg"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-white text-primary-red mb-4 md:mb-6 shadow-sm">
                  <Icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-base md:text-xl font-bold text-white mb-2 md:mb-3">{benefit.title}</h3>
                <p className="text-white/90 text-xs md:text-sm leading-relaxed font-medium">{benefit.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wa.me/5511940546968?text=Olá! Gostaria de solicitar a tabela de preços para atacado/varejo."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-accent-yellow hover:bg-[#ffe05d] text-primary-red px-8 py-4 rounded-full text-lg font-medium transition-colors shadow-lg shadow-yellow-500/20"
          >
            <Package className="w-5 h-5" />
            Solicitar Tabela de Preços
          </motion.a>
        </div>
      </div>
    </section>
  );
}
