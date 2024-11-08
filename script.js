document.querySelector("button").onclick = function() {
    const matricula = document.getElementById("matrícula").value;

    if (matricula.length === 5) {
        window.location.href = "/dev-web/Front/Aluno/Home/index.html";
    } else if (matricula.length === 8) {
        window.location.href = "/dev-web/Front/Professor/Lista Turmas/index.html";
    }
};
