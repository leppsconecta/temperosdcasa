import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column {
    header: string;
    accessor: string | ((row: any, i: number) => React.ReactNode);
    className?: string;
}

interface TableProps {
    columns: Column[];
    data: any[];
    searchPlaceholder?: string;
    pageSize?: number;
}

export default function Table({ columns, data, searchPlaceholder, pageSize = 20 }: TableProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Filtragem: busca em todos os valores string das rows
    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter(row =>
            Object.values(row).some(v =>
                typeof v === 'string' && v.toLowerCase().includes(q)
            )
        );
    }, [data, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // volta para página 1 ao buscar
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Search bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-red/40 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                        placeholder={searchPlaceholder ?? 'Buscar...'}
                    />
                </div>
                <span className="text-xs text-slate-400 font-medium shrink-0">
                    {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                            {columns.map((col, i) => (
                                <th key={i} className={`px-4 py-3 overflow-hidden ${col.className ?? ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((row, i) => (
                            <tr
                                key={i}
                                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                {columns.map((col, j) => (
                                    <td key={j} className={`px-4 py-3 overflow-hidden ${col.className ?? ''}`}>
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(row, (currentPage - 1) * pageSize + i)
                                            : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {paged.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-slate-400 font-medium text-sm">
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                        Página {currentPage} de {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {/* Página buttons */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === '…' ? (
                                    <span key={`ellipsis-${idx}`} className="text-xs text-slate-400 px-1">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p as number)}
                                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${currentPage === p
                                                ? 'bg-[#5A1788] text-white'
                                                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
