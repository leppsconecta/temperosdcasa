import React from 'react';
import { motion } from 'motion/react';
import { Heart, ShieldCheck, Truck, Users } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Qualidade Garantida',
      desc: 'Produtos selecionados com rigor para garantir o melhor sabor e aroma.',
    },
    {
      icon: Heart,
      title: 'Feito com Amor',
      desc: 'Tradição e cuidado artesanal em cada embalagem que chega até você.',
    },
    {
      icon: Users,
      title: 'Atacado e Varejo',
      desc: 'Atendemos desde o consumidor final até grandes estabelecimentos.',
    },
    {
      icon: Truck,
      title: 'Envio Nacional',
      desc: 'Entregamos nossos produtos com segurança em todo o Brasil.',
    },
  ];

  return (
    <section id="quem-somos" className="py-24 bg-earth-100 relative overflow-hidden" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-olive-900/5 -skew-x-12 translate-x-32 hidden lg:block"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-w-4 aspect-h-5 rounded-3xl overflow-hidden shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop"
                alt="Especiarias e temperos naturais"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-olive-900/20 mix-blend-multiply"></div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl hidden md:block border border-earth-200">
              <div className="flex items-center gap-4">
                <div className="bg-mustard-500/20 p-4 rounded-full">
                  <LeafIcon className="w-8 h-8 text-mustard-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-olive-900">100%</p>
                  <p className="text-sm font-medium text-earth-800 uppercase tracking-wider">Natural</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-mustard-600 font-semibold tracking-wider uppercase text-sm mb-4 block">
              Nossa História
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-olive-900 mb-6 leading-tight">
              Tradição e qualidade em cada grão.
            </h2>
            
            <div className="space-y-6 text-earth-800 text-lg font-light mb-10">
              <p>
                A <strong className="font-semibold text-olive-900">Empórios MDA</strong> nasceu da paixão por sabores autênticos e pela busca de uma vida mais saudável através da alimentação natural. Fundada com o propósito de reconectar as pessoas com a essência da culinária, nossa jornada começou em pequenos mercados locais e hoje alcançamos lares em todo o Brasil.
              </p>
              <p>
                Nosso compromisso é selecionar os melhores temperos, chás e grãos, garantindo que a pureza e a qualidade artesanal cheguem até a sua mesa. Acreditamos que o segredo de uma boa receita começa com ingredientes de excelência, cultivados com respeito à terra e colhidos no tempo certo para preservar suas propriedades nutricionais e aromáticas.
              </p>
              <p>
                Trabalhamos em parceria direta com produtores que compartilham de nossos valores, assegurando uma cadeia justa e sustentável. Cada produto que leva a nossa marca passa por um rigoroso controle de qualidade, desde a origem até o empacotamento final.
              </p>
              <p>
                Seja para o dia a dia da sua família ou para o seu negócio, oferecemos um atendimento acolhedor, confiável e próximo. Nossa missão vai além de vender produtos; queremos inspirar você a descobrir novos sabores, cuidar da sua saúde e criar momentos memoráveis ao redor da mesa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-olive-500 shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-olive-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-earth-800 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LeafIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
