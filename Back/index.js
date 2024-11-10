import express from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import jwt from "jsonwebtoken";
import { iniciarConexao, connection } from "./bd.js";

const app = express();
const PORT = 3307;

app.use(express.json());
app.use(cors());


// app.get("/pessoa", (req, res) => {
//     const comandoSql = "SELECT * FROM notasedu.pessoa";

//     connection.query(comandoSql, (err, results) => {
//         if (err) {
//             console.error("Erro ao buscar dados:", err.message);
//             res.status(500).send("Erro ao buscar as notas.");
//         } else {
//             res.json(results);
//         }
//     });
// });

app.post("/login", (req, res) => {
    const { matricula, senha } = req.body;

    const comandoSql = 'SELECT * FROM Aluno WHERE matricula = ? AND senha = ?';

    connection.execute(comandoSql, [matricula, senha], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro interno no servidor.' });
        }

        if (results.length > 0) {
            return res.status(200).json({ message: 'Login bem-sucedido!' });
        } else {
            return res.status(401).json({ message: 'Matrícula ou senha inválidos.' });
        }
    });
});


app.listen(PORT, async () => {
    await iniciarConexao();  // Estabelece a conexão com o banco antes de iniciar o servidor
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});