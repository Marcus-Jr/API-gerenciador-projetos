import { Router } from "express";
import { Equipe, Projeto, STATUS_VALIDOS } from "./types";
import { carregar, proximoId, salvar } from "./storage";
import { lerId, naoEncontrado, validacao } from "./erros";

const CHAVE = "projetos";
const router = Router();

const textoValido = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

function dataValida(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(v);
}

function validarIdEquipe(v: unknown, erros: string[]) {
  if (v === null) return;
  if (!Number.isInteger(v)) {
    erros.push("idEquipe deve ser um número inteiro ou null");
    return;
  }
  if (!carregar<Equipe>("equipes").some((e) => e.id === v)) {
    erros.push(`idEquipe ${v} não corresponde a nenhuma equipe existente`);
  }
}

router.post("/", (req, res) => {
  const { nome, cliente, dataInicio, dataEntrega, idEquipe } = req.body ?? {};
  const erros: string[] = [];
  if (!textoValido(nome)) erros.push("nome é obrigatório e não pode ser vazio");
  if (!textoValido(cliente)) erros.push("cliente é obrigatório e não pode ser vazio");
  if (dataInicio === undefined) erros.push("dataInicio é obrigatória");
  else if (!dataValida(dataInicio)) erros.push("dataInicio deve ser uma data válida (YYYY-MM-DD)");
  if (dataEntrega === undefined) erros.push("dataEntrega é obrigatória");
  else if (!dataValida(dataEntrega)) erros.push("dataEntrega deve ser uma data válida (YYYY-MM-DD)");
  if (dataValida(dataInicio) && dataValida(dataEntrega) && dataEntrega < dataInicio) {
    erros.push("dataEntrega não pode ser anterior à dataInicio");
  }
  if (idEquipe !== undefined) validarIdEquipe(idEquipe, erros);
  if (erros.length) throw validacao(erros);

  const projetos = carregar<Projeto>(CHAVE);
  const novo: Projeto = {
    id: proximoId(CHAVE),
    nome: nome.trim(),
    cliente: cliente.trim(),
    dataInicio,
    dataEntrega,
    status: "nao iniciado",
    idEquipe: idEquipe ?? null,
  };
  projetos.push(novo);
  salvar(CHAVE, projetos);
  res.status(201).json(novo);
});

router.get("/", (_req, res) => {
  res.json(carregar<Projeto>(CHAVE));
});

router.get("/:id", (req, res) => {
  const id = lerId(req.params.id, "Projeto");
  const projeto = carregar<Projeto>(CHAVE).find((p) => p.id === id);
  if (!projeto) throw naoEncontrado("Projeto");
  res.json(projeto);
});

router.put("/:id", (req, res) => {
  const id = lerId(req.params.id, "Projeto");
  const projetos = carregar<Projeto>(CHAVE);
  const indice = projetos.findIndex((p) => p.id === id);
  if (indice === -1) throw naoEncontrado("Projeto");

  const body = req.body ?? {};
  const { nome, cliente, dataInicio, dataEntrega, status, idEquipe } = body;
  const editaveis = [nome, cliente, dataInicio, dataEntrega, status, idEquipe];
  const erros: string[] = [];

  if (editaveis.every((v) => v === undefined)) {
    erros.push("informe ao menos um campo editável: nome, cliente, dataInicio, dataEntrega, status, idEquipe");
  }
  if (nome !== undefined && !textoValido(nome)) erros.push("nome não pode ser vazio");
  if (cliente !== undefined && !textoValido(cliente)) erros.push("cliente não pode ser vazio");
  if (dataInicio !== undefined && !dataValida(dataInicio)) erros.push("dataInicio deve ser uma data válida (YYYY-MM-DD)");
  if (dataEntrega !== undefined && !dataValida(dataEntrega)) erros.push("dataEntrega deve ser uma data válida (YYYY-MM-DD)");
  if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
    erros.push(`status deve ser um de: ${STATUS_VALIDOS.join(", ")}`);
  }
  if (idEquipe !== undefined) validarIdEquipe(idEquipe, erros);

  const atual = projetos[indice];
  const atualizado: Projeto = {
    id: atual.id,
    nome: nome !== undefined && textoValido(nome) ? nome.trim() : atual.nome,
    cliente: cliente !== undefined && textoValido(cliente) ? cliente.trim() : atual.cliente,
    dataInicio: dataInicio !== undefined && dataValida(dataInicio) ? dataInicio : atual.dataInicio,
    dataEntrega: dataEntrega !== undefined && dataValida(dataEntrega) ? dataEntrega : atual.dataEntrega,
    status: status !== undefined && STATUS_VALIDOS.includes(status) ? status : atual.status,
    idEquipe: idEquipe !== undefined && erros.length === 0 ? idEquipe : atual.idEquipe,
  };
  if (atualizado.dataEntrega < atualizado.dataInicio) {
    erros.push("dataEntrega não pode ser anterior à dataInicio");
  }
  if (erros.length) throw validacao(erros);

  projetos[indice] = atualizado;
  salvar(CHAVE, projetos);
  res.json(atualizado);
});

router.delete("/:id", (req, res) => {
  const id = lerId(req.params.id, "Projeto");
  const projetos = carregar<Projeto>(CHAVE);
  if (!projetos.some((p) => p.id === id)) throw naoEncontrado("Projeto");
  salvar(CHAVE, projetos.filter((p) => p.id !== id));
  res.status(204).send();
});

export default router;