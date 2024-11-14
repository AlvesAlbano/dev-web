import express from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import jwt from "jsonwebtoken";
import { iniciarConexao, connection } from "./bd.js";

const app = express();
const PORT = 3307;
const chaveJWT = "chave";

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

                            // Retornar as informações do aluno, turma e as notas
                            return res.json({
                                aluno: {
                                    matricula: aluno.matricula,
                                    nome: aluno.nome,
                                    etapa: turma.turno,  // Turno
                                    serie: turma.nome_turma,  // Turma (Nome da turma)
                                    turma: turma.nome_turma,  // A mesma informação de turma
                                    dataNascimento: aluno.data_nascimento
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

    // Validando o token do aluno
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, chaveJWT, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido.' });
        }

        // Itera sobre as notas enviadas para atualizar o banco
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

        // Executa todas as queries de atualização
        Promise.all(queries)
            .then(() => res.json({ message: "Notas atualizadas com sucesso!" }))
            .catch(() => res.status(500).json({ message: "Erro ao atualizar as notas." }));
    });
});

app.get("/turma-lista", (req, res) => {
    const { id_turma } = decoded;

    // Corrigindo a query SQL: removendo vírgulas desnecessárias
    const SqlTurma = 'SELECT * FROM Turma WHERE id_turma = ?';
    connection.execute(SqlTurma, [id_turma], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar turma.' });
        }
    
        if (results.length > 0) {
            const turma = results[0];
    
            // Corrigindo a query SQL para buscar alunos da turma específica
            const SqlAluno = 'SELECT * FROM Aluno WHERE turma = ?';
            connection.execute(SqlAluno, [id_turma], (err, turmaResults) => {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao buscar informações de turma.' });
                }
    
                // Mapear a lista de alunos retornada na resposta JSON
                const alunos = turmaResults.map(aluno => ({
                    nome: aluno.nome,
                    matricula: aluno.matricula,
                }));
    
                // Retornar a turma e a lista de alunos no JSON
                return res.json({
                    turma: turma,
                    alunos: alunos,
                });
            });
        } else {
            // Caso não encontre a turma
            return res.status(404).json({ message: 'Turma não encontrada.' });
        }
    });    
});

app.listen(PORT, async () => {
    await iniciarConexao();  // Estabelece a conexão com o banco antes de iniciar o servidor
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});