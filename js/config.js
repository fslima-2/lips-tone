/* js/config.js — EDITE AQUI: marca, WhatsApp, Instagram, datas e cardápio (sabores/preços) */
/* ============ CONFIGURAÇÕES (edite aqui) ============ */
const CONFIG = {
  brand: "Lip’s Tone",                 // nome da marca (também troque no <title> e no texto da logo)
  whatsapp: "5577992088022",          // ⚠️ SEU WHATSAPP: 55 + DDD + número, só dígitos (ex.: 5571988887777)
  instagram: "filipesilval",          // @ do Instagram, sem o @
  // Datas disponíveis para entrega/retirada (formato AAAA-MM-DD). Datas passadas somem sozinhas.
 // Datas disponíveis para entrega/retirada
dates: [
  "2026-12-05",
  "2026-12-06",

  "2026-12-11",
  "2026-12-12",
  "2026-12-13",
  "2026-12-14",
  "2026-12-15",

  "2026-12-22",
  "2026-12-23",
  "2026-12-24",
  "2026-12-25",
  "2026-12-26",
  "2026-12-27",

  "2026-12-30",
  "2026-12-31",
  "2027-01-01",
  "2027-01-02",
  "2027-01-03",
  "2027-01-04",
  "2027-01-05"
]
};
/* CATÁLOGO INICIAL: usado só na 1ª vez (para popular o catálogo). Depois, tudo é gerenciado no painel
   (#admin → Catálogo). "title" vira a categoria; cada produto tem variações [rótulo, preço em reais]. */
const MENU = {
  panetones: { title: "Panetones", items: [
    { id:"pan-trad", name:"Panetone Tradicional", desc:"Massa fofinha com frutas cristalizadas.", v:[["500g",45],["750g",62]] },
    { id:"pan-choc", name:"Panetone de Chocolate", desc:"Gotas de chocolate meio amargo.", v:[["500g",52],["750g",70]] },
    { id:"pan-ninho", name:"Panetone Ninho com Nutella", desc:"Recheio cremoso de leite Ninho e Nutella.", v:[["500g",65],["750g",88]] },
    { id:"pan-dl", name:"Panetone de Doce de Leite", desc:"Recheado com doce de leite artesanal.", v:[["500g",55],["750g",75]] }
  ]},
  cookies: { title: "Cookies", items: [
    { id:"ck-trad", name:"Cookie Tradicional", desc:"Gotas de chocolate, crocante fora e macio dentro.", v:[["Unidade",9],["Caixa com 4",32],["Caixa com 6",46]] },
    { id:"ck-red", name:"Cookie Red Velvet", desc:"Com cream cheese e chocolate branco.", v:[["Unidade",11],["Caixa com 4",40],["Caixa com 6",58]] },
    { id:"ck-ninho", name:"Cookie Ninho com Nutella", desc:"Recheio generoso de Nutella.", v:[["Unidade",13],["Caixa com 4",48],["Caixa com 6",69]] }
  ]},
  brownies: { title: "Brownies", items: [
    { id:"br-trad", name:"Brownie Tradicional", desc:"Chocolate intenso e casquinha crocante.", v:[["Unidade",9],["Caixa com 4",32],["Caixa com 9",70]] },
    { id:"br-brig", name:"Brownie de Brigadeiro", desc:"Coberto com brigadeiro cremoso.", v:[["Unidade",11],["Caixa com 4",40],["Caixa com 9",86]] },
    { id:"br-dl", name:"Brownie de Doce de Leite", desc:"Recheio de doce de leite e flor de sal.", v:[["Unidade",11],["Caixa com 4",40],["Caixa com 9",86]] }
  ]}
};
/* ============ FIM DAS CONFIGURAÇÕES ============ */
