// Função utilitária para marcar campo inválido e exibir mensagem
function setInvalid(id, mensagem) {
    const campo = document.getElementById(id);
    if (campo) {
        campo.classList.add('is-invalid');
        const feedback = campo.parentElement.querySelector('.invalid-feedback');
        if (feedback) feedback.textContent = mensagem;
    }
}

// Banco de usuários (localStorage)
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

function salvarUsuarios() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// Cadastro
const formCadastro = document.getElementById('formCadastro');
const cadastroTipoCliente = document.getElementById('cadastroTipoCliente');
const cadastroTipoGerente = document.getElementById('cadastroTipoGerente');
const cadastroCodigoGerenteArea = document.getElementById('cadastroCodigoGerenteArea');
[ cadastroTipoCliente, cadastroTipoGerente ].forEach(radio => {
    radio.addEventListener('change', function() {
        if (cadastroTipoGerente.checked) {
            cadastroCodigoGerenteArea.style.display = '';
        } else {
            cadastroCodigoGerenteArea.style.display = 'none';
        }
    });
});
formCadastro.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('cadastroNome').value.trim();
    const telefone = document.getElementById('cadastroTelefone').value.trim();
    const cep = document.getElementById('cadastroCep').value.trim();
    const casa = document.getElementById('cadastroCasa').value.trim();
    const numero = document.getElementById('cadastroNumero').value.trim();
    const cidade = document.getElementById('cadastroCidade').value.trim();
    const estado = document.getElementById('cadastroEstado').value.trim();
    const pais = document.getElementById('cadastroPais').value.trim();
    let email = formCadastro.cadastroEmail.value.trim().toLowerCase();
    let senha = formCadastro.cadastroSenha.value;
    let senha2 = formCadastro.cadastroSenha2.value;
    let tipoUsuario = cadastroTipoGerente.checked ? 'gerente' : 'cliente';
    let erro = '';
    let sucesso = '';
    let valido = true;
    // Validações
    if (!nome) {
        setInvalid('cadastroNome', 'Informe seu nome.');
        valido = false;
    }
    if (!telefone || !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(telefone)) {
        setInvalid('cadastroTelefone', 'Informe um telefone válido.');
        valido = false;
    }
    if (!cep || !/^\d{5}-\d{3}$/.test(cep)) {
        setInvalid('cadastroCep', 'Informe um CEP válido.');
        valido = false;
    }
    if (!casa) {
        setInvalid('cadastroCasa', 'Informe o tipo de residência.');
        valido = false;
    }
    if (!numero) {
        setInvalid('cadastroNumero', 'Informe o número.');
        valido = false;
    }
    if (!cidade) {
        setInvalid('cadastroCidade', 'Informe a cidade.');
        valido = false;
    }
    if (!estado) {
        setInvalid('cadastroEstado', 'Informe o estado.');
        valido = false;
    }
    if (!pais) {
        setInvalid('cadastroPais', 'Informe o país.');
        valido = false;
    }
    if (!email.match(/^\S+@\S+\.\S+$/)) { formCadastro.cadastroEmail.classList.add('is-invalid'); valido = false; } else { formCadastro.cadastroEmail.classList.remove('is-invalid'); }
    if (!senha || senha.length < 4) { formCadastro.cadastroSenha.classList.add('is-invalid'); valido = false; } else { formCadastro.cadastroSenha.classList.remove('is-invalid'); }
    if (senha !== senha2) { formCadastro.cadastroSenha2.classList.add('is-invalid'); valido = false; } else { formCadastro.cadastroSenha2.classList.remove('is-invalid'); }
    if (tipoUsuario === 'gerente') {
        const codigo = formCadastro.cadastroCodigoGerente.value.trim();
        if (codigo !== 'GERENTE2025') {
            formCadastro.cadastroCodigoGerente.classList.add('is-invalid');
            document.getElementById('cadastroErro').textContent = 'Código do gerente incorreto.';
            return;
        } else {
            formCadastro.cadastroCodigoGerente.classList.remove('is-invalid');
        }
    }
    if (!valido) return;
    if (usuarios.find(u => u.email === email)) {
        erro = 'E-mail já cadastrado.';
        document.getElementById('cadastroErro').textContent = erro;
        document.getElementById('cadastroSucesso').textContent = '';
        return;
    }
    const usuario = {
        nome,
        telefone,
        cep,
        casa,
        numero,
        cidade,
        estado,
        pais,
        email,
        senha,
        tipoUsuario
    };
    usuarios.push(usuario);
    salvarUsuarios();
    sucesso = 'Cadastro realizado com sucesso! Redirecionando...';
    document.getElementById('cadastroErro').textContent = '';
    document.getElementById('cadastroSucesso').textContent = sucesso;
    formCadastro.reset();
    // Salvar usuário logado e redirecionar
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    setTimeout(() => { window.location.href = tipoUsuario === 'gerente' ? 'index.html' : 'loja.html'; }, 1000);
});

// Mostrar/esconder campo código gerente
const loginTipoCliente = document.getElementById('loginTipoCliente');
const loginTipoGerente = document.getElementById('loginTipoGerente');
const loginCodigoGerenteArea = document.getElementById('loginCodigoGerenteArea');
[loginTipoCliente, loginTipoGerente].forEach(radio => {
    radio.addEventListener('change', function() {
        if (loginTipoGerente.checked) {
            loginCodigoGerenteArea.style.display = '';
        } else {
            loginCodigoGerenteArea.style.display = 'none';
        }
    });
});

// Login
const formLogin = document.getElementById('formLogin');
formLogin.addEventListener('submit', function(e) {
    e.preventDefault();
    let email = formLogin.loginEmail.value.trim().toLowerCase();
    let senha = formLogin.loginSenha.value;
    let erro = '';
    let valido = true;
    if (!email.match(/^\S+@\S+\.\S+$/)) { formLogin.loginEmail.classList.add('is-invalid'); valido = false; } else { formLogin.loginEmail.classList.remove('is-invalid'); }
    if (!senha) { formLogin.loginSenha.classList.add('is-invalid'); valido = false; } else { formLogin.loginSenha.classList.remove('is-invalid'); }
    if (!valido) return;
    const tipoUsuario = loginTipoGerente.checked ? 'gerente' : 'cliente';
    if (tipoUsuario === 'gerente') {
        const codigo = document.getElementById('loginCodigoGerente').value.trim();
        if (codigo !== 'GERENTE2025') {
            document.getElementById('loginCodigoGerente').classList.add('is-invalid');
            document.getElementById('loginErro').textContent = 'Código do gerente incorreto.';
            return;
        } else {
            document.getElementById('loginCodigoGerente').classList.remove('is-invalid');
        }
    }
    let usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (!usuario) {
        erro = 'E-mail ou senha inválidos.';
        document.getElementById('loginErro').textContent = erro;
        return;
    }
    document.getElementById('loginErro').textContent = '';
    // Simular login (poderia salvar sessão)
    localStorage.setItem('usuarioLogado', JSON.stringify({ ...usuario, tipoUsuario }));
    window.location.href = 'index.html';
});

// Máscara automática para telefone
const telInput = document.getElementById('cadastroTelefone');
if (telInput) {
    telInput.addEventListener('input', function(e) {
        let v = this.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 10) {
            this.value = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (v.length > 6) {
            this.value = v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
        } else if (v.length > 2) {
            this.value = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else {
            this.value = v;
        }
    });
}

// Máscara automática para CEP
const cepInput = document.getElementById('cadastroCep');
if (cepInput) {
    cepInput.addEventListener('input', function(e) {
        let v = this.value.replace(/\D/g, '');
        if (v.length > 8) v = v.slice(0, 8);
        if (v.length > 5) {
            this.value = v.replace(/(\d{5})(\d{0,3})/, '$1-$2');
        } else {
            this.value = v;
        }
    });
} 