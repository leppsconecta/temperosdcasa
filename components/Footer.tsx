import { Leaf, Instagram, Facebook } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-earth-800 text-earth-100 pt-16 pb-8 border-t border-earth-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <a href="#inicio" className="flex items-center gap-2 group mb-6">
              <Leaf className="w-8 h-8 text-secondary-green" />
              <span className="text-2xl font-bold tracking-tight text-white">
                Temperos D'Casa
              </span>
            </a>
            <p className="text-earth-200 text-sm leading-relaxed mb-6">
              Sabor, qualidade e natureza em cada tempero. Produtos naturais selecionados para transformar suas receitas.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-earth-700 flex items-center justify-center hover:bg-primary-red hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-earth-700 flex items-center justify-center hover:bg-primary-red hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://wa.me/5511940546968" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-earth-700 flex items-center justify-center hover:bg-secondary-green hover:text-white transition-colors">
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-earth-700 flex items-center justify-center hover:bg-primary-red hover:text-white transition-colors">
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="hidden md:block">
            <h4 className="font-bold text-white text-lg mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              <li><a href="#inicio" className="text-earth-200 hover:text-primary-red transition-colors text-sm">Início</a></li>
              <li><a href="#produtos" className="text-earth-200 hover:text-primary-red transition-colors text-sm">Nossos Produtos</a></li>
              <li><a href="#quem-somos" className="text-earth-200 hover:text-primary-red transition-colors text-sm">Quem Somos</a></li>
              <li><a href="#atacado" className="text-earth-200 hover:text-primary-red transition-colors text-sm">Atacado e Varejo</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="hidden md:block">
            <h4 className="font-bold text-white text-lg mb-6">Categorias</h4>
            <ul className="space-y-3">
              <li><a href="#produtos" className="text-earth-200 hover:text-primary-red transition-colors text-sm">Temperos</a></li>
              <li><a href="#produtos" className="text-earth-200 hover:text-primary-red transition-colors text-sm">Chás e Ervas</a></li>
              <li><a href="#produtos" className="text-earth-200 hover:text-primary-red transition-colors text-sm">Grãos e Oleaginosas</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="hidden md:block">
            <h4 className="font-bold text-white text-lg mb-6">Contato</h4>
            <ul className="space-y-3">
              <li className="text-earth-200 text-sm">
                <span className="block text-earth-400 mb-1">WhatsApp:</span>
                <a href="https://wa.me/5511940546968" className="hover:text-mustard-500 transition-colors">
                  (11) 94054-6968
                </a>
              </li>
              <li className="text-earth-200 text-sm mt-4">
                <span className="block text-earth-400 mb-1">Atendimento:</span>
                Segunda a Sexta, 8h às 18h
              </li>
              <li className="text-earth-200 text-sm mt-4">
                <span className="block text-earth-400 mb-1">Envio:</span>
                Entregamos em todo o Brasil
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-earth-700 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-earth-400 text-sm">
            © {new Date().getFullYear()} Temperos D'Casa. Todos os direitos reservados.
          </p>
          <p className="text-earth-400 text-sm hidden md:flex items-center gap-1">
            Feito com <span className="text-mustard-500">♥</span> para você.
          </p>
        </div>
      </div>
    </footer>
  );
}
