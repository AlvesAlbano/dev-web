document.querySelector(".btn-primary").addEventListener("click", function () {
    const linhas = Array.from(document.querySelectorAll("#alunoTable tbody tr"));

    // Mapeia as notas em um array de objetos
    const notasAtualizadas = linhas.map((linha) => {
        return {
            id_disciplina: linha.cells[0].textContent,
            media1: parseFloat(linha.cells[2].querySelector("input").value) || 0,
            media2: parseFloat(linha.cells[3].querySelector("input").value) || 0,
            media3: parseFloat(linha.cells[4].querySelector("input").value) || 0,
            recuperacao: parseFloat(linha.cells[5].querySelector("input").value) || 0,
        };
    });

    // Envia as notas para o servidor
    fetch("/atualizar-notas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ notasAtualizadas })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Notas atualizadas com sucesso!") {
            alert("Notas salvas com sucesso!");
        } else {
            alert("Erro ao salvar as notas.");
        }
    })
    .catch(error => {
        console.error("Erro ao salvar as notas:", error);
        alert("Erro ao salvar as notas.");
    });

});
    
function logout() {
    // Adicione aqui a função de logout
    alert("Você foi deslogado!");
    // Redirecionar para a página de login (exemplo)
    window.location.href = '/dev-web/index.html';
}