'use strict';

/* =====================================================
   Navalha & Brilho — script principal (v2)
   Dados 100% fictícios e editáveis. Sem backend:
   carrinho, cupom, agendamentos e pedidos vivem no localStorage.
   ===================================================== */

const CHAVE_CARRINHO     = 'nb_carrinho_v1';
const CHAVE_AGENDAMENTOS = 'nb_agendamentos_v1';
const CHAVE_PEDIDOS      = 'nb_pedidos_v1';
const CHAVE_TEMA         = 'nb_tema_v1';
const CHAVE_CUPOM        = 'nb_cupom_v1';

/* ---------- Dados de demonstração ---------- */

const SERVICOS = [
  { id: 'corte',      nome: 'Corte Masculino', emoji: '✂️', duracao: 40,  preco: 45,  desc: 'Corte clássico ou moderno com acabamento na navalha.', detalhe: 'Inclui consulta de visagismo, lavagem, corte com tesoura e máquina, acabamento na navalha na nuca e contornos, e finalização com pomada.' },
  { id: 'barba',      nome: 'Barba Completa',  emoji: '🪒', duracao: 30,  preco: 35,  desc: 'Modelagem, toalha quente e finalização com balm.', detalhe: 'Aparo e modelagem da barba, toalha quente para abrir os poros, navalha para contornos e finalização com balm calmante.' },
  { id: 'infantil',   nome: 'Corte Infantil',  emoji: '🧒', duracao: 30,  preco: 35,  desc: 'Corte para crianças em ambiente tranquilo e lúdico.', detalhe: 'Atendimento paciente para crianças até 10 anos, com cadeira especial e brinquedos no salão.' },
  { id: 'hidratacao', nome: 'Hidratação',      emoji: '💧', duracao: 45,  preco: 60,  desc: 'Tratamento capilar profundo para fios ressecados.', detalhe: 'Limpeza prévia, aplicação de máscara profissional, ampolas nutritivas e secagem assistida.' },
  { id: 'escova',     nome: 'Escova Modelada', emoji: '💨', duracao: 40,  preco: 40,  desc: 'Escova profissional com finalização conforme desejo.', detalhe: 'Lavagem, escova com modelagem a quente ou fria e finalização com produtos de proteção térmica.' },
  { id: 'coloracao',  nome: 'Coloração',       emoji: '🎨', duracao: 120, preco: 120, desc: 'Coloração completa com avaliação prévia de tom.', detalhe: 'Teste de mecha, avaliação de tom, aplicação de coloração profissional, matização e finalização.' }
];

const PROFISSIONAIS = [
  { nome: 'Ricardo Alves', cargo: 'Barbeiro sênior',  emoji: '✂️', especialidade: 'Degradês e acabamento na navalha' },
  { nome: 'Marina Costa',  cargo: 'Cabeleireira',    emoji: '💇‍♀️', especialidade: 'Cortes femininos e tratamentos' },
  { nome: 'Bruno Dias',    cargo: 'Barbeiro',        emoji: '🧔', especialidade: 'Barboterapia e design de barba' },
  { nome: 'Camila Souza',  cargo: 'Colorista',       emoji: '🎨', especialidade: 'Mechas, loiros e coloração' }
];

const PRODUTOS = [
  { id: 'pomada',        nome: 'Pomada Modeladora Mate',      cat: 'cabelo',     preco: 38, emoji: '🧴', desc: 'Fixação forte com acabamento fosco natural.' },
  { id: 'shampoo',       nome: 'Shampoo Fortalecedor',        cat: 'cabelo',     preco: 32, emoji: '🧼', desc: 'Limpeza suave com extrato de alecrim.' },
  { id: 'condicionador', nome: 'Condicionador Hidratante',    cat: 'cabelo',     preco: 30, emoji: '🫧', desc: 'Desembaraça e nutre os fios no dia a dia.' },
  { id: 'mascara',       nome: 'Máscara Capilar Reparadora',  cat: 'cabelo',     preco: 48, emoji: '🪣', desc: 'Reconstrução semanal para fios danificados.' },
  { id: 'cera',          nome: 'Cera de Fixação Extra',       cat: 'cabelo',     preco: 28, emoji: '🕯️', desc: 'Textura e fixação para penteados definidos.' },
  { id: 'tonico',        nome: 'Tônico Antiqueda',            cat: 'cabelo',     preco: 52, emoji: '💧', desc: 'Fórmula estimulante para aplicação diária.' },
  { id: 'oleo',          nome: 'Óleo para Barba',             cat: 'barba',      preco: 45, emoji: '🫙', desc: 'Amacia e dá brilho à barba com aroma amadeirado.' },
  { id: 'balm',          nome: 'Balm Pós-Barba',              cat: 'barba',      preco: 36, emoji: '🧴', desc: 'Acalma a pele após a barba ou o aparo.' },
  { id: 'escova',        nome: 'Escova de Madeira',           cat: 'acessorios', preco: 25, emoji: '🪮', desc: 'Escova de cerdas naturais para uso diário.' },
  { id: 'navalha',       nome: 'Navalha de Aparo',            cat: 'acessorios', preco: 55, emoji: '⚙️', desc: 'Aparador compacto para acabamento em casa.' }
];

const CATEGORIAS_ROTULO = { cabelo: 'Cabelo', barba: 'Barba', acessorios: 'Acessórios' };

const DEPOIMENTOS = [
  { texto: 'Melhor degradê da cidade, sem exagero. O atendimento do Ricardo é impecável e o ambiente é muito agradável.', autor: 'Lucas M.' },
  { texto: 'Fiz coloração com a Camila e amei o resultado. Agendei pelo site em menos de um minuto, super prático.', autor: 'Fernanda R.' },
  { texto: 'Compro os produtos no site desde a primeira visita. A pomada é a mesma que usam no salão, vale cada centavo.', autor: 'Pedro H.' }
];

const CUPONS = { BEMVINDO10: 10, NAVALHA5: 5 };
const HORARIOS_BASE = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

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

/* ---------- Cabeçalho: menu, tema, conexão, instalação ---------- */

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

function configurarTema() {
  const salvo = lerLS(CHAVE_TEMA, 'claro');
  if (salvo === 'escuro') document.body.classList.add('tema-escuro');
  atualizarIconeTema();

  $('#btnTema').addEventListener('click', () => {
    const escuro = document.body.classList.toggle('tema-escuro');
    gravarLS(CHAVE_TEMA, escuro ? 'escuro' : 'claro');
    atualizarIconeTema();
  });
}

function atualizarIconeTema() {
  $('#btnTema').textContent = document.body.classList.contains('tema-escuro') ? '☀️' : '🌙';
}

function configurarConexao() {
  const banner = $('#bannerConexao');
  const atualizar = () => { banner.hidden = navigator.onLine; };
  window.addEventListener('online', atualizar);
  window.addEventListener('offline', atualizar);
  atualizar();
}

function configurarInstalacao() {
  let eventoInstalacao = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoInstalacao = e;
    $('#btnInstalar').hidden = false;
  });
  $('#btnInstalar').addEventListener('click', async () => {
    if (!eventoInstalacao) return;
    eventoInstalacao.prompt();
    await eventoInstalacao.userChoice;
    eventoInstalacao = null;
    $('#btnInstalar').hidden = true;
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
      <button class="btn btn-secundario btn-detalhe" data-servico="${s.id}">Ver detalhes</button>
      <button class="btn btn-primario btn-agendar-servico" data-servico="${s.id}">Agendar este serviço</button>
    </article>
  `).join('');

  lista.querySelectorAll('.btn-agendar-servico').forEach((btn) => {
    btn.addEventListener('click', () => {
      $('#selServico').value = btn.dataset.servico;
      atualizarResumo();
      atualizarHorarios();
      $('#agendamento').scrollIntoView({ behavior: 'smooth' });
      $('#selServico').focus();
    });
  });

  lista.querySelectorAll('.btn-detalhe').forEach((btn) => {
    btn.addEventListener('click', () => abrirModalServico(btn.dataset.servico));
  });
}

function abrirModalServico(id) {
  const s = SERVICOS.find((x) => x.id === id);
  if (!s) return;
  $('#tituloModalServico').textContent = `${s.emoji} ${s.nome}`;
  $('#corpoModalServico').innerHTML = `
    <p>${s.detalhe}</p>
    <p><strong>Duração:</strong> ${s.duracao} minutos</p>
    <p><strong>Preço:</strong> ${brl.format(s.preco)}</p>
  `;
  $('#modalServico').hidden = false;
  $('#fecharModalServico').focus();
}

/* ---------- Equipe ---------- */

function renderizarEquipe() {
  $('#listaEquipe').innerHTML = PROFISSIONAIS.map((p) => `
    <article class="card card-equipe">
      <span class="card-emoji" aria-hidden="true">${p.emoji}</span>
      <h3 class="card-nome">${p.nome}</h3>
      <p class="card-especialidade">${p.cargo}</p>
      <p class="card-desc">${p.especialidade}</p>
    </article>
  `).join('');
}

/* ---------- Depoimentos (carrossel) ---------- */

let depoIndice = 0;

function renderizarDepoimento() {
  const d = DEPOIMENTOS[depoIndice];
  $('#depoContainer').innerHTML = `
    <p class="depo-texto">“${d.texto}”</p>
    <p class="depo-autor">— ${d.autor}</p>
  `;
  $('#depoIndicador').textContent = `${depoIndice + 1} de ${DEPOIMENTOS.length}`;
}

function configurarCarrossel() {
  renderizarDepoimento();
  $('#depoAnterior').addEventListener('click', () => {
    depoIndice = (depoIndice - 1 + DEPOIMENTOS.length) % DEPOIMENTOS.length;
    renderizarDepoimento();
  });
  $('#depoProximo').addEventListener('click', () => {
    depoIndice = (depoIndice + 1) % DEPOIMENTOS.length;
    renderizarDepoimento();
  });
}

/* ---------- Produtos: busca, filtro e ordenação ---------- */

function filtrarProdutos() {
  const termo = $('#buscaProduto').value.trim().toLowerCase();
  const categoria = $('#filtroCategoria').value;
  const ordem = $('#ordenarProdutos').value;

  let filtrados = PRODUTOS.filter((p) => {
    const casaTermo = !termo || p.nome.toLowerCase().includes(termo) || p.desc.toLowerCase().includes(termo);
    const casaCategoria = categoria === 'todos' || p.cat === categoria;
    return casaTermo && casaCategoria;
  });

  if (ordem === 'nome') filtrados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  if (ordem === 'preco-asc') filtrados.sort((a, b) => a.preco - b.preco);
  if (ordem === 'preco-desc') filtrados.sort((a, b) => b.preco - a.preco);

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
let cupomAtivo = lerLS(CHAVE_CUPOM, null);

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
  return Object.entries(carr
