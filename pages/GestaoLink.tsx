
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Save, 
  Trash2, 
  ExternalLink, 
  Phone, 
  Calendar, 
  MapPin, 
  Star, 
  Briefcase, 
  Users, 
  Link as LinkIcon,
  Palette,
  Layout,
  Globe,
  MoreVertical,
  Truck,
  RotateCcw,
  ChevronDown,
  X,
  ChevronUp as ArrowUp,
  ChevronDown as ArrowDown,
  Camera,
  User as UserIcon,
  FileText,
  Copy,
  Check
} from 'lucide-react';

// Official WhatsApp SVG Icon
const WhatsAppLogo = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  isSystem?: boolean;
}

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  whatsapp: WhatsAppLogo,
  delivery: Truck,
  reservas: Calendar,
  endereco: MapPin,
  feedback: Star,
  vagas: FileText,
  parcerias: Users,
  generic: LinkIcon
};

const SYSTEM_TEMPLATES: Record<string, Omit<LinkItem, 'id'>> = {
  whatsapp: { label: 'WhatsApp', url: '', icon: 'whatsapp', isSystem: true },
  endereco: { label: 'Endereço', url: '', icon: 'endereco', isSystem: true },
  curriculos: { label: 'Currículos', url: '', icon: 'vagas', isSystem: true },
  feedback: { label: 'Feedback', url: '', icon: 'feedback', isSystem: true },
  reservas: { label: 'Reservas', url: '', icon: 'reservas', isSystem: true },
};

const GestaoLinkPage: React.FC = () => {
  const [profileName, setProfileName] = useState('seu-negocio');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [title, setTitle] = useState('Título da sua Página');
  const [description, setDescription] = useState('Uma breve descrição sobre o seu negócio ou serviços. ✨');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [cardColor, setCardColor] = useState('#2563eb');
  const [textColor, setTextColor] = useState('#0a0a0a');
  const [cardTextColor, setCardTextColor] = useState('#ffffff');

  const [links, setLinks] = useState<LinkItem[]>([
    { id: '1', label: 'WhatsApp', url: 'https://wa.me/5511999999999', icon: 'whatsapp', isSystem: true },
    { id: '2', label: 'Endereço', url: 'Rua Exemplo, 123 - São Paulo', icon: 'endereco', isSystem: true },
    { id: '3', label: 'Reservas', url: 'https://reservas.com', icon: 'reservas', isSystem: true },
  ]);

  const [openIconPicker, setOpenIconPicker] = useState<string | null>(null);

  const handleVerify = () => {
    if (!profileName) return;
    setIsVerifying(true);
    setIsAvailable(null);
    setTimeout(() => {
      setIsVerifying(false);
      setIsAvailable(true);
    }, 800);
  };

  const handleCopyLink = () => {
    const fullLink = `lepps.com/${profileName}`;
    navigator.clipboard.writeText(fullLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomLink = () => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      label: 'Novo Botão',
      url: '',
      icon: 'generic',
      isSystem: false
    };
    setLinks([...links, newLink]);
  };

  const addTemplateLink = (key: keyof typeof SYSTEM_TEMPLATES) => {
    const template = SYSTEM_TEMPLATES[key];
    const newLink: LinkItem = {
      ...template,
      id: Date.now().toString(),
    };
    setLinks([...links, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const updateLink = (id: string, field: keyof LinkItem, value: string) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
    setLinks(newLinks);
  };

  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm transition-all text-slate-700 placeholder:text-slate-400 font-normal shadow-sm";
  const labelClass = "text-xs font-semibold text-slate-500 mb-1.5 block ml-1";

  const renderIcon = (iconName: string, size = 18, isMockup = false) => {
    const Icon = ICON_COMPONENTS[iconName] || ICON_COMPONENTS.generic;
    
    if (isMockup) {
      return <Icon size={size} style={{ color: cardTextColor }} />;
    }

    const colorClass = iconName === 'whatsapp' ? 'text-emerald-500' : 'text-indigo-500';
    return <Icon size={size} className={colorClass} />;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-20">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .icon-picker-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 flex-shrink-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Gestão de Links</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personalize sua página Bio Link</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyLink}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm font-semibold text-sm border ${
              linkCopied 
                ? 'bg-emerald-50 border-emerald-500 text-white' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {linkCopied ? <Check size={18} /> : <Copy size={18} />}
            {linkCopied ? 'Copiado!' : 'Copiar Link'}
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md">
            <Save size={18} /> Salvar Alterações
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-start relative">
        
        {/* COL 1: CONFIGS (Left) - Removed sticky from here */}
        <div className="lg:w-[280px] flex flex-col gap-6 flex-shrink-0">
          {/* Domínio */}
          <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <Globe className="text-indigo-600" size={18} />
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Domínio</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
                <span className="pl-4 text-xs font-medium text-slate-400">lepps.com/</span>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => {
                    setProfileName(e.target.value.toLowerCase().replace(/\s/g, '-'));
                    setIsAvailable(null);
                  }}
                  className="flex-1 px-1 py-2.5 bg-transparent text-sm font-semibold text-indigo-600 outline-none" 
                  placeholder="perfil"
                />
              </div>
              <button 
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                {isVerifying ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </section>

          {/* Perfil e Cores */}
          <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <Layout className="text-indigo-600" size={18} />
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Identidade</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-500 transition-all shrink-0 overflow-hidden group relative"
                >
                  {profileImage ? (
                    <>
                      <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <Plus size={20} />
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Título</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={`${inputClass}`} />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Bio (Descrição)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className={`${inputClass} h-20 resize-none pt-3 text-xs`}
                  placeholder="Conte um pouco sobre você..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={labelClass}>Fundo</label>
                  <input type="color" title="Cor de Fundo" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer bg-white border border-slate-200 p-1" />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Texto</label>
                  <input type="color" title="Cor do Texto" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer bg-white border border-slate-200 p-1" />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Botão</label>
                  <input type="color" title="Cor do Botão" value={cardColor} onChange={e => setCardColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer bg-white border border-slate-200 p-1" />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Texto Botão</label>
                  <input type="color" title="Cor do Texto Botão" value={cardTextColor} onChange={e => setCardTextColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer bg-white border border-slate-200 p-1" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* COL 2: LINKS (Middle) - Will scroll naturally */}
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <LinkIcon size={20} />
              </div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Meus Links</h2>
            </div>
            <button 
              onClick={addCustomLink}
              className="bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={16} /> Personalizado
            </button>
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="mb-6 flex flex-wrap gap-2 flex-shrink-0">
            {Object.keys(SYSTEM_TEMPLATES).map((key) => {
              const item = SYSTEM_TEMPLATES[key as keyof typeof SYSTEM_TEMPLATES];
              return (
                <button
                  key={key}
                  onClick={() => addTemplateLink(key as keyof typeof SYSTEM_TEMPLATES)}
                  className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                >
                  {renderIcon(item.icon, 14)}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Links List */}
          <div className="space-y-4 pb-6">
            {links.map((link, index) => (
              <div key={link.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl flex gap-4 items-start relative animate-in slide-in-from-bottom-2 shadow-sm">
                
                {/* Reorder Controls */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button 
                    disabled={index === 0}
                    onClick={() => moveLink(index, 'up')}
                    className="p-1.5 text-slate-300 hover:text-indigo-600 disabled:opacity-20 transition-all rounded-lg hover:bg-white"
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button 
                    disabled={index === links.length - 1}
                    onClick={() => moveLink(index, 'down')}
                    className="p-1.5 text-slate-300 hover:text-indigo-600 disabled:opacity-20 transition-all rounded-lg hover:bg-white"
                  >
                    <ArrowDown size={18} />
                  </button>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
                  {/* Row 1: Icon and Name */}
                  <div className="flex items-end gap-4">
                    <div className="space-y-1.5 flex-shrink-0">
                      <label className={labelClass}>Ícone</label>
                      <div className="relative">
                        {link.isSystem ? (
                          <div className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm">
                            {renderIcon(link.icon, 20)}
                          </div>
                        ) : (
                          <button 
                            onClick={() => setOpenIconPicker(openIconPicker === link.id ? null : link.id)}
                            className={`w-12 h-12 flex items-center justify-center bg-white border rounded-xl shadow-sm transition-all hover:border-indigo-500 ${openIconPicker === link.id ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200'}`}
                          >
                            {renderIcon(link.icon, 20)}
                            <ChevronDown size={12} className="ml-1 text-slate-300" />
                          </button>
                        )}
                        
                        {/* Popover Icon Picker - Only for non-system links */}
                        {!link.isSystem && openIconPicker === link.id && (
                          <>
                            <div className="fixed inset-0 z-[60] bg-transparent" onClick={() => setOpenIconPicker(null)} />
                            <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-[70] icon-picker-grid w-48 animate-in fade-in zoom-in-95 duration-200">
                              {Object.keys(ICON_COMPONENTS).map(iconKey => (
                                <button
                                  key={iconKey}
                                  onClick={() => { updateLink(link.id, 'icon', iconKey); setOpenIconPicker(null); }}
                                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${link.icon === iconKey ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                                >
                                  {renderIcon(iconKey, 18)}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className={labelClass}>Nome do Botão</label>
                      <input 
                        type="text" 
                        value={link.label} 
                        onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                        className={inputClass} 
                        placeholder="Ex: WhatsApp"
                      />
                    </div>
                  </div>

                  {/* Row 2: Destination Field */}
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within/input:opacity-100 transition-opacity pointer-events-none">
                      {renderIcon(link.icon, 16)}
                    </div>
                    <input 
                      type="text" 
                      value={link.url} 
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      className={`${inputClass} pl-12 py-3`} 
                      placeholder={
                        link.icon === 'endereco' ? 'Endereço Completo (Texto)' : 
                        'https://link.com'
                      }
                    />
                  </div>
                </div>

                {/* Trash Button */}
                <button 
                  onClick={() => removeLink(link.id)}
                  className="mt-8 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            {links.length === 0 && (
              <div className="py-20 text-center text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                <LinkIcon size={40} className="opacity-10" />
                <p className="text-sm font-medium opacity-60">Nenhum botão criado</p>
              </div>
            )}
          </div>
        </div>

        {/* COL 3: PREVIEW (Right) - TRULY STATIC/FIXED RELATIVE TO SCROLL CONTAINER */}
        <div className="lg:w-[340px] flex-shrink-0 flex items-start justify-center bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 min-h-[600px] lg:sticky lg:top-4 self-start">
          <div className="w-[260px] h-[520px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-900 relative ring-1 ring-slate-200">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-3xl z-20" />
            
            {/* Mockup Content */}
            <div className="w-full h-full flex flex-col items-center p-6 pt-14" style={{ backgroundColor }}>
              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-2xl border-2 border-indigo-600 p-1 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={24} />
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm tracking-tight truncate w-[200px]" style={{ color: textColor }}>{title}</h4>
                  <p className="text-[10px] font-medium opacity-70 leading-relaxed px-2 line-clamp-2" style={{ color: textColor }}>{description}</p>
                </div>
              </div>

              {/* Mockup Buttons Render */}
              <div className="w-full space-y-3 px-1">
                {links.map(link => (
                  <div 
                    key={link.id}
                    className="w-full p-3 rounded-2xl flex items-center justify-center shadow-sm transition-all cursor-pointer ring-1 ring-black/5 relative"
                    style={{ backgroundColor: cardColor, color: cardTextColor }}
                  >
                    <div className="absolute left-4 flex items-center justify-center shrink-0">
                      {renderIcon(link.icon, 13, true)}
                    </div>
                    
                    <span className="text-[11px] font-bold tracking-tight truncate max-w-[140px] text-center">
                      {link.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestaoLinkPage;
