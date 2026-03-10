export enum AppRoute {
  DASHBOARD = '/admin',
  FEEDBACKS = '/admin/feedbacks',
  PROMOCIONAL = '/admin/promocional',
  FUNCIONARIOS = '/admin/funcionarios',
  PUBLIC_FORM_FUNCIONARIO = '/form-funcionario',
  PRODUCTS = '/admin/produtos',
  CURRICULOS = '/admin/curriculos',
  ESCALA = '/admin/escala',
  FICHA_TECNICA = '/admin/fichatecnica',
}

export type ModalType = 'confirm-delete' | 'confirm-update' | 'confirm-insert' | 'view-content' | 'create' | 'edit' | 'delete' | 'view';

export interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  telefone?: string;
  codigo?: string;
  dataEntrada?: string;
  dataCadastro?: string;
  status: string;
  [key: string]: any;
}
export interface Promocao { id: string;[key: string]: any; }
export interface Feedback { id: string;[key: string]: any; }
export type FeedbackStatus = 'Novo' | 'Em Andamento' | 'Resolvido';
export interface AvaliacaoProduto { id: string;[key: string]: any; }
export interface Curriculo { id: string;[key: string]: any; }
export interface TurnoConfig { id: string; label: string; inicio: string; fim: string; bgClass: string; colorClass: string; borderClass: string; limits?: any; }
export interface MateriaPrima { id: string;[key: string]: any; }
export interface PratoFicha { id: string;[key: string]: any; }
export interface CategoriaPrato { id: string;[key: string]: any; }
export interface IngredientePrato { id: string;[key: string]: any; }
export interface Arquivo { id: string;[key: string]: any; }

