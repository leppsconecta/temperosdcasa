export const DBService = {
    getDashboardStats: async () => {
        return {
            reservasPendentes: 5,
            reservasTotal: 10,
            feedbacksPendentes: 2,
            consumacoesPendentes: 3,
            promocoesAtivas: 1,
            cuponsAtivos: 4,
            reservasHoje: 1,
            reservasSemanais: [
                { day: 'Seg', val: 0 }, { day: 'Ter', val: 0 }, { day: 'Qua', val: 4 },
                { day: 'Qui', val: 2 }, { day: 'Sex', val: 1 }, { day: 'Sáb', val: 3 }, { day: 'Dom', val: 0 },
            ],
            feedbacksDistribucao: {
                total: 10,
                elogios: 5,
                sugestao: 3,
                reclamacoes: 1,
                denuncia: 1
            },
            cupons: [] as any[],
            funcionarios: [] as any[],
            turnos: [] as any[],
            escala: [] as any[],
            promocoes: [] as any[]
        };
    },
    funcionarios: {
        getAll: async () => []
    },
    turnos: {
        getAll: async () => []
    },
    escala: {
        getByRange: async (start: string, end: string) => [],
        add: async (dateStr: string, turnoId: string, employeeId: string) => { },
        remove: async (dateStr: string, turnoId: string, employeeId: string) => { }
    }
};
