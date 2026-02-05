import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// rota principal
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// 🚀 ROTA QUE SALVA NO SUPABASE
app.post("/api/perdas", async (req, res) => {
  const { localizacao, codigosBarras } = req.body;

  if (!localizacao || !codigosBarras?.length) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  // transforma cada código em uma linha da tabela
  const registros = codigosBarras.map((codigo) => ({
    numero_rastreio: codigo,
    numero_localizacao: localizacao,
    status: "RECEBIDO"
  }));

  const { error } = await supabase
    .from("Logistica_recebimento_garantia")
    .insert(registros);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao salvar no banco" });
  }

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Servidor rodando na porta", PORT)
);
