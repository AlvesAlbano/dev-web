import mysql from "mysql2";

function conectarBD() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
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

export default conectarBD;