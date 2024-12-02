// import express from "express";
// import cors from "cors";
// import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer";
// import { iniciarConexao, connection } from "./bd.js";

// const app = express();
// const PORT = 3307;
// const chaveJWT = "chave";

// app.use(express.json());
// app.use(cors());

// // Configuração do Nodemailer
// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: "seuemail@gmail.com", // Substitua pelo seu e-mail
//         pass: "suasenha", // Substitua pela sua senha ou app password
//     },
// });

// // Endpoint de teste
// app.get("/teste", (req, res) => {
//     const comandoSql = "SELECT * FROM Aluno";

//     connection.query(comandoSql, (error, results) => {
//         if (error) {
//             console.error("Erro ao executar o comando SQL:", error);
//             res.status(500).send("Erro no servidor");
//             return;
//         }

//         res.status(200).json(results);
//     });
// });

// // Login
// app.post("/login", (req, res) => {
//     const { matricula, senha } = req.body;

//     const comandoSqlAluno = "SELECT * FROM Aluno WHERE matricula = ? AND senha = ?";
//     const comandoSqlProfessor = "SELECT * FROM Professor WHERE matricula = ? AND senha = ?";

//     connection.execute(comandoSqlAluno, [matricula, senha], (err, resultsAluno) => {
//         if (err) {
//             return res.status(500).json({ message: "Erro interno no servidor." });
//         }

//         if (resultsAluno.length > 0) {
//             const aluno = resultsAluno[0];
//             const token = jwt.sign({ id_aluno: aluno.id_aluno, role: "aluno" }, chaveJWT);
//             return res.json({ message: "Login bem-sucedido!", token });
//         } else {
//             connection.execute(comandoSqlProfessor, [matricula, senha], (err, resultsProfessor) => {
//                 if (err) {
//                     return res.status(500).json({ message: "Erro interno no servidor." });
//                 }

//                 if (resultsProfessor.length > 0) {
//                     const professor = resultsProfessor[0];
//                     const token = jwt.sign({ id_professor: professor.id_professor, role: "professor" }, chaveJWT);
//                     return res.json({ message: "Login bem-sucedido!", token });
//                 } else {
//                     return res.status(401).json({ message: "Matrícula ou Senha inválidas" });
//                 }
//             });
//         }
//     });
// });

// // Esqueci minha senha
// app.post("/esqueci-senha", (req, res) => {
//     const { matricula } = req.body;

//     const comandoSql = "SELECT email FROM Aluno WHERE matricula = ?";
//     connection.execute(comandoSql, [matricula], (err, results) => {
//         if (err) {
//             console.error("Erro ao buscar matrícula:", err);
//             return res.status(500).json({ message: "Erro interno no servidor." });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ message: "Matrícula não encontrada." });
//         }

//         const email = results[0].email;
//         const token = jwt.sign({ matricula }, chaveJWT, { expiresIn: "15m" });

//         const mailOptions = {
//             from: "seuemail@gmail.com",
//             to: email,
//             subject: "Redefinição de Senha - NotasEdu",
//             html: `
//                 <h1>Redefinição de Senha</h1>
//                 <p>Você solicitou uma redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
//                 <a href="http://localhost:3307/redefinir-senha?token=${token}">Redefinir Senha</a>
//                 <p>Este link é válido por 15 minutos.</p>
//             `,
//         };

//         transporter.sendMail(mailOptions, (err) => {
//             if (err) {
//                 console.error("Erro ao enviar e-mail:", err);
//                 return res.status(500).json({ message: "Erro ao enviar e-mail." });
//             }

//             res.json({ message: "E-mail enviado com sucesso!" });
//         });
//     });
// });

// // Redefinir senha
// app.post("/redefinir-senha", (req, res) => {
//     const { token, novaSenha } = req.body;

//     jwt.verify(token, chaveJWT, (err, decoded) => {
//         if (err) {
//             console.error("Token inválido:", err);
//             return res.status(401).json({ message: "Token inválido ou expirado." });
//         }

//         const { matricula } = decoded;
//         const comandoSql = "UPDATE Aluno SET senha = ? WHERE matricula = ?";
//         connection.execute(comandoSql, [novaSenha, matricula], (err) => {
//             if (err) {
//                 console.error("Erro ao redefinir senha:", err);
//                 return res.status(500).json({ message: "Erro interno no servidor." });
//             }

//             res.json({ message: "Senha redefinida com sucesso!" });
//         });
//     });
// });

// // Atualizar notas
// app.post("/atualizar-notas", (req, res) => {
//     const { notasAtualizadas } = req.body;

//     const token = req.headers["authorization"]?.split(" ")[1];
//     if (!token) {
//         return res.status(403).json({ message: "Token não fornecido." });
//     }

//     jwt.verify(token, chaveJWT, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ message: "Token inválido." });
//         }

//         const queries = notasAtualizadas.map((nota) => {
//             return new Promise((resolve, reject) => {
//                 const comandoSql = `
//                     UPDATE Notas 
//                     SET media1 = ?, media2 = ?, media3 = ?, recuperacao = ? 
//                     WHERE id_aluno = ? AND id_disciplina = ?
//                 `;
//                 connection.execute(comandoSql, [
//                     nota.media1,
//                     nota.media2,
//                     nota.media3,
//                     nota.recuperacao,
//                     decoded.id_aluno,
//                     nota.id_disciplina,
//                 ], (err) => {
//                     if (err) return reject(err);
//                     resolve();
//                 });
//             });
//         });

//         Promise.all(queries)
//             .then(() => res.json({ message: "Notas atualizadas com sucesso!" }))
//             .catch(() => res.status(500).json({ message: "Erro ao atualizar as notas." }));
//     });
// });

// // Endpoint para turmas
// app.get("/turmas", (req, res) => {
//     const comandoSql = `
//         SELECT t.serie, t.letra, t.turno, t.ensino, COUNT(t.id_aluno) AS total_alunos
//         FROM Turma t
//         JOIN Aluno a ON t.id_aluno = a.id_aluno
//         GROUP BY t.serie, t.letra, t.turno, t.ensino
//     `;

//     connection.execute(comandoSql, (err, results) => {
//         if (err) {
//             return res.status(500).json({ message: "Erro ao buscar turmas." });
//         }
//         return res.json(results);
//     });
// });

// // Iniciar servidor
// app.listen(PORT, async () => {
//     await iniciarConexao();
//     console.log(`Servidor rodando em http://localhost:${PORT}`);
// });


import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { iniciarConexao, connection } from "./bd.js";

const app = express();
const PORT = 3307;
const chaveJWT = "chave";

app.use(express.json());
app.use(cors());

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "seuemail@gmail.com", // Substitua pelo seu e-mail
        pass: "suasenha", // Substitua pela sua senha ou app password
    },
});

// // Endpoint de teste
// app.get("/teste", (req, res) => {
//     const comandoSql = "SELECT * FROM Aluno";

//     connection.query(comandoSql, (error, results) => {
//         if (error) {
//             console.error("Erro ao executar o comando SQL:", error);
//             res.status(500).send("Erro no servidor");
//             return;
//         }

//         res.status(200).json(results);
//     });
// });

// Login
app.post("/login", (req, res) => {
    const { matricula, senha } = req.body;

    const comandoSqlAluno = "SELECT * FROM Aluno WHERE matricula_aluno = ? AND senha_aluno = ?";
    const comandoSqlProfessor = "SELECT * FROM Professor WHERE matricula_professor = ? AND senha_professor = ?";

    connection.execute(comandoSqlAluno, [matricula, senha], (err, resultsAluno) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno no servidor." });
        }

        if (resultsAluno.length > 0) {
            const aluno = resultsAluno[0];
            const token = jwt.sign({ id_aluno: aluno.id_aluno, role: "aluno" }, chaveJWT);
            return res.json({ message: "Login bem-sucedido!", token });
        } else {
            connection.execute(comandoSqlProfessor, [matricula, senha], (err, resultsProfessor) => {
                if (err) {
                    return res.status(500).json({ message: "Erro interno no servidor." });
                }

                if (resultsProfessor.length > 0) {
                    const professor = resultsProfessor[0];
                    const token = jwt.sign({ id_professor: professor.id_professor, role: "professor" }, chaveJWT);
                    return res.json({ message: "Login bem-sucedido!", token });
                } else {
                    return res.status(401).json({ message: "Matrícula ou Senha inválidas" });
                }
            });
        }
    });
});

// Esqueci minha senha
app.post("/esqueci-senha", (req, res) => {
    const { matricula } = req.body;

    const comandoSql = "SELECT email_aluno FROM Aluno WHERE matricula_aluno = ?";
    connection.execute(comandoSql, [matricula], (err, results) => {
        if (err) {
            console.error("Erro ao buscar matrícula:", err);
            return res.status(500).json({ message: "Erro interno no servidor." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Matrícula não encontrada." });
        }

        const email = results[0].email;
        const token = jwt.sign({ matricula }, chaveJWT, { expiresIn: "15m" });

        const mailOptions = {
            from: "seuemail@gmail.com",
            to: email,
            subject: "Redefinição de Senha - NotasEdu",
            html: `
                <h1>Redefinição de Senha</h1>
                <p>Você solicitou uma redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
                <a href="http://localhost:3307/redefinir-senha?token=${token}">Redefinir Senha</a>
                <p>Este link é válido por 15 minutos.</p>
            `,
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Erro ao enviar e-mail:", err);
                return res.status(500).json({ message: "Erro ao enviar e-mail." });
            }

            res.json({ message: "E-mail enviado com sucesso!" });
        });
    });
});

// Redefinir senha
app.post("/forgot-password", (req, res) => {
    const { token, novaSenha } = req.body;

    jwt.verify(token, chaveJWT, (err, decoded) => {
        if (err) {
            console.error("Token inválido:", err);
            return res.status(401).json({ message: "Token inválido ou expirado." });
        }

        const { matricula } = decoded;
        const comandoSql = "UPDATE Aluno SET senha = ? WHERE matricula = ?";
        connection.execute(comandoSql, [novaSenha, matricula], (err) => {
            if (err) {
                console.error("Erro ao redefinir senha:", err);
                return res.status(500).json({ message: "Erro interno no servidor." });
            }

            res.json({ message: "Senha redefinida com sucesso!" });
        });
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
                                    matricula: aluno.matricula_aluno,
                                    nome: aluno.nome_aluno,
                                    dataNascimento: aluno.data_nascimento_aluno,
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


// Atualizar notas
app.post("/atualizar-notas", (req, res) => {
    const { notasAtualizadas } = req.body;

    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Token não fornecido." });
    }

    jwt.verify(token, chaveJWT, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido." });
        }

        const queries = notasAtualizadas.map((nota) => {
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
                    nota.id_disciplina,
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

// Endpoint para turmas
app.get("/turmas", (req, res) => {
    const comandoSql = `
        SELECT t.serie, t.letra, t.turno, t.ensino, COUNT(t.id_aluno) AS total_alunos
        FROM Turma t
        JOIN Aluno a ON t.id_aluno = a.id_aluno
        GROUP BY t.serie, t.letra, t.turno, t.ensino
    `;

    connection.execute(comandoSql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao buscar turmas." });
        }

        console.log(results);
        return res.json(results);
    });
});

app.post("/alunos", (req, res) => {
    const { serie, letra } = req.query;

    if (!serie || !letra) {
        return res.status(400).json({ message: "Faltando parâmetros de turma." });
    }

    const comandoSql = `SELECT 
                            a.* 
                        FROM 
                            Aluno a
                        JOIN 
                            Turma t 
                        ON 
                            a.id_aluno = t.id_aluno
                        WHERE 
                            t.serie = ? AND t.letra = ?;`;

    connection.execute(comandoSql, [serie, letra], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao buscar alunos." });
        }

        return res.json(results);
    });
});


// Iniciar servidor
app.listen(PORT, async () => {
    await iniciarConexao();
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});