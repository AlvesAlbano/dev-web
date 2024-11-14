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
        console.log(data);
        alert(data.message);  // Exibir mensagens de erro, se houver
      } else {
        console.log(data);
        document.getElementById("matricula").innerHTML = data.aluno.matricula;
        document.getElementById("nome").innerHTML = data.aluno.nome;
        document.getElementById("turno").innerHTML = data.aluno.turno;
        document.getElementById("serie").innerHTML = `${data.aluno.serie} Ano, ${data.aluno.ensino}`
        document.getElementById("turma").innerHTML = data.aluno.letra;
        document.getElementById("dataNascimento").innerHTML = data.aluno.dataNascimento;

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