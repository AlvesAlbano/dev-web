function getToken() {
  return localStorage.getItem('token');  // ou sessionStorage.getItem('token')
}

function loadBoletim() {
  const token = getToken();

  if (!token) {
      window.location.href = "/dev-web/index.html";  // Redirecionar para o login caso não haja token
      return;
  }

  fetch('http://localhost:3307/boletim', {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,  // Passando o token no cabeçalho
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.message) {
          alert(data.message);  // Exibir mensagens de erro, se houver
      } else {
          // Atualizar a página com as informações do aluno
          document.getElementById('matricula').innerText = data.aluno.matricula;
          document.getElementById('nome').innerText = data.aluno.nome;
          document.getElementById('etapa').innerText = data.aluno.etapa;

          // Aqui pegamos apenas o número da série (por exemplo, '5' de '5 ano A')
          const serie = data.aluno.serie;
          const numeroSerie = serie.match(/\d+/); // Captura o número da série (ex: '5' de '5 ano A')
          document.getElementById('serie').innerText = numeroSerie ? `${numeroSerie}º Ano` : ''; // Exibe o número seguido de "º"

          // Aqui pegamos apenas a letra da turma (por exemplo, 'A' de '5 ano A')
          const turma = data.aluno.turma;
          const letraTurma = turma.match(/[A-Za-z]$/); // Extrai o último caractere, que é a letra da turma
          document.getElementById('turma').innerText = letraTurma ? letraTurma[0] : ''; // Exibe a letra da turma

          document.getElementById('dataNascimento').innerText = data.aluno.dataNascimento;

          // Atualizar a tabela de notas
          const notasTable = document.getElementById('notasTable');
          data.notas.forEach(nota => {
              // Calcular a média final considerando apenas as notas preenchidas
              let notasDisponiveis = [];
              if (nota.nota1) notasDisponiveis.push(nota.nota1);
              if (nota.nota2) notasDisponiveis.push(nota.nota2);
              if (nota.nota3) notasDisponiveis.push(nota.nota3);
              
              const mediaFinal = notasDisponiveis.reduce((a, b) => a + b, 0) / notasDisponiveis.length;
              const situacao = mediaFinal >= 7 ? 'Aprovado' : 'Reprovado';

              // Criar uma linha para cada disciplina
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${nota.nome_disciplina}</td>
                  <td>${nota.nota1 || '---'}</td>
                  <td>${nota.nota2 || '---'}</td>
                  <td>${nota.nota3 || '---'}</td>
                  <td>${nota.nota_recuperacao || '---'}</td>
                  <td>${mediaFinal.toFixed(2)}</td>
                  <td>${situacao}</td>
              `;
              notasTable.appendChild(row);
          });
      }
  })
  .catch(error => {
      console.error('Erro ao carregar boletim:', error);
      alert('Erro ao carregar boletim');
  });
}

window.onload = loadBoletim;