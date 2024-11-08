// Função para calcular a média e definir a situação
function calcularSituacao() {
    const rows = document.querySelectorAll("#alunoTable tbody tr");

    rows.forEach(row => {
        // Captura as médias de cada etapa
        const media1 = parseFloat(row.cells[2].textContent);
        const media2 = parseFloat(row.cells[3].textContent);
        const media3 = parseFloat(row.cells[4].textContent);

        // Calcula a média das três etapas
        const mediaFinal = ((media1 + media2 + media3) / 3).toFixed(1);

        // Seleciona a célula da coluna de Situação
        const situacaoCell = row.cells[7];

        // Define a situação com base na média
        if (mediaFinal >= 5.0) {
            situacaoCell.textContent = "Aprovado";
            situacaoCell.style.color = "green";
        } else {
            situacaoCell.textContent = "Reprovado";
            situacaoCell.style.color = "red";
        }
    });
}

function logout() {
    // Adicione aqui a função de logout
    alert("Você foi deslogado!");
    // Redirecionar para a página de login (exemplo)
    window.location.href = '/dev-web/index.html';
}

// Chama a função após o carregamento do conteúdo da página
document.addEventListener("DOMContentLoaded", calcularSituacao);