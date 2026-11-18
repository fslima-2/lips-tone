# Lip’s Tone — site de encomendas

```
lips-tone/
├── index.html                      estrutura da página (site + área admin)
├── css/style.css                   estilos e cores (variáveis em :root)
├── js/
│   ├── config.js                   ✏️ marca, WhatsApp, Instagram, datas, cardápio e preços
│   ├── services.js                 🔌 PedidosService + CatalogoService + AuthService (ligar banco/login aqui)
│   ├── app.js                      site do cliente: abas, sacola, data, envio por WhatsApp
│   ├── admin.js                    painel #admin: lista, concluir, cancelar, faturamento
│   ├── main.js                     inicialização
│   └── services.supabase.example.js  versão pronta com Supabase (opcional)
└── database/schema.sql             tabelas e regras de segurança (Supabase)
```

## Rodar
Abra a pasta no VS Code, instale a extensão **Live Server** → botão direito em `index.html` → *Open with Live Server*.
Painel: rodapé "Área administrativa" ou `…/index.html#admin` (PIN de teste: `1234`, só para desenvolvimento).

## Editar
- Nome, WhatsApp (55 + DDD + número), Instagram, datas e cardápio: `js/config.js`
- Cores: `css/style.css` (variáveis no início)
- Cardápio: `MENU` em `js/config.js` é só o catálogo INICIAL. Depois, crie, edite (inclusive preços) e exclua produtos em `#admin → Catálogo`; categorias novas viram abas sozinhas.

## Ligar o banco (Supabase)
1. Rode `database/schema.sql` no SQL Editor e crie seu usuário em Authentication → Users; insira o UUID em `admins`.
2. Em `index.html`, adicione o script do `supabase-js` (comentário no topo de `services.supabase.example.js`) e troque `js/services.js` pelo arquivo de exemplo, com a URL e a chave anon do seu projeto.
3. Teste: faça um pedido (deslogado) e confira no painel (logado). Desative o cadastro aberto em Authentication.
Nenhum outro arquivo precisa mudar: `app.js` e `admin.js` só chamam `listarPedidos`, `criarPedido`, `concluirPedido`, `cancelarPedido` e `AuthService`.
