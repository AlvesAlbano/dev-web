function fetchTurmas() {
    fetch('http://localhost:3307/turmas')  // URL do backend (ajuste se necessário)
        .then(response => response.json())
        .then(data => {
            // Organiza as turmas por turno
            const turmasManha = data.filter(turma => turma.turno === 'Manhã');
            const turmasTarde = data.filter(turma => turma.turno === 'Tarde');

            // Função para criar elementos HTML de turmas
            function criarTurmaElement(turma) {
                const turmaElement = document.createElement('div');
                turmaElement.classList.add('turma');
                turmaElement.innerHTML = `
                    <p onclick="window.location.href='/dev-web/Front/Professor/Lista Alunos/index.html?serie=${turma.serie}&letra=${turma.letra}'"
                       style="cursor: pointer; color: blue; text-decoration: underline;">
                        ${turma.serie}º Ano ${turma.letra} - ${turma.total_alunos} Alunos
                    </p>
                `;
                return turmaElement;
            }
            

            // Exibe as turmas de manhã
            const manhaContainer = document.querySelector('#manha-container');
            if (manhaContainer) {
                manhaContainer.innerHTML = '';  // Limpa o conteúdo existente
                turmasManha.forEach(turma => {
                    manhaContainer.appendChild(criarTurmaElement(turma));
                });
            }

            // Exibe as turmas da tarde
            const tardeContainer = document.querySelector('#tarde-container');
            if (tardeContainer) {
                tardeContainer.innerHTML = '';  // Limpa o conteúdo existente
                turmasTarde.forEach(turma => {
                    tardeContainer.appendChild(criarTurmaElement(turma));
                });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar turmas:', error);
        });
}

window.onload = fetchTurmas;