import { Router } from "express";
import { Equipe, Projeto } from "./types";
import { carregar, proximoId, salvar } from "./storage";
import { lerId, naoEncontrado, validacao } from "./erros";

const CHAVE = "equipes";
const router = Router();

const textoValido = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

function validarMembros(membros: unknown, erros: string[]) {
  if (!Array.isArray(membros) || !membros.every((m) => typeof m === "string")) {
    erros.push("membros deve ser uma lista de strings");
  }
}

router.post("/", (req, res) => {
  const { lider, membros } = req.body ?? {};
  const erros: string[] = [];
  if (!textoValido(lider)) erros.push("lider é obrigatório e não pode ser vazio");
  if (membros !== undefined) validarMembros(membros, erros);
  if (erros.length) throw validacao(erros);

  const equipes = carregar<Equipe>(CHAVE);
  const nova: Equipe = { id: proximoId(CHAVE), lider: lider.trim(), membros: membros ?? [] };
  equipes.push(nova);
  salvar(CHAVE, equipes);
  res.status(201).json(nova);
});

router.get("/", (_req, res) => {
  res.json(carregar<Equipe>(CHAVE));
});

router.get("/:id", (req, res) => {
  const id = lerId(req.params.id, "Equipe");
  const equipe = carregar<Equipe>(CHAVE).find((e) => e.id === id);
  if (!equipe) throw naoEncontrado("Equipe");
  res.json(equipe);
});

router.put("/:id", (req, res) => {
  const id = lerId(req.params.id, "Equipe");
  const equipes = carregar<Equipe>(CHAVE);
  const indice = equipes.findIndex((e) => e.id === id);
  if (indice === -1) throw naoEncontrado("Equipe");

  const { lider, membros } = req.body ?? {};
  const erros: string[] = [];
  if (lider === undefined && membros === undefined) {
    erros.push("informe ao menos um campo editável: lider, membros");
  }
  if (lider !== undefined && !textoValido(lider)) erros.push("lider não pode ser vazio");
  if (membros !== undefined) validarMembros(membros, erros);
  if (erros.length) throw validacao(erros);

  const atual = equipes[indice];
  const atualizada: Equipe = {
    id: atual.id,
    lider: lider !== undefined ? lider.trim() : atual.lider,
    membros: membros !== undefined ? membros : atual.membros,
  };
  equipes[indice] = atualizada;
  salvar(CHAVE, equipes);
  res.json(atualizada);
});

router.delete("/:id", (req, res) => {
  const id = lerId(req.params.id, "Equipe");
  const equipes = carregar<Equipe>(CHAVE);
  if (!equipes.some((e) => e.id === id)) throw naoEncontrado("Equipe");
  salvar(CHAVE, equipes.filter((e) => e.id !== id));

  const projetos = carregar<Projeto>("projetos");
  salvar("projetos", projetos.map((p) => (p.idEquipe === id ? { ...p, idEquipe: null } : p)));

  res.status(204).send();
});

export default router;