import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { iniciarConexao, connection } from "./bd.js";

const app = express();
const PORT = 3307;
const chaveJWT = "chave";

app.use(express.json());
app.use(cors());

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

        const email = results[0].email_aluno;
        const token = jwt.sign({ matricula }, chaveJWT, { expiresIn: "15m" });

        const mailOptions = {
            from: "jr040405@gmail.com",
            to: email,
            subject: "Redefinição de Senha - NotasEdu",
            html: `
                <h1>Redefinição de Senha</h1>
                <p>Você solicitou uma redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
                <a href="http://localhost:${PORT}/redefinir-senha?token=${token}">Redefinir Senha</a>
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
app.post("/redefinir-senha", (req, res) => {
    const { token, novaSenha } = req.body;

    jwt.verify(token, chaveJWT, (err, decoded) => {
        if (err) {
            console.error("Token inválido:", err);
            return res.status(401).json({ message: "Token inválido ou expirado." });
        }

        const { matricula } = decoded;
        const comandoSql = "UPDATE Aluno SET senha_aluno = ? WHERE matricula_aluno = ?";
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


app.post("/atualizar-notas", async (req, res) => {
    const { notas } = req.body; // Pega as notas enviadas pelo front-end

    // Se não houver notas ou for um formato inválido, retorna erro
    if (!Array.isArray(notas) || notas.length === 0) {
        return res.status(400).json({ success: false, message: 'Nenhuma nota fornecida.' });
    }
    console.log(notas);

    try {
        // Atualizando as notas no banco de dados
        for (const nota of notas) {
            const query = `
                UPDATE notas
                SET 
                    nota1 = ?, 
                    nota2 = ?, 
                    nota3 = ?, 
                    nota_recuperacao = ?
                WHERE id_nota = ? AND id_disciplina = ?;
            `;

            const values = [
                nota.nova_nota1,
                nota.nova_nota2,
                nota.nova_nota3,
                nota.nova_nota_recuperacao,
                nota.id_nota,
                nota.id_disciplina
            ];

            // Executa a consulta para atualizar as notas
            await promisePool.query(query, values);
        }

        // Se tudo der certo, envia sucesso
        res.status(200).json({ success: true, message: 'Notas atualizadas com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar as notas:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar as notas.' });
    }
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


app.post('/retorna-id', (req, res) => {
    const { nome, matricula } = req.body;
  
    if (!nome || !matricula) {
      return res.status(400).json({ message: 'Nome e matrícula são obrigatórios!' });
    }
  
    console.log("Buscando dados para:", nome, matricula);
  
    const query = `
        SELECT 
          a.id_aluno, a.nome_aluno, a.matricula_aluno, a.data_nascimento_aluno, a.email_aluno,
          t.id_turma, t.serie, t.letra, t.turno, t.ensino,
          n.id_nota, n.id_disciplina, n.nota1, n.nota2, n.nota3, n.nota_recuperacao,
          d.id_disciplina, d.nome_disciplina
        FROM Aluno a
        LEFT JOIN Notas n ON a.id_aluno = n.id_aluno
        LEFT JOIN Disciplina d ON n.id_disciplina = d.id_disciplina
        LEFT JOIN Turma t ON a.id_aluno = t.id_aluno
        WHERE a.nome_aluno = ? AND a.matricula_aluno = ?
    `;
  
    connection.query(query, [nome, matricula], (err, results) => {
      if (err) {
        console.error('Erro ao buscar dados do aluno:', err);
        return res.status(500).json({ message: 'Erro ao buscar dados do aluno' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Aluno não encontrado.' });
      }
  
      // Organizando os dados do aluno
      const aluno = {
        id_aluno: results[0].id_aluno,
        nome_aluno: results[0].nome_aluno,
        matricula_aluno: results[0].matricula_aluno,
        data_nascimento_aluno: results[0].data_nascimento_aluno,
        email_aluno: results[0].email_aluno,
        turma: {
          id_turma: results[0].id_turma,
          serie: results[0].serie,
          letra: results[0].letra,
          turno: results[0].turno,
          ensino: results[0].ensino
        },
        notas: []
      };
  
      // Adicionando as notas do aluno e as disciplinas correspondentes
      results.forEach(row => {
        if (row.id_nota) {
          aluno.notas.push({
            id_nota: row.id_nota,
            id_disciplina: row.id_disciplina,
            nome_disciplina: row.nome_disciplina,
            nota1: row.nota1,
            nota2: row.nota2,
            nota3: row.nota3,
            nota_recuperacao: row.nota_recuperacao
          });
        }
      });
  
      // Gerar o token JWT com os dados do aluno
      const token = jwt.sign(aluno, chaveJWT, { expiresIn: '1h' }); // O token expira em 1 hora
  
      console.log("Token gerado:", token);
      return res.json({ token });
    });
});
  
app.listen(PORT, async () => {
    await iniciarConexao();
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});