import { LocalStorage } from "node-localstorage";

const ls = new LocalStorage("./data");

export function carregar<T>(chave: string): T[] {
  const bruto = ls.getItem(chave);
  return bruto ? (JSON.parse(bruto) as T[]) : [];
}

export function salvar<T>(chave: string, itens: T[]): void {
  ls.setItem(chave, JSON.stringify(itens));
}

export function proximoId(chave: string): number {
  const chaveContador = `${chave}:seq`;
  const id = Number(ls.getItem(chaveContador) ?? "0") + 1;
  ls.setItem(chaveContador, String(id));
  return id;
}