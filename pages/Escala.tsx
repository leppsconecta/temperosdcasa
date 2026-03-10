
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Share2,
  Settings,
  Plus,
  ChevronDown,
  ArrowRight,
  GripVertical,
  Clock,
  MapPin,
  Trash2,
  CalendarDays,
  Download,
  Calendar,
  User as UserIcon,
  RotateCcw,
  FileText,
  Copy,
  CheckCircle2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Modal from '../components/UI/Modal';
import { Funcionario, TurnoConfig } from '../types';
import { DBService } from '../lib/db';

const INITIAL_TURNOS = [
  { id: 't1', label: 'Manhã', inicio: '08:00', fim: '16:00', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20', colorClass: 'text-emerald-600 dark:text-emerald-400', borderClass: 'border-emerald-200 dark:border-emerald-800' },
  { id: 't2', label: 'Tarde', inicio: '16:00', fim: '00:00', bgClass: 'bg-blue-50 dark:bg-blue-900/20', colorClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-blue-200 dark:border-blue-800' },
  { id: 't3', label: 'Noite', inicio: '00:00', fim: '08:00', bgClass: 'bg-purple-50 dark:bg-purple-900/20', colorClass: 'text-purple-600 dark:text-purple-400', borderClass: 'border-purple-200 dark:border-purple-800' }
] as any[];

// --- UTILS ---
const formatName = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[1]}`;
};

const formatNameShort = (fullName: string) => {
  const names = fullName.trim().replace(/\s+/g, ' ').split(' ');
  if (names.length === 1) return names[0];
  const first = names[0];
  const last = names[names.length - 1];
  return `${first} ${last}`;
};

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setHours(0, 0, 0, 0)).setDate(diff);
};

// --- MODAL COMPONENTS ---

const SelectTurnoModal: React.FC<{
  turnos: TurnoConfig[],
  onSelect: (turnoId: string) => void,
  employeeName: string
}> = ({ turnos, onSelect, employeeName }) => (
  <div className="space-y-6 py-2">
    <div className="space-y-1">
      <p className="text-sm text-slate-500 font-medium">Escolha o turno para escalar:</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{employeeName}</p>
    </div>
    <div className="grid grid-cols-1 gap-3">
      {turnos.map(turno => (
        <button
          key={turno.id}
          onClick={() => onSelect(turno.id)}
          className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group active:scale-[0.98] ${turno.bgClass} ${turno.borderClass} hover:shadow-lg hover:brightness-95 dark:bg-slate-900/40 dark:border-slate-700`}
        >
          <div className="flex flex-col items-start text-left">
            <span className={`text-xs font-bold ${turno.colorClass}`}>{turno.label}</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{turno.id === 't4' ? turno.inicio : `Das ${turno.inicio} às ${turno.fim}`}</span>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border ${turno.borderClass} group-hover:scale-110 transition-transform`}>
            <ArrowRight size={16} className={turno.colorClass} />
          </div>
        </button>
      ))}
    </div>
  </div>
);

const MobileEmployeeSelector: React.FC<{
  onSelect: (employeeId: string) => void,
  employees: Funcionario[]
}> = ({ onSelect, employees }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = employees.filter(f =>
    f.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.funcao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {filtered.map(f => (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 font-bold text-xs flex items-center justify-center">
              {f.nome?.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatName(f.nome)}</p>
              <p className="text-[10px] text-slate-500">{f.funcao}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const ConfigTurnosForm: React.FC<{ turnos: TurnoConfig[], onChange: (t: TurnoConfig[]) => void }> = ({ turnos, onChange }) => {
  const handleTimeChange = (id: string, field: 'inicio' | 'fim', value: string) => {
    const updated = turnos.map(t => t.id === id ? { ...t, [field]: value } : t);
    onChange(updated);
  };
  return (
    <div className="space-y-4 py-2">
      {turnos.map(t => (
        <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className={`w-2 h-8 rounded-full ${t.bgClass} ${t.colorClass.replace('text', 'bg')}`} />
          <div className="flex-1">
            <p className={`text-xs font-bold ${t.colorClass} mb-1`}>{t.label}</p>
            <div className="flex items-center gap-2">
              <input type="time" value={t.inicio} onChange={e => handleTimeChange(t.id, 'inicio', e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-center w-20 outline-none focus:border-red-500" />
              <span className="text-slate-400 font-bold text-xs">às</span>
              <input type="time" value={t.fim} onChange={e => handleTimeChange(t.id, 'fim', e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-center w-20 outline-none focus:border-red-500" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EditCopyModalContent: React.FC<{ initialText: string, onCancel: () => void }> = ({ initialText, onCancel }) => {
  const [text, setText] = useState(initialText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Escala copiada para a área de transferência!");
      onCancel();
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conteúdo da Escala</span>
          <button
            onClick={() => setText(initialText)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
          >
            <RotateCcw size={12} /> Restaurar
          </button>
        </div>
        <div className="p-0">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full h-[400px] p-4 text-sm font-mono text-slate-600 dark:text-slate-300 bg-transparent resize-none focus:outline-none custom-scrollbar leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all group"
      >
        <Copy size={20} className="group-hover:scale-110 transition-transform" />
        <span className="uppercase tracking-wide">Copiar para o WhatsApp</span>
      </button>

      <p className="text-center text-[10px] text-slate-400 font-medium italic">
        Você pode editar o texto acima antes de copiar.
      </p>


    </div>
  );
};

const ShareEscalaModal: React.FC<{ onDownload: () => void, onCopyText: () => void }> = ({ onDownload, onCopyText }) => (
  <div className="grid grid-cols-2 gap-4 py-4">
    <button onClick={onDownload} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-white hover:shadow-lg hover:border-red-100 transition-all group">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
        <Download size={24} />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Baixar PDF</span>
    </button>
    <button onClick={onCopyText} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-white hover:shadow-lg hover:border-emerald-100 transition-all group">
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
        <Copy size={24} />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Copiar Texto</span>
    </button>
  </div>
);

// --- MAIN COMPONENT ---

const EscalaPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'semanal' | 'pontual'>('pontual');
  const [currentWeekMonday, setCurrentWeekMonday] = useState(getMonday(new Date()));
  const [pontualDate, setPontualDate] = useState(new Date());

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [escala, setEscala] = useState<Record<string, string[]>>({});
  const [turnosConfigs, setTurnosConfigs] = useState<TurnoConfig[]>(INITIAL_TURNOS);
  const [tempTurnos, setTempTurnos] = useState<TurnoConfig[]>(INITIAL_TURNOS);

  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTurno, setExpandedTurno] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    type: any;
    content: React.ReactNode;
    onConfirm?: () => void;
    maxWidth?: string;
  }>({
    isOpen: false,
    title: '',
    type: 'view-content',
    content: null,
  });

  const reportRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
      // 1. Fetch Funcionarios (Real DB)
      const funcList = await DBService.funcionarios.getAll();
      setFuncionarios(funcList); // Assuming DB returns correct mapping

      // 2. Fetch Turnos (Real DB) - Using hardcoded for now if DB empty, but let's try fetch
      const dbTurnos = await DBService.turnos.getAll();
      if (dbTurnos && dbTurnos.length > 0) {
        // Filter out turno personalizado (t4)
        const filteredTurnos = dbTurnos.filter((t: TurnoConfig) => t.id !== 't4');
        setTurnosConfigs(filteredTurnos);
      }

      // 3. Fetch Escala Range
      // Calculate range based on activeTab
      let start, end;
      if (activeTab === 'semanal') {
        const d = new Date(currentWeekMonday);
        start = d.toISOString().split('T')[0];
        const e = new Date(d);
        e.setDate(d.getDate() + 6);
        end = e.toISOString().split('T')[0];
      } else {
        start = pontualDate.toISOString().split('T')[0];
        end = start;
      }

      const dbEscala = await DBService.escala.getByRange(start, end);

      // Transform DB Escala (array) to Map
      // DB: { data: '2023-10-27', turno_id: 't1', funcionario_id: 'abc' }
      // Map: { 'dayTimestamp-turnoId': ['abc', 'def'] }
      const newEscalaMap: Record<string, string[]> = {};

      dbEscala.forEach((entry: any) => {
        // Convert DB date string to local Midnight timestamp for ID consistency with UI
        const entryDate = new Date(entry.data + 'T00:00:00'); // Force local midnight
        const dayId = entryDate.setHours(0, 0, 0, 0);
        const key = `${dayId}-${entry.turno_id}`;

        if (!newEscalaMap[key]) newEscalaMap[key] = [];
        newEscalaMap[key].push(entry.funcionario_id);
      });

      setEscala(newEscalaMap);

    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentWeekMonday, activeTab, pontualDate]);

  // --- ACTIONS ---
  const handleDownloadPDF = async () => {
    try {
      const isPontual = activeTab === 'pontual';
      const orientation = isPontual ? 'p' : 'l'; // Portrait for Pontual, Landscape for Semanal
      const doc = new jsPDF(orientation, 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const marginX = 10;
      const marginY = 15;

      // --- HEADER ---
      // Title
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59); // Slate 800
      const title = isPontual ? 'Escala Diária' : 'Escala Semanal';
      doc.text(title, marginX, 22);

      // Date Range & Timestamp
      const rightX = pageWidth - marginX;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(dateText, rightX, 18, { align: 'right' });

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const now = new Date();
      const timestamp = `Emitido em: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR').slice(0, 5)}`;
      doc.text(timestamp, rightX, 22, { align: 'right' });

      // Separator Line
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.5);
      doc.line(marginX, 26, rightX, 26);

      // --- CONTENT ---
      let startY = 32;

      if (isPontual) {
        // --- PONTUAL (Vertical Layout) ---
        const dayId = pontualDate.setHours(0, 0, 0, 0);

        turnosConfigs.forEach(t => {
          const key = `${dayId}-${t.id}`;
          const assigned = escala[key] || [];

          // Only show turns with employees or show empty text? Let's show all configured turns for clarity, or just active ones.
          // User said "Ajuste no modo pontual... apenas do dia". 
          // Similar to screen logic: if (assigned.length === 0) return; ?
          // On screen it shows empty boxes. In PDF usually we want to see who is working.

          doc.setFillColor(248, 250, 252); // Slate 50 background for header
          doc.rect(marginX, startY, pageWidth - (marginX * 2), 10, 'F');

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(59, 130, 246); // Blue 500
          doc.text(`${t.label} (${t.inicio} - ${t.fim})`, marginX + 3, startY + 7);

          startY += 15; // Move below header

          if (assigned.length > 0) {
            assigned.forEach(uid => {
              const f = funcionarios.find(emp => emp.id === uid);
              if (f) {
                // Bullet point style
                doc.setDrawColor(203, 213, 225); // Slate 300
                doc.setLineWidth(0.2);

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 41, 59); // Slate 800
                const name = f.nome;
                doc.text(name, marginX + 5, startY);

                // Role aligned to right or next to name?
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 116, 139); // Slate 500
                const role = f.funcao || 'N/A';
                doc.text(role.toUpperCase(), marginX + 80, startY); // Fixed column for role

                // Bottom separator
                doc.line(marginX + 2, startY + 2, pageWidth - marginX - 2, startY + 2);

                startY += 8;
              }
            });
            startY += 5; // Extra gap after list
          } else {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(148, 163, 184); // Slate 400
            doc.text("Nenhum funcionário escalado neste turno.", marginX + 5, startY);
            startY += 10;
          }

          startY += 5; // Gap between turns
        });

      } else {
        // --- SEMANAL (Grid Layout) - Keeping original logic ---
        const gap = 3;
        // Calculate column width dynamically: (PageWidth - (Margins * 2) - (Gap * 6)) / 7
        const colWidth = (pageWidth - (marginX * 2) - (gap * 6)) / 7;
        const gridHeight = pageHeight - startY - 20; // 20mm bottom margin for footer

        weekDays.forEach((day, index) => {
          const x = marginX + (index * (colWidth + gap));

          // 1. Column Header (Dark Box)
          doc.setFillColor(15, 23, 42); // Slate 900 (Dark)
          doc.roundedRect(x, startY, colWidth, 14, 2, 2, 'F');

          // Header Text
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(day.label, x + (colWidth / 2), startY + 5, { align: 'center' });

          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(148, 163, 184); // Slate 400
          const dateStr = `${day.dia}/${day.fullDate.getMonth() + 1}`;
          doc.text(dateStr, x + (colWidth / 2), startY + 10, { align: 'center' });

          // 2. Column Body (Border)
          doc.setDrawColor(226, 232, 240); // Slate 200
          doc.setLineWidth(0.3);
          // Draw rect for body
          doc.roundedRect(x, startY + 14, colWidth, gridHeight - 14, 2, 2, 'S');

          // 3. Content
          let currentY = startY + 18;

          turnosConfigs.forEach(t => {
            const key = `${day.id}-${t.id}`;
            const assigned = escala[key] || [];

            if (assigned.length > 0) {
              // Turno Header (e.g. 1º Turno)
              // Thin separator before if not first
              if (currentY > startY + 20) {
                doc.setDrawColor(241, 245, 249); // lighter separator
                doc.line(x + 2, currentY - 3, x + colWidth - 2, currentY - 3);
              }

              doc.setFontSize(7);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(59, 130, 246); // Blue 500

              // Custom label logic for turns
              const tLabel = t.id === 't1' ? '1º Turno' : t.id === 't2' ? '2º Turno' : t.id === 't3' ? '3º Turno' : t.label;
              doc.text(tLabel, x + 2, currentY);
              currentY += 4;

              // Employees
              assigned.forEach(uid => {
                const f = funcionarios.find(emp => emp.id === uid);
                if (f) {
                  // Name
                  doc.setFontSize(8);
                  doc.setFont('helvetica', 'bold');
                  doc.setTextColor(51, 65, 85); // Slate 700
                  const name = formatNameShort(f.nome);
                  doc.text(name, x + 2, currentY);

                  // Role
                  if (f.funcao) {
                    currentY += 3;
                    doc.setFontSize(6);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 116, 139); // Slate 500
                    // Truncate role if too long??
                    doc.text(f.funcao, x + 2, currentY);
                  }
                  currentY += 5; // Space for next person
                }
              });
              currentY += 2; // Extra space after group
            }
          });
        });
      }

      // --- FOOTER ---
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59); // Darker for visibility
      doc.text('Desenvolvido por leppsconecta.com', pageWidth - marginX, pageHeight - 8, { align: 'right' });

      doc.save(`escala-hashi-${dateText.replace(/\s+/g, '-')}.pdf`);
      setModalConfig(prev => ({ ...prev, isOpen: false }));

    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Erro ao gerar PDF: " + (error instanceof Error ? error.message : "Desconhecido"));
    }
  };

  const handleCopyText = async () => {
    let text = `📅 *Escala Semanal*\n------------------------\n\n`;

    const formatNameInitial = (fullName: string) => {
      const names = fullName.trim().replace(/\s+/g, ' ').split(' ');
      if (names.length === 1) return names[0];
      const first = names[0];
      const last = names[names.length - 1];
      return `${first} ${last.charAt(0)}.`;
    };

    const getTurnoLabel = (id: string, originalLabel: string) => {
      if (id === 't1') return '1º Turno';
      if (id === 't2') return '2º Turno';
      if (id === 't3') return '3º Turno';
      return originalLabel;
    };

    weekDays.forEach(day => {
      const dayHasScale = turnosConfigs.some(t => {
        const key = `${day.id}-${t.id}`;
        const assigned = escala[key] || [];
        return assigned.length > 0;
      });

      if (!dayHasScale && activeTab === 'semanal') return;

      if (dayHasScale) {
        text += `📍 *${day.label} (${day.dia}/${day.fullDate.getMonth() + 1})*\n\n`;

        turnosConfigs.forEach((t) => {
          const key = `${day.id}-${t.id}`;
          const assigned = escala[key] || [];
          if (assigned.length > 0) {
            const label = getTurnoLabel(t.id, t.label);
            text += `🠖 ${label} (${t.inicio} - ${t.fim}h):\n`;
            assigned.forEach(uid => {
              const f = funcionarios.find(x => x.id === uid);
              if (f) {
                const role = f.funcao || 'Funcionario';
                text += `* *${formatNameInitial(f.nome)}* - _${role}_\n`;
              }
            });
            text += '\n';
          }
        });
      }
    });

    setModalConfig({
      isOpen: true,
      title: 'Editar e Copiar Texto',
      type: 'view-content',
      maxWidth: 'max-w-xl',
      content: <EditCopyModalContent initialText={text} onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
    });
  };


  // --- COMPUTED ---
  const weekDays = useMemo(() => {
    const days = [];
    const mon = new Date(currentWeekMonday);
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      days.push({
        id: d.setHours(0, 0, 0, 0),
        dia: d.getDate(),
        label: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d.getDay()],
        fullDate: d
      });
    }
    return days;
  }, [currentWeekMonday]);

  const dateText = useMemo(() => {
    if (activeTab === 'pontual') {
      return pontualDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    const start = new Date(currentWeekMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const m1 = start.toLocaleDateString('pt-BR', { month: 'long' });
    const m2 = end.toLocaleDateString('pt-BR', { month: 'long' });
    if (m1 === m2) return `${start.getDate()} a ${end.getDate()} de ${m1}`;
    return `${start.getDate()} de ${m1} a ${end.getDate()} de ${m2}`;
  }, [currentWeekMonday, activeTab, pontualDate]);

  const filteredFuncionarios = useMemo(() => {
    if (!searchTerm.trim()) return funcionarios;
    const term = searchTerm.toLowerCase();
    return funcionarios.filter(f =>
      f.nome?.toLowerCase().includes(term) ||
      f.funcao?.toLowerCase().includes(term)
    );
  }, [searchTerm, funcionarios]);


  // --- HANDLERS ---
  const changeWeek = (dir: number) => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + (dir * 7));
    setCurrentWeekMonday(d.getTime());
  };

  const changeDay = (dir: number) => {
    const d = new Date(pontualDate);
    d.setDate(d.getDate() + dir);
    setPontualDate(d);
  };

  const handleDropOnDay = (dayId: number, employeeId: string) => {
    // Open standard modal for turn selection
    const emp = funcionarios.find(f => f.id === employeeId);
    if (!emp) return;

    setModalConfig({
      isOpen: true,
      title: 'Atribuir Turno',
      type: 'view-content',
      maxWidth: 'max-w-md',
      content: (
        <SelectTurnoModal
          turnos={turnosConfigs}
          employeeName={emp.nome}
          onSelect={async (turnoId) => {
            await completeAssignment(dayId, turnoId, employeeId);
            setModalConfig(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )
    });
  };

  const completeAssignment = async (dayId: number, turnoId: string, employeeId: string) => {
    // Optimistic Update
    const key = `${dayId}-${turnoId}`;
    const currentList = escala[key] || [];

    if (currentList.includes(employeeId)) return; // No duplicates

    const newList = [...currentList, employeeId];
    setEscala(prev => ({ ...prev, [key]: newList }));

    // DB Persist
    const dateStr = new Date(dayId).toISOString().split('T')[0];
    await DBService.escala.add(dateStr, turnoId, employeeId);
  };

  const removeFuncionarioFromEscala = async (dayId: number, turnoId: string, employeeId: string) => {
    const key = `${dayId}-${turnoId}`;
    const currentList = escala[key] || [];
    const newList = currentList.filter(id => id !== employeeId);

    setEscala(prev => ({ ...prev, [key]: newList })); // Optimistic

    // DB Persist
    const dateStr = new Date(dayId).toISOString().split('T')[0];
    await DBService.escala.remove(dateStr, turnoId, employeeId);
  };

  // --- RENDERERS ---

  const renderDayCard = (day: typeof weekDays[0]) => {
    const isToday = day.fullDate.toDateString() === new Date().toDateString();

    // Check if day is hidden on mobile/active logic if needed (skipping for complexity, showing all)

    return (
      <div
        key={day.id}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          if (draggedEmployeeId) handleDropOnDay(day.id, draggedEmployeeId);
        }}
        className={`flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden relative group
          ${isToday
            ? 'bg-white dark:bg-slate-900 border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isToday ? 'border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold uppercase tracking-wider ${isToday ? 'text-red-700 dark:text-red-400' : 'text-slate-500'}`}>
              {day.label.slice(0, 3)}
            </span>
            <span className={`text-xl font-black ${isToday ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
              {day.dia}
            </span>
          </div>
        </div>

        {/* Turnos Slots */}
        <div className="flex-1 p-2 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {turnosConfigs.map(turno => {
            const key = `${day.id}-${turno.id}`;
            const assigned = escala[key] || [];

            // Per existing request: "Exiba apenas turnos que contem funcionário."
            if (assigned.length === 0) return null;

            const isExpanded = expandedTurno === key;

            return (
              <div key={turno.id} className="relative mb-3 last:mb-0">
                {/* Turno Label (Clickable Header) */}
                <div
                  onClick={() => setExpandedTurno(isExpanded ? null : key)}
                  className={`flex items-center gap-2 mb-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${turno.bgClass.replace('bg-', 'bg-')}`} style={{ backgroundColor: 'currentColor' }} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${turno.colorClass} flex-1`}>{turno.label}</span>

                  {/* Badge Count - Always Visible */}
                  <span className="flex items-center justify-center min-w-[16px] h-4 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 rounded px-1">
                    {assigned.length}
                  </span>

                  <button onClick={(e) => {
                    e.stopPropagation();
                    setModalConfig({
                      isOpen: true,
                      title: `${turno.label} - ${day.label}`,
                      type: 'view-content',
                      content: <MobileEmployeeSelector employees={funcionarios} onSelect={(empId) => {
                        completeAssignment(day.id, turno.id, empId);
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                      }} />
                    })
                  }} className="lg:hidden p-1 text-red-500"><Plus size={12} /></button>
                </div>

                {/* Assigned List (Accordion Content) */}
                {isExpanded && (
                  <div className="space-y-1.5 pl-2 animate-in slide-in-from-top-1 duration-200">
                    {assigned.map(empId => {
                      const f = funcionarios.find(x => x.id === empId);
                      if (!f) return null;
                      return (
                        <div key={empId} className="group/item flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate w-32">{formatNameShort(f.nome)}</span>
                          <button
                            onClick={() => removeFuncionarioFromEscala(day.id, turno.id, empId)}
                            className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all scale-90 hover:scale-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Empty State for Day */}
          {turnosConfigs.every(t => (escala[`${day.id}-${t.id}`] || []).length === 0) && (
            <div className="h-32 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300">
              <Calendar size={24} className="opacity-20" />
              <span className="text-[10px] font-medium opacity-50">Sem escalas</span>
              <span className="text-[9px] opacity-40 px-4 text-center">Arraste um funcionário para adicionar</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- LAYOUT ---
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 h-screen overflow-hidden">
      {/* 1. SIDEBAR (Internal) */}
      <div className="hidden lg:flex flex-col w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 shadow-xl">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Users size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">Funcionários</h2>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Buscar equipe..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {filteredFuncionarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <Users size={24} className="opacity-50" />
              <span className="text-xs">Nenhum funcionário</span>
            </div>
          ) : (
            filteredFuncionarios.map(f => (
              <div
                key={f.id}
                draggable
                onDragStart={() => setDraggedEmployeeId(f.id)}
                onDragEnd={() => setDraggedEmployeeId(null)}
                className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-red-200 hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                  {f.nome?.charAt(0)}{f.nome?.split(' ')[1]?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{formatName(f.nome)}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{f.funcao}</p>
                </div>
                <GripVertical size={14} className="text-slate-300 group-hover:text-red-400" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. MAIN CONTENT PAGE */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* HEADER BAR */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          {/* Left: Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('semanal')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'semanal' ? 'bg-white dark:bg-slate-900 shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semanal
            </button>
            <button
              onClick={() => setActiveTab('pontual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'pontual' ? 'bg-white dark:bg-slate-900 shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pontual
            </button>
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center gap-4">
            <button onClick={() => activeTab === 'semanal' ? changeWeek(-1) : changeDay(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{dateText}</span>
              {activeTab === 'semanal' && (
                <span onClick={() => setCurrentWeekMonday(getMonday(new Date()))} className="text-[10px] text-red-600 font-bold cursor-pointer hover:underline">Ir para hoje</span>
              )}
            </div>
            <button onClick={() => activeTab === 'semanal' ? changeWeek(1) : changeDay(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalConfig({ isOpen: true, title: 'Compartilhar', type: 'view-content', content: <ShareEscalaModal onDownload={handleDownloadPDF} onCopyText={handleCopyText} /> })}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              <Share2 size={16} /> Compartilhar
            </button>
            <button
              onClick={() => setModalConfig({ isOpen: true, title: 'Configurar', type: 'confirm-update', content: <ConfigTurnosForm turnos={turnosConfigs} onChange={setTempTurnos} />, onConfirm: () => setTurnosConfigs(tempTurnos) })}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* CANVAS */}
        <main ref={reportRef} className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar bg-slate-50 dark:bg-slate-950">
          {activeTab === 'semanal' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
              {weekDays.map(day => renderDayCard(day))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pontual View - Single day with all shifts */}
              {turnosConfigs.map(t => {
                const dayId = pontualDate.setHours(0, 0, 0, 0);
                const key = `${dayId}-${t.id}`;
                const assigned = escala[key] || [];

                return (
                  <div
                    key={t.id}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      if (draggedEmployeeId) {
                        completeAssignment(dayId, t.id, draggedEmployeeId);
                      }
                    }}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border ${t.borderClass} p-5 flex flex-col min-h-[400px] transition-all hover:shadow-lg ${draggedEmployeeId ? 'ring-2 ring-dashed ring-red-300 dark:ring-red-700' : ''}`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-10 rounded-full ${t.bgClass}`} style={{ backgroundColor: 'currentColor' }} />
                        <div>
                          <h3 className={`text-lg font-bold ${t.colorClass}`}>{t.label}</h3>
                          <span className="text-xs text-slate-500">{t.inicio} - {t.fim}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {assigned.length > 0 && (
                          <span className="px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                            {assigned.length}
                          </span>
                        )}
                        <button
                          onClick={() => setModalConfig({
                            isOpen: true,
                            title: `${t.label} - ${pontualDate.toLocaleDateString('pt-BR')}`,
                            type: 'view-content',
                            content: <MobileEmployeeSelector employees={funcionarios} onSelect={(empId) => {
                              completeAssignment(dayId, t.id, empId);
                              setModalConfig(prev => ({ ...prev, isOpen: false }));
                            }} />
                          })}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Employee List - scrollable after 10 items */}
                    <div className="flex-1 overflow-y-auto max-h-[360px] custom-scrollbar">
                      {assigned.length > 0 ? (
                        <div className="space-y-2">
                          {assigned.map(empId => {
                            const f = funcionarios.find(x => x.id === empId);
                            if (!f) return null;
                            return (
                              <div key={empId} className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 font-bold text-sm flex items-center justify-center">
                                    {f.nome?.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatNameShort(f.nome)}</span>
                                    <p className="text-[10px] text-slate-500">{f.funcao}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFuncionarioFromEscala(dayId, t.id, empId)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-full min-h-[200px] border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-3 text-slate-300">
                          <Users size={28} className="opacity-30" />
                          <span className="text-xs font-medium opacity-60">Nenhum funcionário escalado</span>
                          <span className="text-[10px] opacity-40">Clique no + para adicionar</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        type={modalConfig.type}
        maxWidth={modalConfig.maxWidth}
        content={modalConfig.content}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

export default EscalaPage;
