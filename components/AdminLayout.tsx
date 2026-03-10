import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LogOut, LayoutDashboard, Package, MessageSquare, Users, FileText,
    CalendarDays, ClipboardList, ChevronLeft, ChevronRight, Moon, Sun,
    Utensils, Megaphone, Terminal, Ticket, Star, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppRoute } from '../types';

export default function AdminLayout() {
    const { logout } = useAuth();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Verifica se há preferência salva ou se o sistema prefere dark
        const saved = localStorage.getItem('admin_theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('admin_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('admin_theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isSidebarExpanded) {
            // Recolher a sidebar automaticamente após 2 minutos (120000 ms)
            timeoutId = setTimeout(() => {
                setIsSidebarExpanded(false);
            }, 120000);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isSidebarExpanded]);

    const toggleSidebar = () => {
        setIsSidebarExpanded(prev => !prev);
    };

    const links = [
        { label: 'Painel', path: AppRoute.DASHBOARD, icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Catálogo', path: AppRoute.PRODUCTS, icon: <Utensils className="w-5 h-5" /> },
        { label: 'Feedbacks', path: AppRoute.FEEDBACKS, icon: <MessageSquare className="w-5 h-5" /> },
        { label: 'Funcionários', path: AppRoute.FUNCIONARIOS, icon: <Users className="w-5 h-5" /> },
        { label: 'Currículos', path: AppRoute.CURRICULOS, icon: <FileText className="w-5 h-5" /> },
        { label: 'Escala', path: AppRoute.ESCALA, icon: <CalendarDays className="w-5 h-5" /> },
        { label: 'Ficha Técnica', path: AppRoute.FICHA_TECNICA, icon: <ClipboardList className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row font-sans h-screen overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className={`bg-primary-red text-white flex-col hidden lg:flex shrink-0 transition-all duration-300 ease-in-out relative ${isSidebarExpanded ? 'w-64' : 'w-20'}`}>

                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-8 bg-white/20 hover:bg-white/30 p-1.5 rounded-full backdrop-blur-sm z-50 transition-colors border border-white/10"
                >
                    {isSidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="p-6 border-b border-white/10 shrink-0 flex justify-center items-center h-24">
                    {isSidebarExpanded ? (
                        <img src="/logo.png" alt="Logo Temperos D'Casa" className="h-10 w-auto object-contain transition-opacity duration-300" />
                    ) : (
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter">
                            T
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === AppRoute.DASHBOARD}
                            title={!isSidebarExpanded ? link.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
                                } ${!isSidebarExpanded ? 'justify-center px-0' : ''}`
                            }
                        >
                            <span className="shrink-0">{link.icon}</span>
                            {isSidebarExpanded && <span className="whitespace-nowrap truncate">{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 shrink-0 flex items-center gap-2">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        title="Alternar Tema"
                        className="flex-1 flex items-center justify-center py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        {isSidebarExpanded && <span className="ml-2 text-sm">Tema</span>}
                    </button>
                    <button
                        onClick={logout}
                        title={!isSidebarExpanded ? "Sair" : undefined}
                        className={`flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg transition-colors ${!isSidebarExpanded ? 'px-2' : 'px-4 flex-1'}`}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {isSidebarExpanded && <span className="text-sm">Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0B0F19] p-4 md:p-8 pb-24 lg:pb-8">
                {/* Page Content */}
                <Outlet />
            </main>

            {/* Bottom Navigation Mobile/Tablet */}
            <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-primary-red text-white lg:hidden px-2 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar max-w-full mx-auto px-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={link.path === AppRoute.DASHBOARD}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center min-w-[56px] py-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-white/40'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-white/10 scale-110 shadow-lg' : 'hover:bg-white/5'
                                    }`}>
                                    {isActive ? React.cloneElement(link.icon as React.ReactElement, { className: 'w-6 h-6' }) : link.icon}
                                </div>
                            )}
                        </NavLink>
                    ))}
                    {/* Dark Mode and Logout at the end of mobile nav */}
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="flex flex-col items-center justify-center min-w-[56px] py-1 text-white/40 hover:text-white transition-all"
                    >
                        <div className="p-2.5 rounded-2xl hover:bg-white/5">
                            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                        </div>
                    </button>
                    <button
                        onClick={logout}
                        className="flex flex-col items-center justify-center min-w-[56px] py-1 text-red-400 hover:text-red-300 transition-all"
                    >
                        <div className="p-2.5 rounded-2xl hover:bg-red-500/10">
                            <LogOut className="w-6 h-6" />
                        </div>
                    </button>
                </div>
            </nav>
        </div>
    );
}
