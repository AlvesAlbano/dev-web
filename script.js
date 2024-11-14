async function login() {
    const matricula = document.getElementById('matricula').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('http://localhost:3307/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula, senha })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.token) {
                localStorage.setItem('token', data.token);
                
                // Decodificar o token para acessar o 'role'
                const decodedToken = jwt_decode(data.token);
                const role = decodedToken.role;

                // Redirecionar com base no 'role'
                if (role === 'aluno') {
                    window.location.href = '/dev-web/Front/Aluno/Home/index.html';
                } else if (role === 'professor') {
                    window.location.href = '/dev-web/Front/Professor/Lista Turmas/index.html';
                } else {
                    errorMessage.textContent = 'Role inválido no token.';
                    errorMessage.style.display = 'block';
                }
            } else {
                errorMessage.textContent = 'Token não encontrado na resposta.';
                errorMessage.style.display = 'block';
            }
        } else {
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro na autenticação:', error);
        errorMessage.textContent = 'Erro ao conectar com o servidor.';
        errorMessage.style.display = 'block';
    }
}