
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Calendar, User, MapPin, Tag } from 'lucide-react';

const CurriculoDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, fetch data by ID
  const mockData = {
    nome: "Candidato Exemplo",
    funcao: "Garçom / Atendente",
    data: "12/05/2024",
    contato: "(11) 9 1234-5678",
    idade: 28,
    sexo: "Masculino",
    cidade: "São Paulo",
    bairro: "Pinheiros",
    email: "candidato@email.com",
    experiencia: "Experiência de 3 anos em restaurantes à la carte. Boa comunicação e disponibilidade de horários, inclusive finais de semana e feriados.",
    escolaridade: "Ensino Médio Completo",
    observacao: "Possui curso de boas práticas de manipulação de alimentos."
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar para a lista
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-indigo-600 p-8 text-white">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-end">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-bold shadow-lg">
              {mockData.nome.charAt(0)}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">{mockData.nome}</h1>
              <p className="text-indigo-100 flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Tag size={16} />
                {mockData.funcao}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Informações Básicas</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-600">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Contato</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{mockData.contato}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Data de Cadastro</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{mockData.data}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-600">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Idade / Sexo</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{mockData.idade} anos • {mockData.sexo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-indigo-600">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Localização</p>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{mockData.bairro}, {mockData.cidade}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Resumo Profissional</h3>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm italic">
                    "{mockData.experiencia}"
                  </p>
                </div>
              </section>
              
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Observações Internas</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {mockData.observacao}
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculoDetail;
