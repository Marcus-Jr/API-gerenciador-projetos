export type StatusProjeto = "nao iniciado" | "em andamento" | "concluido";
export const STATUS_VALIDOS: StatusProjeto[] = ["nao iniciado", "em andamento", "concluido"];

export interface Projeto {
  id: number;
  nome: string;
  cliente: string;
  dataInicio: string;
  dataEntrega: string;
  status: StatusProjeto;
  idEquipe: number | null;
}

export interface Equipe {
  id: number;
  lider: string;
  membros: string[];
}