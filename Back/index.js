import express from "express";
import conectarBD from "./bd.js";

const app = express();
const PORT = 3307;
let connection;

async function iniciarConexao() {
    try {
        connection = await conectarBD();
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error.message);
        process.exit(1); // Finaliza o processo em caso de erro
    }
}

app.get("/pessoa", (req, res) => {
    const comandoSql = "SELECT * FROM notasedu.pessoa";

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
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});