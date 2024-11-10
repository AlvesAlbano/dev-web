import express from "express";
import {iniciarConexao, connection} from "./bd.js";

const app = express();
const PORT = 3307;

app.get("/pessoa", (req, res) => {
    const comandoSql = "SELECT * FROM notasedu.notas";

    connection.query(comandoSql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar dados:", err.message);
            res.status(500).send("Erro ao buscar as notas.");
        } else {
            res.json(results);
        }
    });
});

app.listen(PORT, async () => {
    await iniciarConexao(); // Estabelece a conexão com o banco antes de iniciar o servidor
    console.log(`rodando em http://localhost:${PORT}`);
});