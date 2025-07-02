// Banco de dados simulado
let fornecedores = [];
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];

// Carregar categorias do localStorage ao iniciar
let categorias = JSON.parse(localStorage.getItem('categorias')) || [];

// Utilidades
function salvarLocalStorage() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('produtos', JSON.stringify(produtos));
    localStorage.setItem('vendas', JSON.stringify(vendas));
}

function limparForm(form) {
    form.reset();
    form.classList.remove('was-validated');
}

// Máscaras
function mascaraCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

function mascaraTelefone(tel) {
    tel = tel.replace(/\D/g, '');
    tel = tel.replace(/(\d{2})(\d)/, '($1) $2');
    tel = tel.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    return tel;
}

function mascaraCEP(cep) {
    cep = cep.replace(/\D/g, '');
    cep = cep.replace(/(\d{5})(\d{3})$/, '$1-$2');
    return cep;
}

// Validação de CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

// Validação de data DD/MM/AAAA
function validarData(data) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;
    const [dia, mes, ano] = data.split('/').map(Number);
    const dt = new Date(ano, mes - 1, dia);
    return dt.getDate() === dia && dt.getMonth() === mes - 1 && dt.getFullYear() === ano;
}

// Preencher dropdowns
function preencherFornecedores() {
    const select = document.getElementById('produtoFornecedor');
    select.innerHTML = '<option value="">Selecione</option>';
    fornecedores.forEach(f => {
        select.innerHTML += `<option value="${f.id}">${f.nome}</option>`;
    });
}

function preencherCategorias() {
    const select = document.getElementById('produtoCategoria');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione</option>';
    categorias.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
    });
}

// Atualizar tabelas
function atualizarTabelaProdutos() {
    const tbody = document.querySelector('#tabelaProdutos tbody');
    tbody.innerHTML = '';
    produtos.forEach(p => {
        const fornecedor = fornecedores.find(f => f.id == p.fornecedorId);
        const categoria = categorias.find(c => c.id == p.categoriaId);
        tbody.innerHTML += `<tr>
            <td>${p.nome}</td>
            <td>${p.descricao}</td>
            <td>R$ ${parseFloat(p.valor).toFixed(2)}</td>
            <td>${p.tipo}</td>
            <td>${p.estoque}</td>
            <td>${fornecedor ? fornecedor.nome : ''}</td>
            <td>
                <button class='btn btn-sm btn-primary btn-editar-produto' data-id='${p.id}' title='Editar'>&#9998;</button>
                <button class='btn btn-sm btn-danger btn-remover-produto' data-id='${p.id}' title='Remover'>&#128465;</button>
            </td>
        </tr>`;
    });
    // Evento de remoção
    document.querySelectorAll('.btn-remover-produto').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja remover este produto/serviço?')) {
                produtos = produtos.filter(p => p.id != id);
                salvarLocalStorage();
                atualizarTabelaProdutos();
            }
        });
    });
    // Evento de edição
    document.querySelectorAll('.btn-editar-produto').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const prod = produtos.find(p => p.id == id);
            if (!prod) return;
            // Preencher campos do modal
            document.getElementById('editarProdutoId').value = prod.id;
            document.getElementById('editarProdutoNome').value = prod.nome;
            document.getElementById('editarProdutoDescricao').value = prod.descricao;
            document.getElementById('editarProdutoValor').value = prod.valor;
            document.getElementById('editarProdutoPromocao').value = prod.promocao || '';
            document.getElementById('editarProdutoDesconto').value = prod.desconto || '';
            document.getElementById('editarProdutoTipo').value = prod.tipo;
            document.getElementById('editarProdutoEstoque').value = prod.estoque;
            // Preencher fornecedores
            const selectF = document.getElementById('editarProdutoFornecedor');
            selectF.innerHTML = '<option value="">Selecione</option>';
            fornecedores.forEach(f => {
                selectF.innerHTML += `<option value="${f.id}" ${prod.fornecedorId==f.id?'selected':''}>${f.nome}</option>`;
            });
            // Preencher categorias
            const selectC = document.getElementById('editarProdutoCategoria');
            selectC.innerHTML = '<option value="">Selecione</option>';
            categorias.forEach(c => {
                selectC.innerHTML += `<option value="${c.id}" ${prod.categoriaId==c.id?'selected':''}>${c.nome}</option>`;
            });
            $('#modalEditarProduto').modal('show');
        });
    });
}

function atualizarTabelaVendas() {
    const tbody = document.querySelector('#tabelaVendas tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    vendas.forEach(venda => {
        venda.itens.forEach(item => {
            tbody.innerHTML += `<tr>
                <td>${venda.cliente}</td>
                <td>${item.nome}</td>
                <td>${item.qtd}</td>
                <td>R$ ${item.valorUnit.toFixed(2)}</td>
                <td>R$ ${(item.subtotal).toFixed(2)}</td>
            </tr>`;
        });
    });
}

// Banner Promocional
function exibirBanner() {
    const banner = JSON.parse(localStorage.getItem('bannerPromo'));
    const area = document.getElementById('areaBanner');
    const titulo = document.getElementById('bannerTitulo');
    const descricao = document.getElementById('bannerDescricao');
    const img = document.getElementById('bannerImg');
    if (area && titulo && descricao && img) {
        if (banner && banner.titulo && banner.descricao && banner.imagem) {
            titulo.textContent = banner.titulo;
            descricao.textContent = banner.descricao;
            img.src = banner.imagem;
            area.style.display = '';
        } else {
            area.style.display = 'none';
        }
    }
}

// Exibir banner na área administrativa
function exibirBannerAdmin() {
    const banner = JSON.parse(localStorage.getItem('bannerPromo'));
    const area = document.getElementById('areaBannerAdmin');
    if (area) {
        if (banner && banner.titulo && banner.descricao && banner.imagem) {
            document.getElementById('bannerTituloAdmin').textContent = banner.titulo;
            document.getElementById('bannerDescricaoAdmin').textContent = banner.descricao;
            document.getElementById('bannerImgAdmin').src = banner.imagem;
            area.style.display = '';
        } else {
            area.style.display = 'none';
        }
    }
}

// Função para remover banner
function removerBannerAdmin() {
    localStorage.removeItem('bannerPromo');
    exibirBanner();
    exibirBannerAdmin();
    $('#modalMensagemBody').text('Banner removido com sucesso!');
    $('#modalMensagem').modal('show');
}

// Atualizar tabela de fornecedores
function atualizarTabelaFornecedores() {
    const tbody = document.querySelector('#tabelaFornecedores tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    fornecedores.forEach(f => {
        tbody.innerHTML += `<tr><td>${f.nome}</td><td><button class='btn btn-sm btn-danger btn-remover-fornecedor' data-id='${f.id}'>Remover</button></td></tr>`;
    });
    // Evento de remoção
    document.querySelectorAll('.btn-remover-fornecedor').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja remover este fornecedor?')) {
                fornecedores = fornecedores.filter(f => f.id != id);
                localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
                preencherFornecedores();
                atualizarTabelaFornecedores();
            }
        });
    });
}

// Atualizar tabela de categorias
function atualizarTabelaCategorias() {
    const tbody = document.querySelector('#tabelaCategorias tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    categorias.forEach(c => {
        tbody.innerHTML += `<tr><td>${c.nome}</td><td><button class='btn btn-sm btn-danger btn-remover-categoria' data-id='${c.id}'>Remover</button></td></tr>`;
    });
    // Evento de remoção
    document.querySelectorAll('.btn-remover-categoria').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Tem certeza que deseja remover esta categoria?')) {
                categorias = categorias.filter(c => c.id != id);
                localStorage.setItem('categorias', JSON.stringify(categorias));
                atualizarTabelaCategorias();
            }
        });
    });
}

// Eventos de formulário
window.onload = function() {
    preencherFornecedores();
    preencherCategorias();
    atualizarTabelaProdutos();
    atualizarTabelaVendas();
    atualizarTabelaFornecedores();
    atualizarTabelaCategorias();
    exibirBanner();
    exibirBannerAdmin();

    // Máscaras
    if (document.getElementById('clienteCPF')) {
        document.getElementById('clienteCPF').addEventListener('input', function(e) {
            this.value = mascaraCPF(this.value);
        });
    }
    if (document.getElementById('clienteTelefone')) {
        document.getElementById('clienteTelefone').addEventListener('input', function(e) {
            this.value = mascaraTelefone(this.value);
        });
    }
    if (document.getElementById('clienteCep')) {
        document.getElementById('clienteCep').addEventListener('input', function(e) {
            this.value = mascaraCEP(this.value);
        });
    }

    // Cadastro de Cliente
    if (document.getElementById('formCliente')) {
        document.getElementById('formCliente').addEventListener('submit', function(e) {
            e.preventDefault();
            let form = this;
            let nome = form.clienteNome.value.trim();
            let telefone = form.clienteTelefone.value.trim();
            let cpf = form.clienteCPF.value.trim();
            let cep = form.clienteCep.value.trim();
            let endereco = form.clienteEndereco.value.trim();
            let valido = true;
            if (!nome) { form.clienteNome.classList.add('is-invalid'); valido = false; } else { form.clienteNome.classList.remove('is-invalid'); }
            if (!telefone.match(/^\(\d{2}\) \d{4,5}-\d{4}$/)) { form.clienteTelefone.classList.add('is-invalid'); valido = false; } else { form.clienteTelefone.classList.remove('is-invalid'); }
            if (!validarCPF(cpf)) { form.clienteCPF.classList.add('is-invalid'); valido = false; } else { form.clienteCPF.classList.remove('is-invalid'); }
            if (!cep.match(/^\d{5}-\d{3}$/)) { form.clienteCep.classList.add('is-invalid'); valido = false; } else { form.clienteCep.classList.remove('is-invalid'); }
            if (!endereco) { form.clienteEndereco.classList.add('is-invalid'); valido = false; } else { form.clienteEndereco.classList.remove('is-invalid'); }
            if (!valido) return;
            let novoCliente = {
                id: Date.now(),
                nome, telefone, cpf, cep, endereco
            };
            clientes.push(novoCliente);
            salvarLocalStorage();
            limparForm(form);
            $('#modalMensagemBody').text('Cliente cadastrado com sucesso!');
            $('#modalMensagem').modal('show');
        });
    }

    // Cadastro de Produto/Serviço
    if (document.getElementById('formProduto')) {
        document.getElementById('formProduto').addEventListener('submit', function(e) {
            e.preventDefault();
            let form = this;
            let nome = form.produtoNome.value.trim();
            let descricao = form.produtoDescricao.value.trim();
            let valor = form.produtoValor.value;
            let tipo = form.produtoTipo.value;
            let estoque = form.produtoEstoque.value;
            let fornecedorId = form.produtoFornecedor.value;
            let categoriaId = form.produtoCategoria.value;
            let imagemInput = form.produtoImagem;
            let promocao = form.produtoPromocao.value;
            let desconto = form.produtoDesconto.value;
            let valido = true;
            if (!nome) { form.produtoNome.classList.add('is-invalid'); valido = false; } else { form.produtoNome.classList.remove('is-invalid'); }
            if (!descricao) { form.produtoDescricao.classList.add('is-invalid'); valido = false; } else { form.produtoDescricao.classList.remove('is-invalid'); }
            if (!valor || valor <= 0) { form.produtoValor.classList.add('is-invalid'); valido = false; } else { form.produtoValor.classList.remove('is-invalid'); }
            if (!tipo) { form.produtoTipo.classList.add('is-invalid'); valido = false; } else { form.produtoTipo.classList.remove('is-invalid'); }
            if (estoque === '' || estoque < 0) { form.produtoEstoque.classList.add('is-invalid'); valido = false; } else { form.produtoEstoque.classList.remove('is-invalid'); }
            if (!fornecedorId) { form.produtoFornecedor.classList.add('is-invalid'); valido = false; } else { form.produtoFornecedor.classList.remove('is-invalid'); }
            if (!categoriaId) { form.produtoCategoria.classList.add('is-invalid'); valido = false; } else { form.produtoCategoria.classList.remove('is-invalid'); }
            if (!valido) return;
            // Função para salvar produto após processar imagem
            function salvarProduto(imagemBase64) {
                let valorNum = parseFloat(valor);
                let promocaoNum = promocao ? parseFloat(promocao) : null;
                let descontoNum = desconto ? parseFloat(desconto) : null;
                // Se desconto preenchido, calcular valor promocional
                if (descontoNum && descontoNum > 0) {
                    promocaoNum = (valorNum * (1 - descontoNum / 100)).toFixed(2);
                    promocaoNum = parseFloat(promocaoNum);
                }
                let novoProduto = {
                    id: Date.now(),
                    nome,
                    descricao,
                    valor: valorNum,
                    promocao: promocaoNum,
                    desconto: descontoNum,
                    tipo,
                    estoque: parseInt(estoque),
                    fornecedorId: parseInt(fornecedorId),
                    categoriaId: parseInt(categoriaId),
                    imagem: imagemBase64 || null
                };
                produtos.push(novoProduto);
                salvarLocalStorage();
                atualizarTabelaProdutos();
                limparForm(form);
                $('#modalMensagemBody').text('Produto/Serviço cadastrado com sucesso!');
                $('#modalMensagem').modal('show');
            }
            // Se houver imagem, ler como base64
            if (imagemInput && imagemInput.files && imagemInput.files[0]) {
                let file = imagemInput.files[0];
                let reader = new FileReader();
                reader.onload = function(e) {
                    salvarProduto(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                salvarProduto(null);
            }
        });
    }

    // Cadastro de Banner
    if (document.getElementById('formBanner')) {
        document.getElementById('formBanner').addEventListener('submit', function(e) {
            e.preventDefault();
            let form = this;
            let titulo = form.bannerTituloInput.value.trim();
            let descricao = form.bannerDescricaoInput.value.trim();
            let imgInput = form.bannerImgInput;
            let valido = true;
            if (!titulo) { form.bannerTituloInput.classList.add('is-invalid'); valido = false; } else { form.bannerTituloInput.classList.remove('is-invalid'); }
            if (!descricao) { form.bannerDescricaoInput.classList.add('is-invalid'); valido = false; } else { form.bannerDescricaoInput.classList.remove('is-invalid'); }
            if (!imgInput.files || !imgInput.files[0]) { form.bannerImgInput.classList.add('is-invalid'); valido = false; } else { form.bannerImgInput.classList.remove('is-invalid'); }
            if (!valido) return;
            let file = imgInput.files[0];
            let reader = new FileReader();
            reader.onload = function(e) {
                let banner = { titulo, descricao, imagem: e.target.result };
                localStorage.setItem('bannerPromo', JSON.stringify(banner));
                exibirBanner();
                exibirBannerAdmin();
                form.reset();
                $('#modalMensagemBody').text('Banner cadastrado com sucesso!');
                $('#modalMensagem').modal('show');
            };
            reader.readAsDataURL(file);
        });
    }

    // Cadastro de Fornecedor
    if (document.getElementById('formFornecedor')) {
        document.getElementById('formFornecedor').addEventListener('submit', function(e) {
            e.preventDefault();
            let form = this;
            let nome = form.fornecedorNome.value.trim();
            let valido = true;
            if (!nome) { form.fornecedorNome.classList.add('is-invalid'); valido = false; } else { form.fornecedorNome.classList.remove('is-invalid'); }
            if (!valido) return;
            let novoFornecedor = { id: Date.now(), nome };
            fornecedores.push(novoFornecedor);
            localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
            preencherFornecedores();
            atualizarTabelaFornecedores();
            limparForm(form);
            $('#modalMensagemBody').text('Fornecedor cadastrado com sucesso!');
            $('#modalMensagem').modal('show');
        });
    }

    // Cadastro de Categoria
    if (document.getElementById('formCategoria')) {
        document.getElementById('formCategoria').addEventListener('submit', function(e) {
            e.preventDefault();
            let form = this;
            let nome = form.categoriaNome.value.trim();
            let valido = true;
            if (!nome) { form.categoriaNome.classList.add('is-invalid'); valido = false; } else { form.categoriaNome.classList.remove('is-invalid'); }
            if (!valido) return;
            let novaCategoria = { id: Date.now(), nome };
            categorias.push(novaCategoria);
            localStorage.setItem('categorias', JSON.stringify(categorias));
            atualizarTabelaCategorias();
            limparForm(form);
            $('#modalMensagemBody').text('Categoria cadastrada com sucesso!');
            $('#modalMensagem').modal('show');
        });
    }

    // Edição de produto
    if (document.getElementById('formEditarProduto')) {
        document.getElementById('formEditarProduto').addEventListener('submit', function(e) {
            e.preventDefault();
            let form = this;
            let id = form.editarProdutoId.value;
            let nome = form.editarProdutoNome.value.trim();
            let descricao = form.editarProdutoDescricao.value.trim();
            let valor = form.editarProdutoValor.value;
            let tipo = form.editarProdutoTipo.value;
            let estoque = form.editarProdutoEstoque.value;
            let fornecedorId = form.editarProdutoFornecedor.value;
            let categoriaId = form.editarProdutoCategoria.value;
            let promocao = form.editarProdutoPromocao.value;
            let desconto = form.editarProdutoDesconto.value;
            let imagemInput = form.editarProdutoImagem;
            let valido = true;
            if (!nome) { form.editarProdutoNome.classList.add('is-invalid'); valido = false; } else { form.editarProdutoNome.classList.remove('is-invalid'); }
            if (!descricao) { form.editarProdutoDescricao.classList.add('is-invalid'); valido = false; } else { form.editarProdutoDescricao.classList.remove('is-invalid'); }
            if (!valor || valor <= 0) { form.editarProdutoValor.classList.add('is-invalid'); valido = false; } else { form.editarProdutoValor.classList.remove('is-invalid'); }
            if (!tipo) { form.editarProdutoTipo.classList.add('is-invalid'); valido = false; } else { form.editarProdutoTipo.classList.remove('is-invalid'); }
            if (estoque === '' || estoque < 0) { form.editarProdutoEstoque.classList.add('is-invalid'); valido = false; } else { form.editarProdutoEstoque.classList.remove('is-invalid'); }
            if (!fornecedorId) { form.editarProdutoFornecedor.classList.add('is-invalid'); valido = false; } else { form.editarProdutoFornecedor.classList.remove('is-invalid'); }
            if (!categoriaId) { form.editarProdutoCategoria.classList.add('is-invalid'); valido = false; } else { form.editarProdutoCategoria.classList.remove('is-invalid'); }
            if (!valido) return;
            function salvarEdicao(imagemBase64) {
                let prod = produtos.find(p => p.id == id);
                if (!prod) return;
                prod.nome = nome;
                prod.descricao = descricao;
                prod.valor = parseFloat(valor);
                prod.tipo = tipo;
                prod.estoque = parseInt(estoque);
                prod.fornecedorId = parseInt(fornecedorId);
                prod.categoriaId = parseInt(categoriaId);
                prod.promocao = promocao ? parseFloat(promocao) : null;
                prod.desconto = desconto ? parseFloat(desconto) : null;
                if (imagemBase64) prod.imagem = imagemBase64;
                salvarLocalStorage();
                atualizarTabelaProdutos();
                $('#modalEditarProduto').modal('hide');
                $('#modalMensagemBody').text('Produto/Serviço alterado com sucesso!');
                $('#modalMensagem').modal('show');
            }
            if (imagemInput && imagemInput.files && imagemInput.files[0]) {
                let file = imagemInput.files[0];
                let reader = new FileReader();
                reader.onload = function(e) {
                    salvarEdicao(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                salvarEdicao();
            }
        });
    }

    // Edição de Banner
    const btnEditarBanner = document.getElementById('btnEditarBanner');
    if (btnEditarBanner) {
        btnEditarBanner.addEventListener('click', function() {
            const banner = JSON.parse(localStorage.getItem('bannerPromo'));
            if (!banner) return;
            document.getElementById('editarBannerTitulo').value = banner.titulo || '';
            document.getElementById('editarBannerDescricao').value = banner.descricao || '';
            // Não preenche imagem (só se o usuário quiser trocar)
            $('#modalEditarBanner').modal('show');
        });
    }
    document.getElementById('formEditarBanner').addEventListener('submit', function(e) {
        e.preventDefault();
        let form = this;
        let titulo = form.editarBannerTitulo.value.trim();
        let descricao = form.editarBannerDescricao.value.trim();
        let imgInput = form.editarBannerImg;
        let valido = true;
        if (!titulo) { form.editarBannerTitulo.classList.add('is-invalid'); valido = false; } else { form.editarBannerTitulo.classList.remove('is-invalid'); }
        if (!descricao) { form.editarBannerDescricao.classList.add('is-invalid'); valido = false; } else { form.editarBannerDescricao.classList.remove('is-invalid'); }
        if (!valido) return;
        function salvarBannerEditado(imagemBase64) {
            let banner = JSON.parse(localStorage.getItem('bannerPromo')) || {};
            banner.titulo = titulo;
            banner.descricao = descricao;
            if (imagemBase64) banner.imagem = imagemBase64;
            localStorage.setItem('bannerPromo', JSON.stringify(banner));
            exibirBanner();
            exibirBannerAdmin();
            $('#modalEditarBanner').modal('hide');
            $('#modalMensagemBody').text('Banner alterado com sucesso!');
            $('#modalMensagem').modal('show');
        }
        if (imgInput && imgInput.files && imgInput.files[0]) {
            let file = imgInput.files[0];
            let reader = new FileReader();
            reader.onload = function(e) {
                salvarBannerEditado(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            salvarBannerEditado();
        }
    });
}

// Carregar fornecedores do localStorage ao iniciar
let fornecedoresLS = JSON.parse(localStorage.getItem('fornecedores'));
if (fornecedoresLS && Array.isArray(fornecedoresLS)) {
    fornecedores = fornecedoresLS;
} 