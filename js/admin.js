/* js/admin.js — área administrativa (#admin): pedidos (concluir, cancelar, faturamento) e catálogo (criar, editar, excluir) */
/* ================= PAINEL ADMINISTRATIVO ================= */
const ST = {pendente:"Pendente", concluido:"Concluído", cancelado:"Cancelado"};
let filtro = "pendente", confirmando = null;
let secao = "pedidos", editando = null, excluindo = null;   // catálogo: seção aberta, produto em edição ("novo" ou id), produto aguardando exclusão
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const hora = iso => new Date(iso).toLocaleString("pt-BR", {day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"});

async function renderAdmin(){
  const box = $("admin");
  // >>> CONTROLE DE ACESSO: sem login, só mostra a tela de entrada <<<
  if(!AuthService.estaLogado()){
    box.innerHTML = `<div class="adm-wrap"><h2>Área administrativa</h2>${AuthService.pedeEmail ? `<label for="email">E-mail</label><input id="email" type="email" autocomplete="username">` : ""}<label for="pin">${AuthService.pedeEmail ? "Senha" : "PIN de acesso"}</label>
      <input id="pin" type="password" inputmode="text" autocomplete="current-password"><p class="err" id="pinErr"></p>
      <button class="btn" data-adm="login" style="margin-top:12px">Entrar</button><p><a href="#">← Voltar ao site</a></p></div>`;
    return;
  }
  if(secao === "catalogo"){ box.innerHTML = `<div class="adm-wrap">${barraAdmin()}${await htmlCatalogo()}</div>`; return; }
  const L = await PedidosService.listarPedidos();
  const por = s => L.filter(p => p.status === s);
  const fat = por("concluido").reduce((s,p) => s + p.total, 0);   // faturamento: SÓ concluídos
  const vis = filtro === "todos" ? L : por(filtro);
  const chips = [["pendente","Pendentes"],["concluido","Concluídos"],["cancelado","Cancelados"],["todos","Todos"]]
    .map(([f,n]) => `<button class="chip" data-adm="filtro" data-f="${f}" aria-pressed="${f===filtro}">${n} (${f==="todos"?L.length:por(f).length})</button>`).join("");
  const cards = vis.map(p => `<article class="card ord"><div class="oh"><strong>#${esc(String(p.id).slice(0,6))} · ${esc(p.cliente)}</strong><span class="badge ${p.status}">${ST[p.status]}</span></div>
    <small>Recebido: ${hora(p.criadoEm)} · Entrega: ${fmtDate(p.dataEntrega)}</small>
    <ul>${p.itens.map(i => `<li>${i.qtd}x ${esc(i.nome)} (${esc(i.variacao)}) – ${money(i.qtd*i.preco)}</li>`).join("")}</ul>
    ${p.obs ? `<small>Obs.: ${esc(p.obs)}</small>` : ""}<p class="ot">${money(p.total)}</p>
    ${p.status !== "pendente" ? "" : confirmando === p.id
      ? `<div class="acts"><button class="btn dg" data-adm="cancel" data-id="${p.id}">Sim, cancelar pedido</button><button class="btn no" data-adm="back">Voltar</button></div>`
      : `<div class="acts"><button class="btn ok" data-adm="done" data-id="${p.id}">Marcar como concluído</button><button class="btn no" data-adm="ask" data-id="${p.id}">Cancelar pedido</button></div>`}
  </article>`).join("") || `<p class="empty">Nenhum pedido aqui.</p>`;
  box.innerHTML = `<div class="adm-wrap">${barraAdmin()}
    <div class="rev"><small>Total faturado (apenas pedidos concluídos)</small><strong>${money(fat)}</strong><small>${por("concluido").length} concluídos · ${por("pendente").length} pendentes · ${por("cancelado").length} cancelados</small></div>
    <div class="fl">${chips}</div>${cards}</div>`;
}

/* ================= CATÁLOGO (admin) ================= */
const barraAdmin = () => `<div class="admbar"><h2>Painel · ${esc(CONFIG.brand)}</h2><span><a href="#">Ver site</a> <button data-adm="logout">Sair</button></span></div>
  <div class="fl">${[["pedidos","Pedidos"],["catalogo","Catálogo"]].map(([k,n]) => `<button class="chip" data-adm="secao" data-s="${k}" aria-pressed="${k===secao}">${n}</button>`).join("")}</div>`;
const varsTexto = p => p.variacoes.map(v => `${v.rotulo} = ${String(v.preco).replace(".", ",")}`).join("\n");

async function htmlCatalogo(){
  const L = await CatalogoService.listarProdutos();
  if(editando) return formProduto(editando === "novo" ? null : L.find(p => p.id === editando), L);
  const cards = L.map(p => `<article class="card ord"><div class="oh"><strong>${esc(p.nome)}</strong><span class="badge ${p.disponivel ? "concluido" : "cancelado"}">${p.disponivel ? "Disponível" : "Indisponível"}</span></div>
    <small>${esc(p.categoria)}</small>${p.desc ? `<p>${esc(p.desc)}</p>` : ""}
    <ul>${p.variacoes.map(v => `<li>${esc(v.rotulo)}: ${money(v.preco)}</li>`).join("")}</ul>
    ${excluindo === p.id
      ? `<div class="acts"><button class="btn dg" data-adm="delprod" data-id="${p.id}">Sim, excluir produto</button><button class="btn no" data-adm="backdel">Voltar</button></div>`
      : `<div class="acts"><button class="btn ok" data-adm="editar" data-id="${p.id}">Editar / alterar preço</button><button class="btn no" data-adm="askdel" data-id="${p.id}">Excluir</button></div>`}
  </article>`).join("") || `<p class="empty">Nenhum produto cadastrado.</p>`;
  return `<button class="btn" data-adm="novo" style="margin-bottom:12px">+ Novo produto</button>${cards}`;
}
function formProduto(p, L){
  const cats = [...new Set(L.map(x => x.categoria))];
  return `<article class="card"><h3>${p ? "Editar produto" : "Novo produto"}</h3>
    <label for="fNome">Nome</label><input id="fNome" value="${esc(p?.nome)}">
    <label for="fCat">Categoria (escolha ou digite uma nova)</label><input id="fCat" list="fCats" value="${esc(p?.categoria)}"><datalist id="fCats">${cats.map(c => `<option value="${esc(c)}">`).join("")}</datalist>
    <label for="fDesc">Descrição</label><textarea id="fDesc" rows="2">${esc(p?.desc)}</textarea>
    <label for="fImg">Imagem (opcional: caminho como img/panetone.jpg, ou URL)</label><input id="fImg" value="${esc(p?.imagem)}">
    <label for="fVars">Variações e preços (uma por linha: nome = preço)</label><textarea id="fVars" rows="4" placeholder="500g = 45&#10;750g = 62">${esc(p ? varsTexto(p) : "")}</textarea>
    <label class="chk"><input type="checkbox" id="fDisp" ${!p || p.disponivel ? "checked" : ""}> Disponível na vitrine</label>
    <p class="err" id="fErr"></p>
    <div class="acts"><button class="btn ok" data-adm="salvar" data-id="${p ? p.id : ""}">Salvar</button><button class="btn no" data-adm="cancelarForm">Cancelar</button></div></article>`;
}
function lerForm(){   // devolve o produto pronto ou uma mensagem de erro (string)
  const nome = $("fNome").value.trim(), categoria = $("fCat").value.trim();
  const variacoes = $("fVars").value.split("\n").map(x => x.trim()).filter(Boolean).map(x => {
    const [r, ...resto] = x.split("=");
    return { rotulo: r.trim(), preco: parseFloat(resto.join("=").trim().replace(",", ".")) };
  });
  if(!nome) return "Informe o nome.";
  if(!categoria) return "Informe a categoria.";
  if(!variacoes.length || variacoes.some(v => !v.rotulo || !(v.preco > 0))) return 'Cada variação deve ficar como "nome = preço" (preço maior que zero).';
  return { nome, categoria, desc: $("fDesc").value.trim(), imagem: $("fImg").value.trim(), disponivel: $("fDisp").checked, variacoes };
}

$("admin").addEventListener("click", async e => {
  const b = e.target.closest("[data-adm]"); if(!b) return;
  const a = b.dataset.adm, id = b.dataset.id;
  if(a === "login"){ if(await AuthService.entrar({ email: $("email")?.value, senha: $("pin").value })) renderAdmin(); else $("pinErr").textContent = "Acesso negado."; return; }
  if(a === "logout"){ await AuthService.sair(); renderAdmin(); return; }
  if(!AuthService.estaLogado()) return;            // controle de acesso também nas ações
  if(a === "filtro") filtro = b.dataset.f;
  if(a === "done") await PedidosService.concluirPedido(id);
  if(a === "ask") confirmando = id;
  if(a === "back") confirmando = null;
  if(a === "cancel"){ await PedidosService.cancelarPedido(id); confirmando = null; }
  if(a === "secao"){ secao = b.dataset.s; editando = null; excluindo = null; }
  if(a === "novo") editando = "novo";
  if(a === "editar") editando = id;
  if(a === "cancelarForm") editando = null;
  if(a === "askdel") excluindo = id;
  if(a === "backdel") excluindo = null;
  if(a === "delprod"){ await CatalogoService.excluirProduto(id); excluindo = null; await recarregarVitrine(); }
  if(a === "salvar"){
    const d = lerForm();
    if(typeof d === "string"){ $("fErr").textContent = d; return; }
    if(id) await CatalogoService.atualizarProduto(id, d); else await CatalogoService.criarProduto(d);
    editando = null; await recarregarVitrine();   // vitrine e sacola refletem o novo catálogo na hora
  }
  renderAdmin();
});
$("admin").addEventListener("keydown", e => { if(e.key === "Enter" && e.target.id === "pin") $("admin").querySelector('[data-adm="login"]').click(); });
window.addEventListener("storage", () => { if(document.body.classList.contains("is-admin") && AuthService.estaLogado()) renderAdmin(); });

/* Rota: site normal em "/", painel em "/#admin" */
function rotear(){ const adm = location.hash === "#admin"; document.body.classList.toggle("is-admin", adm); if(adm) renderAdmin(); else window.scrollTo(0,0); }
window.addEventListener("hashchange", rotear);
