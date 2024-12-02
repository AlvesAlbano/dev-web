// Função de login
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
                    window.location.href = 'Front/Aluno/index.html';
                } else if (role === 'professor') {
                    window.location.href = 'Front/Professor/Lista Turmas/index.html';
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

// Função para exibir a tela de redefinição de senha
function showForgotPassword() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('forgotPasswordContainer').style.display = 'block';
}

// Função para voltar à tela de login
function showLogin() {
    document.getElementById('forgotPasswordContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'block';
}

// Função para enviar a solicitação de redefinição de senha
async function redefinirSenha() {
    const matricula = document.getElementById('matriculaRedefinir').value;
    const redefinirSenhaMessage = document.getElementById('redefinirSenhaMessage');

    try {
        const response = await fetch('http://localhost:3307/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula })
        });

        const data = await response.json();

        if (response.ok) {
            redefinirSenhaMessage.style.color = 'green';
            redefinirSenhaMessage.textContent = 'Instruções enviadas para o email cadastrado.';
        } else {
            redefinirSenhaMessage.style.color = 'red';
            redefinirSenhaMessage.textContent = data.message || 'Erro ao solicitar redefinição de senha.';
        }
    } catch (error) {
        console.error('Erro na solicitação de redefinição de senha:', error);
        redefinirSenhaMessage.style.color = 'red';
        redefinirSenhaMessage.textContent = 'Erro ao conectar com o servidor.';
    }

    redefinirSenhaMessage.style.display = 'block';
}