// Utilidades para pegar parâmetros da URL
function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let fornecedores = [
    { id: 1, nome: 'Fornecedor A' },
    { id: 2, nome: 'Fornecedor B' },
    { id: 3, nome: 'Fornecedor C' }
];

function getFornecedorNome(id) {
    let f = fornecedores.find(f => f.id == id);
    return f ? f.nome : '';
}

function renderizarBreadcrumb(produto) {
    const breadcrumb = document.getElementById('breadcrumbProduto');
    breadcrumb.innerHTML = `
        <li class="breadcrumb-item"><a href="loja.html">Início</a></li>
        <li class="breadcrumb-item">${produto.tipo || 'Produto'}</li>
        <li class="breadcrumb-item active" aria-current="page">${produto.nome}</li>
        <li class="ml-auto produto-codigo">Código: ${produto.id}</li>
    `;
}

function renderizarDetalhe() {
    const id = getParam('id');
    const produto = produtos.find(p => p.id == id);
    const container = document.getElementById('produtoDetalhe');
    if (!produto) {
        container.innerHTML = '<div class="text-danger">Produto não encontrado.</div>';
        return;
    }
    renderizarBreadcrumb(produto);
    // Suporte a múltiplas imagens no futuro (hoje só 1)
    let imagens = [produto.imagem ? produto.imagem : 'https://via.placeholder.com/340x260?text=Produto'];
    let emPromocao = produto.promocao && produto.promocao > 0 && produto.promocao < produto.valor;
    let precoAntigo = (produto.valor && produto.valor > 0) ? (parseFloat(produto.valor)).toFixed(2) : '';
    let precoPromocional = emPromocao ? parseFloat(produto.promocao).toFixed(2) : '';
    let desconto = (emPromocao && produto.desconto && produto.desconto > 0) ? parseFloat(produto.desconto).toFixed(0) : null;
    container.innerHTML = `
        <div class="row align-items-start">
            <div class="col-12 col-md-4 mb-4 mb-md-0 d-flex flex-column align-items-center">
                <img src="${imagens[0]}" class="produto-img-main" id="imgPrincipal" alt="Imagem Produto">
                <div class="produto-img-thumbs mt-2">
                    ${imagens.map((img, i) => `<img src="${img}" class="produto-img-thumb${i===0?' selected':''}" data-idx="${i}" alt="Miniatura">`).join('')}
                </div>
            </div>
            <div class="col-12 col-md-8 text-md-left text-center">
                <div class="produto-titulo mb-2">${produto.nome} ${emPromocao ? '<span class=\'badge badge-danger ml-2\'>Promoção</span>' : ''}</div>
                <div class="produto-info-extra mb-2">
                    <span class="produto-fornecedor">${getFornecedorNome(produto.fornecedorId)}</span>
                    <span class="produto-tipo ml-2">${produto.tipo}</span>
                </div>
                <div class="produto-preco-antigo mb-1">${emPromocao ? 'R$ ' + precoAntigo : ''}</div>
                <div class="produto-preco d-inline-block" style="color:${emPromocao ? '#d7263d' : '#ff6600'};font-size:2.2rem;font-weight:bold;">
                    ${emPromocao ? 'R$ ' + precoPromocional : 'R$ ' + precoAntigo}
                    ${desconto ? `<span class=\'badge-desconto ml-2\'>-${desconto}%</span>` : ''}
                </div>
                <div class="produto-estoque mt-2">${produto.estoque > 0 ? 'Em estoque' : 'Indisponível'}</div>
                <div class="produto-descricao">${produto.descricao}</div>
                <button class="btn btn-comprar mt-4" id="btnComprar" ${produto.estoque > 0 ? '' : 'disabled'}>Adicionar ao Carrinho</button>
                <div id="msgCarrinho" class="mt-3" style="display:none;"></div>
            </div>
        </div>
    `;
    // Miniaturas (futuro: mais de uma imagem)
    document.querySelectorAll('.produto-img-thumb').forEach(thumb => {
        thumb.addEventListener('click', function() {
            document.getElementById('imgPrincipal').src = this.src;
            document.querySelectorAll('.produto-img-thumb').forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    // Botão comprar agora adiciona ao carrinho
    document.getElementById('btnComprar').onclick = function() {
        // Adicionar ao carrinho (igual loja.js)
        let carrinho = JSON.parse(localStorage.getItem('carrinhoLoja')) || [];
        let produtoId = String(produto.id);
        let item = carrinho.find(i => String(i.id) === produtoId);
        if (item) {
            if (item.qtd < produto.estoque) item.qtd++;
        } else {
            carrinho.push({ id: produtoId, qtd: 1 });
        }
        localStorage.setItem('carrinhoLoja', JSON.stringify(carrinho));
        // Feedback visual
        let msg = document.getElementById('msgCarrinho');
        msg.innerHTML = '<span class="text-success font-weight-bold">Produto adicionado ao carrinho!</span>';
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 1800);
    };
}

window.onload = renderizarDetalhe; 