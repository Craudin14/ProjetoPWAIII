'use strict';

/* =====================================================
   Navalha & Brilho — script principal (v2, COMPLETO)
   Dados 100% fictícios e editáveis. Sem backend:
   carrinho, cupom, agendamentos e pedidos vivem no localStorage.
   ===================================================== */

const CHAVE_CARRINHO     = 'nb_carrinho_v1';
const CHAVE_AGENDAMENTOS = 'nb_agendamentos_v1';
const CHAVE_PEDIDOS      = 'nb_pedidos_v1';
const CHAVE_TEMA         = 'nb_tema_v1';
const CHAVE_CUPOM        = 'nb_cupom_v1';

/* ---------- Dados de demonstração (edite livremente) ---------- */

const SERVICOS = [
  { id: 'corte',      nome: 'Corte Masculino', emoji: '✂️', duracao: 40,  preco: 45,  desc: 'Corte clássico ou moderno com acabamento na navalha.', detalhe: 'Inclui consulta de visagismo, lavagem, corte com tesoura e máquina, acabamento na navalha e finalização com pomada.' },
  { id: 'barba',      nome: 'Barba Completa',  emoji: '🪒', duracao: 30,  preco: 35,  desc: 'Modelagem, toalha quente e finalização com balm.', detalhe: 'Aparo e modelagem da barba, toalha quente, contornos na navalha e balm calmante.' },
  { id: 'infantil',   nome: 'Corte Infantil',  emoji: '🧒', duracao: 30,  preco: 35,  desc: 'Corte para crianças em ambiente tranquilo e lúdico.', detalhe: 'Atendimento paciente para crianças até 10 anos, com cadeira especial e brinquedos no salão.' },
  { id: 'hidratacao', nome: 'Hidratação',      emoji: '💧', duracao: 45,  preco: 60,  desc: 'Tratamento capilar profundo para fios ressecados.', detalhe: 'Limpeza prévia, máscara profissional, ampolas nutritivas e secagem assistida.' },
  { id: 'escova',     nome: 'Escova Modelada', emoji: '💨', duracao: 40,  preco: 40,  desc: 'Escova profissional com finalização conforme desejo.', detalhe: 'Lavagem, escova com modelagem a quente ou fria e proteção térmica.' },
  { id: 'coloracao',  nome: 'Coloração',       emoji: '🎨', duracao: 120, preco: 120, desc: 'Coloração completa com avaliação prévia de tom.', detalhe: 'Teste de mecha, avaliação de tom, coloração profissional, matização e finalização.' }
];

const PROFISSIONAIS = [
  { nome: 'Ricardo Alves', cargo: 'Barbeiro sênior', emoji: '✂️',  especialidade: 'Degradês e acabamento na navalha' },
  { nome: 'Marina Costa',  cargo: 'Cabeleireira',    emoji: '💇‍♀️', especialidade: 'Cortes femininos e tratamentos' },
  { nome: 'Bruno Dias',    cargo: 'Barbeiro',        emoji: '🧔',  especialidade: 'Barboterapia e design de barba' },
  { nome: 'Camila Souza',  cargo: 'Colorista',       emoji: '🎨',  especialidade: 'Mechas, loiros e coloração' }
];

const PRODUTOS = [
  { id: 'pomada',        nome: 'Pomada Modeladora Mate',     cat: 'cabelo',     preco: 38, emoji: '🧴', desc: 'Fixação forte com acabamento fosco natural.' },
  { id: 'shampoo',       nome: 'Shampoo Fortalecedor',       cat: 'cabelo',     preco: 32, emoji: '🧼', desc: 'Limpeza suave com extrato de alecrim.' },
  { id: 'condicionador', nome: 'Condicionador Hidratante',   cat: 'cabelo',     preco: 30, emoji: '🫧', desc: 'Desembaraça e nutre os fios no dia a dia.' },
  { id: 'mascara',       nome: 'Máscara Capilar Reparadora', cat: 'cabelo',     preco: 48, emoji: '🪣', desc: 'Reconstrução semanal para fios danificados.' },
  { id: 'cera',          nome: 'Cera de Fixação Extra',      cat: 'cabelo',     preco: 28, emoji: '🕯️', desc: 'Textura e fixação para penteados definidos.' },
  { id: 'tonico',        nome: 'Tônico Antiqueda',           cat: 'cabelo',     preco: 52, emoji: '💧', desc: 'Fórmula estimulante para aplicação diária.' },
  { id: 'oleo',          nome: 'Óleo para Barba',            cat: 'barba',      preco: 45, emoji: '🫙', desc: 'Amacia e dá brilho à barba com aroma amadeirado.' },
  { id: 'balm',          nome: 'Balm Pós-Barba',             cat: 'barba',      preco: 36, emoji: '🧴', desc: 'Acalma a pele após a barba ou o aparo.' },
  { id: 'escova',        nome: 'Escova de Madeira',          cat: 'acessorios', preco: 25, emoji: '🪮', desc: 'Escova de cerdas naturais para uso diário.' },
  { id: 'navalha',       nome: 'Navalha de Aparo',           cat: 'acessorios', preco: 55, emoji: '⚙️', desc: 'Aparador compacto para acabamento em casa.' }
];

const CATEGORIAS_ROTULO = { cabelo: 'Cabelo', barba: 'Barba', acessorios: 'Acessórios' };

const DEPOIMENTOS = [
  { texto: 'Melhor degradê da cidade, sem exagero. O atendimento do Ricardo é impecável e o ambiente é muito agradável.', autor: 'Lucas M.' },
  { texto: 'Fiz coloração com a Camila e amei o resultado. Agendei pelo site em menos de um minuto, super prático.', autor: 'Fernanda R.' },
  { texto: 'Compro os produtos no site desde a primeira visita. A pomada é a mesma que usam no salão, vale cada centavo.', autor: 'Pedro H.' }
];

const CUPONS = { BEMVINDO10: 10, NAVALHA5: 5 }; // código → percentual de desconto
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

function marcarInvalido(seletor, invalido) {
  $(seletor).classList.toggle('campo-invalido', invalido);
}

/* ---------- Service Worker (registro tolerante a falhas) ---------- */

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
  if (lerLS(CHAVE_TEMA, 'claro') === 'escuro') document.body.classList.add('tema-escuro');
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
      $('#agendamento').scrollIntoView({ behavior: 'smooth' });
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

let carrinho = lerLS(CHAVE_CARRINHO, {});        // { idProduto: quantidade }
let cupomAtivo = lerLS(CHAVE_CUPOM, null);        // 'BEMVINDO10' ou null
let pedidos = lerLS(CHAVE_PEDIDOS, []);           // histórico simulado
let agendamentos = lerLS(CHAVE_AGENDAMENTOS, []); // agendamentos locais

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
    const p = PRODUTOS.find((x) => x.id === id);
    return p ? total + p.preco * qtd : total;
  }, 0);
}

function dadosCupom() {
  if (!cupomAtivo) return null;
  const percentual = CUPONS[cupomAtivo];
  if (!percentual) return null;
  return { codigo: cupomAtivo, percentual, valor: subtotalCarrinho() * (percentual / 100) };
}

function renderizarCarrinho() {
  const lista = $('#itensCarrinho');
  const ids = Object.keys(carrinho);
  const totalItens = ids.reduce((s, id) => s + carrinho[id], 0);
  const subtotal = subtotalCarrinho();
  const cupom = dadosCupom();
  const desconto = cupom ? cupom.valor : 0;

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

  lista.querySelectorAll('.btn-mais').forEach((b) => b.addEventListener('click', () => alterarQuantidade(b.dataset.id, +1)));
  lista.querySelectorAll('.btn-menos').forEach((b) => b.addEventListener('click', () => alterarQuantidade(b.dataset.id, -1)));
  lista.querySelectorAll('.btn-remover').forEach((b) => b.addEventListener('click', () => removerItem(b.dataset.id)));

  $('#subtotal').textContent = brl.format(subtotal);
  $('#btnCupom').textContent = cupomAtivo ? 'Remover' : 'Aplicar';
  if (cupom) {
    $('#linhaCupom').textContent = `🎟️ Cupom ${cupom.codigo} aplicado: −${cupom.percentual}% (−${brl.format(cupom.valor)})`;
    $('#linhaCupom').hidden = false;
  } else {
    $('#linhaCupom').hidden = true;
  }
  $('#linhaDesconto').hidden = desconto === 0;
  $('#valorDesconto').textContent = '− ' + brl.format(desconto);
  $('#valorTotal').textContent = brl.format(subtotal - desconto);
}

function abrirFecharCarrinho(abrir) {
  const painel = $('#painelCarrinho');
  painel.hidden = !abrir;
  if (abrir) $('#fecharCarrinho').focus();
}

function aplicarCupom() {
  // Se já há cupom ativo, o botão remove
  if (cupomAtivo) {
    cupomAtivo = null;
    gravarLS(CHAVE_CUPOM, null);
    renderizarCarrinho();
    mostrarToast('Cupom removido.');
    return;
  }
  const codigo = $('#inpCupom').value.trim().toUpperCase();
  if (CUPONS[codigo]) {
    cupomAtivo = codigo;
    gravarLS(CHAVE_CUPOM, codigo);
    renderizarCarrinho();
    mostrarToast(`🎟️ Cupom ${codigo} aplicado: -${CUPONS[codigo]}%.`);
  } else {
    mostrarToast('Cupom inválido. Tente BEMVINDO10 ou NAVALHA5.');
  }
}

function finalizarPedido() {
  const ids = Object.keys(carrinho);
  if (ids.length === 0) return;

  const subtotal = subtotalCarrinho();
  const cupom = dadosCupom();
  const desconto = cupom ? cupom.valor : 0;

  const pedido = {
    codigo: codigoAleatorio('PED'),
    itens: ids.map((id) => {
      const p = PRODUTOS.find((x) => x.id === id);
      return { nome: p.nome, qtd: carrinho[id], subtotal: p.preco * carrinho[id] };
    }),
    subtotal,
    desconto,
    total: subtotal - desconto,
    cupom: cupom ? cupom.codigo : null,
    criadoEm: new Date().toISOString()
  };

  pedidos.push(pedido);
  gravarLS(CHAVE_PEDIDOS, pedidos);

  carrinho = {};
  cupomAtivo = null;
  gravarLS(CHAVE_CUPOM, null);
  $('#inpCupom').value = '';
  salvarCarrinho();
  renderizarPedidos();

  $('#codigoPedido').textContent = pedido.codigo;
  $('#resumoPedido').innerHTML = `Itens: ${pedido.itens.map((i) => `${i.qtd}× ${i.nome}`).join(', ')}. Total: <strong>${brl.format(pedido.total)}</strong>.`;
  $('#modalPedido').hidden = false;
  $('#fecharModal').focus();
}

/* ---------- Agendamentos ---------- */

function preencherSelectServicos() {
  const sel = $('#selServico');
  SERVICOS.forEach((s) => {
    sel.appendChild(new Option(`${s.nome} — ${brl.format(s.preco)}`, s.id));
  });
}

function preencherSelectProfissionais() {
  const sel = $('#selProfissional');
  PROFISSIONAIS.forEach((p) => {
    sel.appendChild(new Option(`${p.nome} — ${p.cargo}`, p.nome));
  });
}

function definirDataMinima() {
  const hoje = new Date();
  const iso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  $('#inpData').min = iso;
}

function dataISOValida(valor) {
  const [ano, mes, dia] = valor.split('-').map(Number);
  const escolhida = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return escolhida >= hoje;
}

function atualizarHorarios() {
  const selHorario = $('#selHorario');
  const data = $('#inpData').value;
  const profissional = $('#selProfissional').value;
  selHorario.innerHTML = '';

  if (!data) {
    selHorario.appendChild(new Option('Selecione uma data primeiro', ''));
    selHorario.value = '';
    atualizarResumo();
    return;
  }

  const ocupados = agendamentos
    .filter((a) => a.data === data && a.profissional === profissional)
    .map((a) => a.horario);

  selHorario.appendChild(new Option('Selecione um horário', ''));
  HORARIOS_BASE.forEach((h) => {
    const op = new Option(ocupados.includes(h) ? `${h} — ocupado` : h, h);
    if (ocupados.includes(h)) op.disabled = true;
    selHorario.appendChild(op);
  });
  atualizarResumo();
}

function atualizarResumo() {
  const resumo = $('#resumoAgendamento');
  const servico = SERVICOS.find((s) => s.id === $('#selServico').value);
  const profissional = $('#selProfissional').value;
  const data = $('#inpData').value;
  const horario = $('#selHorario').value;

  if (servico && profissional && data && horario) {
    resumo.textContent = `Resumo: ${servico.nome} (${servico.duracao} min, ${brl.format(servico.preco)}) com ${profissional}, em ${data} às ${horario}.`;
    resumo.hidden = false;
  } else {
    resumo.hidden = true;
  }
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

  // Limpa destaques de erro e revalida campo a campo
  ['#selServico', '#selProfissional', '#inpData', '#selHorario', '#inpNome'].forEach((s) => marcarInvalido(s, false));

  const erros = [];
  if (!servicoId) { erros.push('selecione um serviço'); marcarInvalido('#selServico', true); }
  if (!profissional) { erros.push('selecione um profissional'); marcarInvalido('#selProfissional', true); }
  if (!data) { erros.push('escolha uma data'); marcarInvalido('#inpData', true); }
  else if (!dataISOValida(data)) { erros.push('a data não pode estar no passado'); marcarInvalido('#inpData', true); }
  if (!horario) { erros.push('escolha um horário'); marcarInvalido('#selHorario', true); }
  if (!nome) { erros.push('informe seu nome'); marcarInvalido('#inpNome', true); }

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
  atualizarHorarios(); // reflete o horário recém-ocupado
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
      atualizarHorarios();
      mostrarToast('Agendamento cancelado.');
    });
  });
}

/* ---------- Pedidos simulados ---------- */

function renderizarPedidos() {
  const lista = $('#listaPedidos');
  $('#vazioPedidos').hidden = pedidos.length > 0;

  lista.innerHTML = [...pedidos].reverse().map((p) => `
    <li>
      <span class="agendamento-codigo">${p.codigo}</span>
      <strong>${brl.format(p.total)}</strong> — ${p.itens.reduce((s, i) => s + i.qtd, 0)} item(ns)
      <span>${p.itens.map((i) => `${i.qtd}× ${i.nome}`).join(', ')}</span>
      ${p.cupom ? `<span>Cupom aplicado: ${p.cupom}</span>` : ''}
      <span>${new Date(p.criadoEm).toLocaleString('pt-BR')}</span>
    </li>
  `).join('');
}

/* ---------- Abas locais ---------- */

function alternarAba(agendamentosAtiva) {
  $('#tabAgendamentos').classList.toggle('ativa', agendamentosAtiva);
  $('#tabAgendamentos').setAttribute('aria-selected', String(agendamentosAtiva));
  $('#tabPedidos').classList.toggle('ativa', !agendamentosAtiva);
  $('#tabPedidos').setAttribute('aria-selected', String(!agendamentosAtiva));
  $('#painelAgendamentos').hidden = !agendamentosAtiva;
  $('#painelPedidos').hidden = agendamentosAtiva;
}

function configurarAbas() {
  $('#tabAgendamentos').addEventListener('click', () => alternarAba(true));
  $('#tabPedidos').addEventListener('click', () => alternarAba(false));
}

/* ---------- Modais (fechar clicando fora) ---------- */

function configurarModais() {
  ['#modalPedido', '#modalServico'].forEach((sel) => {
    $(sel).addEventListener('click', (e) => {
      if (e.target === $(sel)) $(sel).hidden = true;
    });
  });
}

/* ---------- Inicialização ---------- */

document.addEventListener('DOMContentLoaded', () => {
  $('#anoAtual').textContent = String(new Date().getFullYear());

  registrarServiceWorker();
  configurarMenu();
  configurarTema();
  configurarConexao();
  configurarInstalacao();
  configurarCarrossel();
  configurarAbas();
  configurarModais();

  renderizarServicos();
  renderizarEquipe();
  preencherSelectServicos();
  preencherSelectProfissionais();
  definirDataMinima();
  atualizarHorarios();

  $('#buscaProduto').addEventListener('input', filtrarProdutos);
  $('#filtroCategoria').addEventListener('change', filtrarProdutos);
  $('#ordenarProdutos').addEventListener('change', filtrarProdutos);
  filtrarProdutos();

  $('#btnCarrinho').addEventListener('click', () => abrirFecharCarrinho(true));
  $('#fecharCarrinho').addEventListener('click', () => abrirFecharCarrinho(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      abrirFecharCarrinho(false);
      $('#modalPedido').hidden = true;
      $('#modalServico').hidden = true;
    }
  });

  $('#btnLimparCarrinho').addEventListener('click', () => {
    carrinho = {};
    salvarCarrinho();
    mostrarToast('Carrinho esvaziado.');
  });
  $('#btnFinalizar').addEventListener('click', finalizarPedido);
  $('#btnCupom').addEventListener('click', aplicarCupom);
  $('#fecharModal').addEventListener('click', () => { $('#modalPedido').hidden = true; });
  $('#fecharModalServico').addEventListener('click', () => { $('#modalServico').hidden = true; });

  $('#formAgendamento').addEventListener('submit', processarAgendamento);
  ['selServico', 'selProfissional', 'inpData', 'selHorario'].forEach((id) => {
    $('#' + id).addEventListener('change', () => {
      marcarInvalido('#' + id, false);
      if (id === 'inpData' || id === 'selProfissional') atualizarHorarios();
      else atualizarResumo();
    });
  });
  ['#inpNome', '#inpTelefone', '#inpObs'].forEach((id) => {
    $(id).addEventListener('input', () => marcarInvalido(id, false));
  });

  renderizarAgendamentos();
  renderizarPedidos();
  renderizarCarrinho();

  console.info('Navalha & Brilho: aplicação iniciada. Dados de demonstração no localStorage.');
});
