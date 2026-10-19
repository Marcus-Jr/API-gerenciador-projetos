import express, { NextFunction, Request, Response } from "express";
import projetosRouter from "./projetos";
import equipesRouter from "./equipes";
import { HttpError } from "./erros";

const app = express();
app.use(express.json());

app.use("/projetos", projetosRouter);
app.use("/equipes", equipesRouter);

app.use((_req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message, detalhes: err.detalhes });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição" });
  }
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));