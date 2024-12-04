// // Função de login
// async function login() {
//     const matricula = document.getElementById('matricula').value;
//     const senha = document.getElementById('senha').value;
//     const errorMessage = document.getElementById('error-message');

//     try {
//         const response = await fetch('http://localhost:3307/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ matricula, senha })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             if (data.token) {
//                 localStorage.setItem('token', data.token);

//                 // Decodificar o token para acessar o 'role'
//                 const decodedToken = jwt_decode(data.token);
//                 const role = decodedToken.role;

//                 // Redirecionar com base no 'role'
//                 if (role === 'aluno') {
//                     window.location.href = 'Front/Aluno/index.html';
//                 } else if (role === 'professor') {
//                     window.location.href = 'Front/Professor/Lista Turmas/index.html';
//                 } else {
//                     errorMessage.textContent = 'Role inválido no token.';
//                     errorMessage.style.display = 'block';
//                 }
//             } else {
//                 errorMessage.textContent = 'Token não encontrado na resposta.';
//                 errorMessage.style.display = 'block';
//             }
//         } else {
//             errorMessage.textContent = data.message;
//             errorMessage.style.display = 'block';
//         }
//     } catch (error) {
//         console.error('Erro na autenticação:', error);
//         errorMessage.textContent = 'Erro ao conectar com o servidor.';
//         errorMessage.style.display = 'block';
//     }
// }

// // Função para exibir a tela de redefinição de senha
// function showForgotPassword() {
//     document.getElementById('loginContainer').style.display = 'none';
//     document.getElementById('forgotPasswordContainer').style.display = 'block';
// }

// // Função para voltar à tela de login
// function showLogin() {
//     document.getElementById('forgotPasswordContainer').style.display = 'none';
//     document.getElementById('loginContainer').style.display = 'block';
// }

// // Função para enviar a solicitação de redefinição de senha
// async function redefinirSenha() {
//     const matricula = document.getElementById('matriculaRedefinir').value;
//     const redefinirSenhaMessage = document.getElementById('redefinirSenhaMessage');

//     try {
//         const response = await fetch('http://localhost:3307/forgot-password', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ matricula })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             redefinirSenhaMessage.style.color = 'green';
//             redefinirSenhaMessage.textContent = 'Instruções enviadas para o email cadastrado.';
//         } else {
//             redefinirSenhaMessage.style.color = 'red';
//             redefinirSenhaMessage.textContent = data.message || 'Erro ao solicitar redefinição de senha.';
//         }
//     } catch (error) {
//         console.error('Erro na solicitação de redefinição de senha:', error);
//         redefinirSenhaMessage.style.color = 'red';
//         redefinirSenhaMessage.textContent = 'Erro ao conectar com o servidor.';
//     }

//     redefinirSenhaMessage.style.display = 'block';
// }

// Função de login
async function login() {
    const matricula = document.getElementById('matricula').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const response = await fetch('http://localhost:3306/login', {
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

// Função para enviar o token de redefinição para o e-mail
async function enviarToken() {
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
            redefinirSenhaMessage.textContent = 'Token enviado para o e-mail cadastrado.';
            showTokenInput();
        } else {
            redefinirSenhaMessage.style.color = 'red';
            redefinirSenhaMessage.textContent = data.message || 'Erro ao solicitar redefinição de senha.';
        }
    } catch (error) {
        console.error('Erro ao enviar token:', error);
        redefinirSenhaMessage.style.color = 'red';
        redefinirSenhaMessage.textContent = 'Erro ao conectar com o servidor.';
    }

    redefinirSenhaMessage.style.display = 'block';
}

// Função para validar o token de redefinição
async function validarToken() {
    const matricula = document.getElementById('matriculaRedefinir').value;
    const token = document.getElementById('tokenRedefinir').value;
    const tokenValidationMessage = document.getElementById('tokenValidationMessage');

    try {
        const response = await fetch('http://localhost:3306/validate-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula, token })
        });

        const data = await response.json();

        if (response.ok) {
            tokenValidationMessage.style.color = 'green';
            tokenValidationMessage.textContent = 'Token validado com sucesso.';
            showPasswordResetInput();
        } else {
            tokenValidationMessage.style.color = 'red';
            tokenValidationMessage.textContent = data.message || 'Token inválido.';
        }
    } catch (error) {
        console.error('Erro ao validar token:', error);
        tokenValidationMessage.style.color = 'red';
        tokenValidationMessage.textContent = 'Erro ao conectar com o servidor.';
    }

    tokenValidationMessage.style.display = 'block';
}

// Função para redefinir a senha
async function atualizarSenha() {
    const matricula = document.getElementById('matriculaRedefinir').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const senhaResetMessage = document.getElementById('senhaResetMessage');

    if (novaSenha !== confirmarSenha) {
        senhaResetMessage.style.color = 'red';
        senhaResetMessage.textContent = 'As senhas não coincidem.';
        senhaResetMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:3306/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula, novaSenha })
        });

        const data = await response.json();

        if (response.ok) {
            senhaResetMessage.style.color = 'green';
            senhaResetMessage.textContent = 'Senha atualizada com sucesso.';
            senhaResetMessage.style.display = 'block';
        } else {
            senhaResetMessage.style.color = 'red';
            senhaResetMessage.textContent = data.message || 'Erro ao redefinir a senha.';
        }
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        senhaResetMessage.style.color = 'red';
        senhaResetMessage.textContent = 'Erro ao conectar com o servidor.';
    }

    senhaResetMessage.style.display = 'block';
}

// Fluxo de exibição
function showTokenInput() {
    document.getElementById('matriculaInputContainer').style.display = 'none';
    document.getElementById('tokenInputContainer').style.display = 'block';
}

function showPasswordResetInput() {
    document.getElementById('tokenInputContainer').style.display = 'none';
    document.getElementById('passwordResetContainer').style.display = 'block';
}