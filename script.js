function login() {
    const matricula = document.getElementById('matricula').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('error-message');
    
    const data = {
        matricula: matricula,
        senha: senha
    };

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login bem-sucedido!') {
            window.location.href = '/dev-web/Front/Professor/Lista Alunos/index.html';
        } else {
            errorMessage.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        errorMessage.style.display = 'block';
    });
}