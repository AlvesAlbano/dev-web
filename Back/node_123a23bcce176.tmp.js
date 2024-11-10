// backend/app.js
import express from "express";
import bcrypt from "bcryptjs";  // Para comparar as senhas
import cors from "cors";
import jwt from "jsonwebtoken";  // Para gerar tokens JWT
import { iniciarConexao, connection } from "./bd.js";

const app = express();
const PORT = 3307;

// Middleware para analisar o corpo da requisição (JSON)
app.use(express.json());
app.use(cors());

// Rota para autenticação
app.post("/auth", (req, res) => {
    const { matricula, senha } = req.body;

    // Verifica se a matrícula foi fornecida
    if (!matricula || !senha) {
        return res.status(400).json({ message: "Matrícula e senha são obrigatórios" });
    }

    // Consulta no banco de dados para verificar se o usuário existe
    const comandoSql = "SELECT * FROM notasedu.aluno WHERE matricula = ?";
    connection.query(comandoSql, [matricula], (err, results) => {
        if (err) {
            console.error("Erro ao buscar o usuário:", err.message);
            return res.status(500).send("Erro ao buscar o usuário.");
        }

        if (results.length === 0) {
            return res.status(400).json({ message: "Matrícula ou senha inválida" });
        }

        const user = results[0];

        // Verificar se a senha fornecida corresponde à armazenada no banco
        bcrypt.compare(senha, user.senha, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(400).json({ message: "Matrícula ou senha inválida" });
            }

            // Gerar token JWT com a matrícula do usuário
            const token = jwt.sign({ matricula: user.matricula }, 'secreta', { expiresIn: '1h' });

            // Retornar o token JWT
            return res.json({ token });
        });
    });
});

// Rota para buscar os dados de uma pessoa (exemplo de consulta)
app.get("/pessoa", (req, res) => {
    const comandoSql = "SELECT * FROM notasedu.aluno";

    connection.query(comandoSql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar dados:", err.message);
            res.status(500).send("Erro ao buscar os dados.");
        } else {
            res.json(results);
        }
    });
});

// Iniciar a conexão e rodar o servidor
app.listen(PORT, async () => {
    await iniciarConexao();  // Estabelece a conexão com o banco antes de iniciar o servidor
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});