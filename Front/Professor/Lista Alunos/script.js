// console.log("Página de lista de alunos carregada com sucesso!");

function logout() {
    // Adicione aqui a função de logout
    alert("Você foi deslogado!");
    // Redirecionar para a página de login (exemplo)
    window.location.href = '/dev-web/index.html';
}

function fetchAlunos() {
    // Pegando os parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const serie = params.get('serie');
    const letra = params.get('letra');

    if (!serie || !letra) {
        console.error("Faltando parâmetros de turma.");
        return;
    }

    fetch(`http://localhost:3307/alunos?serie=${serie}&letra=${letra}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const alunosContainer = document.querySelector('.card');
        alunosContainer.innerHTML = ''; // Limpa o conteúdo existente
        console.log(data);
        data.forEach(aluno => {
            const alunoElement = document.createElement('div');
            alunoElement.classList.add('aluno-item', 'd-flex', 'align-items-center');
            alunoElement.innerHTML = `
                <img src="https://via.placeholder.com/50" alt="Foto do Aluno" class="aluno-foto">
                <span class="aluno-nome">
                    <p onclick="window.location.href='/dev-web/Front/Professor/Notas Aluno/index.html?matricula=${aluno.matricula_aluno}'"
                       style="cursor: pointer; color: blue; text-decoration: underline;">
                        ${aluno.nome_aluno}
                    </p>
                </span>
                <span class="aluno-matricula">Matrícula: ${aluno.matricula_aluno}</span>
            `;
            alunosContainer.appendChild(alunoElement);
        });
    })
    .catch(error => {
        console.error('Erro ao buscar alunos:', error);
    });
}

window.onload = fetchAlunos;