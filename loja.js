// Redireciona para home.html se não estiver logado
if (!localStorage.getItem('usuarioLogado')) {
    window.location.href = 'home.html';
}

// Proteção de acesso: só usuários logados
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
if (!usuarioLogado) {
    window.location.href = 'auth.html';
}
const isGerente = usuarioLogado.tipoUsuario === 'gerente';

// Carregar produtos do localStorage
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let fornecedores = [
    { id: 1, nome: 'Fornecedor A' },
    { id: 2, nome: 'Fornecedor B' },
    { id: 3, nome: 'Fornecedor C' }
];

// Carrinho de compras
let carrinho = JSON.parse(localStorage.getItem('carrinhoLoja')) || [];

// Carregar categorias do localStorage
let categorias = JSON.parse(localStorage.getItem('categorias')) || [];

function getFornecedorNome(id) {
    let f = fornecedores.find(f => f.id == id);
    return f ? f.nome : '';
}

function salvarCarrinho() {
    localStorage.setItem('carrinhoLoja', JSON.stringify(carrinho));
}

function atualizarBadgeCarrinho() {
    const badge = document.getElementById('carrinhoQtd');
    let total = carrinho.reduce((s, item) => s + item.qtd, 0);
    badge.textContent = total;
}

function adicionarAoCarrinho(produtoId) {
    produtoId = String(produtoId);
    let prod = produtos.find(p => String(p.id) === produtoId);
    if (!prod) return;
    let item = carrinho.find(i => String(i.id) === produtoId);
    if (item) {
        if (item.qtd < prod.estoque) item.qtd++;
    } else {
        carrinho.push({ id: produtoId, qtd: 1 });
    }
    salvarCarrinho();
    atualizarBadgeCarrinho();
}

function removerDoCarrinho(produtoId) {
    produtoId = String(produtoId);
    carrinho = carrinho.filter(i => String(i.id) !== produtoId);
    salvarCarrinho();
    atualizarBadgeCarrinho();
    renderizarCarrinho();
}

function alterarQtdCarrinho(produtoId, delta) {
    produtoId = String(produtoId);
    let item = carrinho.find(i => String(i.id) === produtoId);
    let prod = produtos.find(p => String(p.id) === produtoId);
    if (!item || !prod) return;
    item.qtd += delta;
    if (item.qtd < 1) item.qtd = 1;
    if (item.qtd > prod.estoque) item.qtd = prod.estoque;
    salvarCarrinho();
    atualizarBadgeCarrinho();
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const conteudo = document.getElementById('carrinhoConteudo');
    if (!carrinho.length) {
        conteudo.innerHTML = '<div class="text-center text-muted">Seu carrinho está vazio.</div>';
        return;
    }
    let total = 0;
    conteudo.innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead class="thead-dark">
                    <tr>
                        <th>Produto</th>
                        <th>Valor</th>
                        <th>Qtd</th>
                        <th>Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${carrinho.map(item => {
                        let p = produtos.find(p => String(p.id) === String(item.id));
                        if (!p) return '';
                        let emPromocao = p.promocao && p.promocao > 0 && p.promocao < p.valor;
                        let valorUnit = emPromocao ? parseFloat(p.promocao) : parseFloat(p.valor);
                        let subtotal = item.qtd * valorUnit;
                        total += subtotal;
                        return `<tr>
                            <td><img src="${p.imagem ? p.imagem : 'https://via.placeholder.com/60x40?text=Produto'}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;"> ${p.nome} ${emPromocao ? '<span class=\'badge badge-danger ml-2\'>Promoção</span>' : ''}</td>
                            <td>
                                ${emPromocao ? `<span style='color:#888;text-decoration:line-through;font-size:0.95rem;'>R$ ${parseFloat(p.valor).toFixed(2)}</span> <span style='color:#d7263d;font-weight:bold;'>R$ ${parseFloat(p.promocao).toFixed(2)}</span>` : `R$ ${parseFloat(p.valor).toFixed(2)}`}
                            </td>
                            <td>
                                <button class="btn btn-sm btn-light" onclick="alterarQtdCarrinho('${p.id}',-1)">-</button>
                                <span class="mx-2">${item.qtd}</span>
                                <button class="btn btn-sm btn-light" onclick="alterarQtdCarrinho('${p.id}',1)">+</button>
                            </td>
                            <td>R$ ${subtotal.toFixed(2)}</td>
                            <td><button class="btn btn-sm btn-danger" onclick="removerDoCarrinho('${p.id}')">Remover</button></td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="text-right font-weight-bold pr-2">Total: <span style="color:#b12704;font-size:1.3rem;">R$ ${total.toFixed(2)}</span></div>
    `;
}

function renderizarProdutos(lista) {
    const container = document.getElementById('produtosContainer');
    container.innerHTML = '';
    if (!lista || lista.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">Nenhum produto ou serviço encontrado.</div>';
        return;
    }
    lista.forEach(produto => {
        let card = document.createElement('div');
        card.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';
        let imagem = produto.imagem ? produto.imagem : 'https://via.placeholder.com/220x180?text=Produto';
        let emPromocao = produto.promocao && produto.promocao > 0 && produto.promocao < produto.valor;
        card.innerHTML = `
            <a href="produto.html?id=${produto.id}" class="text-decoration-none" style="color:inherit;">
                <div class="card product-card h-100">
                    <img src="${imagem}" class="card-img-top product-img" alt="Imagem Produto">
                    <div class="card-body d-flex flex-column">
                        <div class="product-title mb-1">${produto.nome} ${emPromocao ? '<span class=\'badge badge-danger ml-2\'>Promoção</span>' : ''}</div>
                        <div class="product-type mb-2">${produto.tipo}</div>
                        <div class="mb-2 text-muted" style="font-size:0.95rem;">${produto.descricao}</div>
                        <div class="product-price mb-2">
                            ${emPromocao ? `<span style='color:#888;text-decoration:line-through;font-size:1rem;'>R$ ${parseFloat(produto.valor).toFixed(2)}</span> <span style='color:#d7263d;font-weight:bold;font-size:1.2rem;'>R$ ${parseFloat(produto.promocao).toFixed(2)}</span>` : `R$ ${parseFloat(produto.valor).toFixed(2)}`}
                        </div>
                        <div class="mb-1"><span class="badge badge-info">${getFornecedorNome(produto.fornecedorId)}</span></div>
                        <div class="mt-auto"><small class="text-muted">Estoque: ${produto.estoque}</small></div>
                    </div>
                </div>
            </a>
            <button class="btn btn-warning btn-block mt-2" onclick="adicionarAoCarrinho(${produto.id})"><span class="fa fa-cart-plus mr-1"></span>Adicionar ao Carrinho</button>
        `;
        container.appendChild(card);
    });
}

function buscarProdutos(termo, categoriaId) {
    termo = termo.trim().toLowerCase();
    return produtos.filter(produto => {
        const fornecedorNome = getFornecedorNome(produto.fornecedorId).toLowerCase();
        const categoriaOk = !categoriaId || (produto.categoriaId && String(produto.categoriaId) === String(categoriaId));
        const termoOk =
            !termo ||
            produto.nome.toLowerCase().includes(termo) ||
            produto.descricao.toLowerCase().includes(termo) ||
            produto.tipo.toLowerCase().includes(termo) ||
            fornecedorNome.includes(termo);
        return categoriaOk && termoOk;
    });
}

// Banner Promocional na loja
function exibirBanner() {
    const banner = JSON.parse(localStorage.getItem('bannerPromo'));
    const area = document.getElementById('areaBanner');
    if (banner && banner.titulo && banner.descricao && banner.imagem) {
        document.getElementById('bannerTitulo').textContent = banner.titulo;
        document.getElementById('bannerDescricao').textContent = banner.descricao;
        document.getElementById('bannerImg').src = banner.imagem;
        area.style.display = '';
    } else {
        area.style.display = 'none';
    }
}

// Função utilitária para gerar linha digitável e código de barras fictícios
function gerarLinhaDigitavel(valor) {
    // Simplesmente gera uma linha digitável fake baseada no valor
    let base = '23793.38128 60000.000012 34567.890123 4 ';
    let val = String(Math.round(valor * 100)).padStart(11, '0');
    return base + val;
}
function gerarCodigoBarras(valor) {
    // Gera um código de barras fake (44 dígitos)
    let base = '23793381286000000012345678901234567890123456';
    let val = String(Math.round(valor * 100)).padStart(11, '0');
    return base.slice(0, 33) + val;
}
// Preencher boleto simulado
function preencherBoletoSimulado(total, usuario) {
    // Linha digitável e código de barras
    document.getElementById('boletoLinha').textContent = gerarLinhaDigitavel(total);
    // Substituir QR Code por código de barras tradicional (Code128)
    document.getElementById('boletoBarCode').src = 'https://barcodeapi.org/api/code128/' + gerarCodigoBarras(total);
    // Pagador
    document.getElementById('boletoPagador').textContent = usuario && usuario.nome ? usuario.nome : 'Cliente Bazaar+';
    // Datas
    let hoje = new Date();
    let venc = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 3);
    let vencStr = venc.toLocaleDateString('pt-BR');
    let dataDocStr = hoje.toLocaleDateString('pt-BR');
    document.getElementById('boletoVencimento').textContent = vencStr;
    document.getElementById('boletoDataDoc').textContent = dataDocStr;
    // Valor
    document.getElementById('boletoValor').textContent = 'R$ ' + total.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}
// Baixar boleto em PDF
function baixarBoletoPDF() {
    if (typeof window.jspdf === 'undefined') {
        alert('Para baixar o boleto em PDF, é necessário conexão com a internet.');
        return;
    }
    const doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const boleto = document.getElementById('boletoSimulado');
    doc.html(boleto, {
        callback: function (doc) {
            doc.save('boleto-bazaarplus.pdf');
        },
        margin: [20, 20, 20, 20],
        autoPaging: 'text',
        x: 0,
        y: 0,
        width: 600,
        windowWidth: 700
    });
}

function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function gerarPayloadPixComValor(valor) {
    valor = valor ? Number(valor).toFixed(2) : '';
    let campoValor = '';
    if (valor && parseFloat(valor) > 0) {
        campoValor = '5405' + valor;
    } else {
        campoValor = '';
    }
    let payloadSemCRC =
        '000201' +
        '26580014br.gov.bcb.pix' +
        '0131zangelaegu@outlook.com' +
        '52040000' +
        '5303986' +
        campoValor +
        '5802BR' +
        '5910BAZAARPLUS' +
        '6009SAOPAULO' +
        '6304';
    let crc = crc16(payloadSemCRC);
    return payloadSemCRC + crc;
}

function atualizarPixComValor(valor) {
    const payload = gerarPayloadPixComValor(valor);
    // Atualiza QR Code
    const qrImg = document.getElementById('qrPixImg');
    if (qrImg) qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(payload);
    // Atualiza payload
    const payloadBox = document.querySelector('#areaPix textarea');
    if (payloadBox) payloadBox.value = payload;
}

// Função para atualizar o mapa e tempo de entrega
function atualizarMapaEntrega() {
    const casa = document.getElementById('inputCasa').value.trim();
    const numero = document.getElementById('inputNumero').value.trim();
    const cep = document.getElementById('inputCep').value.trim();
    const cidade = document.getElementById('inputCidade').value.trim();
    const estado = document.getElementById('inputEstado').value.trim();
    const pais = document.getElementById('inputPais').value.trim();
    const enderecoCompleto = `${casa}, ${numero}, ${cep}, ${cidade}, ${estado}, ${pais}`;
    // Atualizar mapa (Google Maps embed)
    const mapa = document.getElementById('mapaEntrega');
    if (mapa) {
        mapa.innerHTML = `<iframe width='100%' height='240' style='border:0;border-radius:8px;' loading='lazy' allowfullscreen referrerpolicy='no-referrer-when-downgrade'
        src='https://www.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&output=embed'></iframe>`;
    }
    // Simular tempo de entrega (exemplo: 30-60 min)
    const tempo = document.getElementById('tempoEntrega');
    if (tempo) {
        tempo.textContent = 'Entrega estimada: 30-60 minutos após confirmação.';
    }
}

['inputCasa','inputNumero','inputCep','inputCidade','inputEstado','inputPais'].forEach(id => {
    document.addEventListener('input', function(e) {
        if (e.target && e.target.id === id) atualizarMapaEntrega();
    });
});

window.onload = function() {
    exibirBanner();
    atualizarBadgeCarrinho();
    renderizarProdutos(produtos);
    // Preencher categorias no select
    const selectCategoria = document.getElementById('selectCategoria');
    if (selectCategoria) {
        selectCategoria.innerHTML = '<option value="">Todas as categorias</option>';
        categorias.forEach(c => {
            selectCategoria.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
        });
    }
    document.getElementById('formBusca').addEventListener('submit', function(e) {
        e.preventDefault();
        const termo = document.getElementById('inputBusca').value;
        const categoriaId = document.getElementById('selectCategoria').value;
        renderizarProdutos(buscarProdutos(termo, categoriaId));
    });
    document.getElementById('inputBusca').addEventListener('input', function(e) {
        const termo = e.target.value;
        const categoriaId = document.getElementById('selectCategoria').value;
        renderizarProdutos(buscarProdutos(termo, categoriaId));
    });
    document.getElementById('selectCategoria').addEventListener('change', function(e) {
        const termo = document.getElementById('inputBusca').value;
        const categoriaId = e.target.value;
        renderizarProdutos(buscarProdutos(termo, categoriaId));
    });
    // Carrinho: abrir modal
    document.getElementById('btnCarrinho').addEventListener('click', function() {
        renderizarCarrinho();
        $('#modalCarrinho').modal('show');
    });
    // Finalizar compra -> abrir modal de pagamento
    document.getElementById('btnFinalizarCompra').addEventListener('click', function() {
        if (!carrinho.length) return;
        let total = 0;
        carrinho.forEach(item => {
            let p = produtos.find(p => String(p.id) === String(item.id));
            if (!p) return;
            let emPromocao = p.promocao && p.promocao > 0 && p.promocao < p.valor;
            let valorUnit = emPromocao ? parseFloat(p.promocao) : parseFloat(p.valor);
            let subtotal = item.qtd * valorUnit;
            total += subtotal;
        });
        atualizarPixComValor(total);
        // Resumo do pedido
        let resumo = `<div class='mb-2'><b>Resumo do Pedido:</b></div><ul class='list-group mb-2'>`;
        carrinho.forEach(item => {
            let p = produtos.find(p => String(p.id) === String(item.id));
            if (!p) return;
            let emPromocao = p.promocao && p.promocao > 0 && p.promocao < p.valor;
            let valorUnit = emPromocao ? parseFloat(p.promocao) : parseFloat(p.valor);
            let subtotal = item.qtd * valorUnit;
            resumo += `<li class='list-group-item d-flex justify-content-between align-items-center'>${p.nome} <span>${item.qtd} x R$ ${valorUnit.toFixed(2)}</span></li>`;
        });
        resumo += `</ul><div class='text-right font-weight-bold'>Total: <span style='color:#b12704;font-size:1.2rem;'>R$ ${total.toFixed(2)}</span></div>`;
        document.getElementById('resumoPagamento').innerHTML = resumo;
        // Resetar seleção
        document.getElementById('pagamentoPix').checked = true;
        document.getElementById('pagamentoCartao').checked = false;
        document.getElementById('pagamentoBoleto').checked = false;
        document.getElementById('areaPix').style.display = '';
        document.getElementById('areaCartao').style.display = 'none';
        document.getElementById('areaBoleto').style.display = 'none';
        // Preencher parcelas (default para cartão)
        preencherParcelas(total);
        // Esconde o campo de parcelas (só mostra ao selecionar cartão)
        document.getElementById('selectParcelas').parentElement.style.display = 'none';
        // Se Cartão estiver selecionado, mostrar área e parcelas
        setTimeout(function() {
            if(document.getElementById('pagamentoCartao').checked) {
                document.getElementById('areaPix').style.display = 'none';
                document.getElementById('areaCartao').style.display = '';
                document.getElementById('areaBoleto').style.display = 'none';
                document.getElementById('selectParcelas').parentElement.style.display = '';
            }
        }, 100);
        $('#modalCarrinho').modal('hide');
        $('#modalPagamento').modal('show');
        preencherEnderecoUsuario();
    });
    // Alternar áreas de pagamento
    document.querySelectorAll('input[name="pagamentoOpcao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Atualizar classes de destaque dos botões
            document.querySelectorAll('.btn-group-toggle label').forEach(lbl => lbl.classList.remove('active', 'btn-success', 'btn-primary', 'btn-warning'));
            if (this.id === 'pagamentoPix') {
                this.parentElement.classList.add('active', 'btn-success');
            } else if (this.id === 'pagamentoCartao') {
                this.parentElement.classList.add('active', 'btn-primary');
            } else if (this.id === 'pagamentoBoleto') {
                this.parentElement.classList.add('active', 'btn-warning');
            }
            document.getElementById('areaPix').style.display = this.id === 'pagamentoPix' ? '' : 'none';
            document.getElementById('areaCartao').style.display = this.id === 'pagamentoCartao' ? '' : 'none';
            document.getElementById('areaBoleto').style.display = this.id === 'pagamentoBoleto' ? '' : 'none';
            // Atualizar parcelas ao selecionar cartão
            if(this.id === 'pagamentoCartao') {
                let total = 0;
                carrinho.forEach(item => {
                    let p = produtos.find(p => String(p.id) === String(item.id));
                    if (!p) return;
                    let emPromocao = p.promocao && p.promocao > 0 && p.promocao < p.valor;
                    let valorUnit = emPromocao ? parseFloat(p.promocao) : parseFloat(p.valor);
                    let subtotal = item.qtd * valorUnit;
                    total += subtotal;
                });
                preencherParcelas(total);
                // Mostra o campo de parcelas
                setTimeout(function() {
                    document.getElementById('selectParcelas').parentElement.style.display = '';
                }, 50);
            } else {
                // Esconde o campo de parcelas
                document.getElementById('selectParcelas').parentElement.style.display = 'none';
            }
            // Se selecionar boleto, preencher boleto simulado
            if(this.id === 'pagamentoBoleto') {
                let total = 0;
                carrinho.forEach(item => {
                    let p = produtos.find(p => String(p.id) === String(item.id));
                    if (!p) return;
                    let emPromocao = p.promocao && p.promocao > 0 && p.promocao < p.valor;
                    let valorUnit = emPromocao ? parseFloat(p.promocao) : parseFloat(p.valor);
                    let subtotal = item.qtd * valorUnit;
                    total += subtotal;
                });
                preencherBoletoSimulado(total, usuarioLogado);
            }
            if(this.id === 'pagamentoPix') {
                let total = 0;
                carrinho.forEach(item => {
                    let p = produtos.find(p => String(p.id) === String(item.id));
                    if (!p) return;
                    let emPromocao = p.promocao && p.promocao > 0 && p.promocao < p.valor;
                    let valorUnit = emPromocao ? parseFloat(p.promocao) : parseFloat(p.valor);
                    let subtotal = item.qtd * valorUnit;
                    total += subtotal;
                });
                atualizarPixComValor(total);
            }
        });
    });
    // Confirmar pagamento
    document.getElementById('btnConfirmarPagamento').addEventListener('click', function() {
        let opcao = document.querySelector('input[name="pagamentoOpcao"]:checked').id;
        let msg = '';
        // Validação dos campos de endereço
        let casa = document.getElementById('inputCasa').value.trim();
        let numero = document.getElementById('inputNumero').value.trim();
        let cep = document.getElementById('inputCep').value.trim();
        let cidade = document.getElementById('inputCidade').value.trim();
        let estado = document.getElementById('inputEstado').value.trim();
        let pais = document.getElementById('inputPais').value.trim();
        let valido = true;
        let primeiroInvalido = null;
        if (!casa) { document.getElementById('inputCasa').classList.add('is-invalid'); valido = false; if (!primeiroInvalido) primeiroInvalido = 'inputCasa'; } else { document.getElementById('inputCasa').classList.remove('is-invalid'); }
        if (!numero) { document.getElementById('inputNumero').classList.add('is-invalid'); valido = false; if (!primeiroInvalido) primeiroInvalido = 'inputNumero'; } else { document.getElementById('inputNumero').classList.remove('is-invalid'); }
        if (!cep || !/^\d{5}-?\d{3}$/.test(cep)) { document.getElementById('inputCep').classList.add('is-invalid'); valido = false; if (!primeiroInvalido) primeiroInvalido = 'inputCep'; } else { document.getElementById('inputCep').classList.remove('is-invalid'); }
        if (!cidade) { document.getElementById('inputCidade').classList.add('is-invalid'); valido = false; if (!primeiroInvalido) primeiroInvalido = 'inputCidade'; } else { document.getElementById('inputCidade').classList.remove('is-invalid'); }
        if (!estado) { document.getElementById('inputEstado').classList.add('is-invalid'); valido = false; if (!primeiroInvalido) primeiroInvalido = 'inputEstado'; } else { document.getElementById('inputEstado').classList.remove('is-invalid'); }
        if (!pais) { document.getElementById('inputPais').classList.add('is-invalid'); valido = false; if (!primeiroInvalido) primeiroInvalido = 'inputPais'; } else { document.getElementById('inputPais').classList.remove('is-invalid'); }
        // Validação dos campos do cartão (se selecionado)
        if (opcao === 'pagamentoCartao') {
            // Limpar erros anteriores
            [
                ['numeroCartao', 'erroNumeroCartao'],
                ['nomeCartao', 'erroNomeCartao'],
                ['validadeCartao', 'erroValidadeCartao'],
                ['cvvCartao', 'erroCvvCartao']
            ].forEach(([input, erro]) => {
                document.getElementById(input).classList.remove('is-invalid');
                document.getElementById(erro).style.display = 'none';
                document.getElementById(erro).textContent = '';
            });
            const numero = document.getElementById('numeroCartao').value.replace(/\D/g, '');
            const nome = document.getElementById('nomeCartao').value.trim();
            const validade = document.getElementById('validadeCartao').value.trim();
            const cvv = document.getElementById('cvvCartao').value.trim();
            if (numero.length !== 16) {
                document.getElementById('numeroCartao').classList.add('is-invalid');
                document.getElementById('erroNumeroCartao').textContent = 'Número do cartão deve ter 16 dígitos.';
                document.getElementById('erroNumeroCartao').style.display = 'block';
                valido = false; if (!primeiroInvalido) primeiroInvalido = 'numeroCartao';
            }
            if (!nome) {
                document.getElementById('nomeCartao').classList.add('is-invalid');
                document.getElementById('erroNomeCartao').textContent = 'Informe o nome impresso no cartão.';
                document.getElementById('erroNomeCartao').style.display = 'block';
                valido = false; if (!primeiroInvalido) primeiroInvalido = 'nomeCartao';
            }
            if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(validade)) {
                document.getElementById('validadeCartao').classList.add('is-invalid');
                document.getElementById('erroValidadeCartao').textContent = 'Validade deve estar no formato MM/AA.';
                document.getElementById('erroValidadeCartao').style.display = 'block';
                valido = false; if (!primeiroInvalido) primeiroInvalido = 'validadeCartao';
            } else {
                // Checar se validade não está expirada
                const [mes, ano] = validade.split('/');
                const agora = new Date();
                const anoAtual = agora.getFullYear() % 100;
                const mesAtual = agora.getMonth() + 1;
                if (parseInt(ano) < anoAtual || (parseInt(ano) === anoAtual && parseInt(mes) < mesAtual)) {
                    document.getElementById('validadeCartao').classList.add('is-invalid');
                    document.getElementById('erroValidadeCartao').textContent = 'Cartão expirado.';
                    document.getElementById('erroValidadeCartao').style.display = 'block';
                    valido = false; if (!primeiroInvalido) primeiroInvalido = 'validadeCartao';
                }
            }
            if (!/^\d{3,4}$/.test(cvv)) {
                document.getElementById('cvvCartao').classList.add('is-invalid');
                document.getElementById('erroCvvCartao').textContent = 'CVV deve ter 3 ou 4 dígitos.';
                document.getElementById('erroCvvCartao').style.display = 'block';
                valido = false; if (!primeiroInvalido) primeiroInvalido = 'cvvCartao';
            }
        }
        if (!valido) {
            if (primeiroInvalido) document.getElementById(primeiroInvalido).focus();
            return;
        }
        // Validação do endereço de entrega
        let enderecoEntrega = {
            casa, numero, cep, cidade, estado, pais
        };
        if (!enderecoEntrega.casa || !enderecoEntrega.numero || !enderecoEntrega.cep || !enderecoEntrega.cidade || !enderecoEntrega.estado || !enderecoEntrega.pais) {
            document.getElementById('inputLocalizacaoEntrega').classList.add('is-invalid');
            document.getElementById('inputLocalizacaoEntrega').focus();
            return;
        } else {
            document.getElementById('inputLocalizacaoEntrega').classList.remove('is-invalid');
        }
        if (opcao === 'pagamentoPix') msg = 'Pagamento via Pix confirmado! Obrigado pela compra.';
        else if (opcao === 'pagamentoCartao') {
            // Limpar erros anteriores
            [
                ['numeroCartao', 'erroNumeroCartao'],
                ['nomeCartao', 'erroNomeCartao'],
                ['validadeCartao', 'erroValidadeCartao'],
                ['cvvCartao', 'erroCvvCartao']
            ].forEach(([input, erro]) => {
                document.getElementById(input).classList.remove('is-invalid');
                document.getElementById(erro).style.display = 'none';
                document.getElementById(erro).textContent = '';
            });
            // Validação dos campos do cartão
            const numero = document.getElementById('numeroCartao').value.replace(/\D/g, '');
            const nome = document.getElementById('nomeCartao').value.trim();
            const validade = document.getElementById('validadeCartao').value.trim();
            const cvv = document.getElementById('cvvCartao').value.trim();
            let erro = false;
            if (numero.length !== 16) {
                document.getElementById('numeroCartao').classList.add('is-invalid');
                document.getElementById('erroNumeroCartao').textContent = 'Número do cartão deve ter 16 dígitos.';
                document.getElementById('erroNumeroCartao').style.display = 'block';
                erro = true;
            }
            if (!nome) {
                document.getElementById('nomeCartao').classList.add('is-invalid');
                document.getElementById('erroNomeCartao').textContent = 'Informe o nome impresso no cartão.';
                document.getElementById('erroNomeCartao').style.display = 'block';
                erro = true;
            }
            if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(validade)) {
                document.getElementById('validadeCartao').classList.add('is-invalid');
                document.getElementById('erroValidadeCartao').textContent = 'Validade deve estar no formato MM/AA.';
                document.getElementById('erroValidadeCartao').style.display = 'block';
                erro = true;
            } else {
                // Checar se validade não está expirada
                const [mes, ano] = validade.split('/');
                const agora = new Date();
                const anoAtual = agora.getFullYear() % 100;
                const mesAtual = agora.getMonth() + 1;
                if (parseInt(ano) < anoAtual || (parseInt(ano) === anoAtual && parseInt(mes) < mesAtual)) {
                    document.getElementById('validadeCartao').classList.add('is-invalid');
                    document.getElementById('erroValidadeCartao').textContent = 'Cartão expirado.';
                    document.getElementById('erroValidadeCartao').style.display = 'block';
                    erro = true;
                }
            }
            if (!/^\d{3,4}$/.test(cvv)) {
                document.getElementById('cvvCartao').classList.add('is-invalid');
                document.getElementById('erroCvvCartao').textContent = 'CVV deve ter 3 ou 4 dígitos.';
                document.getElementById('erroCvvCartao').style.display = 'block';
                erro = true;
            }
            if (erro) return;
        }
        else if (opcao === 'pagamentoBoleto') {
            // Exibir boleto simulado preenchido
            let total = 0;
            carrinho.forEach(item => {
                let p = produtos.find(p => String(p.id) === String(item.id));
                if (!p) return;
                let emPromocao = p.promocao && p.promocao > 0 && p.promocao < p.valor;
                let valorUnit = emPromocao ? parseFloat(p.promocao) : parseFloat(p.valor);
                let subtotal = item.qtd * valorUnit;
                total += subtotal;
            });
            preencherBoletoSimulado(total, usuarioLogado);
            // Não fecha o modal, apenas mostra o boleto
            return;
        }
        // REGISTRO DA VENDA E ATUALIZAÇÃO DE ESTOQUE
        let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
        let produtosLS = JSON.parse(localStorage.getItem('produtos')) || [];
        let dataVenda = new Date().toLocaleString('pt-BR');
        let itensVenda = [];
        let totalVenda = 0;
        carrinho.forEach(item => {
            let p = produtosLS.find(prod => String(prod.id) === String(item.id));
            if (!p) return;
            let emPromocao = p.promocao && p.promocao > 0 && p.promocao < p.valor;
            let valorUnit = emPromocao ? parseFloat(p.promocao) : parseFloat(p.valor);
            let subtotal = item.qtd * valorUnit;
            totalVenda += subtotal;
            itensVenda.push({
                produtoId: p.id,
                nome: p.nome,
                qtd: item.qtd,
                valorUnit,
                subtotal
            });
            // Atualizar estoque
            p.estoque = Math.max(0, (parseInt(p.estoque) - item.qtd));
        });
        vendas.push({
            id: Date.now(),
            cliente: usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : 'Cliente',
            itens: itensVenda,
            total: totalVenda,
            data: dataVenda,
            enderecoEntrega: enderecoEntrega
        });
        localStorage.setItem('vendas', JSON.stringify(vendas));
        localStorage.setItem('produtos', JSON.stringify(produtosLS));
        carrinho = [];
        salvarCarrinho();
        atualizarBadgeCarrinho();
        renderizarCarrinho();
        $('#modalPagamento').modal('hide');
        setTimeout(() => alert(msg), 400);
    });
    // Exibir nome do usuário logado
    if(usuarioLogado && usuarioLogado.nome) {
        document.getElementById('nomeUsuarioLogado').textContent = usuarioLogado.nome;
    }
    // Logout
    document.getElementById('btnLogout').onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'auth.html';
    };
    // Baixar boleto PDF
    document.getElementById('btnBaixarBoleto').onclick = baixarBoletoPDF;
    // Abrir modal de edição de perfil ao clicar no menu
    $(document).on('click', '#btnEditarPerfil', function(e) {
        e.preventDefault();
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuario) return;
        $('#perfilNome').val(usuario.nome || '');
        $('#perfilTelefone').val(usuario.telefone || '');
        $('#perfilCep').val(usuario.cep || '');
        $('#perfilCasa').val(usuario.casa || '');
        $('#perfilNumero').val(usuario.numero || '');
        $('#perfilCidade').val(usuario.cidade || '');
        $('#perfilEstado').val(usuario.estado || '');
        $('#perfilPais').val(usuario.pais || '');
        $('#modalEditarPerfil').modal('show');
    });
    // Salvar alterações do perfil
    $(document).on('submit', '#formEditarPerfil', function(e) {
        e.preventDefault();
        let usuario = JSON.parse(localStorage.getItem('usuarioLogado')) || {};
        usuario.nome = $('#perfilNome').val().trim();
        usuario.telefone = $('#perfilTelefone').val().trim();
        usuario.cep = $('#perfilCep').val().trim();
        usuario.casa = $('#perfilCasa').val().trim();
        usuario.numero = $('#perfilNumero').val().trim();
        usuario.cidade = $('#perfilCidade').val().trim();
        usuario.estado = $('#perfilEstado').val().trim();
        usuario.pais = $('#perfilPais').val().trim();
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        $('#modalEditarPerfil').modal('hide');
        if(document.getElementById('nomeUsuarioLogado')) document.getElementById('nomeUsuarioLogado').textContent = usuario.nome;
        alert('Informações atualizadas com sucesso!');
    });
};

window.adicionarAoCarrinho = adicionarAoCarrinho;
window.removerDoCarrinho = removerDoCarrinho;
window.alterarQtdCarrinho = alterarQtdCarrinho;

// Função para preencher o select de parcelas
function preencherParcelas(total) {
    const select = document.getElementById('selectParcelas');
    if (!select) return;
    let maxParcelas = total < 1000 ? 6 : 12;
    select.innerHTML = '';
    for(let i=1; i<=maxParcelas; i++) {
        let valorParcela = total / i;
        select.innerHTML += `<option value="${i}">${i}x de R$ ${valorParcela.toFixed(2)} sem juros</option>`;
    }
}

// Preencher automaticamente endereço e telefone do usuário logado na finalização da compra
function preencherEnderecoUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) return;
    if (usuario.casa) document.getElementById('inputCasa').value = usuario.casa;
    if (usuario.numero) document.getElementById('inputNumero').value = usuario.numero;
    if (usuario.cep) document.getElementById('inputCep').value = usuario.cep;
    if (usuario.cidade) document.getElementById('inputCidade').value = usuario.cidade;
    if (usuario.estado) document.getElementById('inputEstado').value = usuario.estado;
    if (usuario.pais) document.getElementById('inputPais').value = usuario.pais;
    atualizarMapaEntrega();
} 