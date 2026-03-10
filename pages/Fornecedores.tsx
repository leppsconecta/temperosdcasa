import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Phone, MapPin, Tag } from 'lucide-react';

interface Fornecedor {
  id: string;
  nome: string;
  telefone: string;
  categoria: string;
  cidade: string;
  estado: string;
}

const MOCK_FORNECEDORES: Fornecedor[] = [
  { id: '1', nome: 'Agro Temperos Ltda', telefone: '(11) 98888-7777', categoria: 'Ervas e Especiarias', cidade: 'Salto', estado: 'SP' },
  { id: '2', nome: 'Distribuidora Global', telefone: '(21) 97777-6666', categoria: 'Embalagens', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { id: '3', nome: 'Sais do Brasil', telefone: '(47) 96666-5555', categoria: 'Sais e Minerais', cidade: 'Itajaí', estado: 'SC' },
  { id: '4', nome: 'Naturais & Companhia', telefone: '(31) 95555-4444', categoria: 'Grãos e Sementes', cidade: 'Belo Horizonte', estado: 'MG' },
];

export default function FornecedoresPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFornecedores = MOCK_FORNECEDORES.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fornecedores</h1>
          <p className="text-slate-500 dark:text-slate-400">Gerenciamento de fornecedores da Temperos D'Casa</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-red-500/20">
          <Plus className="w-5 h-5" />
          Novo Fornecedor
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, categoria ou cidade..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300">
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">Nome</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">Telefone</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">Cidade/UF</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredFornecedores.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-white">{f.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {f.telefone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      {f.categoria}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                     <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {f.cidade}/{f.estado}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600 dark:text-slate-400">
                    <button className="p-2 text-slate-400 hover:text-primary-red transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFornecedores.length === 0 && (
          <div className="p-12 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum fornecedor encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400">Tente ajustar sua busca ou filtros.</p>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exibindo <span className="font-bold">{filteredFornecedores.length}</span> fornecedores
          </p>
        </div>
      </div>
    </div>
  );
}
