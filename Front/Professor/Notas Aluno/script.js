document.addEventListener("DOMContentLoaded", function () {
    const tabela = document.getElementById("alunoTable");

    function calcularMedia(row) {
        // Pega as notas das três etapas e a nota de recuperação
        const notas = Array.from(row.querySelectorAll("input[type='number']"))
            .map(input => parseFloat(input.value) || 0); // Converte em números, considerando 0 se vazio

        // Calcula a média das três etapas
        let mediaEtapas = (notas[0] + notas[1] + notas[2]) / 3;

        // Se a nota de recuperação for maior que 0, recalcula a média
        let mediaFinal = notas[3] > 0 ? (mediaEtapas + notas[3]) / 2 : mediaEtapas;

        // Define a situação com base na média final
        let situacao = mediaFinal >= 5.0 ? "Aprovado" : "Reprovado";

        // Preenche a coluna da média final e a coluna de situação
        row.cells[6].textContent = mediaFinal.toFixed(1); // Exibe a média com uma casa decimal
        row.cells[7].textContent = situacao;

        // Define a cor da situação (verde para aprovado, vermelho para reprovado)
        row.cells[7].style.color = mediaFinal >= 5.0 ? "green" : "red";
    }

    function calcularMediasETodasSituacoes() {
        // Itera sobre as linhas de dados na tabela, ignorando o cabeçalho
        Array.from(tabela.querySelectorAll("tbody tr")).forEach(row => {
            calcularMedia(row);
        });
    }

    // Calcula médias e situação ao carregar a página
    calcularMediasETodasSituacoes();

    // Atualiza médias e situação automaticamente ao modificar alguma nota
    tabela.addEventListener("input", function (event) {
        if (event.target.tagName === "INPUT") {
            const row = event.target.closest("tr");
            calcularMedia(row);
        }
    });
});

function logout() {
    // Adicione aqui a função de logout
    alert("Você foi deslogado!");
    // Redirecionar para a página de login (exemplo)
    window.location.href = '/dev-web/index.html';
}