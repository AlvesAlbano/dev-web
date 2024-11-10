import mysql from "mysql2";

let connection;

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
            } else {
                console.log("Conectado ao banco de dados!");
                resolve(connection); // Resolve a Promise com a conexão
            }
        });
    });
}

async function iniciarConexao() {
    try {
        await conectarBD();  // Aguarda a conexão
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error.message);
        process.exit(1);  // Encerra a aplicação se não conseguir conectar
    }
}

export { iniciarConexao, connection };