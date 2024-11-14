document.addEventListener("DOMContentLoaded", function () {
    const tabela = document.getElementById("turmaTable");

    function buscarTabela() {
        fetch('http://localhost:3307/boletim', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Corrigido para usar template string
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                const serie = data.turma.serie;
                const numeroSerie = serie.match(/\d+/);
                document.getElementById('serie').innerText = numeroSerie ? `${numeroSerie[0]}º Ano` : ''; // Corrigido para usar numeroSerie[0]

                const turma = data.turma.id_turma;
                const letraTurma = turma.match(/[A-Za-z]$/); // Corrigido para usar turma e não id_turma
                document.getElementById('turma').innerText = letraTurma ? letraTurma[0] : '';

                const turno = data.turma.turno;
                document.getElementById('turno').innerText = turno;

                data.alunos.forEach(aluno => {
                    const novaLinha = document.createElement('tr');
                    novaLinha.innerHTML = `
                        <td>${aluno.nome}</td>
                        <td>${aluno.matricula}</td>
                        <td><img src="${aluno.foto}" alt="${aluno.nome}"></td>
                    `;
                    tabela.appendChild(novaLinha);
                });
            }
        })
        .catch(error => {
            console.error('Erro:', error);
        });
    }

    buscarTabela(); // Chama a função buscarTabela ao carregar a página
});