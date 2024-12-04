document.addEventListener('DOMContentLoaded', () => {
    // Seleciona os elementos do formulário
    const nomeElement = document.getElementById('nome');
    const matriculaElement = document.getElementById('matricula');
    const serieElement = document.getElementById("serie");
    const turmaElement = document.getElementById("turma");
    const turnoElement = document.getElementById("turno");
    const dataNascimentoElement = document.getElementById("dataNascimento");

    // Pega o nome e matrícula do aluno armazenados no localStorage
    const nome = localStorage.getItem('nome_aluno');
    const matricula = localStorage.getItem('matricula_aluno');

    // Verifica se os dados existem no localStorage
    if (!nome || !matricula) {
        console.error('Nome ou matrícula não encontrados no localStorage!');
        return;
    }

    // Fazendo a requisição para obter os dados do aluno
    fetch('http://localhost:3307/retorna-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, matricula })  // Envia os dados no corpo da requisição
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar os dados do aluno');
        }
        return response.json();  // Converte a resposta para JSON
    })
    .then(data => {
        const token = data.token;
        const decodedToken = jwt_decode(token);
        console.log('Dados do aluno recebidos:', decodedToken);  // Imprime os dados do aluno no console

        // Preenchendo as informações do aluno no formulário
        nomeElement.innerHTML = decodedToken.nome_aluno;
        matriculaElement.innerHTML = decodedToken.matricula_aluno;
        serieElement.innerHTML = `${decodedToken.turma.serie}º Ano , ${decodedToken.turma.ensino}`;
        turmaElement.innerHTML = decodedToken.turma.letra;
        turnoElement.innerHTML = decodedToken.turma.turno;
        dataNascimentoElement.innerHTML = decodedToken.data_nascimento_aluno;

        // Preenchendo a tabela com as disciplinas e notas
        const alunoTableBody = document.querySelector('#alunoTable tbody');
        decodedToken.notas.forEach(nota => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${nota.id_disciplina}</td>
                <td>${nota.nome_disciplina}</td>
                <td><input type="number" class="form-control" value="${nota.nota1}" data-id-nota="${nota.id_nota}" data-disciplina="${nota.id_disciplina}" step="0.1" min="0" max="10" required></td>
                <td><input type="number" class="form-control" value="${nota.nota2}" data-id-nota="${nota.id_nota}" data-disciplina="${nota.id_disciplina}" step="0.1" min="0" max="10" required></td>
                <td><input type="number" class="form-control" value="${nota.nota3}" data-id-nota="${nota.id_nota}" data-disciplina="${nota.id_disciplina}" step="0.1" min="0" max="10" required></td>
                <td><input type="number" class="form-control" value="${nota.nota_recuperacao}" data-id-nota="${nota.id_nota}" data-disciplina="${nota.id_disciplina}" step="0.1" min="0" max="10" required></td>
                <td class="media-final"></td> <!-- Média calculada -->
                <td class="situacao"></td> <!-- Situação calculada -->
            `;
            alunoTableBody.appendChild(row);

            // Adiciona o evento de escuta para os campos de nota
            row.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    calcularEMostrarMediaESituacao(row); // Recalcula e exibe a média e situação ao digitar
                });
            });
        });
    })
    .catch(error => {
        console.error('Erro:', error);  // Imprime qualquer erro no console
    });
});

document.getElementById('salvarBtn').addEventListener('click', () => {
    const notasAlteradas = [];
    const rows = document.querySelectorAll('#alunoTable tbody tr'); // Acessa todas as linhas da tabela

    rows.forEach((row, index) => {
        const nota1 = parseFloat(obterNotaOuZero(row.querySelector('input:nth-child(3)').value));
        const nota2 = parseFloat(obterNotaOuZero(row.querySelector('input:nth-child(4)').value));
        const nota3 = parseFloat(obterNotaOuZero(row.querySelector('input:nth-child(5)').value));
        const notaRecuperacao = parseFloat(obterNotaOuZero(row.querySelector('input:nth-child(6)').value));

        // Calcular a média para cada disciplina
        const media = calcularMedia(nota1, nota2, nota3, notaRecuperacao);
        const situacao = media >= 5 ? 'Aprovado' : 'Reprovado';

        // Atualiza a média e situação na tabela
        row.querySelector('.media-final').textContent = media.toFixed(1);  // Exibe a média com uma casa decimal
        row.querySelector('.situacao').textContent = situacao;  // Exibe a situação

        // Coletar as notas alteradas para enviar ao servidor
        const idNota = row.querySelector('input').getAttribute('data-id-nota');
        const idDisciplina = row.querySelector('input').getAttribute('data-disciplina');

        if (!isNaN(nota1) && !isNaN(nota2) && !isNaN(nota3) && !isNaN(notaRecuperacao)) {
            notasAlteradas.push({
                id_nota: idNota,
                id_disciplina: idDisciplina,
                nova_nota1: nota1.toFixed(1),  // Garantir uma casa decimal
                nova_nota2: nota2.toFixed(1),  // Garantir uma casa decimal
                nova_nota3: nota3.toFixed(1),  // Garantir uma casa decimal
                nova_nota_recuperacao: notaRecuperacao.toFixed(1)  // Garantir uma casa decimal
            });
        }
    });

    // Enviando as notas alteradas para o backend
    fetch('http://localhost:3307/atualizar-notas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notas: notasAlteradas })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Notas salvas com sucesso!');
        } else {
            alert('Erro ao salvar notas.');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar as notas.');
    });
});

// Função para garantir que valores nulos ou inválidos sejam tratados como 0
function obterNotaOuZero(valor) {
    return valor === '' || valor === null || valor === undefined ? '0' : valor;
}

// Função para calcular a média e mostrar a situação
function calcularEMostrarMediaESituacao(row) {
    const nota1 = parseFloat(obterNotaOuZero(row.querySelector('input:nth-child(3)').value));
    const nota2 = parseFloat(obterNotaOuZero(row.querySelector('input:nth-child(4)').value));
    const nota3 = parseFloat(obterNotaOuZero(row.querySelector('input:nth-child(5)').value));
    const notaRecuperacao = parseFloat(obterNotaOuZero(row.querySelector('input:nth-child(6)').value));

    const media = calcularMedia(nota1, nota2, nota3, notaRecuperacao);
    const situacao = media >= 5 ? 'Aprovado' : 'Reprovado';

    row.querySelector('.media-final').textContent = media.toFixed(1);  // Exibe a média com uma casa decimal
    row.querySelector('.situacao').textContent = situacao;  // Exibe a situação
}
