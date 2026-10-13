'use strict';

/* =====================================================
   Navalha & Brilho — script principal
   Dados 100% fictícios e editáveis. Sem backend:
   carrinho e agendamentos vivem no localStorage.
   ===================================================== */

const CHAVE_CARRINHO = 'nb_carrinho_v1';
const CHAVE_AGENDAMENTOS = 'nb_agendamentos_v1';

/* ---------- Dados de demonstração ---------- */

const SERVICOS = [
  { id: 'corte',      nome: 'Corte Masculino', emoji: '✂️', duracao: 40,  preco: 45,  desc: 'Corte clássico ou moderno com acabamento na navalha.' },
  { id: 'barba',      nome: 'Barba Completa',  emoji: '🪒', duracao: 30,  preco: 35,  desc: 'Modelagem, toalha quente e finalização com balm.' },
  { id: 'infantil',   nome: 'Corte Infantil',  emoji: '🧒', duracao: 30,  preco: 35,  desc: 'Corte para crianças em ambiente tranquilo e lúdico.' },
  { id: 'hidratacao', nome: 'Hidratação',      emoji: '💧', duracao: 45,  preco: 60,  desc: 'Tratamento capilar profundo para fios ressecados.' },
  { id: 'escova',     nome: 'Escova Modelada', emoji: '💨', duracao: 40,  preco: 40,  desc: 'Escova profissional com finalização conforme desejo.' },
  { id: 'coloracao',  nome: 'Coloração',       emoji: '🎨', duracao: 120, preco: 120, desc: 'Coloração completa com avaliação prévia de tom.' }
];

const PRODUTOS = [
  { id: 'pomada',       nome: 'Pomada Modeladora Mate', cat: 'cabelo',     preco: 38, emoji: '🧴', desc: 'Fixação forte com acabamento fosco natural.' },
  { id: 'shampoo',      nome: 'Shampoo Fortalecedor',   cat: 'cabelo',     preco: 32, emoji: '🧼', desc: 'Limpeza suave com extrato de alecrim.' },
  { id: 'condicionador', nome: 'Condicionador Hidratante', cat: 'cabelo',  preco: 30, emoji: '🫧', desc: 'Desembaraça e nutre os fios no dia a dia.' },
  { id: 'mascara',      nome: 'Máscara Capilar Reparadora', cat: 'cabelo', preco: 48, emoji: '🪣', desc: 'Reconstrução semanal para fios danificados.' },
  { id: 'cera',         nome: 'Cera de Fixação Extra',  cat: 'cabelo',     preco: 28, emoji: '🕯️', desc: 'Textura e fixação para penteados definidos.' },
  { id: 'oleo',         nome: 'Óleo para Barba',        cat: 'barba',      preco: 45, emoji: '🫙', desc: 'Amacia e dá brilho à barba com aroma amadeirado.' },
  { id: 'balm',         nome: 'Balm Pós-Barba',         cat: 'barba',      preco: 36, emoji: '🧴', desc: 'Acalma a pele após a barba ou o aparo.' },
  { id: 'escova',       nome: 'Escova de Madeira',      cat: 'acessorios', preco: 25, emoji: '🪮', desc: 'Escova de cerdas naturais para uso diário.' },
  { id: 'navalha',      nome: 'Navalha de Aparo',       cat: 'acessorios', preco: 55, emoji: '⚙️', desc: 'Aparador compacto para acabamento em casa.' }
];

const CATEGORIAS_ROTULO = { cabelo: 'Cabelo', barba: 'Barba', acessorios: 'Acessórios' };

/* ---------- Utilitários ---------- */

const $ = (seletor) => document.querySelector(seletor);
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function lerLS(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch (e) {
    console.warn('Falha ao ler dados locais:', e);
    return padrao;
  }
}

function gravarLS(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (e) {
    console.warn('Falha ao gravar dados locais:', e);
  }
}

function codigoAleatorio(prefixo) {
  return prefixo + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

let temporizadorToast = null;
function mostrarToast(mensagem) {
  const toast = $('#toast');
  toast.textContent = mensagem;
  toast.hidden = false;
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => { toast.hidden = true; }, 3000);
}

/* ---------- Service Worker ---------- */

function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js')
    .then((registro) => console.info('Service Worker registrado. Escopo:', registro.scope))
    .catch((erro) => console.warn('Service Worker não registrado (o site continua funcionando):', erro));
}

/* ---------- Navegação mobile ---------- */

function configurarMenu() {
  const btn = $('#btnMenu');
  const nav = $('#siteNav');
  btn.addEventListener('click', () => {
    const aberto = nav.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', String(aberto));
    btn.textContent = aberto ? '✕' : '☰';
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('aberto');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
    });
  });
}

/* ---------- Serviços ---------- */

function renderizarServicos() {
  const lista = $('#listaServicos');
  lista.innerHTML = SERVICOS.map((s) => `
    <article class="card">
      <span class="card-emoji" aria-hidden="true">${s.emoji}</span>
      <h3 class="card-nome">${s.nome}</h3>
      <p class="card-desc">${s.desc}</p>
      <div class="card-meta">
        <span>⏱️ ${s.duracao} min</span>
        <span class="card-preco">${brl.format(s.preco)}</span>
      </div>
      <button class="btn btn-primario btn-agendar-servico" data-servico="${s.id}">Agendar este serviço</button>
    </article>
  `).join('');

  lista.querySelectorAll('.btn-agendar-servico').forEach((btn) => {
    btn.addEventListener('click', () => {
      $('#selServico').value = btn.dataset.servico;
      $('#agendamento').scrollIntoView({ behavior: 'smooth' });
      $('#selServico').focus();
    });
  });
}

/* ---------- Produtos, busca e filtro ---------- */

function filtrarProdutos() {
  const termo = $('#buscaProduto').value.trim().toLowerCase();
  const categoria = $('#filtroCategoria').value;
  const filtrados = PRODUTOS.filter((p) => {
    const casaTermo = !termo || p.nome.toLowerCase().includes(termo) || p.desc.toLowerCase().includes(termo);
    const casaCategoria = categoria === 'todos' || p.cat === categoria;
    return casaTermo && casaCategoria;
  });

  const grade = $('#gradeProdutos');
  $('#vazioProdutos').hidden = filtrados.length > 0;

  grade.innerHTML = filtrados.map((p) => `
    <article class="card">
      <div class="card-imagem" aria-hidden="true">${p.emoji}</div>
      <span class="card-categoria">${CATEGORIAS_ROTULO[p.cat]}</span>
      <h3 class="card-nome">${p.nome}</h3>
      <p class="card-desc">${p.desc}</p>
      <div class="card-meta">
        <span class="card-preco">${brl.format(p.preco)}</span>
      </div>
      <button class="btn btn-primario btn-add" data-id="${p.id}">Adicionar ao carrinho</button>
    </article>
  `).join('');

  grade.querySelectorAll('.btn-add').forEach((btn) => {
    btn.addEventListener('click', () => adicionarAoCarrinho(btn.dataset.id));
  });
}

/* ---------- Carrinho ---------- */

let carrinho = lerLS(CHAVE_CARRINHO, {}); // formato: { idProduto: quantidade }

function salvarCarrinho() {
  gravarLS(CHAVE_CARRINHO, carrinho);
  renderizarCarrinho();
}

function adicionarAoCarrinho(id) {
  carrinho[id] = (carrinho[id] || 0) + 1;
  salvarCarrinho();
  const produto = PRODUTOS.find((p) => p.id === id);
  mostrarToast(`🛒 ${produto.nome} adicionado ao carrinho.`);
}

function alterarQuantidade(id, delta) {
  if (!carrinho[id]) return;
  carrinho[id] += delta;
  if (carrinho[id] <= 0) delete carrinho[id];
  salvarCarrinho();
}

function removerItem(id) {
  delete carrinho[id];
  salvarCarrinho();
}

function subtotalCarrinho() {
  return Object.entries(carrinho).reduce((total, [id, qtd]) => {
    const produto = PRODUTOS.find((p) => p.id === id);
    return produto ? total + produto.preco * qtd : total;
  }, 0);
}

function renderizarCarrinho() {
  const lista = $('#itensCarrinho');
  const ids = Object.keys(carrinho);
  const totalItens = ids.reduce((s, id) => s + carrinho[id], 0);

  $('#badgeCarrinho').textContent = totalItens;
  $('#vazioCarrinho').hidden = ids.length > 0;
  $('#btnFinalizar').disabled = ids.length === 0;
  $('#btnLimparCarrinho').disabled = ids.length === 0;

  lista.innerHTML = ids.map((id) => {
    const p = PRODUTOS.find((prod) => prod.id === id);
    if (!p) return '';
    return `
      <li>
        <span class="item-nome">${p.nome}</span>
        <span class="item-preco-unit">${brl.format(p.preco)} / un.</span>
        <div class="item-controles">
          <button class="btn-qtd btn-menos" data-id="${id}" aria-label="Diminuir quantidade de ${p.nome}">−</button>
          <span class="item-qtd" aria-label="Quantidade">${carrinho[id]}</span>
          <button class="btn-qtd btn-mais" data-id="${id}" aria-label="Aumentar quantidade de ${p.nome}">+</button>
        </div>
        <span class="item-subtotal">Subtotal: ${brl.format(p.preco * carrinho[id])}</span>
        <button class="btn-remover" data-id="${id}">Remover</button>
      </li>
    `;
  }).join('');

  $('#subtotal').textContent = brl.format(subtotalCarrinho());

  lista.querySelectorAll('.btn-mais').forEach((b) => b.addEventListener('click', () => alterarQuantidade(b.dataset.id, +1)));
  lista.querySelectorAll('.btn-menos').forEach((b) => b.addEventListener('click', () => alterarQuantidade(b.dataset.id, -1)));
  lista.querySelectorAll('.btn-remover').forEach((b) => b.addEventListener('click', () => removerItem(b.dataset.id)));
}

function abrirFecharCarrinho(abrir) {
  const painel = $('#painelCarrinho');
  painel.hidden = !abrir;
  if (abrir) $('#fecharCarrinho').focus();
}

/* ---------- Agendamentos ---------- */

let agendamentos = lerLS(CHAVE_AGENDAMENTOS, []);

function preencherSelectServicos() {
  const sel = $('#selServico');
  SERVICOS.forEach((s) => {
    const opcao = document.createElement('option');
    opcao.value = s.id;
    opcao.textContent = `${s.nome} — ${brl.format(s.preco)}`;
    sel.appendChild(opcao);
  });
}

function definirDataMinima() {
  const hoje = new Date();
  const iso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  $('#inpData').min = iso;
}

function dataISOValida(valor) {
  // Verifica se a data escolhida não é anterior a hoje (independente de fuso)
  const [ano, mes, dia] = valor.split('-').map(Number);
  const escolhida = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return escolhida >= hoje;
}

function processarAgendamento(evento) {
  evento.preventDefault();

  const servicoId = $('#selServico').value;
  const profissional = $('#selProfissional').value;
  const data = $('#inpData').value;
  const horario = $('#selHorario').value;
  const nome = $('#inpNome').value.trim();
  const telefone = $('#inpTelefone').value.trim();
  const obs = $('#inpObs').value.trim();

  const erros = [];
  if (!servicoId) erros.push('selecione um serviço');
  if (!profissional) erros.push('selecione um profissional');
  if (!data) erros.push('escolha uma data');
  else if (!dataISOValida(data)) erros.push('a data não pode estar no passado');
  if (!horario) erros.push('escolha um horário');
  if (!nome) erros.push('informe seu nome');

  const caixaErro = $('#erroAgendamento');
  if (erros.length > 0) {
    caixaErro.textContent = '⚠️ Corrija o formulário: ' + erros.join(', ') + '.';
    caixaErro.hidden = false;
    return;
  }
  caixaErro.hidden = true;

  const servico = SERVICOS.find((s) => s.id === servicoId);
  const registro = {
    codigo: codigoAleatorio('NB'),
    servico: servico.nome,
    preco: servico.preco,
    profissional,
    data,
    horario,
    nome,
    telefone,
    obs,
    criadoEm: new Date().toISOString()
  };

  agendamentos.push(registro);
  gravarLS(CHAVE_AGENDAMENTOS, agendamentos);

  $('#confirmacaoAgendamento').hidden = false;
  $('#detalheAgendamento').innerHTML = `
    <strong>${registro.nome}</strong>, seu horário de <strong>${registro.servico}</strong> com
    <strong>${registro.profissional}</strong> foi registrado para <strong>${registro.data}</strong> às
    <strong>${registro.horario}</strong>. Código: <strong>${registro.codigo}</strong>.
  `;
  $('#confirmacaoAgendamento').scrollIntoView({ behavior: 'smooth' });

  evento.target.reset();
  renderizarAgendamentos();
  mostrarToast('📅 Agendamento registrado localmente (demonstração).');
}

function renderizarAgendamentos() {
  const lista = $('#listaAgendamentos');
  $('#vazioAgendamentos').hidden = agendamentos.length > 0;

  lista.innerHTML = [...agendamentos].reverse().map((a, indiceReverso) => {
    const indice = agendamentos.length - 1 - indiceReverso;
    return `
      <li>
        <span class="agendamento-codigo">${a.codigo}</span>
        <strong>${a.servico}</strong> com ${a.profissional}
        <span>${a.data} às ${a.horario} — ${a.nome}</span>
        <button class="btn-cancelar" data-indice="${indice}">Cancelar agendamento</button>
      </li>
    `;
  }).join('');

  lista.querySelectorAll('.btn-cancelar').forEach((btn) => {
    btn.addEventListener('click', () => {
      agendamentos.splice(Number(btn.dataset.indice), 1);
      gravarLS(CHAVE_AGENDAMENTOS, agendamentos);
      renderizarAgendamentos();
      $('#confirmacaoAgendamento').hidden = true;
      mostrarToast('Agendamento cancelado.');
    });
  });
}

/* ---------- Finalização simulada ---------- */

function finalizarPedido() {
  if (Object.keys(carrinho).length === 0) return;
  $('#codigoPedido').textContent = codigoAleatorio('PED');
  $('#modalPedido').hidden = false;
  $('#fecharModal').focus();
  carrinho = {};
  salvarCarrinho();
}

/* ---------- Inicialização ---------- */

document.addEventListener('DOMContentLoaded', () => {
  // Ano no rodapé
  $('#anoAtual').textContent = String(new Date().getFullYear());

  registrarServiceWorker();
  configurarMenu();

  renderizarServicos();
  preencherSelectServicos();
  definirDataMinima();

  $('#buscaProduto').addEventListener('input', filtrarProdutos);
  $('#filtroCategoria').addEventListener('change', filtrarProdutos);
  filtrarProdutos();

  $('#btnCarrinho').addEventListener('click', () => abrirFecharCarrinho(true));
  $('#fecharCarrinho').addEventListener('click', () => abrirFecharCarrinho(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      abrirFecharCarrinho(false);
      $('#modalPedido').hidden = true;
    }
  });

  $('#btnLimparCarrinho').addEventListener('click', () => {
    carrinho = {};
    salvarCarrinho();
    mostrarToast('Carrinho esvaziado.');
  });
  $('#btnFinalizar').addEventListener('click', finalizarPedido);
  $('#fecharModal').addEventListener('click', () => { $('#modalPedido').hidden = true; });

  $('#formAgendamento').addEventListener('submit', processarAgendamento);
  renderizarAgendamentos();

  console.info('Navalha & Brilho: aplicação iniciada. Dados de demonstração no localStorage.');
});
