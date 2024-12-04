// Função para realizar logout
function logout() {
    alert("Você foi deslogado!");
    window.location.href = '/dev-web/index.html';
}

// Função para buscar alunos com base nos parâmetros da URL
function fetchAlunos() {
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar alunos: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const alunosContainer = document.querySelector('.card');
        alunosContainer.innerHTML = ''; // Limpa o conteúdo existente

        data.forEach(aluno => {
            const alunoElement = document.createElement('div');
            alunoElement.classList.add('aluno-item', 'd-flex', 'align-items-center');
            alunoElement.innerHTML = `
                <img src="https://via.placeholder.com/50" alt="Foto do Aluno" class="aluno-foto">
                <span class="aluno-nome">
                    <p style="cursor: pointer; color: blue; text-decoration: underline;"
                       onclick="handleAlunoClick('${aluno.nome_aluno}', '${aluno.matricula_aluno}')">
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

function handleAlunoClick(nome, matricula) {
    // Armazenar o nome e matrícula no localStorage
    localStorage.setItem('nome_aluno', nome);
    localStorage.setItem('matricula_aluno', matricula);

    // Enviar os dados do aluno para a requisição
    fetch('http://localhost:3307/retorna-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, matricula })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao enviar os dados do aluno: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Dados do aluno:', data);
        window.location.href = "/dev-web/Front/Professor/Notas Aluno/index.html"; // Redireciona para a página de notas
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });
}

// Chama a função fetchAlunos ao carregar a página
window.onload = fetchAlunos;
