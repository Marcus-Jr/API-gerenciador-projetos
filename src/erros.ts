export class HttpError extends Error {
  constructor(public status: number, message: string, public detalhes?: string[]) {
    super(message);
  }
}

export const naoEncontrado = (recurso: string) => new HttpError(404, `${recurso} não encontrado(a)`);
export const validacao = (detalhes: string[]) => new HttpError(400, "Erro de validação", detalhes);

// Converte o parâmetro :id em número; id inválido nunca existirá -> 404
export function lerId(param: string, recurso: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) throw naoEncontrado(recurso);
  return id;
}