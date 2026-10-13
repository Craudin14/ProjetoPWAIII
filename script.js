'use strict';

/* =====================================================
   Navalha & Brilho — script principal (v6, COMPLETO)
   Blindagem: toda ligação de evento verifica se o elemento
   existe; produtos renderizam primeiro na inicialização.
   ===================================================== */

const CHAVE_CARRINHO     = 'nb_carrinho_v1';
const CHAVE_AGENDAMENTOS = 'nb_agendamentos_v1';
const CHAVE_PEDIDOS      = 'nb_pedidos_v1';
const CHAVE_TEMA         = 'nb_tema_v1';
const CHAVE_CUPOM        = 'nb_cupom_v1';

const SERVICOS = [
  { id: 'corte',      nome: 'Corte Masculino', emoji: '✂️', duracao: 40,  preco: 45,  desc: 'Corte clássico ou moderno com acabamento na navalha.', detalhe: 'Consulta de visagismo, lavagem, corte com tesoura e máquina, acabamento na navalha e finalização com pomada.' },
  { id: 'barba',      nome: 'Barba Completa',  emoji: '🪒', duracao: 30,  preco: 35,  desc: 'Modelagem, toalha quente e finalização com balm.', detalhe: 'Aparo e modelagem, toalha quente, contornos na navalha e balm calmante.' },
  { id: 'infantil',   nome: 'Corte Infantil',  emoji: '🧒', duracao: 30,  preco: 35,  desc: 'Corte para crianças em ambiente tranquilo e lúdico.', detalhe: 'Atendimento paciente para crianças até 10 anos, com cadeira especial e brinquedos.' },
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
  { texto: 'Melhor degradê da cidade. Atendimento impecável e ambiente agradável.', autor: 'Lucas M.' },
  { texto: 'Fiz coloração e amei o resultado. Agendei pelo site em menos de um minuto.', autor: 'Fernanda R.' },
  { texto: 'Compro os produtos desde a primeira visita. A pomada é a mesma do salão.', autor: 'Pedro H.' }
];

const CUPONS = { BEMVINDO10: 10, NAVALHA5: 5 };
const HORARIOS_BASE = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

/* ---------- Utilitários e blindagem ---------- */

const $  = (sel) => document.querySelector(sel);
const el = (id)  => document.getElementById(id);
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Anexa evento somente se o elemento existir — evita quebrar a inicialização
function bind(id, evento, fn) {
  const e = el(id);
  if (e) e.addEventListener(evento, fn);
  else console.warn('Elemento ausente no HTML (ignorado): #' + id);
}

function bindAll(sel, evento, fn) {
  document.querySelectorAll(sel).forEach((e) => e.addEventListener(evento, fn));
}

function lerLS(chave, padrao) {
  try { const b = localStorage.getItem(chave); return b ? JSON.parse(b) : padrao; }
  catch (e) { return padrao; }
}

function gravarLS(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* ignora */ }
}

function codigoAleatorio(p) { return p + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }

function abrirOverlay(id)   { const e = el(id); if (e) e.style.display = 'flex'; }
function fecharOverlay(id)  { const e = el(id); if (e) e.style.display = 'none'; }
function mostrar(id, sim)   { const e = el(id); if (e) e.style.display = sim ? 'block' : 'none'; }

let temporizadorToast = null;
function mostrarToast(msg) {
  const t = el('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function marcarInvalido(id, invalido) {
  const e = el(id);
  if (e) e.classList.toggle('campo-invalido', invalido);
}

/* ---------- Service Worker ---------- */

function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js')
    .then((r) => console.info('SW registrado. Escopo:', r.scope))
    .catch((e) => console.warn('SW não registrado (site funciona mesmo assim):', e));
}

/* ---------- Cabeçalho ---------- */

function configurarMenu() {
  const btn = el('btnMenu'), nav = el('siteNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const aberto = nav.classList.toggle('aberto');
    btn.setAttribute('aria-expanded', String(aberto));
    btn.textContent = aberto ? '✕' : '☰';
  });
  bindAll('#siteNav a', 'click', () => {
    nav.classList.remove('aberto');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '☰';
  });
}

function atualizarIconeTema() {
  const b = el('btnTema');
  if (b) b.textContent = document.body.classList.contains('tema-escuro') ? '☀️' : '🌙';
}

function configurarTema() {
  if (lerLS(CHAVE_TEMA, 'claro') === 'escuro') document.body.classList.add('tema-escuro');
  atualizarIconeTema();
  bind('btnTema', 'click', () => {
    const escuro = document.body.classList.toggle('tema-escuro');
    gravarLS(CHAVE_TEMA, escuro ? 'escuro' : 'claro');
    atualizarIconeTema();
  });
}

function configurarConexao() {
  const atualizar = () => mostrar('bannerConexao', !navigator.onLine);
  window.addEventListener('online', atualizar);
  window.addEventListener('offline', atualizar);
  atualizar();
}

function configurarInstalacao() {
  let ev = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    ev = e;
    const b = el('btnInstalar');
    if (b) b.style.display = 'inline-block';
  });
  bind('btnInstalar', 'click', async () => {
    if (!ev) return;
    ev.prompt();
    await ev.userChoice;
    ev = null;
    const b = el('btnInstalar');
    if (b) b.style.display = 'none';
  });
}

/* ---------- Serviços ---------- */

function renderizarServicos() {
  const lista = el('listaServicos');
  if (!lista) return;
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

  bindAll('.btn-agendar-servico', 'click', (e) => {
    const sel = el('selServico');
    if (sel) sel.value = e.currentTarget.dataset.servico;
    atualizarResumo();
    const sec = el('agendamento');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  });
  bindAll('.btn-detalhe', 'click', (e) => abrirModalServico(e.currentTarget.dataset.servico));
}

function abrirModalServico(id) {
  const s = SERVICOS.find((x) => x.id === id);
  if (!s) return;
  const t = el('tituloModalServico'), c = el('corpoModalServico');
  if (t) t.textContent = `${s.emoji} ${s.nome}`;
  if (c) c.innerHTML = `<p>${s.detalhe}</p><p><strong>Duração:</strong> ${s.duracao} min</p><p><strong>Preço:</strong> ${brl.format(s.preco)}</p>`;
  abrirOverlay('modalServico');
  const f = el('fecharModalServico');
  if (f) f.focus();
}

/* ---------- Equipe e depoimentos ---------- */

function renderizarEquipe() {
  const l = el('listaEquipe');
  if (!l) return;
  l.innerHTML = PROFISSIONAIS.map((p) => `
    <article class="card card-equipe">
      <span class="card-emoji" aria-hidden="true">${p.emoji}</span>
      <h3 class="card-nome">${p.nome}</h3>
      <p class="card-especialidade">${p.cargo}</p>
      <p class="card-desc">${p.especialidade}</p>
    </article>
  `).join('');
}

let depoIndice = 0;
function renderizarDepoimento() {
  const c = el('depoContainer');
  if (!c) return;
  const d = DEPOIMENTOS[depoIndice];
  c.innerHTML = `<p class="depo-texto">“${d.texto}”</p><p class="depo-autor">— ${d.autor}</p>`;
  const i = el('depoIndicador');
  if (i) i.textContent = `${depoIndice + 1} de ${DEPOIMENTOS.length}`;
}

function configurarCarrossel() {
  renderizarDepoimento();
  bind('depoAnterior', 'click', () => { depoIndice = (depoIndice - 1 + DEPOIMENTOS.length) % DEPOIMENTOS.length; renderizarDepoimento(); });
  bind('depoProximo', 'click', () => { depoIndice = (depoIndice + 1) % DEPOIMENTOS.length; renderizarDepoimento(); });
}

/* ---------- Produtos ---------- */

function filtrarProdutos() {
  const inpBusca = el('buscaProduto'), inpCat = el('filtroCategoria'), inpOrdem = el('ordenarProdutos');
  const grade = el('gradeProdutos');
  if (!grade) return;

  const termo = inpBusca ? inpBusca.value.trim().toLowerCase() : '';
  const categoria = inpCat ? inpCat.value : 'todos';
  const ordem = inpOrdem ? inpOrdem.value : 'relevancia';

  let filtrados = PRODUTOS.filter((p) => {
    const casaTermo = !termo || p.nome.toLowerCase().includes(termo) || p.desc.toLowerCase().includes(termo);
    const casaCategoria = categoria === 'todos' || p.cat === categoria;
    return casaTermo && casaCategoria;
  });

  if (ordem === 'nome') filtrados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  if (ordem === 'preco-asc') filtrados.sort((a, b) => a.preco - b.preco);
  if (ordem === 'preco-desc') filtrados.sort((a, b) => b.preco - a.preco);

  mostrar('vazioProdutos', filtrados.length === 0);

  grade.innerHTML = filtrados.map((p) => `
    <article class="card">
      <div class="card-imagem" aria-hidden="true">${p.emoji}</div>
      <span class="card-categoria">${CATEGORIAS_ROTULO[p.cat]}</span>
      <h3 class="card-nome">${p.nome}</h3>
      <p class="card-desc">${p.desc}</p>
      <div class="card-meta"><span class="card-preco">${brl.format(p.preco)}</span></div>
      <button class="btn btn-primario btn-add" data-id="${p.id}">Adicionar ao carrinho</button>
    </article>
  `).join('');

  bindAll('.btn-add', 'click', (e) => adicionarAoCarrinho(e.currentTarget.dataset.id));
}

/* ---------- Carrinho ---------- */

let carrinho = lerLS(CHAVE_CARRINHO, {});
let cupomAtivo = lerLS(CHAVE_CUPOM, null);
let pedidos = lerLS(CHAVE_PEDIDOS, []);
let agendamentos = lerLS(CHAVE_AGENDAMENTOS, []);

function salvarCarrinho() { gravarLS(CHAVE_CARRINHO, carrinho); renderizarCarrinho(); }

function adicionarAoCarrinho(id) {
  carrinho[id] = (carrinho[id] || 0) + 1;
  salvarCarrinho();
  const p = PRODUTOS.find((x) => x.id === id);
  mostrarToast(`🛒 ${p.nome} adicionado ao carrinho.`);
}

function alterarQuantidade(id, delta) {
  if (!carrinho[id]) return;
  carrinho[id] += delta;
  if (carrinho[id] <= 0) delete carrinho[id];
  salvarCarrinho();
}

function removerItem(id) { delete carrinho[id]; salvarCarrinho(); }

function subtotalCarrinho() {
  return Object.entries(carrinho).reduce((t, [id, q]) => {
    const p = PRODUTOS.find((x) => x.id === id);
    return p ? t + p.preco * q : t;
  }, 0);
}

function dadosCupom() {
  if (!cupomAtivo || !CUPONS[cupomAtivo]) return null;
  return { codigo: cupomAtivo, percentual: CUPONS[cupomAtivo], valor: subtotalCarrinho() * (CUPONS[cupomAtivo] / 100) };
}

function renderizarCarrinho() {
  const lista = el('itensCarrinho');
  if (!lista) return;
  const ids = Object.keys(carrinho);
  const subtotal = subtotalCarrinho();
  const cupom = dadosCupom();
  const desconto = cupom ? cupom.valor : 0;

  const badge = el('badgeCarrinho');
  if (badge) badge.textContent = ids.reduce((s, id) => s + carrinho[id], 0);
  mostrar('vazioCarrinho', ids.length === 0);
  const bf = el('btnFinalizar'); if (bf) bf.disabled = ids.length === 0;
  const bl = el('btnLimparCarrinho'); if (bl) bl.disabled = ids.length === 0;

  lista.innerHTML = ids.map((id) => {
    const p = PRODUTOS.find((x) => x.id === id);
    if (!p) return '';
    return `
      <li>
        <span class="item-nome">${p.nome}</span>
        <span class="item-preco-unit">${brl.format(p.preco)} / un.</span>
        <div class="item-controles">
          <button class="btn-qtd btn-menos" data-id="${id}">−</button>
          <span class="item-qtd">${carrinho[id]}</span>
          <button class="btn-qtd btn-mais" data-id="${id}">+</button>
        </div>
        <span class="item-subtotal">Subtotal: ${brl.format(p.preco * carrinho[id])}</span>
        <button class="btn-remover" data-id="${id}">Remover</button>
      </li>
    `;
  }).join('');

  bindAll('.btn-mais', 'click', (e) => alterarQuantidade(e.currentTarget.dataset.id, +1));
  bindAll('.btn-menos', 'click', (e) => alterarQuantidade(e.currentTarget.dataset.id, -1));
  bindAll('.btn-remover', 'click', (e) => removerItem(e.currentTarget.dataset.id));

  const sub = el('subtotal'); if (sub) sub.textContent = brl.format(subtotal);
  const bCupom = el('btnCupom'); if (bCupom) bCupom.textContent = cupomAtivo ? 'Remover' : 'Aplicar';
  if (cupom) {
    const lc = el('linhaCupom');
    if (lc) lc.textContent = `🎟️ Cupom ${cupom.codigo}: −${cupom.percentual}% (−${brl.format(cupom.valor)})`;
    mostrar('linhaCupom', true);
  } else mostrar('linhaCupom', false);
  mostrar('linhaDesconto', desconto > 0);
  const vd = el('valorDesconto'); if (vd) vd.textContent = '− ' + brl.format(desconto);
  const vt = el('valorTotal'); if (vt) vt.textContent = brl.format(subtotal - desconto);
}

function abrirFecharCarrinho(abrir) {
  if (abrir) { abrirOverlay('painelCarrinho'); const f = el('fecharCarrinho'); if (f) f.focus(); }
  else fecharOverlay('painelCarrinho');
}

function aplicarCupom() {
  if (cupomAtivo) {
    cupomAtivo = null;
    gravarLS(CHAVE_CUPOM, null);
    renderizarCarrinho();
    mostrarToast('Cupom removido.');
    return;
  }
  const inp = el('inpCupom');
  const codigo = inp ? inp.value.trim().toUpperCase() : '';
  if (CUPONS[codigo]) {
    cupomAtivo = codigo;
    gravarLS(CHAVE_CUPOM, codigo);
    renderizarCarrinho();
    mostrarToast(`🎟️ Cupom ${codigo} aplicado: -${CUPONS[codigo]}%.`);
  } else mostrarToast('Cupom inválido. Tente BEMVINDO10 ou NAVALHA5.');
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
    subtotal, desconto,
    total: subtotal - desconto,
    cupom: cupom ? cupom.codigo : null,
    criadoEm: new Date().toISOString()
  };

  pedidos.push(pedido);
  gravarLS(CHAVE_PEDIDOS, pedidos);
  carrinho = {};
  cupomAtivo = null;
  gravarLS(CHAVE_CUPOM, null);
  const ic = el('inpCupom'); if (ic) ic.value = '';
  salvarCarrinho();
  renderizarPedidos();

  const cp = el('codigoPedido'); if (cp) cp.textContent = pedido.codigo;
  const rp = el('resumoPedido');
  if (rp) rp.innerHTML = `Itens: ${pedido.itens.map((i) => `${i.qtd}× ${i.nome}`).join(', ')}. Total: <strong>${brl.format(pedido.total)}</strong>.`;
  abrirOverlay('modalPedido');
  const fm = el('fecharModal'); if (fm) fm.focus();
}

/* ---------- Agendamentos ---------- */

function preencherSelectServicos() {
  const sel = el('selServico');
  if (!sel) return;
  SERVICOS.forEach((s) => sel.appendChild(new Option(`${s.nome} — ${brl.format(s.preco)}`, s.id)));
}

function preencherSelectProfissionais() {
  const sel = el('selProfissional');
  if (!sel) return;
  PROFISSIONAIS.forEach((p) => sel.appendChild(new Option(`${p.nome} — ${p.cargo}`, p.nome)));
}

function definirDataMinima() {
  const inp = el('inpData');
  if (!inp) return;
  const h = new Date();
  inp.min = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
}

function dataISOValida(valor) {
  const [a, m, d] = valor.split('-').map(Number);
  const escolhida = new Date(a, m - 1, d);
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return escolhida >= hoje;
}

function atualizarHorarios() {
  const sel = el('selHorario');
  if (!sel) return;
  const data = el('inpData') ? el('inpData').value : '';
  const prof = el('selProfissional') ? el('selProfissional').value : '';
  sel.innerHTML = '';
  if (!data) {
    sel.appendChild(new Option('Selecione uma data primeiro', ''));
    sel.value = '';
    atualizarResumo();
    return;
  }
  const ocupados = agendamentos.filter((a) => a.data === data && a.profissional === prof).map((a) => a.horario);
  sel.appendChild(new Option('Selecione um horário', ''));
  HORARIOS_BASE.forEach((h) => {
    const op = new Option(ocupados.includes(h) ? `${h} — ocupado` : h, h);
    if (ocupados.includes(h)) op.disabled = true;
    sel.appendChild(op);
  });
  atualizarResumo();
}

function atualizarResumo() {
  const resumo = el('resumoAgendamento');
  if (!resumo) return;
  const s = SERVICOS.find((x) => x.id === (el('selServico') ? el('selServico').value : ''));
  const prof = el('selProfissional') ? el('selProfissional').value : '';
  const data = el('inpData') ? el('inpData').value : '';
  const hor = el('selHorario') ? el('selHorario').value : '';
  if (s && prof && data && hor) {
    resumo.textContent = `Resumo: ${s.nome} (${s.duracao} min, ${brl.format(s.preco)}) com ${prof}, em ${data} às ${hor}.`;
    mostrar('resumoAgendamento', true);
  } else mostrar('resumoAgendamento', false);
}

function processarAgendamento(evento) {
  evento.preventDefault();
  const v = (id) => el(id) ? el(id).value.trim() : '';
  const servicoId = el('selServico') ? el('selServico').value : '';
  const profissional = v('selProfissional');
  const data = v('inpData');
  const horario = el('selHorario') ? el('selHorario').value : '';
  const nome = v('inpNome');
  const telefone = v('inpTelefone');
  const obs = v('inpObs');

  ['selServico', 'selProfissional', 'inpData', 'selHorario', 'inpNome'].forEach((id) => marcarInvalido(id, false));

  const erros = [];
  if (!servicoId) { erros.push('selecione um serviço'); marcarInvalido('selServico', true); }
  if (!profissional) { erros.push('selecione um profissional'); marcarInvalido('selProfissional', true); }
  if (!data) { erros.push('escolha uma data'); marcarInvalido('inpData', true); }
  else if (!dataISOValida(data)) { erros.push('a data não pode estar no passado'); marcarInvalido('inpData', true); }
  if (!horario) { erros.push('escolha um horário'); marcarInvalido('selHorario', true); }
  if (!nome) { erros.push('informe seu nome'); marcarInvalido('inpNome', true); }

  if (erros.length > 0) {
    const e = el('erroAgendamento');
    if (e) e.textContent = '⚠️ Corrija o formulário: ' + erros.join(', ') + '.';
    mostrar('erroAgendamento', true);
    return;
  }
  mostrar('erroAgendamento', false);

  const servico = SERVICOS.find((s) => s.id === servicoId);
  const registro = { codigo: codigoAleatorio('NB'), servico: servico.nome, preco: servico.preco, profissional, data, horario, nome, telefone, obs, criadoEm: new Date().toISOString() };
  agendamentos.push(registro);
  gravarLS(CHAVE_AGENDAMENTOS, agendamentos);

  const d = el('detalheAgendamento');
  if (d) d.innerHTML = `<strong>${registro.nome}</strong>, seu horário de <strong>${registro.servico}</strong> com <strong>${registro.profissional}</strong> foi registrado para <strong>${registro.data}</strong> às <strong>${registro.horario}</strong>. Código: <strong>${registro.codigo}</strong>.`;
  mostrar('confirmacaoAgendamento', true);

  evento.target.reset();
  atualizarHorarios();
  renderizarAgendamentos();
  mostrarToast('📅 Agendamento registrado localmente (demonstração).');
}

function renderizarAgendamentos() {
  const lista = el('listaAgendamentos');
  if (!lista) return;
  mostrar('vazioAgendamentos', agendamentos.length === 0);
  lista.innerHTML = [...agendamentos].reverse().map((a, iR) => {
    const i = agendamentos.length - 1 - iR;
    return `
      <li>
        <span class="agendamento-codigo">${a.codigo}</span>
        <strong>${a.servico}</strong> com ${a.profissional}
        <span>${a.data} às ${a.horario} — ${a.nome}</span>
        <button class="btn-cancelar" data-indice="${i}">Cancelar agendamento</button>
      </li>
    `;
  }).join('');
  bindAll('.btn-cancelar', 'click', (e) => {
    agendamentos.splice(Number(e.currentTarget.dataset.indice), 1);
    gravarLS(CHAVE_AGENDAMENTOS, agendamentos);
    renderizarAgendamentos();
    mostrar('confirmacaoAgendamento', false);
    atualizarHorarios();
    mostrarToast('Agendamento cancelado.');
  });
}

/* ---------- Pedidos simulados ---------- */

function renderizarPedidos() {
  const lista = el('listaPedidos');
  if (!lista) return;
  mostrar('vazioPedidos', pedidos.length === 0);
  const bp = el('btnLimparPedidos'); if (bp) bp.disabled = pedidos.length === 0;
  lista.innerHTML = [...pedidos].reverse().map((p) => `
    <li>
      <span class="agendamento-codigo">${p.codigo}</span>
      <strong>${brl.format(p.total)}</strong> — ${p.itens.reduce((s, i) => s + i.qtd, 0)} item(ns)
      <span>${p.itens.map((i) => `${i.qtd}× ${i.nome}`).join(', ')}</span>
      ${p.cupom ? `<span>Cupom: ${p.cupom}</span>` : ''}
      <span>${new Date(p.criadoEm).toLocaleString('pt-BR')}</span>
    </li>
  `).join('');
}

function limparPedidos() {
  if (pedidos.length === 0) { mostrarToast('Nenhum pedido no histórico.'); return; }
  pedidos = [];
  gravarLS(CHAVE_PEDIDOS, pedidos);
  renderizarPedidos();
  mostrarToast('Histórico de pedidos limpo.');
}

/* ---------- Abas ---------- */

function alternarAba(agendaAtiva) {
  const tA = el('tabAgendamentos'), tP = el('tabPedidos');
  if (tA) { tA.classList.toggle('ativa', agendaAtiva); tA.setAttribute('aria-selected', String(agendaAtiva)); }
  if (tP) { tP.classList.toggle('ativa', !agendaAtiva); tP.setAttribute('aria-selected', String(!agendaAtiva)); }
  mostrar('painelAgendamentos', agendaAtiva);
  mostrar('painelPedidos', !agendaAtiva);
}

/* ---------- Inicialização ---------- */

document.addEventListener('DOMContentLoaded', () => {
  const ano = el('anoAtual'); if (ano) ano.textContent = String(new Date().getFullYear());

  // MARKETPLACE PRIMEIRO — renderiza antes de qualquer outra configuração
  filtrarProdutos();
  renderizarServicos();
  renderizarEquipe();

  registrarServiceWorker();
  configurarMenu();
  configurarTema();
  configurarConexao();
  configurarInstalacao();
  configurarCarrossel();

  preencherSelectServicos();
  preencherSelectProfissionais();
  definirDataMinima();
  atualizarHorarios();

  bind('buscaProduto', 'input', filtrarProdutos);
  bind('filtroCategoria', 'change', filtrarProdutos);
  bind('ordenarProdutos', 'change', filtrarProdutos);

  bind('btnCarrinho', 'click', () => abrirFecharCarrinho(true));
  bind('fecharCarrinho', 'click', () => abrirFecharCarrinho(false));
  bind('btnLimparCarrinho', 'click', () => { carrinho = {}; salvarCarrinho(); mostrarToast('Carrinho esvaziado.'); });
  bind('btnFinalizar', 'click', finalizarPedido);
  bind('btnCupom', 'click', aplicarCupom);
  bind('fecharModal', 'click', () => fecharOverlay('modalPedido'));
  bind('fecharModalServico', 'click', () => fecharOverlay('modalServico'));
  bind('btnLimparPedidos', 'click', limparPedidos);
  bind('tabAgendamentos', 'click', () => alternarAba(true));
  bind('tabPedidos', 'click', () => alternarAba(false));

  ['#modalPedido', '#modalServico'].forEach((sel) => {
    const m = $(sel);
    if (m) m.addEventListener('click', (e) => { if (e.target === m) fecharOverlay(sel); });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      abrirFecharCarrinho(false);
      fecharOverlay('modalPedido');
      fecharOverlay('modalServico');
    }
  });

  bind('formAgendamento', 'submit', processarAgendamento);
  ['selServico', 'selProfissional', 'inpData', 'selHorario'].forEach((id) => {
    bind(id, 'change', () => {
      marcarInvalido(id, false);
      if (id === 'inpData' || id === 'selProfissional') atualizarHorarios();
      else atualizarResumo();
    });
  });
  ['inpNome', 'inpTelefone', 'inpObs'].forEach((id) => bind(id, 'input', () => marcarInvalido(id, false)));

  renderizarAgendamentos();
  renderizarPedidos();
  renderizarCarrinho();

  console.info('Navalha & Brilho: aplicação iniciada (v6).');
});
