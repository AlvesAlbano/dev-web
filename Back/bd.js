import mysql from "mysql2";

let connection;
let conectado = false;

function conectarBD() {    
    return new Promise((resolve, reject) => {
        connection = mysql.createConnection({
            host: "127.0.0.1",
            user: "root",
            password: "12345678",
            database: "notasedu"
        });

        connection.connect((err) => {
            if (err) {
                console.log(`Erro de conexão: ${err.message}`);
                reject(err); // Rejeita a Promise se houver erro
                conectado = false;
            } else {
                console.log("Conectado ao banco de dados!");
                resolve(connection); // Resolve a Promise com a conexão
                conectado = true;
            }
        });
    });
}

async function iniciarConexao() {
    try {
        await conectarBD();  // Aguarda a conexão
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error.message);
        console.log("Tentando reconectar em 10 segundos...");
        await reconectar();  // Aguarda a reconexão
    }
}

// Função para reconectar após 10 segundos
async function reconectar() {
    if (!conectado) {
        setTimeout(async () => {
            try {
                await conectarBD();  // Tenta se reconectar após 10 segundos
                if (conectado) {
                    console.log("Reconectado ao banco de dados!");
                } else {
                    console.log("Erro na reconexão, tentando novamente...");
                    await reconectar();  // Tenta novamente se não conectar
                }
            } catch (error) {
                console.error("Erro ao tentar reconectar:", error.message);
                await reconectar();  // Caso haja outro erro, tenta reconectar novamente
            }
        }, 10000);  // 10 segundos de espera
    }
}

export { iniciarConexao, connection };