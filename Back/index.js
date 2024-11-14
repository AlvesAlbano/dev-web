import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { iniciarConexao, connection } from "./bd.js";

const app = express();
const PORT = 3307;
const chaveJWT = "chave";

app.use(express.json());
app.use(cors());

app.post("/login", (req, res) => {
    const { matricula, senha } = req.body;

    const comandoSqlAluno = 'SELECT * FROM Aluno WHERE matricula = ? AND senha = ?';
    const comandoSqlProfessor = 'SELECT * FROM Professor WHERE matricula = ? AND senha = ?';

    connection.execute(comandoSqlAluno, [matricula, senha], (err, resultsAluno) => {
        if (err) {
            return res.status(500).json({ message: 'Erro interno no servidor.' });
        }

        if (resultsAluno.length > 0) {
            const aluno = resultsAluno[0];
            const token = jwt.sign({ id_aluno: aluno.id_aluno, role: "aluno" }, chaveJWT);
            return res.json({ message: 'Login bem-sucedido!', token });
        } else {
            connection.execute(comandoSqlProfessor, [matricula, senha], (err, resultsProfessor) => {
                if (err) {
                    return res.status(500).json({ message: 'Erro interno no servidor.' });
                }

                if (resultsProfessor.length > 0) {
                    const professor = resultsProfessor[0];
                    const token = jwt.sign({ id_professor: professor.id_professor, role: "professor" }, chaveJWT);
                    return res.json({ message: 'Login bem-sucedido!', token });
                } else {
                    return res.status(401).json({ message: 'Matricula ou Senha invalidas' });
                }
            });
        }
    });
});

app.post("/boletim", (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Exemplo de 'Authorization: Bearer <token>'

    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, chaveJWT, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido.' });
        }

        const { id_aluno } = decoded;  // Acessar o ID do aluno decodificado

        // Buscar informações do aluno com base no ID
        const comandoSqlAluno = 'SELECT * FROM Aluno WHERE id_aluno = ?';
        connection.execute(comandoSqlAluno, [id_aluno], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao buscar aluno.' });
            }

            if (results.length > 0) {
                const aluno = results[0];

                // Buscar informações de turno, turma e série do aluno
                const comandoSqlTurma = 'SELECT * FROM Turma WHERE id_aluno = ?';
                connection.execute(comandoSqlTurma, [id_aluno], (err, turmaResults) => {
                    if (err) {
                        return res.status(500).json({ message: 'Erro ao buscar informações de turma.' });
                    }

                    if (turmaResults.length > 0) {
                        const turma = turmaResults[0];
                        console.log(turma);

                        // Buscar as notas do aluno com o nome da disciplina
                        const comandoNotas = `
                            SELECT n.*, d.nome_disciplina 
                            FROM Notas n
                            JOIN Disciplina d ON n.id_disciplina = d.id_disciplina
                            WHERE n.id_aluno = ?
                        `;
                        connection.execute(comandoNotas, [id_aluno], (err, notas) => {
                            if (err) {
                                return res.status(500).json({ message: 'Erro ao buscar notas.' });
                            }
                            
                            return res.json({
                                aluno: {
                                    matricula: aluno.matricula,
                                    nome: aluno.nome,
                                    dataNascimento: aluno.data_nascimento,
                                    serie: turma.serie,
                                    letra : turma.letra,
                                    turno: turma.turno,
                                    ensino: turma.ensino
                                },
                                notas: notas  // As notas do aluno com o nome da disciplina
                            });
                        });
                    } else {
                        return res.status(404).json({ message: 'Informações de turma não encontradas.' });
                    }
                });
            } else {
                return res.status(404).json({ message: 'Aluno não encontrado.' });
            }
        });
    });
});

app.post("/atualizar-notas", (req, res) => {
    const { notasAtualizadas } = req.body;

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, chaveJWT, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido.' });
        }

        const queries = notasAtualizadas.map(nota => {
            return new Promise((resolve, reject) => {
                const comandoSql = `
                    UPDATE Notas 
                    SET media1 = ?, media2 = ?, media3 = ?, recuperacao = ? 
                    WHERE id_aluno = ? AND id_disciplina = ?
                `;
                connection.execute(comandoSql, [
                    nota.media1, 
                    nota.media2, 
                    nota.media3, 
                    nota.recuperacao, 
                    decoded.id_aluno, 
                    nota.id_disciplina
                ], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });

        Promise.all(queries)
            .then(() => res.json({ message: "Notas atualizadas com sucesso!" }))
            .catch(() => res.status(500).json({ message: "Erro ao atualizar as notas." }));
    });
});

app.get("/turmas", (req, res) => {
    const comandoSql = `
        SELECT t.serie, t.letra, t.turno, t.ensino, COUNT(t.id_aluno) AS total_alunos
        FROM Turma t
        JOIN Aluno a ON t.id_aluno = a.id_aluno
        GROUP BY t.serie, t.letra, t.turno, t.ensino
    `;
        
    connection.execute(comandoSql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar turmas.' });
        }
        return res.json(results);
    });
});


app.listen(PORT, async () => {
    await iniciarConexao();  // Estabelece a conexão com o banco antes de iniciar o servidor
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});