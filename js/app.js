/* js/app.js — site do cliente: abas, cardápio, sacola, data e envio por WhatsApp */
const $ = id => document.getElementById(id);
const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const cart = {};            // chave "idProduto|indiceVariacao" -> quantidade
const picked = {};          // variação escolhida em cada card
let tab = null;             // categoria aberta
let CATALOGO = [];          // vem de CatalogoService.listarProdutos()
const produto = id => CATALOGO.find(p => p.id === id);
const vitrine = () => CATALOGO.filter(p => p.disponivel);
const categorias = () => [...new Set(vitrine().map(p => p.categoria))];
const selVar = p => Math.min(picked[p.id] ?? 0, p.variacoes.length - 1);
async function recarregarVitrine(){   // chame depois de qualquer alteração no catálogo
  CATALOGO = await CatalogoService.listarProdutos();
  if(!categorias().includes(tab)) tab = categorias()[0];
  renderTabs(); renderMenu(); renderCart();
}

$("waLink").href = "https://wa.me/" + CONFIG.whatsapp;
$("igLink").href = "https://instagram.com/" + CONFIG.instagram;
$("igLink").textContent = "Instagram @" + CONFIG.instagram;

function renderTabs(){
  $("tabs").innerHTML = categorias().map(c =>
    `<button class="tab" role="tab" data-tab="${esc(c)}" aria-selected="${c===tab}">${esc(c)}</button>`).join("");
}
function renderMenu(){
  $("menu").innerHTML = vitrine().filter(p => p.categoria === tab).map(p => {
    const sel = selVar(p);
    return `<article class="card">${p.imagem ? `<img class="pimg" src="${esc(p.imagem)}" alt="" loading="lazy">` : ""}<h3>${esc(p.nome)}</h3><p>${esc(p.desc)}</p>
      <div class="chips">${p.variacoes.map((v,i) => `<button class="chip" data-pid="${p.id}" data-vi="${i}" aria-pressed="${i===sel}">${esc(v.rotulo)}<small>${money(v.preco)}</small></button>`).join("")}</div>
      <button class="btn" data-add="${p.id}">Adicionar à sacola</button></article>`;
  }).join("") || `<p class="empty">Nenhum produto disponível no momento.</p>`;
}
function lines(){   // preços sempre do catálogo atual; itens removidos/indisponíveis saem da sacola
  const out = [];
  Object.entries(cart).forEach(([k,q]) => {
    if(q <= 0) return;
    const [pid,vi] = k.split("|"), p = produto(pid), v = p && p.disponivel && p.variacoes[vi];
    if(!v){ delete cart[k]; return; }
    out.push({
  k,
  q,
  name: p.nome,
  label: v.rotulo,
  price: v.preco,
  category: p.categoria
});
  });
  return out;
}

function quantidadeTotalBrownies() {
  return lines().reduce((total, item) => {
    if (item.category !== "Brownies") return total;

    const correspondencia = item.label.match(/(\d+)\s*unidades?/i);
    const unidadesPorPacote = correspondencia
      ? Number(correspondencia[1])
      : 1;

    return total + (item.q * unidadesPorPacote);
  }, 0);
}

function renderCart(){
  const L = lines(), qty = L.reduce((s,l)=>s+l.q,0), tot = L.reduce((s,l)=>s+l.q*l.price,0);
  $("bar").classList.toggle("on", qty>0);
  $("barQty").textContent = qty + (qty===1?" item":" itens");
  $("barTotal").textContent = $("total").textContent = money(tot);
  $("items").innerHTML = L.length ? L.map(l => `<div class="row"><div class="n"><strong>${esc(l.name)}</strong><small>${l.label} · ${money(l.price)} · subtotal ${money(l.q*l.price)}</small></div>
    <div class="qty"><button data-dec="${l.k}" aria-label="Diminuir">−</button><strong>${l.q}</strong><button data-inc="${l.k}" aria-label="Aumentar">+</button></div></div>`).join("")
    : `<p class="empty">Sua sacola está vazia.</p>`;
  if(!L.length) $("sheet").classList.remove("on");
}
function fmtDate(iso){
  return new Date(iso+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});
}
function fillDates(){
  const today = new Date().toISOString().slice(0,10);
  const ok = CONFIG.dates.filter(d => d >= today);
  $("data").innerHTML = `<option value="">Escolha uma data</option>` + ok.map(d => `<option value="${d}">${fmtDate(d)}</option>`).join("");
}
document.addEventListener("click", e => {
  const t = e.target.closest("button"); if(!t) return;
  if(t.dataset.tab){ tab = t.dataset.tab; renderTabs(); renderMenu(); }
  else if(t.dataset.vi){ picked[t.dataset.pid] = +t.dataset.vi; renderMenu(); }
  else if(t.dataset.add){ const p = produto(t.dataset.add); if(!p) return; const k = p.id+"|"+selVar(p); cart[k]=(cart[k]||0)+1; renderCart(); t.textContent="Adicionado ✓"; setTimeout(()=>t.textContent="Adicionar à sacola",900); }
  else if(t.dataset.inc){ cart[t.dataset.inc]++; renderCart(); }
  else if(t.dataset.dec){ cart[t.dataset.dec]--; renderCart(); }
});
$("openCart").onclick = () => $("sheet").classList.add("on");
$("closeCart").onclick = () => $("sheet").classList.remove("on");
$("sheet").onclick = e => { if(e.target===$("sheet")) $("sheet").classList.remove("on"); };
$("send").onclick = () => {
  const L = lines();

  if (!L.length) return;

  $("err").textContent = "";

  const totalBrownies = quantidadeTotalBrownies();

  if (totalBrownies > 0 && totalBrownies < 3) {
    $("err").textContent =
      `Você precisa selecionar pelo menos 3 brownies. Atualmente há ${totalBrownies} na sua sacola. Você pode misturar os sabores.`;
    return;
  }

  if (!$("data").value) {
    $("err").textContent = "Escolha a data do pedido.";
    $("data").focus();
    return;
  }
  const tot = L.reduce((s,l)=>s+l.q*l.price,0), nome = $("nome").value.trim(), obs = $("obs").value.trim();
  const msg = [`*Novo pedido · ${CONFIG.brand}* 🎄`, nome && `Cliente: ${nome}`, `Data desejada: ${fmtDate($("data").value)}`, "", "*Itens:*",
    ...L.map(l => `• ${l.q}x ${l.name} (${l.label}) – ${money(l.q*l.price)}`), "", `*Total: ${money(tot)}*`, obs && `Obs.: ${obs}`]
    .filter(x => x !== "" ? x : true).filter(x => x !== false && x !== undefined && x !== null).join("\n");
  window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg), "_blank");
  // registra o pedido no painel administrativo (ver PedidosService)
  PedidosService.criarPedido({ cliente: nome || "Sem nome", itens: L.map(l => ({nome:l.name, variacao:l.label, qtd:l.q, preco:l.price})), total: tot, dataEntrega: $("data").value, obs });
  Object.keys(cart).forEach(k => delete cart[k]); renderCart();
};

/* ================= MARCA NOS TEXTOS ================= */
document.title = CONFIG.brand + " · Confeitaria Artesanal";
$("brandName").textContent = CONFIG.brand;
document.querySelectorAll(".brandTxt").forEach(e => e.textContent = CONFIG.brand);
$("yr").textContent = new Date().getFullYear();
$("data").onchange = () => $("err").textContent = "";
