/* js/services.supabase.example.js — versão COM BANCO REAL (Supabase).
   Para usar: no index.html, adicione antes dos outros scripts
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   e troque  js/services.js  por  js/services.supabase.example.js.
   Preencha a URL e a chave ANON (pública). NUNCA use a chave service_role aqui. */
const db = supabase.createClient("https://SEU-PROJETO.supabase.co", "SUA_CHAVE_ANON");

const mapa = r => ({ id: r.id, cliente: r.cliente, itens: r.itens, total: Number(r.total),
  dataEntrega: r.data_entrega, criadoEm: r.criado_em, status: r.status, obs: r.obs || "" });

/* ---------- PEDIDOS ---------- */
const PedidosService = {
  async listarPedidos() {
    const { data, error } = await db.from("pedidos").select("*").order("criado_em", { ascending: false });
    if (error) throw error; return data.map(mapa);
  },
  async criarPedido(d) {   // sem .select(): o cliente não tem permissão de leitura
    const { error } = await db.from("pedidos").insert({ cliente: d.cliente, itens: d.itens,
      total: d.total, data_entrega: d.dataEntrega, obs: d.obs || "" });
    if (error) throw error;
  },
  async _mudar(id, status) {
    const { error } = await db.from("pedidos").update({ status }).eq("id", id).eq("status", "pendente");
    if (error) throw error;
  },
  concluirPedido(id) { return this._mudar(id, "concluido"); },
  cancelarPedido(id) { return this._mudar(id, "cancelado"); }
};

/* ---------- CATÁLOGO (tabela "produtos") ---------- */
const mapaProd = r => ({ id: r.id, nome: r.nome, categoria: r.categoria, desc: r.descricao || "", imagem: r.imagem || "", disponivel: r.disponivel, variacoes: r.variacoes });
const linhaProd = d => ({ nome: d.nome, categoria: d.categoria, descricao: d.desc, imagem: d.imagem, disponivel: d.disponivel, variacoes: d.variacoes });
const CatalogoService = {
  async listarProdutos() {
    const { data, error } = await db.from("produtos").select("*").order("criado_em");
    if (error) throw error; return data.map(mapaProd);
  },
  async criarProduto(d) { const { error } = await db.from("produtos").insert(linhaProd(d)); if (error) throw error; },
  async atualizarProduto(id, d) { const { error } = await db.from("produtos").update(linhaProd(d)).eq("id", id); if (error) throw error; },
  async excluirProduto(id) { const { error } = await db.from("produtos").delete().eq("id", id); if (error) throw error; }
};
// 1ª carga: para popular a tabela com o catálogo inicial (MENU em config.js), crie os produtos pelo painel ou por um INSERT no SQL Editor.

/* ---------- LOGIN (e-mail + senha) ---------- */
let _sessao = null;
const AuthService = {
  pedeEmail: true,
  estaLogado() { return !!_sessao; },
  async entrar({ email, senha }) {
    const { data, error } = await db.auth.signInWithPassword({ email, password: senha });
    if (error) return false; _sessao = data.session; return true;
  },
  async sair() { await db.auth.signOut(); _sessao = null; }
};
db.auth.getSession().then(({ data }) => { _sessao = data.session; rotear(); });
// atualização automática do painel (alternativa: Supabase Realtime)
setInterval(() => { if (AuthService.estaLogado() && document.body.classList.contains("is-admin")) renderAdmin(); }, 30000);
